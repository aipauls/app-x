import React, { useState, useCallback } from 'react';
import {
  View, Text, StyleSheet, FlatList, TextInput, TouchableOpacity,
  Share, ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useShoppingStore } from '../store/shoppingStore';
import { useSettingsStore } from '../store/settingsStore';
import { callClaudeJSON } from '../services/anthropic';
import { SYSTEM_PROMPTS } from '../constants/prompts';
import type { ShoppingResult, LocationResult } from '../types/agents';

export default function ShoppingListScreen() {
  const items = useShoppingStore((s) => s.items);
  const addItem = useShoppingStore((s) => s.addItem);
  const toggleItem = useShoppingStore((s) => s.toggleItem);
  const removeItem = useShoppingStore((s) => s.removeItem);
  const clearChecked = useShoppingStore((s) => s.clearChecked);
  const location = useSettingsStore((s) => s.location);

  const [newItem, setNewItem] = useState('');
  const [loading, setLoading] = useState<'prices' | 'stores' | null>(null);
  const [priceResult, setPriceResult] = useState<ShoppingResult | null>(null);
  const [storeResult, setStoreResult] = useState<LocationResult | null>(null);
  const [showChecked, setShowChecked] = useState(false);

  const unchecked = items.filter((i) => !i.checked);
  const checked = items.filter((i) => i.checked);

  const handleAdd = useCallback(() => {
    const name = newItem.trim();
    if (!name) return;
    addItem(name);
    setNewItem('');
  }, [newItem, addItem]);

  const handlePriceCheck = useCallback(async () => {
    if (unchecked.length === 0) return;
    setLoading('prices');
    const result = await callClaudeJSON<ShoppingResult>({
      systemPrompt: SYSTEM_PROMPTS.shopping,
      userMessage: `Price check these items: ${unchecked.map((i) => i.name).join(', ')}\nLocation: ${location}`,
    });
    setPriceResult(result);
    setLoading(null);
  }, [unchecked, location]);

  const handleFindStore = useCallback(async () => {
    setLoading('stores');
    const result = await callClaudeJSON<LocationResult>({
      systemPrompt: SYSTEM_PROMPTS.location,
      userMessage: `Find best stores near ${location} for grocery shopping`,
    });
    setStoreResult(result);
    setLoading(null);
  }, [location]);

  const handleShare = useCallback(() => {
    const text = unchecked.map((i) => `• ${i.name}`).join('\n');
    Share.share({ message: `Shopping List:\n${text}` });
  }, [unchecked]);

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.title}>Shopping List</Text>
        <TouchableOpacity onPress={handleShare} accessibilityRole="button" accessibilityLabel="Share list">
          <Text style={styles.shareBtn}>Share</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.addRow}>
        <TextInput
          style={styles.addInput}
          placeholder="Add item..."
          placeholderTextColor="#64748b"
          value={newItem}
          onChangeText={setNewItem}
          onSubmitEditing={handleAdd}
          returnKeyType="done"
        />
        <TouchableOpacity style={styles.addBtn} onPress={handleAdd} accessibilityRole="button">
          <Text style={styles.addBtnText}>Add</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={unchecked}
        keyExtractor={(_, i) => i.toString()}
        ListEmptyComponent={<Text style={styles.empty}>Your list is empty. Add items above!</Text>}
        renderItem={({ item, index }) => {
          const realIndex = items.indexOf(item);
          return (
            <View style={styles.row}>
              <TouchableOpacity onPress={() => toggleItem(realIndex)} style={styles.check} accessibilityRole="checkbox" accessibilityLabel={item.name}>
                <View style={styles.checkBox} />
                <Text style={styles.rowName}>{item.name}</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => removeItem(realIndex)} accessibilityRole="button" accessibilityLabel={`Remove ${item.name}`}>
                <Text style={styles.removeText}>×</Text>
              </TouchableOpacity>
            </View>
          );
        }}
        ListFooterComponent={
          <View>
            {priceResult && (
              <View style={styles.resultBox}>
                <Text style={styles.resultTitle}>💰 Price Estimate: {priceResult.total_estimated} (Budget: {priceResult.budget_total})</Text>
                {priceResult.money_saving_tips.map((tip, i) => (
                  <Text key={i} style={styles.tip}>💡 {tip}</Text>
                ))}
              </View>
            )}
            {storeResult?.best_option && (
              <View style={styles.resultBox}>
                <Text style={styles.resultTitle}>🏪 Best Option: {storeResult.best_option.store}</Text>
                <Text style={styles.tip}>{storeResult.best_option.reason}</Text>
              </View>
            )}
            {checked.length > 0 && (
              <View style={styles.checkedSection}>
                <TouchableOpacity onPress={() => setShowChecked(!showChecked)} style={styles.checkedHeader} accessibilityRole="button">
                  <Text style={styles.checkedTitle}>Checked ({checked.length}) {showChecked ? '▼' : '▶'}</Text>
                  <TouchableOpacity onPress={clearChecked} accessibilityRole="button">
                    <Text style={styles.clearText}>Clear all</Text>
                  </TouchableOpacity>
                </TouchableOpacity>
                {showChecked && checked.map((item) => {
                  const idx = items.indexOf(item);
                  return (
                    <View key={idx} style={[styles.row, styles.checkedRow]}>
                      <TouchableOpacity onPress={() => toggleItem(idx)} style={styles.check} accessibilityRole="checkbox">
                        <View style={styles.checkBoxDone}><Text style={styles.checkMark}>✓</Text></View>
                        <Text style={styles.rowNameDone}>{item.name}</Text>
                      </TouchableOpacity>
                    </View>
                  );
                })}
              </View>
            )}
          </View>
        }
      />

      <View style={styles.actions}>
        <TouchableOpacity
          style={[styles.actionBtn, loading === 'prices' && styles.actionBtnLoading]}
          onPress={handlePriceCheck}
          disabled={loading !== null}
          accessibilityRole="button"
        >
          {loading === 'prices' ? <ActivityIndicator color="#fff" size="small" /> : <Text style={styles.actionBtnText}>💰 Price Check</Text>}
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.actionBtn, styles.actionBtnAlt, loading === 'stores' && styles.actionBtnLoading]}
          onPress={handleFindStore}
          disabled={loading !== null}
          accessibilityRole="button"
        >
          {loading === 'stores' ? <ActivityIndicator color="#fff" size="small" /> : <Text style={styles.actionBtnText}>🏪 Find Best Store</Text>}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0f172a' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 16, paddingBottom: 12 },
  title: { fontSize: 24, fontWeight: '800', color: '#f1f5f9' },
  shareBtn: { color: '#10b981', fontSize: 14, fontWeight: '600' },
  addRow: { flexDirection: 'row', paddingHorizontal: 16, paddingBottom: 12, gap: 8 },
  addInput: { flex: 1, backgroundColor: '#1e293b', borderRadius: 12, paddingHorizontal: 14, paddingVertical: 10, color: '#f1f5f9', fontSize: 14 },
  addBtn: { backgroundColor: '#10b981', borderRadius: 12, paddingHorizontal: 16, paddingVertical: 10, justifyContent: 'center' },
  addBtnText: { color: '#fff', fontWeight: '700', fontSize: 14 },
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: '#1e293b' },
  check: { flexDirection: 'row', alignItems: 'center', flex: 1 },
  checkBox: { width: 22, height: 22, borderRadius: 11, borderWidth: 2, borderColor: '#10b981', marginRight: 12 },
  checkBoxDone: { width: 22, height: 22, borderRadius: 11, backgroundColor: '#10b981', marginRight: 12, justifyContent: 'center', alignItems: 'center' },
  checkMark: { color: '#fff', fontSize: 12, fontWeight: '700' },
  rowName: { fontSize: 15, color: '#f1f5f9' },
  rowNameDone: { fontSize: 15, color: '#64748b', textDecorationLine: 'line-through' },
  removeText: { color: '#ef4444', fontSize: 22, paddingHorizontal: 4 },
  empty: { padding: 32, textAlign: 'center', color: '#64748b', fontSize: 14 },
  checkedSection: { marginTop: 8 },
  checkedHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16, backgroundColor: '#1e293b' },
  checkedTitle: { color: '#64748b', fontSize: 13, fontWeight: '600' },
  clearText: { color: '#ef4444', fontSize: 13 },
  checkedRow: { opacity: 0.6 },
  resultBox: { margin: 16, backgroundColor: '#1e293b', borderRadius: 12, padding: 12 },
  resultTitle: { fontSize: 14, fontWeight: '600', color: '#f1f5f9', marginBottom: 6 },
  tip: { fontSize: 12, color: '#94a3b8', marginTop: 4 },
  actions: { flexDirection: 'row', padding: 12, gap: 10, borderTopWidth: 1, borderTopColor: '#1e293b' },
  actionBtn: { flex: 1, backgroundColor: '#10b981', borderRadius: 12, paddingVertical: 12, alignItems: 'center', justifyContent: 'center' },
  actionBtnAlt: { backgroundColor: '#3b82f6' },
  actionBtnLoading: { opacity: 0.6 },
  actionBtnText: { color: '#fff', fontWeight: '700', fontSize: 13 },
});
