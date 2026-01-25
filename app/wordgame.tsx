import { loadDailyActivity, saveDailyActivity, todayKey } from "@/storage/dailyActivityStorage";
import { loadWords } from "@/storage/wordStorage";
import { Language } from "@/types/Word";
import { LinearGradient } from "expo-linear-gradient";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from "react-native";
import FontAwesome5 from "react-native-vector-icons/FontAwesome5";
import { useDailyActivity } from "../hooks/useDailyActivity";

type CellPos = { x: number; y: number };
type Cell = { letter: string; selected?: boolean; found?: boolean };
type Grid = Cell[][];

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function generateWordSearchGuaranteed(
  words: string[],
  lang: Language,
  size = 10,
  targetCount = 10
): { grid: Grid; targets: string[] } {
  let grid: (string | null)[][] = Array.from({ length: size }, () =>
    Array(size).fill(null)
  );

  const directions = [{ dx: 1, dy: 0 }, { dx: 0, dy: 1 }];
  const placed: string[] = [];

  for (const word of words) {
    if (placed.length >= targetCount) break;

    const w = word.toUpperCase();
    let success = false;

    for (let attempt = 0; attempt < 100 && !success; attempt++) {
      const dir = directions[Math.floor(Math.random() * directions.length)];
      const x = Math.floor(Math.random() * size);
      const y = Math.floor(Math.random() * size);

      let ok = true;
      for (let i = 0; i < w.length; i++) {
        const nx = x + dir.dx * i;
        const ny = y + dir.dy * i;
        if (nx < 0 || ny < 0 || nx >= size || ny >= size) { ok = false; break; }
        if (grid[ny][nx] && grid[ny][nx] !== w[i]) { ok = false; break; }
      }
      if (!ok) continue;

      for (let i = 0; i < w.length; i++) {
        grid[y + dir.dy * i][x + dir.dx * i] = w[i];
      }
      placed.push(w);
      success = true;
    }
  }

  const fillerLetters = lang === "ru"
    ? "ООООЕЕЕАААИННТТРРССВВЛЛККММДПУЯЫЗБГЧЙХЖШЮЦЩЭФ"
    : "AAAAAEEEEIIIOOOUNNNLRRSTTKM";

  const finalGrid: Grid = grid.map(row =>
    row.map(c => ({
      letter: c ?? fillerLetters[Math.floor(Math.random() * fillerLetters.length)],
      selected: false,
      found: false
    }))
  );

  return { grid: finalGrid, targets: placed };
}

export default function WordSearchScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const paramLang = typeof params.lang === "string" ? (params.lang as Language) : undefined;
  const language: Language = paramLang ?? "en";

  const [grid, setGrid] = useState<Grid>([]);
  const [targets, setTargets] = useState<string[]>([]);
  const [found, setFound] = useState<Set<string>>(new Set());
  const [selected, setSelected] = useState<CellPos[]>([]);
  const [direction, setDirection] = useState<"horizontal" | "vertical" | null>(null);
  const [loading, setLoading] = useState(true);

  const { markActivity } = useDailyActivity();

  useEffect(() => {
    let mounted = true;

    async function load() {
      const all = await loadWords();
      if (!mounted) return;

      const active = all.filter(w => w.language === language && !w.suspended);
      const filtered = active
        .map(w => w.text.trim().toUpperCase())
        .filter(w => {
          if (language === "ru") return /^[А-ЯЁ]+$/.test(w) && w.length <= 10;
          return /^[A-Z]+$/.test(w) && w.length <= 10;
        });

      const result = generateWordSearchGuaranteed(
        shuffle(filtered),
        language,
        10,
        Math.min(10, filtered.length)
      );

      setGrid(result.grid);
      setTargets(result.targets);
      setFound(new Set());
      setSelected([]);
      setLoading(false);
    }

    load();

    return () => { mounted = false; };
  }, [language]);

  async function markWordSearchActivity() {
    const data = await loadDailyActivity();
    const key = todayKey();
    const day = data[key] ?? { addedWords: 0, quizAnswers: 0, activeMs: 0 };
    if (day.quizAnswers > 0) return;
    data[key] = { ...day, quizAnswers: day.quizAnswers + 1 };
    await saveDailyActivity(data);
  }

  function onCellPress(x: number, y: number) {
    setSelected(prev => {
      if (prev.some(p => p.x === x && p.y === y)) return prev;

      if (prev.length === 0) {
        setDirection(null);
        return [{ x, y }];
      }

      const first = prev[0];

      if (prev.length === 1) {
        if (x !== first.x && y !== first.y) return prev;
        setDirection(x === first.x ? "vertical" : "horizontal");
        return [...prev, { x, y }];
      }

      if (direction === "horizontal" && y !== first.y) return prev;
      if (direction === "vertical" && x !== first.x) return prev;

      return [...prev, { x, y }];
    });
  }

  function checkSelection() {
    if (!selected.length) return;

    const word = selected.map(p => grid[p.y][p.x].letter).join("").toUpperCase();

    if (targets.includes(word) && !found.has(word)) {
      markActivity("quiz");
      markWordSearchActivity();
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
      setGrid(g => g.map(row => row.map(c => ({ ...c, selected: false }))));
    }

    setSelected([]);
    setDirection(null);
  }

  if (loading) return (
    <View style={{ flex:1, justifyContent:"center", alignItems:"center" }}>
      <ActivityIndicator size="large" color="#ffffff" />
    </View>
  );

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
                  activeOpacity={0.7}
                  onPress={() => onCellPress(x, y)}
                  style={[
                    styles.cell,
                    cell.found && styles.found,
                    selected.some(p => p.x === x && p.y === y) && styles.selected
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
          <View style={{ alignItems: "center", marginTop: 8 }}>
            <FontAwesome5 name="check-circle" size={20} color="#9ee2acff" />
            <Text style={styles.done}>Kész</Text>
          </View>
        )}

        <TouchableOpacity onPress={() => router.back()} style={styles.back}>
          <Text style={{ color: "white" }}>Vissza</Text>
        </TouchableOpacity>
      </View>
    </LinearGradient>
  );
}

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
    borderRadius: 4
  },
  selected: { backgroundColor: "#bfc1c5ff" },
  found: { backgroundColor: "#8fb8a2" },
  letter: { color: "white", fontWeight: "bold" },
  button: {
    backgroundColor: "rgba(255,255,255,0.35)",
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 10,
    marginTop: 10
  },
  progress: { color: "white", marginTop: 10 },
  done: { color: "#9ee2acff", fontSize: 16, marginTop: 4, fontWeight: "600" },
  back: { marginTop: 16 }
});
