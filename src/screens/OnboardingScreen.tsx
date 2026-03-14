import React, { useRef, useState } from 'react';
import {
  View, Text, StyleSheet, Dimensions, ScrollView, TouchableOpacity, Animated,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const { width: W } = Dimensions.get('window');

const SLIDES = [
  {
    icon: '📷',
    title: 'Scan Your Kitchen',
    desc: "Take a photo of your fridge and I'll identify every ingredient automatically.",
  },
  {
    icon: '👨\u200d🍳',
    title: 'Smart Recipes',
    desc: "I'll suggest meals from what you already have, prioritising food that's about to expire.",
  },
  {
    icon: '🛒',
    title: 'Shop Smarter',
    desc: 'Find the best prices and get groceries delivered to your door.',
  },
];

interface Props {
  onComplete: () => void;
}

export default function OnboardingScreen({ onComplete }: Props) {
  const [page, setPage] = useState(0);
  const scrollRef = useRef<ScrollView>(null);
  const dotAnims = useRef(SLIDES.map((_, i) => new Animated.Value(i === 0 ? 1 : 0))).current;

  const goTo = (index: number) => {
    scrollRef.current?.scrollTo({ x: index * W, animated: true });
    setPage(index);
    SLIDES.forEach((_, i) => {
      Animated.timing(dotAnims[i], { toValue: i === index ? 1 : 0, duration: 200, useNativeDriver: false }).start();
    });
  };

  const handleNext = () => {
    if (page < SLIDES.length - 1) goTo(page + 1);
    else onComplete();
  };

  return (
    <SafeAreaView style={styles.container}>
      <TouchableOpacity style={styles.skip} onPress={onComplete} accessibilityRole="button" accessibilityLabel="Skip onboarding">
        <Text style={styles.skipText}>Skip</Text>
      </TouchableOpacity>

      <ScrollView
        ref={scrollRef}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        scrollEnabled={false}
      >
        {SLIDES.map((slide, i) => (
          <View key={i} style={styles.slide}>
            <Text style={styles.icon}>{slide.icon}</Text>
            <Text style={styles.title}>{slide.title}</Text>
            <Text style={styles.desc}>{slide.desc}</Text>
          </View>
        ))}
      </ScrollView>

      <View style={styles.footer}>
        <View style={styles.dots}>
          {SLIDES.map((_, i) => (
            <Animated.View
              key={i}
              style={[styles.dot, {
                width: dotAnims[i].interpolate({ inputRange: [0, 1], outputRange: [8, 24] }),
                backgroundColor: dotAnims[i].interpolate({ inputRange: [0, 1], outputRange: ['#1e293b', '#10b981'] }),
              }]}
            />
          ))}
        </View>
        <TouchableOpacity style={styles.btn} onPress={handleNext} accessibilityRole="button">
          <Text style={styles.btnText}>{page === SLIDES.length - 1 ? 'Get Started' : 'Next'}</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0f172a' },
  skip: { position: 'absolute', top: 60, right: 24, zIndex: 10 },
  skipText: { color: '#64748b', fontSize: 14 },
  slide: { width: W, flex: 1, justifyContent: 'center', alignItems: 'center', padding: 40 },
  icon: { fontSize: 80, marginBottom: 32 },
  title: { fontSize: 28, fontWeight: '800', color: '#f1f5f9', textAlign: 'center', marginBottom: 16 },
  desc: { fontSize: 16, color: '#94a3b8', textAlign: 'center', lineHeight: 24 },
  footer: { paddingHorizontal: 32, paddingBottom: 48, alignItems: 'center', gap: 24 },
  dots: { flexDirection: 'row', gap: 8, alignItems: 'center' },
  dot: { height: 8, borderRadius: 4 },
  btn: { width: '100%', backgroundColor: '#10b981', paddingVertical: 16, borderRadius: 16, alignItems: 'center' },
  btnText: { color: '#fff', fontWeight: '800', fontSize: 16 },
});
