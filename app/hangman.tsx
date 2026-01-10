import { loadWords } from "@/storage/wordStorage";
import { Language, Word } from "@/types/Word";
import { LinearGradient } from "expo-linear-gradient";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

const MAX_ATTEMPTS = 12;

type HangmanProps = {
  language: Language;
};

export default function HangmanScreen({ language }: HangmanProps) {
  const router = useRouter();
  const params = useLocalSearchParams();

  const paramLang =
    typeof params.lang === "string" ? (params.lang as Language) : undefined;

  const currentLanguage: Language = paramLang ?? language ?? "en";

  const [word, setWord] = useState("");
  const lastWordRef = useRef<string | null>(null);
  const [guessed, setGuessed] = useState<Set<string>>(new Set());
  const [wrongCount, setWrongCount] = useState(0);
  const [loading, setLoading] = useState(true);

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

  const pickNewWord = useCallback(async () => {
    setLoading(true);

    const all: Word[] = await loadWords();
    const active = all.filter(
      (w) => w.language === currentLanguage && !w.suspended
    );

    const filtered = active
      .map((w) => w.text.trim().toUpperCase())
      .filter((w) => {
        if (currentLanguage === "ru")
          return /^[А-ЯЁ]+$/.test(w) && w.length < 10;
        if (currentLanguage === "de")
          return /^[A-ZÄÖÜß]+$/.test(w) && w.length < 10;
        return /^[A-Z]+$/.test(w) && w.length < 10;
      });

    let candidates = filtered;

    if (lastWordRef.current && filtered.length > 1) {
      candidates = filtered.filter((w) => w !== lastWordRef.current);
    }

    const nextWord =
      candidates.length > 0
        ? candidates[Math.floor(Math.random() * candidates.length)]
        : "EXAMPLE";

    lastWordRef.current = nextWord;
    setWord(nextWord);
    setGuessed(new Set());
    setWrongCount(0);
    setLoading(false);
  }, [currentLanguage]);

  useEffect(() => {
    pickNewWord();
  }, [pickNewWord]);

  const isWin = word.split("").every((l) => guessed.has(l));
  const isLose = wrongCount >= MAX_ATTEMPTS;
  const inputDisabled = isWin || isLose;

  function handleGuess(letter: string) {
    if (inputDisabled) return;

    setGuessed((prev) => {
      if (prev.has(letter)) return prev;

      const next = new Set(prev);
      next.add(letter);

      if (!word.includes(letter)) {
        setWrongCount((c) => c + 1);
      }

      return next;
    });
  }

  function renderWord() {
    return word.split("").map((l, i) => (
      <Text key={`${l}-${i}`} style={styles.letter}>
        {guessed.has(l) ? l : "_"}
      </Text>
    ));
  }

  function renderKeyboard() {
    return getLettersForLanguage()
      .split("")
      .map((l) => {
        const disabled = guessed.has(l) || inputDisabled;

        return (
          <TouchableOpacity
            key={l}
            onPress={() => handleGuess(l)}
            disabled={disabled}
            style={[
              styles.key,
              guessed.has(l) && styles.keyDisabled,
              guessed.has(l) && !word.includes(l) && styles.keyWrong,
            ]}
          >
            <Text style={styles.keyText}>{l}</Text>
          </TouchableOpacity>
        );
      });
  }

  if (loading) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" color="#ffffff" />
      </View>
    );
  }

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
            <Text style={styles.buttonText}>Új játék</Text>
          </TouchableOpacity>
        )}

        <TouchableOpacity
          style={styles.back}
          onPress={() => {
            if (router.canGoBack()) {
              router.back();
            } else {
              router.replace("/");
            }
          }}
        >
          <Text style={styles.buttonText}>Vissza</Text>
        </TouchableOpacity>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  gradient: { flex: 1 },

  loading: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#2f3e5c",
  },

  container: {
    flex: 1,
    alignItems: "center",
    paddingTop: 40,
  },

  title: {
    fontSize: 24,
    color: "white",
    marginBottom: 4,
    fontWeight: "600",
  },

  info: {
    fontSize: 16,
    color: "white",
    marginBottom: 10,
  },

  wordContainer: {
    flexDirection: "row",
    marginVertical: 16,
  },

  letter: {
    fontSize: 28,
    color: "white",
    marginHorizontal: 4,
  },

  keyboard: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    maxWidth: 320,
  },

  key: {
    width: 30,
    height: 30,
    margin: 3,
    backgroundColor: "rgba(255,255,255,0.25)",
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 4,
  },

  keyDisabled: {
    backgroundColor: "rgba(255,255,255,0.5)",
  },

  keyWrong: {
    backgroundColor: "#c58aa6",
  },

  keyText: {
    color: "white",
    fontWeight: "600",
    lineHeight: 18,
  },

  button: {
    marginTop: 12,
    marginBottom: 20,
    paddingHorizontal: 20,
    paddingVertical: 10,
    backgroundColor: "rgba(255,255,255,0.35)",
    borderRadius: 10,
  },

  back: {
    marginTop: 8,
  },

  buttonText: {
    color: "white",
    fontWeight: "600",
  },

  result: {
    color: "#9ee2acff",
    fontSize: 18,
    marginTop: 12,
    fontWeight: "600",
    textAlign: "center",
  },
});
