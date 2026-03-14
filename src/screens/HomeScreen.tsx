import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Animated } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation } from '@react-navigation/native';

import { usePantryStore } from '../store/pantryStore';
import { ExpiryAlertCard } from '../components/ExpiryAlertCard';
import type { PantryItem, StorageCategory } from '../types/pantry';

const GREETING = (() => {
  const h = new Date().getHours();
  if (h < 12) return 'Good morning';
  if (h < 18) return 'Good afternoon';
  return 'Good evening';
})();

const QUICK_ACTIONS = [
  { label: '📷 Scan Ingredients', prompt: '' },
  { label: "👨‍🍳 What's for Dinner?", prompt: "What can I cook tonight with my pantry?" },
  { label: '🛒 Smart Shop', prompt: "Find me the best deals on my shopping list" },
  { label: '📍 Nearby Stores', prompt: "Show me stores nearby" },
];

const CATS: Array<{ cat: StorageCategory; icon: string }> = [
  { cat: 'Fridge', icon: '🧊' },
  { cat: 'Cupboard', icon: '🗄️' },
  { cat: 'Freezer', icon: '❄️' },
];

export default function HomeScreen() {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const navigation = useNavigation<any>();
  const items = usePantryStore((s) => s.items);
  const getExpiring = usePantryStore((s) => s.getExpiring);
  const getByCategory = usePantryStore((s) => s.getByCategory);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const expiringItems = getExpiring(3);

  useEffect(() => {
    Animated.timing(fadeAnim, { toValue: 1, duration: 600, useNativeDriver: true }).start();
  }, [fadeAnim]);

  const handleUseItUp = (item: PantryItem) => {
    navigation.navigate('Chat', {
      initialPrompt: `Give me a quick recipe using ${item.name}, which expires ${item.expiry}`,
    });
  };

  const handleQuickAction = (prompt: string) => {
    navigation.navigate('Chat', prompt ? { initialPrompt: prompt } : undefined);
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <LinearGradient colors={['#0f172a', '#1e293b']} style={styles.header}>
        <Text style={styles.brand}>App.X</Text>
        <Text style={styles.greeting}>{GREETING}, ready to cook?</Text>
        <Text style={styles.sub}>{items.length} items in your pantry</Text>
      </LinearGradient>

      <Animated.ScrollView style={{ opacity: fadeAnim }} contentContainerStyle={styles.scroll}>
        {expiringItems.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>⚠️ Expiring Soon</Text>
            {expiringItems.slice(0, 3).map((item) => (
              <ExpiryAlertCard key={item.id} item={item} onUseItUp={handleUseItUp} />
            ))}
          </View>
        )}

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          <View style={styles.grid}>
            {QUICK_ACTIONS.map((action) => (
              <TouchableOpacity
                key={action.label}
                style={styles.actionBtn}
                onPress={() => handleQuickAction(action.prompt)}
                accessibilityRole="button"
                accessibilityLabel={action.label}
              >
                <Text style={styles.actionText}>{action.label}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Pantry Summary</Text>
          {CATS.map(({ cat, icon }) => {
            const count = getByCategory(cat).length;
            const pct = items.length > 0 ? (count / items.length) * 100 : 0;
            return (
              <TouchableOpacity
                key={cat}
                style={styles.barRow}
                onPress={() => navigation.navigate('Pantry')}
                accessibilityRole="button"
                accessibilityLabel={`${cat}: ${count} items`}
              >
                <Text style={styles.barLabel}>{icon} {cat}</Text>
                <View style={styles.barBg}>
                  <View style={[styles.barFill, { width: `${Math.round(pct)}%` as `${number}%` }]} />
                </View>
                <Text style={styles.barCount}>{count}</Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </Animated.ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0f172a' },
  header: { paddingHorizontal: 20, paddingBottom: 20, paddingTop: 8 },
  brand: { fontSize: 28, fontWeight: '800', color: '#10b981', letterSpacing: -0.5 },
  greeting: { fontSize: 18, fontWeight: '600', color: '#f1f5f9', marginTop: 4 },
  sub: { fontSize: 13, color: '#64748b', marginTop: 2 },
  scroll: { padding: 16, paddingBottom: 32 },
  section: { marginBottom: 24 },
  sectionTitle: { fontSize: 14, fontWeight: '700', color: '#64748b', letterSpacing: 0.5, textTransform: 'uppercase', marginBottom: 10 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  actionBtn: { width: '47%', backgroundColor: '#1e293b', borderRadius: 14, padding: 16, justifyContent: 'center', alignItems: 'center' },
  actionText: { fontSize: 13, fontWeight: '600', color: '#f1f5f9', textAlign: 'center' },
  barRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 10 },
  barLabel: { fontSize: 13, color: '#94a3b8', width: 90 },
  barBg: { flex: 1, height: 8, backgroundColor: '#1e293b', borderRadius: 4, overflow: 'hidden', marginHorizontal: 10 },
  barFill: { height: '100%', backgroundColor: '#10b981', borderRadius: 4 },
  barCount: { fontSize: 13, color: '#64748b', width: 24, textAlign: 'right' },
});
