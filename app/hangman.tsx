import { loadWords } from "@/storage/wordStorage";
import { Language, Word } from "@/types/Word";
import { LinearGradient } from "expo-linear-gradient";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

const MAX_ATTEMPTS = 6;

type HangmanProps = {
  language: Language;
};

// ... importok változatlanok ...

export default function HangmanScreen({ language }: HangmanProps) {
  const router = useRouter();
  const { lang } = useLocalSearchParams();
  const currentLanguage = (lang as Language) ?? language;

  const [word, setWord] = useState<string>("");
  const [guessed, setGuessed] = useState<Set<string>>(new Set());
  const [wrongCount, setWrongCount] = useState(0);
  const [loading, setLoading] = useState(true);

  // Nyelvspecifikus karakterkészlet
  const getLettersForLanguage = useCallback(() => {
    switch (currentLanguage) {
      case "ru":
        return "АБВГДЕЁЖЗИЙКЛМНОПРСТУФХЦЧШЩЪЫЬЭЮЯ";
      case "de":
        return "ABCDEFGHIJKLMNOPQRSTUVWXYZÄÖÜß";
      case "en":
      default:
        return "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    }
  }, [currentLanguage]);

  // Új szó kiválasztása
  const pickNewWord = useCallback(async () => {
    setLoading(true);
    const all: Word[] = await loadWords();
    const active = all.filter(
      (w) => w.language === currentLanguage && !w.suspended
    );
    const filtered = active
      .map((w) => w.text.trim().toUpperCase())
      .filter((w) => {
        if (currentLanguage === "ru") return /^[А-ЯЁ]+$/.test(w) && w.length < 10;
        return /^[A-ZÄÖÜß]+$/.test(w) && w.length < 10;
      });

    if (filtered.length === 0) setWord("EXAMPLE");
    else setWord(filtered[Math.floor(Math.random() * filtered.length)]);

    setGuessed(new Set());
    setWrongCount(0);
    setLoading(false);
  }, [currentLanguage]);

  useEffect(() => {
    pickNewWord();
  }, [pickNewWord]);

  function handleGuess(letter: string) {
    setGuessed((prev) => {
      if (prev.has(letter)) return prev;
      const next = new Set(prev);
      next.add(letter);
      if (!word.includes(letter)) setWrongCount((c) => c + 1);
      return next;
    });
  }

  function renderWord() {
    return word.split("").map((l, i) => (
      <Text key={i} style={styles.letter}>
        {guessed.has(l) ? l : "_"}
      </Text>
    ));
  }

  function renderKeyboard() {
    const letters = getLettersForLanguage();
    return letters.split("").map((l) => (
      <TouchableOpacity
        key={l}
        onPress={() => handleGuess(l)}
        style={[
          styles.key,
          guessed.has(l) && styles.keyDisabled,
          !word.includes(l) && guessed.has(l) && styles.keyWrong,
        ]}
      >
        <Text style={styles.keyText}>{l}</Text>
      </TouchableOpacity>
    ));
  }

  if (loading) return <ActivityIndicator style={{ flex: 1 }} />;

  const isWin = word.split("").every((l) => guessed.has(l));
  const isLose = wrongCount >= MAX_ATTEMPTS;

  return (
    <LinearGradient colors={["#2f3e5c", "#445b84"]} style={styles.gradient}>
      <View style={styles.container}>
        <Text style={styles.title}>Akasztófa</Text>
        <Text style={styles.info}>
          Hibák: {wrongCount} / {MAX_ATTEMPTS}
        </Text>

        <View style={styles.wordContainer}>{renderWord()}</View>

        <View style={styles.keyboard}>{renderKeyboard()}</View>

        {isWin && <Text style={styles.result}>Győzelem, nyertél!</Text>}
        {isLose && (
          <Text style={styles.result}>
            Ez most nem jött össze! A szó: {word}
          </Text>
        )}

        {(isWin || isLose) && (
          <TouchableOpacity style={styles.button} onPress={pickNewWord}>
            <Text style={{ color: "white" }}>Új játék</Text>
          </TouchableOpacity>
        )}

        <TouchableOpacity onPress={() => router.back()} style={styles.back}>
          <Text style={{ color: "white" }}>Vissza</Text>
        </TouchableOpacity>
      </View>
    </LinearGradient>
  );
}

// ... stílusok változatlanok ...

    

const styles = StyleSheet.create({
  gradient: { flex: 1 },
  container: { flex: 1, alignItems: "center", paddingTop: 60 },
  title: { fontSize: 24, color: "white", marginBottom: 10 },
  info: { fontSize: 16, color: "white", marginBottom: 10 },
  wordContainer: { flexDirection: "row", marginVertical: 20 },
  letter: { fontSize: 32, color: "white", marginHorizontal: 4 },
  keyboard: { flexDirection: "row", flexWrap: "wrap", justifyContent: "center" },
  key: {
    width: 32,
    height: 32,
    margin: 2,
    backgroundColor: "rgba(255,255,255,0.25)",
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 4,
  },
  keyDisabled: { backgroundColor: "rgba(255,255,255,0.5)" },
  keyWrong: { backgroundColor: "#c58aa6" },
  keyText: { color: "white", fontWeight: "bold" },
  button: {
    marginTop: 16,
    paddingHorizontal: 20,
    paddingVertical: 10,
    backgroundColor: "rgba(255,255,255,0.35)",
    borderRadius: 10,
  },
  back: { marginTop: 16 },
  result: { color: "#9ee2acff", fontSize: 18, marginTop: 12, fontWeight: "600" },
});
