import AsyncStorage from "@react-native-async-storage/async-storage";
import { Word } from "../types/Word";

const STORAGE_KEY = "WORDS_2026";

export async function loadWords(): Promise<Word[]> {
  try {
    const json = await AsyncStorage.getItem(STORAGE_KEY);
    const parsed = json ? JSON.parse(json) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch (error) {
    console.warn("Hiba a szavak betöltésekor:", error);
    return [];
  }
}

export async function saveWords(words: Word[]) {
  try {
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(words));
  } catch (error) {
    console.warn("Hiba a szavak mentésekor:", error);
  }
}
