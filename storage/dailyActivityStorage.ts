import AsyncStorage from "@react-native-async-storage/async-storage";

export type DailyActivity = {
  addedWords: number;
  quizAnswers: number;
  activeMs: number;
};

const KEY = "dailyActivity";

export async function loadDailyActivity(): Promise<Record<string, DailyActivity>> {
  try {
    const raw = await AsyncStorage.getItem(KEY);
    const parsed = raw ? JSON.parse(raw) : {};
    return parsed && typeof parsed === "object" ? parsed : {};
  } catch (error) {
    console.warn("Hiba a napi aktivitás betöltésekor:", error);
    return {};
  }
}

export async function saveDailyActivity(data: Record<string, DailyActivity>) {
  try {
    await AsyncStorage.setItem(KEY, JSON.stringify(data));
  } catch (error) {
    console.warn("Hiba a napi aktivitás mentésekor:", error);
  }
}

export function todayKey() {
  return new Date().toISOString().slice(0, 10);
}
