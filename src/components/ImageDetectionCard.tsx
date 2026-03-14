import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

import type { ImageDetectionResult } from '../types/agents';

interface Props {
  data: ImageDetectionResult;
  onAddAll?: (items: Array<{ name: string; category: 'Fridge' | 'Cupboard' | 'Freezer'; qty: string }>) => void;
}

export function ImageDetectionCard({ data, onAddAll }: Props) {
  return (
    <View style={styles.card}>
      <Text style={styles.title}>📷 Detected Ingredients</Text>
      {data.ingredients.map((item, i) => (
        <View key={i} style={styles.row}>
          <View style={styles.info}>
            <Text style={styles.name}>{item.name}</Text>
            <Text style={styles.meta}>{item.category} · {item.estimated_quantity}</Text>
          </View>
          <View style={[styles.conf, { opacity: item.confidence }]}>
            <Text style={styles.confText}>{Math.round(item.confidence * 100)}%</Text>
          </View>
        </View>
      ))}
      {data.notes ? <Text style={styles.notes}>{data.notes}</Text> : null}
      {onAddAll && (
        <TouchableOpacity
          style={styles.addBtn}
          onPress={() => onAddAll(data.ingredients.map((i) => ({ name: i.name, category: i.category, qty: i.estimated_quantity })))}
          accessibilityRole="button"
          accessibilityLabel="Add all to pantry"
        >
          <Text style={styles.addBtnText}>+ Add all to pantry</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: { backgroundColor: '#1e293b', borderRadius: 14, padding: 14, marginBottom: 10 },
  title: { fontSize: 14, fontWeight: '700', color: '#60a5fa', marginBottom: 10 },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 6, borderBottomWidth: 1, borderBottomColor: '#0f172a' },
  info: { flex: 1 },
  name: { fontSize: 13, color: '#f1f5f9', fontWeight: '500' },
  meta: { fontSize: 11, color: '#64748b', marginTop: 1 },
  conf: { backgroundColor: '#172554', borderRadius: 8, paddingHorizontal: 8, paddingVertical: 2 },
  confText: { fontSize: 11, color: '#60a5fa', fontWeight: '600' },
  notes: { fontSize: 12, color: '#94a3b8', marginTop: 8, fontStyle: 'italic' },
  addBtn: { marginTop: 10, backgroundColor: '#1e3a5f', paddingVertical: 8, borderRadius: 10, alignItems: 'center' },
  addBtnText: { color: '#60a5fa', fontWeight: '600', fontSize: 13 },
});
