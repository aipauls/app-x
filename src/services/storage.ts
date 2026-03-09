import AsyncStorage from "@react-native-async-storage/async-storage";

const KEYS = {
  pantry: "@appx_pantry",
  shoppingList: "@appx_shopping",
  preferences: "@appx_prefs",
};

export async function savePantry(data: unknown): Promise<void> {
  await AsyncStorage.setItem(KEYS.pantry, JSON.stringify(data));
}

export async function loadPantry<T>(): Promise<T | null> {
  const raw = await AsyncStorage.getItem(KEYS.pantry);
  return raw ? JSON.parse(raw) : null;
}

export async function saveShoppingList(data: unknown): Promise<void> {
  await AsyncStorage.setItem(KEYS.shoppingList, JSON.stringify(data));
}

export async function loadShoppingList<T>(): Promise<T | null> {
  const raw = await AsyncStorage.getItem(KEYS.shoppingList);
  return raw ? JSON.parse(raw) : null;
}

export async function savePreferences(data: unknown): Promise<void> {
  await AsyncStorage.setItem(KEYS.preferences, JSON.stringify(data));
}

export async function loadPreferences<T>(): Promise<T | null> {
  const raw = await AsyncStorage.getItem(KEYS.preferences);
  return raw ? JSON.parse(raw) : null;
}

export async function clearAll(): Promise<void> {
  await AsyncStorage.multiRemove(Object.values(KEYS));
}
