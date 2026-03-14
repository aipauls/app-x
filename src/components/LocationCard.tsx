import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

import type { LocationResult } from '../types/agents';

interface Props {
  data: LocationResult;
}

export function LocationCard({ data }: Props) {
  return (
    <View style={styles.card}>
      <Text style={styles.title}>📍 Nearby Stores</Text>

      {data.stores.map((store, i) => (
        <View key={i} style={styles.storeRow}>
          <View style={styles.storeHeader}>
            <Text style={styles.storeName}>{store.name}</Text>
            <Text style={styles.distance}>{store.distance}</Text>
          </View>
          <View style={styles.options}>
            {store.delivery_available && (
              <Text style={styles.option}>🚚 {store.delivery_time} · {store.delivery_fee}</Text>
            )}
            {store.collection_available && (
              <Text style={styles.option}>🏪 Collection</Text>
            )}
          </View>
          <Text style={styles.rec}>{store.recommendation}</Text>
        </View>
      ))}

      {data.best_option && (
        <View style={styles.bestBox}>
          <Text style={styles.bestTitle}>Best option:</Text>
          <Text style={styles.bestText}>
            {data.best_option.method === 'delivery' ? '🚚' : '🏪'} {data.best_option.store}
          </Text>
          <Text style={styles.bestReason}>{data.best_option.reason}</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: { backgroundColor: '#1e293b', borderRadius: 14, padding: 14, marginBottom: 10 },
  title: { fontSize: 14, fontWeight: '700', color: '#fb7185', marginBottom: 10 },
  storeRow: { marginBottom: 10, paddingBottom: 10, borderBottomWidth: 1, borderBottomColor: '#0f172a' },
  storeHeader: { flexDirection: 'row', justifyContent: 'space-between' },
  storeName: { fontSize: 14, fontWeight: '600', color: '#f1f5f9' },
  distance: { fontSize: 12, color: '#94a3b8' },
  options: { flexDirection: 'row', gap: 10, marginTop: 4 },
  option: { fontSize: 12, color: '#cbd5e1' },
  rec: { fontSize: 11, color: '#94a3b8', marginTop: 4, fontStyle: 'italic' },
  bestBox: { marginTop: 4, backgroundColor: '#0f172a', borderRadius: 10, padding: 10 },
  bestTitle: { fontSize: 11, color: '#94a3b8' },
  bestText: { fontSize: 14, fontWeight: '700', color: '#f1f5f9', marginVertical: 2 },
  bestReason: { fontSize: 12, color: '#94a3b8' },
});
