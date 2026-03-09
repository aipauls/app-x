import { useState, useCallback, useEffect } from "react";
import { PantryItem, StorageCategory } from "../types/pantry";
import { savePantry, loadPantry } from "../services/storage";
import { defaultExpiry } from "../utils/dates";

export function usePantry() {
  const [pantry, setPantry] = useState<PantryItem[]>([]);
  const [nextId, setNextId] = useState(1);

  // Load from storage on mount
  useEffect(() => {
    loadPantry<PantryItem[]>().then((data) => {
      if (data && data.length > 0) {
        setPantry(data);
        setNextId(Math.max(...data.map((i) => i.id)) + 1);
      }
    });
  }, []);

  // Persist on change
  useEffect(() => {
    if (pantry.length > 0) savePantry(pantry);
  }, [pantry]);

  const addItem = useCallback(
    (name: string, category: StorageCategory, quantity: string, expiry: string, source: PantryItem["source"] = "manual") => {
      const exists = pantry.find((p) => p.name.toLowerCase() === name.toLowerCase() && p.category === category);
      if (exists) return;

      setPantry((prev) => [
        ...prev,
        {
          id: nextId,
          name,
          category,
          quantity,
          expiry: expiry || "",
          addedAt: new Date().toISOString(),
          source,
        },
      ]);
      setNextId((n) => n + 1);
    },
    [pantry, nextId]
  );

  const removeItem = useCallback((id: number) => {
    setPantry((prev) => prev.filter((i) => i.id !== id));
  }, []);

  const updateItem = useCallback((id: number, updates: Partial<PantryItem>) => {
    setPantry((prev) => prev.map((i) => (i.id === id ? { ...i, ...updates } : i)));
  }, []);

  const getByCategory = useCallback(
    (category: StorageCategory) => pantry.filter((i) => i.category === category),
    [pantry]
  );

  return { pantry, addItem, removeItem, updateItem, getByCategory };
}
