import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

import { getExpiryLabel, daysFromNow } from '../utils/dates';
import type { PantryItem } from '../types/pantry';

interface Props {
  item: PantryItem;
  onUseItUp: (item: PantryItem) => void;
}

export function ExpiryAlertCard({ item, onUseItUp }: Props) {
  const days = daysFromNow(item.expiry);
  const urgent = days <= 1;

  return (
    <View style={[styles.card, urgent && styles.urgentCard]}>
      <View style={styles.info}>
        <Text style={styles.name}>{item.name}</Text>
        <Text style={[styles.label, urgent && styles.urgentLabel]}>
          {getExpiryLabel(item.expiry)}
        </Text>
      </View>
      <TouchableOpacity
        style={styles.btn}
        onPress={() => onUseItUp(item)}
        accessibilityRole="button"
        accessibilityLabel={`Use up ${item.name}`}
      >
        <Text style={styles.btnText}>Use it up</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    backgroundColor: '#1e293b', borderRadius: 12, padding: 12, marginBottom: 8,
    borderLeftWidth: 3, borderLeftColor: '#f59e0b',
  },
  urgentCard: { borderLeftColor: '#ef4444' },
  info: { flex: 1 },
  name: { fontSize: 14, fontWeight: '600', color: '#f1f5f9' },
  label: { fontSize: 12, color: '#f59e0b', marginTop: 2 },
  urgentLabel: { color: '#ef4444' },
  btn: { backgroundColor: '#10b981', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8 },
  btnText: { color: '#fff', fontSize: 12, fontWeight: '600' },
});
