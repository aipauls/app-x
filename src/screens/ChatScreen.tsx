import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TextInput, TouchableOpacity,
  KeyboardAvoidingView, Platform, Animated, Image, ActivityIndicator,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import * as ImagePicker from 'expo-image-picker';
import { useRoute, RouteProp } from '@react-navigation/native';

import { callClaudeJSON } from '../services/anthropic';
import { SYSTEM_PROMPTS } from '../constants/prompts';
import { daysFromNow, defaultExpiry } from '../utils/dates';
import { usePantryStore } from '../store/pantryStore';
import { useShoppingStore } from '../store/shoppingStore';
import { useSettingsStore } from '../store/settingsStore';
import { RecipeCard } from '../components/RecipeCard';
import { ShoppingCard } from '../components/ShoppingCard';
import { LocationCard } from '../components/LocationCard';
import { ImageDetectionCard } from '../components/ImageDetectionCard';
import { AgentStatusBar } from '../components/AgentStatusBar';
import type { RootTabParamList } from '../types/navigation';
import type { AgentId, OrchestratorDecision, AgentResult } from '../types/agents';

type ChatRouteProp = RouteProp<RootTabParamList, 'Chat'>;

interface ChatMsg {
  id: string;
  role: 'user' | 'assistant';
  content: string | null;
  richContent?: AgentResult[];
  image?: string;
  isStatus?: boolean;
  welcome?: boolean;
}

const FadeIn = ({ delay = 0, children }: { delay?: number; children: React.ReactNode }) => {
  const anim = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.timing(anim, { toValue: 1, duration: 400, delay, useNativeDriver: true }).start();
  }, [anim, delay]);
  return <Animated.View style={{ opacity: anim }}>{children}</Animated.View>;
};

const SUGGEST_CHIPS = ["What can I cook tonight?", "Find cheap recipes", "Best deals nearby", "Use expiring food"];

