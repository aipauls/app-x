import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { daysFromNow } from '../utils/dates';
import type { PantryItem, StorageCategory } from '../types/pantry';

interface PantryStore {
  items: PantryItem[];
  nextId: number;
  addItem: (item: Omit<PantryItem, 'id'>) => void;
  removeItem: (id: number) => void;
  updateItem: (id: number, updates: Partial<PantryItem>) => void;
  getExpiring: (withinDays: number) => PantryItem[];
  getByCategory: (cat: StorageCategory) => PantryItem[];
}

export const usePantryStore = create<PantryStore>()(
  persist(
    (set, get) => ({
      items: [],
      nextId: 1,
      addItem: (item) => {
        const { items, nextId } = get();
        const exists = items.find(
          (i) => i.name.toLowerCase() === item.name.toLowerCase() && i.category === item.category,
        );
        if (exists) return;
        set({ items: [...items, { ...item, id: nextId }], nextId: nextId + 1 });
      },
      removeItem: (id) => set((s) => ({ items: s.items.filter((i) => i.id !== id) })),
      updateItem: (id, updates) =>
        set((s) => ({ items: s.items.map((i) => (i.id === id ? { ...i, ...updates } : i)) })),
      getExpiring: (withinDays) =>
        get()
          .items.filter((i) => i.expiry && daysFromNow(i.expiry) <= withinDays && daysFromNow(i.expiry) >= 0)
          .sort((a, b) => daysFromNow(a.expiry) - daysFromNow(b.expiry)),
      getByCategory: (cat) => get().items.filter((i) => i.category === cat),
    }),
    { name: '@appx_pantry_v2', storage: createJSONStorage(() => AsyncStorage) },
  ),
);
