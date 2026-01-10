import { LinearGradient } from "expo-linear-gradient";
import { useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import Flashcard from "@/components/Flashcard";
import { loadWords } from "@/storage/wordStorage";
import { Language, Word } from "@/types/Word";

import { useDailyActivity } from "../hooks/useDailyActivity";

/* -------- segédfüggvény: véletlen sorrend -------- */
function shuffle<T>(array: T[]): T[] {
  const result = [...array];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

export default function PracticeScreen() {
  /* -------- params / hookok -------- */
  const params = useLocalSearchParams();

  const paramLang =
    typeof params.lang === "string" ? (params.lang as Language) : undefined;

  const language: Language = paramLang ?? "en";

  const { markActivity } = useDailyActivity();

  /* -------- state-ek -------- */
  const [words, setWords] = useState<Word[]>([]);
  const [index, setIndex] = useState(0);
  const [loading, setLoading] = useState(true);

  /* -------- adatok betöltése -------- */
  useEffect(() => {
    let mounted = true;

    async function fetchWords() {
      const allWords = await loadWords();

      if (!mounted) return;

      const filtered = allWords.filter(
        (w) =>
          w.language === language &&
          !w.suspended &&
          Boolean(w.translation)
      );

      setWords(shuffle(filtered));
      setIndex(0);
      setLoading(false);
    }

    fetchWords();

    return () => {
      mounted = false;
    };
  }, [language]);

  /* -------- lapozás -------- */
  function next() {
    if (!words.length) return;

    markActivity("quiz");
    setIndex((i) => (i + 1) % words.length);
  }

  function prev() {
    if (!words.length) return;

    setIndex((i) => (i - 1 + words.length) % words.length);
  }

  /* -------- loading -------- */
  if (loading) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" color="#ffffff" />
      </View>
    );
  }

  /* -------- üres állapot -------- */
  if (!words.length) {
    return (
      <LinearGradient colors={["#2f3e5c", "#445b84"]} style={styles.gradient}>
        <View style={styles.container}>
          <Text style={styles.emptyText}>
            Nincs gyakorlásra alkalmas szó.
          </Text>
        </View>
      </LinearGradient>
    );
  }

  const word = words[index];

  /* -------- UI -------- */
  return (
    <LinearGradient colors={["#2f3e5c", "#445b84"]} style={styles.gradient}>
      <View style={styles.container}>
        <Flashcard
          front={word.text}
          back={word.translation ?? "—"}
          gender={word.gender}
          language={word.language}
        />

        <View style={styles.controls}>
          <TouchableOpacity onPress={prev} style={styles.button}>
            <Text style={styles.buttonText}>◀</Text>
          </TouchableOpacity>

          <Text style={styles.counter}>
            {index + 1} / {words.length}
          </Text>

          <TouchableOpacity onPress={next} style={styles.button}>
            <Text style={styles.buttonText}>▶</Text>
          </TouchableOpacity>
        </View>
      </View>
    </LinearGradient>
  );
}

/* -------- stílusok -------- */
const styles = StyleSheet.create({
  gradient: {
    flex: 1,
  },

  loading: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#2f3e5c",
  },

  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },

  controls: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 24,
  },

  button: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: "#bfc1c5ff",
    borderRadius: 12,
    marginHorizontal: 12,
  },

  buttonText: {
    color: "#77748dff",
    fontSize: 18,
    fontWeight: "600",
  },

  counter: {
    fontSize: 16,
    color: "white",
  },

  emptyText: {
    color: "white",
    fontSize: 16,
  },
});
