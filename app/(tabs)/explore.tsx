import * as Haptics from "expo-haptics";
import { useRouter } from "expo-router";

import { LinearGradient } from "expo-linear-gradient";
import { useEffect, useRef, useState } from "react";
import {
  FlatList,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import CountryFlag from "react-native-country-flag";
import FontAwesome5 from "react-native-vector-icons/FontAwesome5";

import { LanguageSelector } from "../../components/LanguageSelector";
import { ThemedView } from "../../components/ui/themed-view";

import { loadWords, saveWords } from "storage/wordStorage";
import { Language, Word } from "../../types/Word";

/* ------------------ DAILY ACTIVITY ------------------ */
type DailyActivity = {
  addedWords: number;
  quizAnswers: number;
  activeMs: number;
};

function todayKey() {
  return new Date().toISOString().slice(0, 10);
}

function isDayActive(d: DailyActivity) {
  return (
    d.addedWords >= 3 ||
    d.quizAnswers >= 10 ||
    d.activeMs >= 5 * 60 * 1000
  );
}

/* ------------------ MAIN COMPONENT ------------------ */
export default function ExploreScreen() {
  const router = useRouter();

  const [language, setLanguage] = useState<Language>("en");

  const [input, setInput] = useState("");
  const [translation, setTranslation] = useState("");
  const [gender, setGender] = useState<"m" | "f" | "n" | undefined>();

  const [words, setWords] = useState<Word[]>([]);
  const [mode, setMode] = useState<"input" | "quiz">("input");

  const [quizWord, setQuizWord] = useState<Word | null>(null);
  const [quizAnswer, setQuizAnswer] = useState("");
  const [quizGender, setQuizGender] = useState<"m" | "f" | "n" | undefined>();
  const [feedback, setFeedback] = useState<"correct" | "wrong" | null>(null);

  const [answeredCount, setAnsweredCount] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);
  const [wrongCount, setWrongCount] = useState(0);

  const [quizWordsQueue, setQuizWordsQueue] = useState<Word[]>([]);

  const [quizDirection, setQuizDirection] = useState<"foreign" | "hu">("foreign");

  const [dailyActivity, setDailyActivity] = useState<Record<string, DailyActivity>>(
    {}
  );

  const sessionStart = useRef<number>(Date.now());

  /* ------------------ LOAD ------------------ */
  useEffect(() => {
    loadWords().then(setWords);
  }, []);

  /* ------------------ TIME TRACK ------------------ */
  useEffect(() => {
    const id = setInterval(() => {
      const now = Date.now();
      const delta = now - sessionStart.current;
      sessionStart.current = now;

      setDailyActivity((prev) => {
        const key = todayKey();
        const day = prev[key] ?? { addedWords: 0, quizAnswers: 0, activeMs: 0 };
        return { ...prev, [key]: { ...day, activeMs: day.activeMs + delta } };
      });
    }, 10000);

    return () => clearInterval(id);
  }, []);

  /* ------------------ WORD CRUD ------------------ */
  function persistWords(updated: Word[]) {
    setWords(updated);
    saveWords(updated);
  }

  function addWord() {
    if (!input.trim()) return;

    const newWord: Word = {
      id: Date.now().toString(),
      text: input.trim(),
      translation: translation.trim() || undefined,
      language,
      createdAt: Date.now(),
      gender: language === "de" || language === "ru" ? gender : undefined,
      suspended: false,
    };

    persistWords([newWord, ...words]);
    setInput("");
    setTranslation("");
    setGender(undefined);

    // Napi aktivitás
    setDailyActivity((prev) => {
      const key = todayKey();
      const day = prev[key] ?? { addedWords: 0, quizAnswers: 0, activeMs: 0 };
      return { ...prev, [key]: { ...day, addedWords: day.addedWords + 1 } };
    });
  }

  function deleteWord(id: string) {
    persistWords(words.filter((w) => w.id !== id));
  }

  function toggleSuspendWord(id: string) {
    persistWords(
      words.map((w) => (w.id === id ? { ...w, suspended: !w.suspended } : w))
    );
  }

  /* ------------------ QUIZ ------------------ */
  const activeWords = words.filter((w) => w.language === language && !w.suspended);
  const suspendedCount = words.filter((w) => w.language === language && w.suspended).length;

  function startQuizMode() {
    setMode("quiz");
    setAnsweredCount(0);
    setCorrectCount(0);
    setWrongCount(0);

    const shuffled = [...activeWords].sort(() => Math.random() - 0.5);
    setQuizWordsQueue(shuffled);
    nextQuizWord(shuffled);
  }

  function nextQuizWord(queue: Word[] = quizWordsQueue) {
    if (queue.length === 0) {
      setQuizWord(null);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      return;
    }

    const [nextWord, ...rest] = queue;
    setQuizWord(nextWord);
    setQuizAnswer("");
    setQuizGender(undefined);
    setFeedback(null);
    setQuizWordsQueue(rest);
  }

  function checkQuizAnswer() {
    if (!quizWord) return;

    const expected = quizDirection === "foreign" ? quizWord.text : quizWord.translation ?? "";
    const textOk = expected.toLowerCase() === quizAnswer.trim().toLowerCase();
    const genderOk = quizDirection === "hu" || !quizWord.gender || quizGender === quizWord.gender;

    const correct = textOk && genderOk;
    setFeedback(correct ? "correct" : "wrong");

    setDailyActivity((prev) => {
      const key = todayKey();
      const day = prev[key] ?? { addedWords: 0, quizAnswers: 0, activeMs: 0 };
      return { ...prev, [key]: { ...day, quizAnswers: day.quizAnswers + 1 } };
    });

    if (correct) setCorrectCount((c) => c + 1);
    else setWrongCount((c) => c + 1);

    setAnsweredCount((c) => c + 1);
    setTimeout(() => nextQuizWord(), 600);
  }

  /* ------------------ MOTIVATION ------------------ */
  const today = dailyActivity[todayKey()];
  const todayIsActive = today && isDayActive(today);

  function calculateStreak() {
    let streak = 0;
    const d = new Date();
    while (true) {
      const key = d.toISOString().slice(0, 10);
      if (!dailyActivity[key] || !isDayActive(dailyActivity[key])) break;
      streak++;
      d.setDate(d.getDate() - 1);
    }
    return streak;
  }

  const streak = calculateStreak();

  function last7Days() {
    const res: boolean[] = [];
    const d = new Date();
    for (let i = 0; i < 7; i++) {
      const key = d.toISOString().slice(0, 10);
      res.unshift(!!dailyActivity[key] && isDayActive(dailyActivity[key]));
      d.setDate(d.getDate() - 1);
    }
    return res;
  }

  /* ------------------ HELPERS ------------------ */
  function getGenderColor(word: Word) {
    if (!word.gender) return "rgba(255,255,255,0.18)";
    return word.gender === "m"
      ? "#6b8fb3"
      : word.gender === "f"
      ? "#c58aa6"
      : "#8fb8a2";
  }

  function getArticle(word: Word) {
    if (word.language === "de" && word.gender) {
      return word.gender === "m" ? "der" : word.gender === "f" ? "die" : "das";
    }
    return "";
  }

  function isoCodeForLang(lang: Language) {
    return lang === "de" ? "DE" : lang === "ru" ? "RU" : "GB";
  }

  const progress = activeWords.length ? Math.min(answeredCount / activeWords.length, 1) : 0;

  /* ------------------ UI ------------------ */
  return (
    <LinearGradient colors={["#2f3e5c", "#445b84"]} style={styles.container}>
      <ThemedView style={styles.content}>
        <View style={styles.header}>
          <CountryFlag isoCode={isoCodeForLang(language)} size={32} />
          <Text style={styles.wordCountText}>
            Aktív: {activeWords.length} | Megtanult: {suspendedCount}
          </Text>
        </View>

        <LanguageSelector selected={language} onSelect={setLanguage} />

        {/* --- MOTIVÁCIÓ --- */}
        <View style={styles.motivationBox}>
          <Text style={styles.motivationLine}>
            {todayIsActive ? "✅ Mai cél teljesítve" : "❌ Ma még nem tanultál"}
          </Text>
          <Text style={styles.motivationLine}>🔥 Folyamatos napok: {streak}</Text>
          <View style={styles.weekRow}>
            {last7Days().map((a, i) => (
              <Text key={i} style={{ color: "white", opacity: a ? 1 : 0.3 }}>
                ●
              </Text>
            ))}
          </View>
        </View>

        {mode === "input" && (
          <>
            <TextInput
              value={input}
              onChangeText={setInput}
              placeholder={language === "ru" ? "Írd cirill betűkkel…" : "Idegen nyelvi alak…"}
              placeholderTextColor="#ccc"
              style={styles.input}
            />
            <TextInput
              value={translation}
              onChangeText={setTranslation}
              placeholder="Magyar jelentés…"
              placeholderTextColor="#ccc"
              style={styles.input}
            />

            {(language === "de" || language === "ru") && (
              <View style={styles.genderRow}>
                {["m", "f", "n"].map((g) => (
                  <TouchableOpacity
                    key={g}
                    onPress={() => setGender(g as any)}
                    style={[
                      styles.genderButton,
                      {
                        backgroundColor:
                          g === "m" ? "#6b8fb3" : g === "f" ? "#c58aa6" : "#8fb8a2",
                      },
                    ]}
                  >
                    <Text style={{ color: "white" }}>{g.toUpperCase()}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}

            <TouchableOpacity onPress={addWord} style={styles.button}>
              <Text>Mentés</Text>
            </TouchableOpacity>

            <FlatList
              data={words.filter((w) => w.language === language)}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => (
                <View
                  style={[
                    styles.wordItem,
                    { backgroundColor: getGenderColor(item), opacity: item.suspended ? 0.4 : 1 },
                  ]}
                >
                  <View style={{ flex: 1 }}>
                    <Text style={styles.foreignText}>
                      {getArticle(item)} {item.text}
                    </Text>
                    {item.translation && <Text style={styles.translationText}>{item.translation}</Text>}
                  </View>
                  <View style={styles.actions}>
                    <TouchableOpacity onPress={() => toggleSuspendWord(item.id)}>
                      <FontAwesome5 name={item.suspended ? "play" : "pause"} size={16} color="white" />
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => deleteWord(item.id)}>
                      <FontAwesome5 name="trash" size={16} color="white" />
                    </TouchableOpacity>
                  </View>
                </View>
              )}
            />
          </>
        )}

        {mode === "quiz" && (
          <View style={{ alignItems: "center" }}>
            {quizWord ? (
              <>
                {/* --- Quiz nyelv választó zászlókkal --- */}
                <View style={{ flexDirection: "row", gap: 20, marginBottom: 10 }}>
                  <TouchableOpacity onPress={() => setQuizDirection("foreign")}>
                    <CountryFlag isoCode={isoCodeForLang(language)} size={28} />
                  </TouchableOpacity>
                  <TouchableOpacity onPress={() => setQuizDirection("hu")}>
                    <Text style={{ fontSize: 24 }}>🇭🇺</Text>
                  </TouchableOpacity>
                </View>

                <Text style={styles.quizPrompt}>
                  {quizDirection === "foreign" ? quizWord.translation || quizWord.text : quizWord.text}
                </Text>

                <View style={styles.progressBarBackground}>
                  <View style={[styles.progressBarFill, { flex: progress }]} />
                  <View style={{ flex: 1 - progress }} />
                </View>

                <TextInput
                  value={quizAnswer}
                  onChangeText={setQuizAnswer}
                  placeholder="Válasz…"
                  placeholderTextColor="#ccc"
                  style={styles.input}
                />

                {(quizWord.language === "de" || quizWord.language === "ru") &&
                  quizWord.gender && quizDirection === "foreign" && (
                    <View style={styles.genderRow}>
                      {["m", "f", "n"].map((g) => (
                        <TouchableOpacity
                          key={g}
                          onPress={() => setQuizGender(g as any)}
                          style={[
                            styles.genderButton,
                            { backgroundColor: g === "m" ? "#6b8fb3" : g === "f" ? "#c58aa6" : "#8fb8a2" },
                          ]}
                        >
                          <Text style={{ color: "white" }}>{g.toUpperCase()}</Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                  )}

                <TouchableOpacity onPress={checkQuizAnswer} style={styles.button}>
                  <Text>Ellenőrzés</Text>
                </TouchableOpacity>

                {feedback === "correct" && <Text style={styles.correctMark}>Helyes</Text>}
                {feedback === "wrong" && <Text style={styles.wrongMark}>Nem jó</Text>}
              </>
            ) : (
              <View style={{ marginTop: 20, alignItems: "center" }}>
                <Text style={{ color: "white", fontSize: 18, marginBottom: 8 }}>Teszt vége!</Text>
                <Text style={{ color: "white" }}>Jó válaszok: {correctCount}</Text>
                <Text style={{ color: "white" }}>Hibás válaszok: {wrongCount}</Text>
                <Text style={{ color: "white" }}>
                  Eredmény: {answeredCount ? Math.round((correctCount / answeredCount) * 100) : 0}%
                </Text>
              </View>
            )}
          </View>
        )}
      </ThemedView>

      <View style={styles.bottomBar}>
        <TouchableOpacity onPress={() => setMode("input")}>
          <FontAwesome5 name="pen" size={22} color={mode === "input" ? "white" : "#999"} />
        </TouchableOpacity>
        <TouchableOpacity onPress={startQuizMode}>
          <FontAwesome5 name="question-circle" size={22} color={mode === "quiz" ? "white" : "#999"} />
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() =>
            router.push({
              pathname: "../practice",
              params: { lang: language },
            })
          }
        >
          <FontAwesome5 name="clone" size={22} color="#999" />
        </TouchableOpacity>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { flex: 1, marginTop: 60, paddingHorizontal: 20, backgroundColor: "transparent" },
  header: { flexDirection: "row", alignItems: "center", gap: 10 },
  wordCountText: { color: "white", fontWeight: "bold" },

  input: {
    backgroundColor: "rgba(255,255,255,0.22)",
    padding: 14,
    borderRadius: 10,
    color: "white",
    marginBottom: 12,
  },

  button: {
    backgroundColor: "rgba(255,255,255,0.35)",
    padding: 14,
    borderRadius: 10,
    alignItems: "center",
    marginBottom: 20,
  },

  genderRow: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginBottom: 12,
  },

  genderButton: {
    padding: 10,
    borderRadius: 6,
    minWidth: 50,
    alignItems: "center",
  },

  wordItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 10,
    borderRadius: 8,
    marginBottom: 8,
  },

  foreignText: { color: "white", fontWeight: "bold" },
  translationText: { color: "#fff", opacity: 0.8 },

  actions: { flexDirection: "row", gap: 14 },

  quizPrompt: { color: "white", fontSize: 18, marginBottom: 12 },

  bottomBar: {
    flexDirection: "row",
    justifyContent: "space-around",
    paddingVertical: 10,
    backgroundColor: "rgba(0,0,0,0.35)",
  },

  correctMark: { color: "#7CFC98", fontSize: 16 },
  wrongMark: { color: "#FF8A8A", fontSize: 16 },

  progressBarBackground: {
    flexDirection: "row",
    height: 10,
    width: "100%",
    backgroundColor: "#333",
    borderRadius: 5,
    marginVertical: 10,
  },

  progressBarFill: {
    backgroundColor: "#7CFC98",
    borderRadius: 5,
  },

  motivationBox: { marginVertical: 10, alignItems: "center" },
  motivationLine: { color: "white", fontSize: 14, marginVertical: 2 },
  weekRow: { flexDirection: "row", gap: 4, marginTop: 4 },
});
