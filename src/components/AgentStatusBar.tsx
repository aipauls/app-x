import React, { useRef, useEffect } from 'react';
import { View, Text, Animated, StyleSheet } from 'react-native';

import type { AgentId } from '../types/agents';

const AGENT_META: Record<string, { name: string; icon: string; color: string }> = {
  orchestrator: { name: 'Orchestrator', icon: '⚡', color: '#818cf8' },
  image: { name: 'Vision', icon: '📷', color: '#60a5fa' },
  cooking: { name: 'Chef', icon: '👨‍🍳', color: '#34d399' },
  shopping: { name: 'Shopping', icon: '🛒', color: '#fbbf24' },
  location: { name: 'Location', icon: '📍', color: '#fb7185' },
  waste_reduction: { name: 'Waste AI', icon: '♻️', color: '#a78bfa' },
};

function AgentPill({ agentId }: { agentId: AgentId }) {
  const pulse = useRef(new Animated.Value(1)).current;
  const meta = AGENT_META[agentId] ?? { name: agentId, icon: '🤖', color: '#94a3b8' };

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, { toValue: 0.4, duration: 700, useNativeDriver: true }),
        Animated.timing(pulse, { toValue: 1, duration: 700, useNativeDriver: true }),
      ]),
    ).start();
  }, [pulse]);

  return (
    <View style={[styles.pill, { borderColor: meta.color }]}>
      <Animated.View style={[styles.dot, { backgroundColor: meta.color, opacity: pulse }]} />
      <Text style={styles.pillText}>{meta.icon} {meta.name}</Text>
    </View>
  );
}

interface Props {
  agents: AgentId[];
}

export function AgentStatusBar({ agents }: Props) {
  if (agents.length === 0) return null;
  return (
    <View style={styles.bar}>
      {agents.map((id) => <AgentPill key={id} agentId={id} />)}
    </View>
  );
}

const styles = StyleSheet.create({
  bar: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, paddingHorizontal: 16, paddingVertical: 8 },
  pill: { flexDirection: 'row', alignItems: 'center', gap: 5, paddingHorizontal: 10, paddingVertical: 5, borderRadius: 20, borderWidth: 1, backgroundColor: '#0f172a' },
  dot: { width: 6, height: 6, borderRadius: 3 },
  pillText: { fontSize: 12, color: '#cbd5e1', fontWeight: '500' },
});
