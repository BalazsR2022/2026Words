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
  /* -------- hookok FELÜL -------- */
  const { lang } = useLocalSearchParams();
  const language: Language = (lang as Language) ?? "en";

  const { markActivity } = useDailyActivity();

  /* -------- state-ek -------- */
  const [words, setWords] = useState<Word[]>([]);
  const [index, setIndex] = useState(0);
  const [loading, setLoading] = useState(true);

  /* -------- adatok betöltése -------- */
  useEffect(() => {
    async function fetchWords() {
      const allWords = await loadWords();

      const filtered = allWords.filter(
        w =>
          w.language === language &&
          !w.suspended &&
          w.translation
      );

      setWords(shuffle(filtered));
      setIndex(0);
      setLoading(false);
    }

    fetchWords();
  }, [language]);

  /* -------- lapozás -------- */
  function next() {
    markActivity("quiz"); // ✅ gyakorlás = tanulás
    setIndex(i => (i + 1) % words.length);
  }

  function prev() {
    setIndex(i => (i - 1 + words.length) % words.length);
  }

  /* -------- állapotok -------- */
  if (loading) {
    return <ActivityIndicator style={{ flex: 1 }} />;
  }

  if (!words.length) {
    return (
      <LinearGradient colors={["#2f3e5c", "#445b84"]} style={styles.gradient}>
        <View style={styles.container}>
          <Text style={{ color: "white" }}>
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
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  controls: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 24,
    gap: 24,
  },
  button: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: "#bfc1c5ff",
    borderRadius: 12,
  },
  buttonText: {
    fontSize: 18,
  },
  counter: {
    fontSize: 16,
    color: "white",
  },
});
