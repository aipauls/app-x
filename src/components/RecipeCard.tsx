import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

import type { Recipe } from '../types/agents';

interface Props {
  recipe: Recipe;
  pantryItems: string[];
  onAddMissing?: (items: string[]) => void;
}

export function RecipeCard({ recipe, pantryItems, onAddMissing }: Props) {
  const [expanded, setExpanded] = useState(false);
  const matched = recipe.uses_ingredients.filter((i) =>
    pantryItems.some((p) => p.toLowerCase().includes(i.toLowerCase())),
  ).length;
  const pct = recipe.uses_ingredients.length > 0
    ? Math.round((matched / recipe.uses_ingredients.length) * 100)
    : 100;

  return (
    <View style={styles.card}>
      <TouchableOpacity onPress={() => setExpanded(!expanded)} accessibilityRole="button">
        <View style={styles.header}>
          <Text style={styles.name}>{recipe.name}</Text>
          <View style={styles.badges}>
            <Text style={styles.badge}>{recipe.difficulty}</Text>
            <Text style={styles.badge}>⏱ {recipe.time_minutes}m</Text>
            <Text style={[styles.badge, styles.matchBadge]}>{pct}% match</Text>
          </View>
        </View>
        <Text style={styles.desc}>{recipe.description}</Text>
      </TouchableOpacity>

      {expanded && (
        <View style={styles.expanded}>
          {recipe.steps.map((step, i) => (
            <Text key={i} style={styles.step}>{i + 1}. {step}</Text>
          ))}
          {recipe.missing_ingredients.length > 0 && (
            <View style={styles.missingBox}>
              <Text style={styles.missingTitle}>Need: {recipe.missing_ingredients.join(', ')}</Text>
              {onAddMissing && (
                <TouchableOpacity
                  style={styles.addBtn}
                  onPress={() => onAddMissing(recipe.missing_ingredients)}
                  accessibilityRole="button"
                >
                  <Text style={styles.addBtnText}>+ Add to shopping list</Text>
                </TouchableOpacity>
              )}
            </View>
          )}
          {recipe.chef_tip ? <Text style={styles.tip}>💡 {recipe.chef_tip}</Text> : null}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: { backgroundColor: '#1e293b', borderRadius: 14, padding: 14, marginBottom: 10 },
  header: { marginBottom: 4 },
  name: { fontSize: 15, fontWeight: '700', color: '#f1f5f9', marginBottom: 4 },
  badges: { flexDirection: 'row', flexWrap: 'wrap', gap: 4 },
  badge: { fontSize: 11, color: '#94a3b8', backgroundColor: '#0f172a', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 8 },
  matchBadge: { color: '#10b981', backgroundColor: '#052e16' },
  desc: { fontSize: 13, color: '#94a3b8', lineHeight: 18 },
  expanded: { marginTop: 12 },
  step: { fontSize: 13, color: '#cbd5e1', marginBottom: 6, lineHeight: 18 },
  missingBox: { marginTop: 8, padding: 10, backgroundColor: '#0f172a', borderRadius: 10 },
  missingTitle: { fontSize: 12, color: '#f59e0b' },
  addBtn: { marginTop: 8, backgroundColor: '#10b981', paddingVertical: 6, borderRadius: 8, alignItems: 'center' },
  addBtnText: { color: '#fff', fontSize: 12, fontWeight: '600' },
  tip: { marginTop: 8, fontSize: 12, color: '#6ee7b7', fontStyle: 'italic' },
});
