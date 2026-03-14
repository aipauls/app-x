import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

import type { ShoppingResult } from '../types/agents';

interface Props {
  data: ShoppingResult;
  onAddAll?: (names: string[]) => void;
}

export function ShoppingCard({ data, onAddAll }: Props) {
  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <Text style={styles.title}>🛒 Shopping List</Text>
        <View style={styles.totals}>
          <Text style={styles.total}>Est: {data.total_estimated}</Text>
          <Text style={styles.budget}>Budget: {data.budget_total}</Text>
        </View>
      </View>

      {data.shopping_list.map((item, i) => (
        <View key={i} style={styles.row}>
          <View style={styles.itemInfo}>
            <Text style={styles.itemName}>{item.item}</Text>
            {item.budget_alternative ? (
              <Text style={styles.alt}>Alt: {item.budget_alternative} ({item.budget_price})</Text>
            ) : null}
          </View>
          <Text style={styles.price}>{item.estimated_price}</Text>
        </View>
      ))}

      {data.money_saving_tips.length > 0 && (
        <View style={styles.tips}>
          {data.money_saving_tips.map((tip, i) => (
            <Text key={i} style={styles.tip}>💡 {tip}</Text>
          ))}
        </View>
      )}

      {onAddAll && (
        <TouchableOpacity
          style={styles.addBtn}
          onPress={() => onAddAll(data.shopping_list.map((i) => i.item))}
          accessibilityRole="button"
          accessibilityLabel="Add all to shopping list"
        >
          <Text style={styles.addBtnText}>+ Add all to my list</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: { backgroundColor: '#1e293b', borderRadius: 14, padding: 14, marginBottom: 10 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 },
  title: { fontSize: 14, fontWeight: '700', color: '#fbbf24' },
  totals: { alignItems: 'flex-end' },
  total: { fontSize: 12, color: '#f1f5f9', fontWeight: '600' },
  budget: { fontSize: 11, color: '#10b981' },
  row: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 6, borderBottomWidth: 1, borderBottomColor: '#0f172a' },
  itemInfo: { flex: 1 },
  itemName: { fontSize: 13, color: '#f1f5f9' },
  alt: { fontSize: 11, color: '#10b981', marginTop: 2 },
  price: { fontSize: 13, color: '#fbbf24', fontWeight: '600', marginLeft: 8 },
  tips: { marginTop: 10 },
  tip: { fontSize: 12, color: '#94a3b8', marginBottom: 4 },
  addBtn: { marginTop: 10, backgroundColor: '#854d0e', paddingVertical: 8, borderRadius: 10, alignItems: 'center' },
  addBtnText: { color: '#fbbf24', fontWeight: '600', fontSize: 13 },
});
