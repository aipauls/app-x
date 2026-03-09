export type StorageCategory = "Fridge" | "Cupboard" | "Freezer";

export type ExpiryStatus = "expired" | "urgent" | "soon" | "ok" | "none";

export interface PantryItem {
  id: number;
  name: string;
  category: StorageCategory;
  quantity: string;
  expiry: string;
  addedAt: string;
  source: "manual" | "image" | "quick-add";
}

export interface ShoppingListItem {
  name: string;
  checked: boolean;
  addedFrom?: string;
}

export type DietaryPreference =
  | "None"
  | "Vegetarian"
  | "Vegan"
  | "Gluten-Free"
  | "Dairy-Free"
  | "Keto"
  | "Low-Carb";
