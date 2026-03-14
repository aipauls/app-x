import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

import type { ShoppingListItem } from '../types/pantry';

interface ShoppingStore {
  items: ShoppingListItem[];
  addItem: (name: string, addedFrom?: string) => void;
  toggleItem: (index: number) => void;
  removeItem: (index: number) => void;
  clearChecked: () => void;
  addMultiple: (names: string[], addedFrom?: string) => void;
}

export const useShoppingStore = create<ShoppingStore>()(
  persist(
    (set, get) => ({
      items: [],
      addItem: (name, addedFrom) => {
        const items = get().items;
        if (items.find((i) => i.name.toLowerCase() === name.toLowerCase())) return;
        set({ items: [...items, { name, checked: false, addedFrom }] });
      },
      toggleItem: (index) =>
        set((s) => ({
          items: s.items.map((item, i) => (i === index ? { ...item, checked: !item.checked } : item)),
        })),
      removeItem: (index) => set((s) => ({ items: s.items.filter((_, i) => i !== index) })),
      clearChecked: () => set((s) => ({ items: s.items.filter((i) => !i.checked) })),
      addMultiple: (names, addedFrom) => {
        names.forEach((name) => get().addItem(name, addedFrom));
      },
    }),
    { name: '@appx_shopping_v2', storage: createJSONStorage(() => AsyncStorage) },
  ),
);
