import { LinearGradient } from "expo-linear-gradient";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useDailyActivity } from "../hooks/useDailyActivity";

import { loadDailyActivity, saveDailyActivity, todayKey } from "@/storage/dailyActivityStorage";
import { loadWords } from "@/storage/wordStorage";
import { Language, Word } from "@/types/Word";

/* =======================
   TÍPUSOK
======================= */

type Cell = {
  letter: string;
  selected?: boolean;
  found?: boolean;
};

type Grid = Cell[][];

/* =======================
   SEGÉDFÜGGVÉNYEK
======================= */

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function generateWordSearch(words: string[], lang: Language, size = 10): { grid: Grid; targets: string[] } {
  const grid: (string | null)[][] = Array.from({ length: size }, () =>
    Array(size).fill(null)
  );

  const directions = [
    { dx: 1, dy: 0 }, // →
    { dx: 0, dy: 1 }, // ↓
  ];

  const placed: string[] = [];

  for (const word of words) {
    const w = word.toUpperCase();
    let success = false;

    for (let attempt = 0; attempt < 50 && !success; attempt++) {
      const dir = directions[Math.floor(Math.random() * directions.length)];
      const x = Math.floor(Math.random() * size);
      const y = Math.floor(Math.random() * size);

      let ok = true;
      for (let i = 0; i < w.length; i++) {
        const nx = x + dir.dx * i;
        const ny = y + dir.dy * i;
        if (nx < 0 || ny < 0 || nx >= size || ny >= size) {
          ok = false;
          break;
        }
        if (grid[ny][nx] && grid[ny][nx] !== w[i]) {
          ok = false;
          break;
        }
      }

      if (!ok) continue;

      for (let i = 0; i < w.length; i++) {
        grid[y + dir.dy * i][x + dir.dx * i] = w[i];
      }
      placed.push(w);
      success = true;
    }
  }

  function fillerLettersForLanguage(lang: Language): string {
    if (lang === "ru") {
      return "ООООЕЕЕАААИННТТРРССВВЛЛККММДПУЯЫЗБГЧЙХЖШЮЦЩЭФ";
    }
    return "AAAAAEEEEIIIOOOUNNNLRRSTTKM";
  }
  const letters = fillerLettersForLanguage(lang);

  const finalGrid: Grid = grid.map(row =>
    row.map(c => ({
      letter: c ?? letters[Math.floor(Math.random() * letters.length)],
      selected: false,
      found: false,
    }))
  );

  return { grid: finalGrid, targets: placed };
}

/* =======================
   SCREEN
======================= */

export default function WordSearchScreen() {
  const router = useRouter();
  const { lang } = useLocalSearchParams();
  const language = (lang as Language) ?? "en";

  const [grid, setGrid] = useState<Grid>([]);
  const [targets, setTargets] = useState<string[]>([]);
  const [found, setFound] = useState<Set<string>>(new Set());
  const [selected, setSelected] = useState<{ x: number; y: number }[]>([]);
  const [loading, setLoading] = useState(true);
  const { markActivity } = useDailyActivity();

  /* ---------------- LOAD ---------------- */

  useEffect(() => {
    async function load() {
      const all = await loadWords();
      const active = all.filter(
        (w: Word) => w.language === language && !w.suspended
      );

      const chosen = shuffle(active)
        .slice(0, 10)
        .map(w => w.text);

      const result = generateWordSearch(chosen, language);
      setGrid(result.grid);
      setTargets(result.targets);
      setFound(new Set());
      setSelected([]);
      setLoading(false);
    }

    load();
  }, [language]);

  /* ---------------- DAILY ACTIVITY ---------------- */

  async function markWordSearchActivity() {
    const data = await loadDailyActivity();
    const key = todayKey();
    const day = data[key] ?? { addedWords: 0, quizAnswers: 0, activeMs: 0 };

    // csak egyszer számítson naponta
    if (day.quizAnswers > 0) return;

    data[key] = {
      ...day,
      quizAnswers: day.quizAnswers + 1,
    };

    await saveDailyActivity(data);
  }

  /* ---------------- LOGIKA ---------------- */

  function toggleCell(x: number, y: number) {
    setGrid(g =>
      g.map((row, ry) =>
        row.map((c, cx) =>
          cx === x && ry === y ? { ...c, selected: !c.selected } : c
        )
      )
    );

    setSelected(sel => {
      const exists = sel.find(p => p.x === x && p.y === y);
      return exists ? sel.filter(p => !(p.x === x && p.y === y)) : [...sel, { x, y }];
    });
  }

  function checkSelection() {
    if (!selected.length) return;

    const word = selected
      .map(p => grid[p.y][p.x].letter)
      .join("")
      .toUpperCase();

    if (targets.includes(word) && !found.has(word)) {
      markActivity("quiz");
      markWordSearchActivity(); // <-- napi tevékenység követése

      setFound(f => new Set(f).add(word));
      setGrid(g =>
        g.map((row, y) =>
          row.map((c, x) =>
            selected.some(p => p.x === x && p.y === y)
              ? { ...c, found: true, selected: false }
              : c
          )
        )
      );
    } else {
      setGrid(g =>
        g.map(row => row.map(c => ({ ...c, selected: false })))
      );
    }

    setSelected([]);
  }

  /* ---------------- UI ---------------- */

  if (loading) {
    return <ActivityIndicator style={{ flex: 1 }} />;
  }

  return (
    <LinearGradient colors={["#2f3e5c", "#445b84"]} style={styles.gradient}>
      <View style={styles.container}>
        <Text style={styles.title}>Szókereső</Text>

        <View style={styles.grid}>
          {grid.map((row, y) => (
            <View key={y} style={styles.row}>
              {row.map((cell, x) => (
                <TouchableOpacity
                  key={x}
                  onPress={() => toggleCell(x, y)}
                  style={[
                    styles.cell,
                    cell.found && styles.found,
                    cell.selected && styles.selected,
                  ]}
                >
                  <Text style={styles.letter}>{cell.letter}</Text>
                </TouchableOpacity>
              ))}
            </View>
          ))}
        </View>

        <TouchableOpacity onPress={checkSelection} style={styles.button}>
          <Text>Ellenőrzés</Text>
        </TouchableOpacity>

        <Text style={styles.progress}>
          Találatok: {found.size} / {targets.length}
        </Text>

        {found.size === targets.length && (
          <Text style={styles.done}>🎉 Kész!</Text>
        )}

        <TouchableOpacity onPress={() => router.back()} style={styles.back}>
          <Text style={{ color: "white" }}>Vissza</Text>
        </TouchableOpacity>
      </View>
    </LinearGradient>
  );
}

/* =======================
   STÍLUSOK
======================= */

const styles = StyleSheet.create({
  gradient: { flex: 1 },
  container: { flex: 1, alignItems: "center", paddingTop: 60 },
  title: { color: "white", fontSize: 20, marginBottom: 10 },

  grid: { marginVertical: 10 },
  row: { flexDirection: "row" },

  cell: {
    width: 32,
    height: 32,
    margin: 2,
    backgroundColor: "rgba(255,255,255,0.25)",
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 4,
  },

  selected: { backgroundColor: "#bfc1c5ff" },
  found: { backgroundColor: "#8fb8a2" },

  letter: { color: "white", fontWeight: "bold" },

  button: {
    backgroundColor: "rgba(255,255,255,0.35)",
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 10,
    marginTop: 10,
  },

  progress: { color: "white", marginTop: 10 },
  done: { color: "#9ee2acff", fontSize: 18, marginTop: 6 },

  back: { marginTop: 16 },
});
