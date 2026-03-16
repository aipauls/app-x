import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface PantryItem {
  id: string;
  name: string;
  quantity: string;
  category: 'fridge' | 'cupboard' | 'freezer';
  expiryDate?: string;
  addedDate: string;
}

export interface ShoppingItem {
  id: string;
  name: string;
  price?: number;
  completed: boolean;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'status';
  content: string;
  agents?: string[];
  richContent?: RichContent;
  timestamp: string;
}

export interface RichContent {
  type: 'recipes' | 'prices' | 'stores';
  data: any;
}

export interface Recipe {
  id: string;
  name: string;
  description: string;
  matchPercent: number;
  time: string;
  difficulty: string;
  servings: number;
  tags: string[];
  haveIngredients: string[];
  needIngredients: string[];
  steps: string[];
  chefTip: string;
}

export interface User {
  name: string;
  email: string;
  avatar?: string;
}

interface AppState {
  hasOnboarded: boolean;
  setHasOnboarded: (v: boolean) => void;
  user: User | null;
  signIn: (name: string, email: string) => void;
  signOut: () => void;
  updateUser: (updates: Partial<User>) => void;
  pantryItems: PantryItem[];
  addPantryItem: (item: Omit<PantryItem, 'id' | 'addedDate'>) => void;
  removePantryItem: (id: string) => void;
  shoppingItems: ShoppingItem[];
  addShoppingItem: (name: string) => void;
  toggleShoppingItem: (id: string) => void;
  removeShoppingItem: (id: string) => void;
  clearCompletedItems: () => void;
  chatMessages: ChatMessage[];
  addChatMessage: (msg: Omit<ChatMessage, 'id' | 'timestamp'>) => void;
  dietaryPreferences: string[];
  setDietaryPreferences: (prefs: string[]) => void;
  notificationsEnabled: boolean;
  setNotificationsEnabled: (v: boolean) => void;
}

const MOCK_PANTRY: PantryItem[] = [
  { id: '1', name: 'Chicken Breast', quantity: '2 pieces', category: 'fridge', expiryDate: new Date(Date.now() + 86400000).toISOString(), addedDate: new Date().toISOString() },
  { id: '2', name: 'Eggs', quantity: '6', category: 'fridge', expiryDate: new Date(Date.now() + 172800000).toISOString(), addedDate: new Date().toISOString() },
  { id: '3', name: 'Milk', quantity: '1L', category: 'fridge', expiryDate: new Date(Date.now() + 345600000).toISOString(), addedDate: new Date().toISOString() },
  { id: '4', name: 'Spinach', quantity: '200g', category: 'fridge', expiryDate: new Date(Date.now() + 86400000 * 2).toISOString(), addedDate: new Date().toISOString() },
  { id: '5', name: 'Cheddar Cheese', quantity: '250g', category: 'fridge', expiryDate: new Date(Date.now() + 86400000 * 7).toISOString(), addedDate: new Date().toISOString() },
  { id: '6', name: 'Rice', quantity: '1kg', category: 'cupboard', addedDate: new Date().toISOString() },
  { id: '7', name: 'Pasta', quantity: '500g', category: 'cupboard', addedDate: new Date().toISOString() },
  { id: '8', name: 'Tinned Tomatoes', quantity: '3 cans', category: 'cupboard', addedDate: new Date().toISOString() },
  { id: '9', name: 'Olive Oil', quantity: '500ml', category: 'cupboard', addedDate: new Date().toISOString() },
  { id: '10', name: 'Frozen Peas', quantity: '500g', category: 'freezer', addedDate: new Date().toISOString() },
  { id: '11', name: 'Fish Fingers', quantity: '10 pieces', category: 'freezer', expiryDate: new Date(Date.now() + 86400000 * 30).toISOString(), addedDate: new Date().toISOString() },
  { id: '12', name: 'Ice Cream', quantity: '500ml', category: 'freezer', addedDate: new Date().toISOString() },
];

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      hasOnboarded: false,
      setHasOnboarded: (v) => set({ hasOnboarded: v }),
      user: null,
      signIn: (name, email) => set({ user: { name, email } }),
      signOut: () => set({ user: null }),
      updateUser: (updates) => set((s) => ({ user: s.user ? { ...s.user, ...updates } : null })),
      pantryItems: MOCK_PANTRY,
      addPantryItem: (item) =>
        set((s) => ({
          pantryItems: [...s.pantryItems, { ...item, id: crypto.randomUUID(), addedDate: new Date().toISOString() }],
        })),
      removePantryItem: (id) => set((s) => ({ pantryItems: s.pantryItems.filter((i) => i.id !== id) })),
      shoppingItems: [
        { id: '1', name: 'Garlic', completed: false },
        { id: '2', name: 'Onions', completed: false },
        { id: '3', name: 'Butter', completed: false },
      ],
      addShoppingItem: (name) =>
        set((s) => ({
          shoppingItems: [...s.shoppingItems, { id: crypto.randomUUID(), name, completed: false }],
        })),
      toggleShoppingItem: (id) =>
        set((s) => ({
          shoppingItems: s.shoppingItems.map((i) => (i.id === id ? { ...i, completed: !i.completed } : i)),
        })),
      removeShoppingItem: (id) => set((s) => ({ shoppingItems: s.shoppingItems.filter((i) => i.id !== id) })),
      clearCompletedItems: () => set((s) => ({ shoppingItems: s.shoppingItems.filter((i) => !i.completed) })),
      chatMessages: [],
      addChatMessage: (msg) =>
        set((s) => ({
          chatMessages: [...s.chatMessages, { ...msg, id: crypto.randomUUID(), timestamp: new Date().toISOString() }],
        })),
      dietaryPreferences: [],
      setDietaryPreferences: (prefs) => set({ dietaryPreferences: prefs }),
      notificationsEnabled: true,
      setNotificationsEnabled: (v) => set({ notificationsEnabled: v }),
    }),
    { name: 'appx-storage' }
  )
);
