import AsyncStorage from "@react-native-async-storage/async-storage";
import { Word } from "../types/Word";

const STORAGE_KEY = "WORDS_2026";

export async function loadWords(): Promise<Word[]> {
  try {
    const json = await AsyncStorage.getItem(STORAGE_KEY);
    return json ? JSON.parse(json) : [];
  } catch (error) {
    console.warn("Hiba betöltéskor:", error);
    return [];
  }
}

export async function saveWords(words: Word[]) {
  try {
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(words));
  } catch (error) {
    console.warn("Hiba mentéskor:", error);
  }
}
