import AsyncStorage from "@react-native-async-storage/async-storage";

export type DailyActivity = {
  addedWords: number;
  quizAnswers: number;
  activeMs: number;
};

const KEY = "dailyActivity";

export async function loadDailyActivity(): Promise<Record<string, DailyActivity>> {
  const raw = await AsyncStorage.getItem(KEY);
  return raw ? JSON.parse(raw) : {};
}

export async function saveDailyActivity(
  data: Record<string, DailyActivity>
) {
  await AsyncStorage.setItem(KEY, JSON.stringify(data));
}

export function todayKey() {
  return new Date().toISOString().slice(0, 10);
}