export default function ChatScreen() {
  const insets = useSafeAreaInsets();
  const scrollRef = useRef<ScrollView>(null);
  const route = useRoute<ChatRouteProp>();
  const initialPrompt = route.params?.initialPrompt;
  const didAutoSend = useRef(false);

  const pantryItems = usePantryStore((s) => s.items);
  const addPantryItem = usePantryStore((s) => s.addItem);
  const addShoppingItem = useShoppingStore((s) => s.addItem);
  const shoppingItems = useShoppingStore((s) => s.items);
  const dietary = useSettingsStore((s) => s.dietary);
  const location = useSettingsStore((s) => s.location);

  const [msgs, setMsgs] = useState<ChatMsg[]>([{ id: '0', role: 'assistant', content: null, welcome: true }]);
  const [input, setInput] = useState('');
  const [processing, setProcessing] = useState(false);
  const [activeAgents, setActiveAgents] = useState<AgentId[]>([]);
  const [imgPreview, setImgPreview] = useState<string | null>(null);
  const [imgData, setImgData] = useState<string | null>(null);

  useEffect(() => {
    setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 100);
  }, [msgs, activeAgents]);

  const buildPantryDesc = useCallback(() =>
    pantryItems.map((i) => {
      let s = `${i.name} (${i.category})`;
      if (i.expiry && daysFromNow(i.expiry) <= 3) s += ' [EXPIRING SOON]';
      return s;
    }).join(', '), [pantryItems]);

  const handleSend = useCallback(async (text?: string) => {
    const msg = (text ?? input).trim();
    if (!msg && !imgData) return;

    setMsgs((m) => [...m, { id: Date.now().toString(), role: 'user', content: msg || '📷 Photo uploaded', image: imgPreview ?? undefined }]);
    setInput('');
    setProcessing(true);
    setActiveAgents(['orchestrator']);

    const pantryDesc = buildPantryDesc();

    try {
      const orch = await callClaudeJSON<OrchestratorDecision>({
        systemPrompt: SYSTEM_PROMPTS.orchestrator,
        userMessage: `User: "${msg || 'Photo of food'}"\nImage: ${!!imgData}\nLocation: ${location}\nDiet: ${dietary}\nPantry: ${pantryDesc}`,
      });

      if (!orch) {
        setMsgs((m) => [...m, { id: Date.now().toString(), role: 'assistant', content: "I couldn't process that. Try rephrasing?" }]);
        return;
      }

      setMsgs((m) => [...m, { id: Date.now().toString(), role: 'assistant', content: orch.summary_for_user, isStatus: true }]);

      const agents = orch.agents ?? [];
      const results: Record<string, unknown> = {};
      let extra = '';

      if (agents.includes('image') && imgData) {
        setActiveAgents(['image']);
        const r = await callClaudeJSON<{ ingredients: Array<{ name: string; category: 'Fridge'|'Cupboard'|'Freezer'; estimated_quantity: string; confidence: number }>; notes: string }>({
          systemPrompt: SYSTEM_PROMPTS.image,
          userMessage: orch.agent_instructions?.image || 'Identify ingredients',
          imageBase64: imgData,
        });
        if (r?.ingredients) {
          results.image = r;
          extra = 'New: ' + r.ingredients.map((i) => i.name).join(', ');
        }
        setImgPreview(null); setImgData(null);
      }

      const rest = agents.filter((a) => a !== 'image');
      if (rest.length) {
        setActiveAgents(rest as AgentId[]);
        await Promise.all([
          rest.includes('cooking') && callClaudeJSON({ systemPrompt: SYSTEM_PROMPTS.cooking, userMessage: `${orch.agent_instructions?.cooking || 'Recipes'}\nDiet: ${dietary}\nIngredients: ${pantryDesc}\n${extra}` }).then((r) => { if (r) results.cooking = r; }),
          rest.includes('shopping') && callClaudeJSON({ systemPrompt: SYSTEM_PROMPTS.shopping, userMessage: `${orch.agent_instructions?.shopping || 'Prices'}\nLocation: ${location}\nPantry: ${pantryDesc}` }).then((r) => { if (r) results.shopping = r; }),
          rest.includes('location') && callClaudeJSON({ systemPrompt: SYSTEM_PROMPTS.location, userMessage: `${orch.agent_instructions?.location || 'Stores'}\nLocation: ${location}` }).then((r) => { if (r) results.location = r; }),
          rest.includes('waste_reduction') && callClaudeJSON({ systemPrompt: SYSTEM_PROMPTS.waste_reduction, userMessage: `Analyse waste risk\nPantry: ${pantryDesc}` }).then((r) => { if (r) results.waste_reduction = r; }),
        ].filter(Boolean));
      }

      const rich: AgentResult[] = [];
      if (results.image) rich.push({ type: 'image_results', data: results.image as AgentResult extends { type: 'image_results'; data: infer D } ? D : never });
      if (results.cooking) rich.push({ type: 'recipes', data: results.cooking as AgentResult extends { type: 'recipes'; data: infer D } ? D : never });
      if (results.shopping) rich.push({ type: 'shopping', data: results.shopping as AgentResult extends { type: 'shopping'; data: infer D } ? D : never });
      if (results.location) rich.push({ type: 'location', data: results.location as AgentResult extends { type: 'location'; data: infer D } ? D : never });
      if (results.waste_reduction) rich.push({ type: 'waste_reduction', data: results.waste_reduction as AgentResult extends { type: 'waste_reduction'; data: infer D } ? D : never });

      setMsgs((m) => [...m, { id: (Date.now() + 1).toString(), role: 'assistant', content: null, richContent: rich }]);
    } catch (err) {
      console.error('[ChatScreen] pipeline error:', err);
      setMsgs((m) => [...m, { id: Date.now().toString(), role: 'assistant', content: 'Something went wrong. Please try again.' }]);
    } finally {
      setProcessing(false);
      setActiveAgents([]);
    }
  }, [input, imgData, imgPreview, buildPantryDesc, dietary, location]);

  useEffect(() => {
    if (initialPrompt && !didAutoSend.current) {
      didAutoSend.current = true;
      handleSend(initialPrompt);
    }
  }, [initialPrompt, handleSend]);

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ['images'], base64: true, quality: 0.7 });
    if (!result.canceled && result.assets[0]) {
      setImgPreview(result.assets[0].uri);
      setImgData(result.assets[0].base64 ?? null);
    }
  };

  const renderResult = (result: AgentResult, idx: number) => {
    const pantryNames = pantryItems.map((p) => p.name);
    switch (result.type) {
      case 'image_results':
        return <ImageDetectionCard key={idx} data={result.data} onAddAll={(items) => items.forEach((i) => addPantryItem({ name: i.name, category: i.category, quantity: i.qty, expiry: defaultExpiry(5), addedAt: new Date().toISOString(), source: 'image' }))} />;
      case 'recipes':
        return result.data.recipes.map((r, i) => <RecipeCard key={i} recipe={r} pantryItems={pantryNames} onAddMissing={(names) => names.forEach((n) => addShoppingItem(n, 'agent'))} />);
      case 'shopping':
        return <ShoppingCard key={idx} data={result.data} onAddAll={(names) => names.forEach((n) => addShoppingItem(n, 'agent'))} />;
      case 'location':
        return <LocationCard key={idx} data={result.data} />;
      case 'waste_reduction':
        return (
          <View key={idx} style={styles.wasteCard}>
            <Text style={styles.wasteTitle}>♻️ Waste Report — Score: {result.data.waste_score}%</Text>
            {result.data.at_risk_items.map((item, i) => (
              <View key={i} style={styles.wasteItem}>
                <Text style={[styles.wasteName, { color: item.urgency === 'critical' ? '#ef4444' : item.urgency === 'warning' ? '#f59e0b' : '#94a3b8' }]}>{item.name} ({item.days_left}d)</Text>
                <Text style={styles.wasteTip}>{item.quick_recipe_suggestion}</Text>
              </View>
            ))}
            <Text style={styles.weeklyTip}>💡 {result.data.weekly_tip}</Text>
          </View>
        );
      default:
        return null;
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <LinearGradient colors={['#0f172a', '#0f172a']} style={styles.header}>
        <Text style={styles.headerTitle}>App.X Chat</Text>
        <TouchableOpacity onPress={() => setMsgs([{ id: '0', role: 'assistant', content: null, welcome: true }])} accessibilityRole="button" accessibilityLabel="Clear chat">
          <Text style={styles.clearBtn}>Clear</Text>
        </TouchableOpacity>
      </LinearGradient>

      <AgentStatusBar agents={activeAgents} />

      <ScrollView ref={scrollRef} style={styles.messages} contentContainerStyle={styles.messagesContent}>
        {msgs.map((msg, i) => (
          <FadeIn key={msg.id} delay={i * 30}>
            {msg.welcome ? (
              <View style={styles.welcome}>
                <Text style={styles.welcomeTitle}>👋 Hi! I'm App.X</Text>
                <Text style={styles.welcomeDesc}>Ask me to find recipes, check prices, scan ingredients, or reduce food waste.</Text>
                <View style={styles.chips}>
                  {SUGGEST_CHIPS.map((c) => (
                    <TouchableOpacity key={c} style={styles.chip} onPress={() => handleSend(c)} accessibilityRole="button">
                      <Text style={styles.chipText}>{c}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            ) : msg.role === 'user' ? (
              <View style={styles.userRow}>
                <View style={styles.userBubble}>
                  {msg.image ? <Image source={{ uri: msg.image }} style={styles.msgImage} /> : null}
                  {msg.content ? <Text style={styles.userText}>{msg.content}</Text> : null}
                </View>
              </View>
            ) : (
              <View style={styles.assistantRow}>
                {msg.content ? <Text style={[styles.assistantText, msg.isStatus && styles.statusText]}>{msg.content}</Text> : null}
                {msg.richContent?.map((r, idx) => renderResult(r, idx))}
              </View>
            )}
          </FadeIn>
        ))}
        {processing && !activeAgents.length && (
          <View style={styles.assistantRow}>
            <ActivityIndicator color="#10b981" size="small" />
          </View>
        )}
      </ScrollView>

      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} keyboardVerticalOffset={insets.bottom}>
        {imgPreview ? (
          <View style={styles.previewRow}>
            <Image source={{ uri: imgPreview }} style={styles.preview} />
            <TouchableOpacity onPress={() => { setImgPreview(null); setImgData(null); }} accessibilityRole="button">
              <Text style={styles.previewRemove}>×</Text>
            </TouchableOpacity>
          </View>
        ) : null}
        <View style={[styles.inputRow, { paddingBottom: Math.max(insets.bottom, 8) }]}>
          <TouchableOpacity onPress={pickImage} style={styles.iconBtn} accessibilityRole="button" accessibilityLabel="Pick image">
            <Text style={styles.iconBtnText}>📷</Text>
          </TouchableOpacity>
          <TextInput
            style={styles.input}
            placeholder="Ask anything about food..."
            placeholderTextColor="#475569"
            value={input}
            onChangeText={setInput}
            onSubmitEditing={() => handleSend()}
            returnKeyType="send"
            editable={!processing}
            multiline
          />
          <TouchableOpacity
            onPress={() => handleSend()}
            style={[styles.sendBtn, (!input.trim() && !imgData) && styles.sendBtnDisabled]}
            disabled={processing || (!input.trim() && !imgData)}
            accessibilityRole="button"
            accessibilityLabel="Send message"
          >
            {processing ? <ActivityIndicator color="#fff" size="small" /> : <Text style={styles.sendBtnText}>↑</Text>}
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0f172a' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 12 },
  headerTitle: { fontSize: 18, fontWeight: '700', color: '#f1f5f9' },
  clearBtn: { color: '#64748b', fontSize: 13 },
  messages: { flex: 1 },
  messagesContent: { padding: 16, paddingBottom: 8 },
  welcome: { backgroundColor: '#1e293b', borderRadius: 16, padding: 16, marginBottom: 12 },
  welcomeTitle: { fontSize: 18, fontWeight: '700', color: '#f1f5f9', marginBottom: 4 },
  welcomeDesc: { fontSize: 13, color: '#94a3b8', marginBottom: 12 },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: { backgroundColor: '#0f172a', borderRadius: 20, paddingHorizontal: 12, paddingVertical: 6, borderWidth: 1, borderColor: '#334155' },
  chipText: { color: '#94a3b8', fontSize: 12 },
  userRow: { alignItems: 'flex-end', marginBottom: 12 },
  userBubble: { backgroundColor: '#10b981', borderRadius: 16, borderBottomRightRadius: 4, padding: 12, maxWidth: '80%' },
  userText: { color: '#fff', fontSize: 14 },
  msgImage: { width: 180, height: 120, borderRadius: 10, marginBottom: 8 },
  assistantRow: { marginBottom: 12 },
  assistantText: { fontSize: 14, color: '#f1f5f9', marginBottom: 8 },
  statusText: { color: '#64748b', fontStyle: 'italic', fontSize: 13 },
  wasteCard: { backgroundColor: '#1e1040', borderRadius: 14, padding: 14, marginBottom: 10, borderLeftWidth: 3, borderLeftColor: '#a78bfa' },
  wasteTitle: { fontSize: 14, fontWeight: '700', color: '#a78bfa', marginBottom: 8 },
  wasteItem: { marginBottom: 8 },
  wasteName: { fontSize: 13, fontWeight: '600' },
  wasteTip: { fontSize: 12, color: '#94a3b8', marginTop: 2 },
  weeklyTip: { fontSize: 12, color: '#a78bfa', marginTop: 8, fontStyle: 'italic' },
  inputRow: { flexDirection: 'row', alignItems: 'flex-end', paddingHorizontal: 12, paddingTop: 8, borderTopWidth: 1, borderTopColor: '#1e293b', gap: 8, backgroundColor: '#0f172a' },
  iconBtn: { width: 40, height: 40, justifyContent: 'center', alignItems: 'center', backgroundColor: '#1e293b', borderRadius: 20 },
  iconBtnText: { fontSize: 18 },
  input: { flex: 1, backgroundColor: '#1e293b', borderRadius: 20, paddingHorizontal: 16, paddingVertical: 10, color: '#f1f5f9', fontSize: 14, maxHeight: 100 },
  sendBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#10b981', justifyContent: 'center', alignItems: 'center' },
  sendBtnDisabled: { backgroundColor: '#1e293b' },
  sendBtnText: { color: '#fff', fontSize: 18, fontWeight: '700' },
  previewRow: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 8, gap: 8 },
  preview: { width: 60, height: 60, borderRadius: 10 },
  previewRemove: { color: '#ef4444', fontSize: 22, fontWeight: '700' },
});
