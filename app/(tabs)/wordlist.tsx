import React, { useEffect, useMemo, useState } from "react";
import { FlatList, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import { useLocalSearchParams } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import CountryFlag from "react-native-country-flag";
import { FontAwesome5 } from "@expo/vector-icons";

import { ThemedView } from "../../components/ui/themed-view";
import { loadWords, saveWords } from "../../storage/wordStorage";
import { Language, Word } from "../../types/Word";

export default function WordListScreen() {
  const { lang } = useLocalSearchParams();
  const [language, setLanguage] = useState<Language>((lang as Language) ?? "en");

  const [allWords, setAllWords] = useState<Word[]>([]);
  const [query, setQuery] = useState("");

  // Inline edit state (allow editing words from the wordlist screen)
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editText, setEditText] = useState("");
  const [editTranslation, setEditTranslation] = useState("");
  const [editNote, setEditNote] = useState("");
  const [editGender, setEditGender] = useState<"m" | "f" | "n" | undefined>(undefined);

  useEffect(() => {
    if (lang && lang !== language) {
      setLanguage(lang as Language);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lang]);

  useEffect(() => {
    async function load() {
      const w = await loadWords();
      setAllWords(w);
    }
    load();
  }, []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return allWords
      .filter((w) => w.language === language)
      .filter((w) => {
        if (!q) return true;
        return (
          w.text.toLowerCase().includes(q) ||
          (w.translation || "").toLowerCase().includes(q)
        );
      })
      .sort((a, b) => a.text.localeCompare(b.text));
  }, [allWords, language, query]);

  function isoCodeForLang(l: Language) {
    return l === "de" ? "DE" : l === "ru" ? "RU" : l === "it" ? "IT" : "GB";
  }

  function persistWords(updated: Word[]) {
    setAllWords(updated);
    saveWords(updated);
  }

  function deleteWord(id: string) {
    persistWords(allWords.filter((w) => w.id !== id));
  }

  function cycleGender(id: string) {
    persistWords(
      allWords.map((w) => {
        if (w.id !== id) return w;
        const next = w.gender === "m" ? "f" : w.gender === "f" ? "n" : w.gender === "n" ? undefined : "m";
        return { ...w, gender: next } as Word;
      })
    );
  }

  function startEdit(word: Word) {
    setEditingId(word.id);
    setEditText(word.text);
    setEditTranslation(word.translation ?? "");
    setEditNote(word.note ?? "");
    setEditGender(word.gender);
  }

  function cancelEdit() {
    setEditingId(null);
    setEditText("");
    setEditTranslation("");
    setEditNote("");
    setEditGender(undefined);
  }

  function saveEdit() {
    if (!editingId) return;
    const updated = allWords.map((w) =>
      w.id === editingId
        ? ({ ...w, text: editText.trim(), translation: editTranslation.trim() || undefined, note: editNote.trim() || undefined, gender: editGender })
        : w
    );
    persistWords(updated);
    cancelEdit();
  }

  return (
    <LinearGradient colors={["#2f3e5c", "#445b84"]} style={styles.container}>
      <ThemedView style={styles.content}>
        <View style={styles.headerRow}>
          <CountryFlag isoCode={isoCodeForLang(language)} size={28} />
          <Text style={styles.headerTitle}>Szólista — {language.toUpperCase()}</Text>
        </View>

        {/* Inline editor shown when editingId is set */}
        {editingId && (
          <View style={{ marginBottom: 12 }}>
            <TextInput value={editText} onChangeText={setEditText} placeholder="Szó…" placeholderTextColor="#ccc" style={styles.input} />
            <TextInput value={editTranslation} onChangeText={setEditTranslation} placeholder="Magyar jelentés…" placeholderTextColor="#ccc" style={styles.input} />
            <TextInput value={editNote} onChangeText={setEditNote} placeholder="Megjegyzés…" placeholderTextColor="#ccc" style={styles.input} />
            <View style={styles.genderRow}>
              {['m','f','n'].map((g) => (
                <TouchableOpacity key={g} onPress={() => setEditGender(g as any)} style={[styles.genderButton, { backgroundColor: g === 'm' ? '#6b8fb3' : g === 'f' ? '#c58aa6' : '#8fb8a2', borderWidth: editGender === g ? 2 : 1, borderColor: editGender === g ? '#fff' : 'rgba(255,255,255,0.25)'}]}>
                  <Text style={{ color: 'white' }}>{g.toUpperCase()}</Text>
                </TouchableOpacity>
              ))}
            </View>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
              <TouchableOpacity onPress={saveEdit} style={[styles.button, { flex: 1, marginRight: 8 }]}><Text>Mentés</Text></TouchableOpacity>
              <TouchableOpacity onPress={cancelEdit} style={[styles.button, { flex: 1 }]}><Text>Mégse</Text></TouchableOpacity>
            </View>
          </View>
        )}

        <TextInput
          value={query}
          onChangeText={setQuery}
          placeholder="Keresés (szó vagy jelentés)..."
          placeholderTextColor="#ccc"
          style={styles.input}
        />

        <FlatList
          data={filtered}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <View style={styles.item}>
              <View style={{ flex: 1 }}>
                <Text style={styles.foreignText}>{item.text}</Text>
                {item.translation ? (
                  <Text style={styles.translationText}>{item.translation}</Text>
                ) : null}
                {item.note ? (
                  <Text style={[styles.translationText, { fontStyle: 'italic', opacity: 0.7 }]}>{item.note}</Text>
                ) : null}
              </View>

              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <TouchableOpacity style={[styles.iconButton, { marginRight: 10 }]} onPress={() => cycleGender(item.id)}>
                  <FontAwesome5 name="venus-mars" size={18} color="white" />
                </TouchableOpacity>

                <TouchableOpacity style={[styles.iconButton, { marginRight: 10 }]} onPress={() => startEdit(item)}>
                  <FontAwesome5 name="edit" size={18} color="white" />
                </TouchableOpacity>

                <TouchableOpacity style={styles.iconButton} onPress={() => deleteWord(item.id)}>
                  <FontAwesome5 name="trash" size={18} color="white" />
                </TouchableOpacity>
              </View>
            </View>
          )}
          ListEmptyComponent={() => (
            <Text style={{ color: "white", marginTop: 20 }}>
              Nincs találat
            </Text>
          )}
        />
      </ThemedView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: {
    flex: 1,
    marginTop: 60,
    paddingHorizontal: 20,
    backgroundColor: "transparent",
  },
  headerRow: { flexDirection: "row", alignItems: "center", marginBottom: 10 },
  headerTitle: { color: "white", marginLeft: 10, fontWeight: "bold" },
  input: {
    backgroundColor: "rgba(255,255,255,0.22)",
    padding: 14,
    borderRadius: 10,
    color: "white",
    marginBottom: 12,
  },
  item: {
    flexDirection: "row",
    alignItems: "center",
    padding: 10,
    borderRadius: 8,
    marginBottom: 8,
    backgroundColor: "rgba(255,255,255,0.06)",
  },
  foreignText: { color: "white", fontWeight: "bold" },
  translationText: { color: "#fff", opacity: 0.8 },
  iconButton: { width: 40, alignItems: "center" },
  genderRow: { flexDirection: 'row', marginTop: 8, marginBottom: 12 },
  genderButton: { flex: 1, padding: 10, borderRadius: 8, alignItems: 'center', justifyContent: 'center', marginRight: 8 },
  button: { backgroundColor: 'rgba(255,255,255,0.1)', padding: 10, borderRadius: 8, alignItems: 'center', justifyContent: 'center' },
});
