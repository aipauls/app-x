import { StorageCategory, DietaryPreference } from "../types/pantry";

export const STORAGE_CATEGORIES: StorageCategory[] = ["Fridge", "Cupboard", "Freezer"];

export const DIETARY_OPTIONS: DietaryPreference[] = [
  "None", "Vegetarian", "Vegan", "Gluten-Free", "Dairy-Free", "Keto", "Low-Carb",
];

export const COMMON_ITEMS: Record<StorageCategory, string[]> = {
  Fridge: [
    "Milk", "Eggs", "Butter", "Cheese", "Yogurt",
    "Chicken Breast", "Bacon", "Carrots", "Spinach",
    "Bell Peppers", "Tomatoes", "Onions", "Garlic",
    "Lemons", "Cream", "Ham", "Mushrooms",
  ],
  Cupboard: [
    "Rice", "Pasta", "Flour", "Sugar", "Olive Oil",
    "Canned Tomatoes", "Chickpeas", "Lentils", "Soy Sauce",
    "Stock Cubes", "Oats", "Bread", "Peanut Butter",
    "Honey", "Baked Beans", "Salt", "Pepper",
  ],
  Freezer: [
    "Frozen Peas", "Frozen Berries", "Ice Cream",
    "Frozen Prawns", "Fish Fillets", "Frozen Chips",
    "Frozen Sweetcorn", "Mince Beef", "Frozen Bread",
    "Frozen Pizza",
  ],
};

export const DEFAULT_EXPIRY_DAYS: Record<StorageCategory, number> = {
  Fridge: 5,
  Cupboard: 90,
  Freezer: 180,
};
