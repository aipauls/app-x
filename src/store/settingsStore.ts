import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

import type { DietaryPreference } from '../types/pantry';

interface SettingsStore {
  dietary: DietaryPreference;
  location: string;
  setDietary: (pref: DietaryPreference) => void;
  setLocation: (loc: string) => void;
}

export const useSettingsStore = create<SettingsStore>()(
  persist(
    (set) => ({
      dietary: 'None',
      location: process.env.EXPO_PUBLIC_DEFAULT_LOCATION ?? 'London, UK',
      setDietary: (dietary) => set({ dietary }),
      setLocation: (location) => set({ location }),
    }),
    { name: '@appx_settings', storage: createJSONStorage(() => AsyncStorage) },
  ),
);
