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
  /* -------- nyelv a routerből -------- */
  const { lang } = useLocalSearchParams();
  const language = lang as Language;

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

  /* -------- állapotok -------- */
  if (loading) {
    return <ActivityIndicator style={{ flex: 1 }} />;
  }

  if (!words.length) {
    return (
      <View style={styles.container}>
        <Text>Nincs gyakorlásra alkalmas szó.</Text>
      </View>
    );
  }

  const word = words[index];

  /* -------- lapozás -------- */
  function next() {
    setIndex(i => (i + 1) % words.length);
  }

  function prev() {
    setIndex(i => (i - 1 + words.length) % words.length);
  }

  /* -------- UI -------- */
  return (
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
  );
}

/* -------- stílusok -------- */
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#d2d6ddff",
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
  },
});
