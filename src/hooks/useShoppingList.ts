import { useState, useCallback, useEffect } from "react";
import { ShoppingListItem } from "../types/pantry";
import { saveShoppingList, loadShoppingList } from "../services/storage";

export function useShoppingList() {
  const [items, setItems] = useState<ShoppingListItem[]>([]);

  useEffect(() => {
    loadShoppingList<ShoppingListItem[]>().then((data) => {
      if (data) setItems(data);
    });
  }, []);

  useEffect(() => {
    saveShoppingList(items);
  }, [items]);

  const addItem = useCallback((name: string, addedFrom?: string) => {
    setItems((prev) => {
      if (prev.find((i) => i.name.toLowerCase() === name.toLowerCase())) return prev;
      return [...prev, { name, checked: false, addedFrom }];
    });
  }, []);

  const toggleItem = useCallback((index: number) => {
    setItems((prev) => prev.map((item, i) => (i === index ? { ...item, checked: !item.checked } : item)));
  }, []);

  const removeItem = useCallback((index: number) => {
    setItems((prev) => prev.filter((_, i) => i !== index));
  }, []);

  const clearChecked = useCallback(() => {
    setItems((prev) => prev.filter((i) => !i.checked));
  }, []);

  const addMultiple = useCallback((names: string[], addedFrom?: string) => {
    names.forEach((name) => addItem(name, addedFrom));
  }, [addItem]);

  return { items, addItem, toggleItem, removeItem, clearChecked, addMultiple };
}
