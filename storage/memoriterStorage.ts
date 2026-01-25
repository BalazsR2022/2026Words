import AsyncStorage from "@react-native-async-storage/async-storage";
import { Memoriter } from "../types/Memoriter";

const KEY = "MEMORITERS_2026";

export async function loadMemoriters(): Promise<Memoriter[]> {
  try {
    const json = await AsyncStorage.getItem(KEY);
    const parsed = json ? JSON.parse(json) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch (e) {
    console.warn("Hiba a memoriterek betöltésekor:", e);
    return [];
  }
}

export async function saveMemoriters(items: Memoriter[]) {
  try {
    await AsyncStorage.setItem(KEY, JSON.stringify(items));
  } catch (e) {
    console.warn("Hiba a memoriterek mentésekor:", e);
  }
}

export async function addMemoriter(item: Memoriter) {
  const list = await loadMemoriters();
  list.unshift(item);
  await saveMemoriters(list);
}

export async function deleteMemoriter(id: string) {
  const list = await loadMemoriters();
  const filtered = list.filter((m) => m.id !== id);
  await saveMemoriters(filtered);
}
