import { loadDailyActivity, saveDailyActivity, todayKey } from "@/storage/dailyActivityStorage";
import { useEffect, useState } from "react";

export type DailyActivity = {
  addedWords: number;
  quizAnswers: number;
  activeMs: number;
};

export function isDayActive(d: DailyActivity) {
  return (
    d.addedWords >= 3 ||
    d.quizAnswers >= 1 ||
    d.activeMs >= 5 * 60 * 1000
  );
}

export function useDailyActivity() {
  const [data, setData] = useState<Record<string, DailyActivity>>({});

  /* ---- betöltés ---- */
  useEffect(() => {
    loadDailyActivity().then(setData);
  }, []);

  /* ---- mentés ---- */
  useEffect(() => {
    saveDailyActivity(data);
  }, [data]);

  function markActivity(type: "quiz" | "word" | "time" = "quiz") {
    const key = todayKey();

    setData(prev => {
      const day = prev[key] ?? { addedWords: 0, quizAnswers: 0, activeMs: 0 };

      if (type === "quiz") {
        if (day.quizAnswers > 0) return prev; // napi 1 elég
        return { ...prev, [key]: { ...day, quizAnswers: day.quizAnswers + 1 } };
      }

      if (type === "word") {
        return { ...prev, [key]: { ...day, addedWords: day.addedWords + 1 } };
      }

      return prev;
    });
  }

  function addActiveTime(ms: number) {
    const key = todayKey();

    setData(prev => {
      const day = prev[key] ?? { addedWords: 0, quizAnswers: 0, activeMs: 0 };
      return { ...prev, [key]: { ...day, activeMs: day.activeMs + ms } };
    });
  }

  return {
    dailyActivity: data,
    markActivity,
    addActiveTime,
    isDayActive,
  };
}
