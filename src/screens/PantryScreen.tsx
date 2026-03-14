import React, { useState, useCallback, useMemo } from 'react';
import {
  View, Text, StyleSheet, FlatList, TextInput, TouchableOpacity,
  Modal, ScrollView, RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as ImagePicker from 'expo-image-picker';

import { usePantryStore } from '../store/pantryStore';
import { getExpiryLabel, getExpiryStatus, defaultExpiry } from '../utils/dates';
import { COMMON_ITEMS, STORAGE_CATEGORIES } from '../constants/food';
import type { PantryItem, StorageCategory } from '../types/pantry';

const EXPIRY_COLORS: Record<string, string> = {
  expired: '#ef4444', urgent: '#ef4444', soon: '#f59e0b', ok: '#10b981', none: '#64748b',
};

const PantryRow = React.memo(({ item, onRemove }: { item: PantryItem; onRemove: (id: number) => void }) => {
  const status = getExpiryStatus(item.expiry);
  return (
    <View style={styles.row}>
      <View style={styles.rowInfo}>
        <Text style={styles.rowName}>{item.name}</Text>
        <Text style={styles.rowQty}>{item.quantity}</Text>
      </View>
      {item.expiry ? (
        <Text style={[styles.rowExpiry, { color: EXPIRY_COLORS[status] }]}>{getExpiryLabel(item.expiry)}</Text>
      ) : null}
      <TouchableOpacity onPress={() => onRemove(item.id)} style={styles.removeBtn} accessibilityRole="button" accessibilityLabel={`Remove ${item.name}`}>
        <Text style={styles.removeTxt}>×</Text>
      </TouchableOpacity>
    </View>
  );
});
PantryRow.displayName = 'PantryRow';

export default function PantryScreen() {
  const items = usePantryStore((s) => s.items);
  const addItem = usePantryStore((s) => s.addItem);
  const removeItem = usePantryStore((s) => s.removeItem);

  const [search, setSearch] = useState('');
  const [collapsed, setCollapsed] = useState<Record<StorageCategory, boolean>>({ Fridge: false, Cupboard: false, Freezer: false });
  const [showModal, setShowModal] = useState(false);
  const [newName, setNewName] = useState('');
  const [newQty, setNewQty] = useState('');
  const [newCat, setNewCat] = useState<StorageCategory>('Fridge');
  const [refreshing, setRefreshing] = useState(false);

  const filtered = useMemo(
    () => items.filter((i) => i.name.toLowerCase().includes(search.toLowerCase())),
    [items, search],
  );

  const handleAdd = useCallback(() => {
    if (!newName.trim()) return;
    addItem({ name: newName.trim(), category: newCat, quantity: newQty || '1', expiry: defaultExpiry(newCat === 'Fridge' ? 5 : newCat === 'Freezer' ? 180 : 90), addedAt: new Date().toISOString(), source: 'manual' });
    setNewName(''); setNewQty(''); setShowModal(false);
  }, [newName, newQty, newCat, addItem]);

  const handleRefresh = useCallback(() => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 500);
  }, []);

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.title}>Pantry</Text>
        <TextInput style={styles.search} placeholder="Search items..." placeholderTextColor="#64748b" value={search} onChangeText={setSearch} />
      </View>

      <ScrollView refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} tintColor="#10b981" />}>
        {STORAGE_CATEGORIES.map((cat) => {
          const catItems = filtered.filter((i) => i.category === cat);
          const isCollapsed = collapsed[cat];
          return (
            <View key={cat} style={styles.section}>
              <TouchableOpacity style={styles.sectionHeader} onPress={() => setCollapsed((c) => ({ ...c, [cat]: !c[cat] }))} accessibilityRole="button">
                <Text style={styles.sectionTitle}>{cat === 'Fridge' ? '🧊' : cat === 'Cupboard' ? '🗄️' : '❄️'} {cat}</Text>
                <Text style={styles.sectionCount}>{catItems.length} {isCollapsed ? '▶' : '▼'}</Text>
              </TouchableOpacity>
              {!isCollapsed && (
                catItems.length > 0
                  ? <FlatList data={catItems} keyExtractor={(i) => i.id.toString()} renderItem={({ item }) => <PantryRow item={item} onRemove={removeItem} />} scrollEnabled={false} />
                  : <Text style={styles.empty}>No items. Tap + to add.</Text>
              )}
            </View>
          );
        })}
        {items.length === 0 && (
          <View style={styles.emptyState}>
            <Text style={styles.emptyIcon}>🧺</Text>
            <Text style={styles.emptyTitle}>Your pantry is empty</Text>
            <Text style={styles.emptySub}>Tap + to add items or scan your fridge!</Text>
          </View>
        )}
      </ScrollView>

      <TouchableOpacity style={styles.fab} onPress={() => setShowModal(true)} accessibilityRole="button" accessibilityLabel="Add pantry item">
        <Text style={styles.fabText}>+</Text>
      </TouchableOpacity>

      <Modal visible={showModal} animationType="slide" transparent onRequestClose={() => setShowModal(false)}>
        <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPress={() => setShowModal(false)}>
          <View style={styles.modalSheet}>
            <Text style={styles.modalTitle}>Add Item</Text>
            <View style={styles.catRow}>
              {STORAGE_CATEGORIES.map((c) => (
                <TouchableOpacity key={c} style={[styles.catBtn, newCat === c && styles.catBtnActive]} onPress={() => setNewCat(c)} accessibilityRole="button">
                  <Text style={[styles.catBtnText, newCat === c && styles.catBtnTextActive]}>{c}</Text>
                </TouchableOpacity>
              ))}
            </View>
            <Text style={styles.label}>Quick add:</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipsRow}>
              {COMMON_ITEMS[newCat].map((name) => (
                <TouchableOpacity key={name} style={styles.chip} onPress={() => setNewName(name)} accessibilityRole="button">
                  <Text style={styles.chipText}>{name}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
            <TextInput style={styles.input} placeholder="Item name" placeholderTextColor="#64748b" value={newName} onChangeText={setNewName} />
            <TextInput style={styles.input} placeholder="Quantity (e.g. 2, 500g)" placeholderTextColor="#64748b" value={newQty} onChangeText={setNewQty} />
            <TouchableOpacity style={styles.addBtn} onPress={handleAdd} accessibilityRole="button">
              <Text style={styles.addBtnText}>Add to Pantry</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0f172a' },
  header: { paddingHorizontal: 16, paddingBottom: 12 },
  title: { fontSize: 24, fontWeight: '800', color: '#f1f5f9', marginBottom: 10 },
  search: { backgroundColor: '#1e293b', borderRadius: 12, paddingHorizontal: 14, paddingVertical: 10, color: '#f1f5f9', fontSize: 14 },
  section: { marginBottom: 4 },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 12, backgroundColor: '#1e293b' },
  sectionTitle: { fontSize: 15, fontWeight: '700', color: '#f1f5f9' },
  sectionCount: { fontSize: 13, color: '#64748b' },
  row: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#1e293b' },
  rowInfo: { flex: 1 },
  rowName: { fontSize: 14, color: '#f1f5f9', fontWeight: '500' },
  rowQty: { fontSize: 12, color: '#64748b', marginTop: 2 },
  rowExpiry: { fontSize: 12, fontWeight: '600', marginRight: 10 },
  removeBtn: { width: 28, height: 28, borderRadius: 14, backgroundColor: '#1e293b', justifyContent: 'center', alignItems: 'center' },
  removeTxt: { color: '#ef4444', fontSize: 18, lineHeight: 20 },
  empty: { padding: 16, color: '#64748b', fontSize: 13 },
  emptyState: { alignItems: 'center', padding: 60 },
  emptyIcon: { fontSize: 64, marginBottom: 16 },
  emptyTitle: { fontSize: 18, fontWeight: '700', color: '#f1f5f9', marginBottom: 8 },
  emptySub: { fontSize: 14, color: '#64748b', textAlign: 'center' },
  fab: { position: 'absolute', bottom: 24, right: 24, width: 56, height: 56, borderRadius: 28, backgroundColor: '#10b981', justifyContent: 'center', alignItems: 'center', elevation: 8 },
  fabText: { color: '#fff', fontSize: 28, lineHeight: 30 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'flex-end' },
  modalSheet: { backgroundColor: '#1e293b', borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24, paddingBottom: 40 },
  modalTitle: { fontSize: 18, fontWeight: '700', color: '#f1f5f9', marginBottom: 16 },
  catRow: { flexDirection: 'row', gap: 8, marginBottom: 16 },
  catBtn: { flex: 1, paddingVertical: 8, borderRadius: 10, backgroundColor: '#0f172a', alignItems: 'center' },
  catBtnActive: { backgroundColor: '#10b981' },
  catBtnText: { color: '#64748b', fontWeight: '600', fontSize: 13 },
  catBtnTextActive: { color: '#fff' },
  label: { fontSize: 12, color: '#64748b', marginBottom: 8 },
  chipsRow: { marginBottom: 16 },
  chip: { backgroundColor: '#0f172a', borderRadius: 20, paddingHorizontal: 12, paddingVertical: 6, marginRight: 8 },
  chipText: { color: '#94a3b8', fontSize: 12 },
  input: { backgroundColor: '#0f172a', borderRadius: 12, padding: 12, color: '#f1f5f9', fontSize: 14, marginBottom: 10 },
  addBtn: { backgroundColor: '#10b981', paddingVertical: 14, borderRadius: 14, alignItems: 'center', marginTop: 8 },
  addBtnText: { color: '#fff', fontWeight: '700', fontSize: 15 },
});
