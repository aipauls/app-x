import { supabase } from "./supabase";

export async function savePantry(data: unknown[]): Promise<void> {
  await supabase.from("pantry_items").delete().neq("id", 0);
  if (data.length > 0) {
    await supabase.from("pantry_items").insert(
      (data as any[]).map(({ id, ...item }) => ({
        name: item.name,
        category: item.category,
        quantity: item.quantity,
        expiry: item.expiry,
        added_at: item.addedAt,
        source: item.source,
      }))
    );
  }
}

export async function loadPantry<T>(): Promise<T | null> {
  const { data, error } = await supabase
    .from("pantry_items")
    .select("*")
    .order("id", { ascending: true });
  if (error || !data) return null;
  return data.map((row: any) => ({
    id: row.id,
    name: row.name,
    category: row.category,
    quantity: row.quantity,
    expiry: row.expiry,
    addedAt: row.added_at,
    source: row.source,
  })) as T;
}

export async function saveShoppingList(data: unknown[]): Promise<void> {
  await supabase.from("shopping_list_items").delete().neq("id", 0);
  if (data.length > 0) {
    await supabase.from("shopping_list_items").insert(
      (data as any[]).map((item) => ({
        name: item.name,
        checked: item.checked,
        added_from: item.addedFrom,
      }))
    );
  }
}

export async function loadShoppingList<T>(): Promise<T | null> {
  const { data, error } = await supabase
    .from("shopping_list_items")
    .select("*")
    .order("id", { ascending: true });
  if (error || !data) return null;
  return data.map((row: any) => ({
    name: row.name,
    checked: row.checked,
    addedFrom: row.added_from,
  })) as T;
}

export async function savePreferences(data: unknown): Promise<void> {
  await supabase.from("preferences").upsert({ id: 1, data });
}

export async function loadPreferences<T>(): Promise<T | null> {
  const { data, error } = await supabase
    .from("preferences")
    .select("data")
    .eq("id", 1)
    .single();
  if (error || !data) return null;
  return data.data as T;
}

export async function clearAll(): Promise<void> {
  await Promise.all([
    supabase.from("pantry_items").delete().neq("id", 0),
    supabase.from("shopping_list_items").delete().neq("id", 0),
  ]);
}
