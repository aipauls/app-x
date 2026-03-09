# React Native / Expo Standards

## Framework

- App.X uses Expo SDK 52 with TypeScript
- Target platforms: iOS, Android, and web
- Navigation: React Navigation (bottom tabs + native stack)
- State management: Zustand for global state, React hooks for local state
- Storage: AsyncStorage for persistence

## Component Structure

```typescript
// 1. Imports (grouped per typescript.md rules)
import { useState } from "react";
import { View, Text, StyleSheet } from "react-native";
import { PantryItem } from "../types/pantry";

// 2. Props interface
interface PantryItemRowProps {
  item: PantryItem;
  onRemove: (id: number) => void;
}

// 3. Component (named export for components, default for screens)
export function PantryItemRow({ item, onRemove }: PantryItemRowProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.name}>{item.name}</Text>
    </View>
  );
}

// 4. Styles (always StyleSheet.create, always at bottom)
const styles = StyleSheet.create({
  container: { flexDirection: "row", padding: 12 },
  name: { fontSize: 14, color: "#1f2937" },
});
```

## Component Rules

- One component per file. File name matches component name.
- Screens in `src/screens/`, reusable UI in `src/components/`.
- Never use inline styles. Always use `StyleSheet.create`.
- Keep components under 150 lines. Extract sub-components if longer.

## Hooks

- Custom hooks live in `src/hooks/` with `use` prefix.
- Hooks should do one thing well.
- Always include dependencies in `useCallback` and `useMemo` arrays.
- Use `useRef` for values that shouldn't trigger re-renders.

## State Management

- Local state (`useState`): UI state like inputs, modals, tabs.
- Zustand stores (`src/store/`): Shared state across screens.
- Never put raw API responses into global state.

## Performance

- Use `React.memo` for list item components.
- Use `FlatList` for any list over 20 items.
- Resize camera images before API calls (max 1024px longest edge).
- Debounce search inputs by 300ms.

## Platform

- Test on both iOS and Android.
- Use `SafeAreaView` or `useSafeAreaInsets` on all screens.
- Use Expo cross-platform APIs over native modules.
