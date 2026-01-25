import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  FlatList,
} from "react-native";

type Word = {
  id: string;
  text: string;
  translation?: string;
  language: string;
  createdAt: number;
  gender?: "m" | "f" | "n";
  suspended: boolean;
  note?: string;
};

const App = () => {
  const [input, setInput] = useState("");
  const [translation, setTranslation] = useState("");
  const [gender, setGender] = useState<"m" | "f" | "n" | undefined>();
  const [note, setNote] = useState("");

  const [words, setWords] = useState<Word[]>([]);

  const addWord = () => {
    if (!input.trim()) return;

    const newWord: Word = {
      id: `${Date.now()}-${Math.random()}`,
      text: input.trim(),
      translation: translation.trim() || undefined,
      language: "hu",
      createdAt: Date.now(),
      gender,
      suspended: false,
      note: note.trim() || undefined,
    };

    setWords((prev) => [...prev, newWord]);
    setInput("");
    setTranslation("");
    setGender(undefined);
    setNote("");
  };

  const toggleSuspendWord = (id: string) => {
    setWords((prev) =>
      prev.map((word) =>
        word.id === id ? { ...word, suspended: !word.suspended } : word
      )
    );
  };

  const renderWordItem = ({ item }: { item: Word }) => (
    <View style={styles.wordItem}>
      <Text style={styles.foreignText}>
        {getArticle(item)} {item.text}
      </Text>
      {item.translation && (
        <Text style={styles.translationText}>{item.translation}</Text>
      )}
      {item.note ? (
        <Text style={[styles.translationText, { fontStyle: "italic", opacity: 0.7 }]}>
          {item.note}
        </Text>
      ) : null}
      <TouchableOpacity
        style={{ marginRight: 14 }}
        onPress={() => toggleSuspendWord(item.id)}
      >
        <Text style={styles.suspendText}>
          {item.suspended ? "Aktiválás" : "Felfüggesztés"}
        </Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
      <TextInput
        value={input}
        onChangeText={setInput}
        placeholder="Új szó…"
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
      <TextInput
        value={note}
        onChangeText={setNote}
        placeholder="Megjegyzés…"
        placeholderTextColor="#ccc"
        style={styles.input}
      />
      <TouchableOpacity onPress={addWord} style={styles.addButton}>
        <Text style={styles.addButtonText}>Hozzáadás</Text>
      </TouchableOpacity>
      <FlatList
        data={words}
        renderItem={renderWordItem}
        keyExtractor={(item) => item.id}
        style={styles.list}
      />
    </View>
  );
};

const getArticle = (word: Word) => {
  if (!word.gender) return "";
  switch (word.gender) {
    case "m":
      return "A(z)";
    case "f":
      return "Az";
    case "n":
      return "Egy";
  }
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#fff",
  },
  input: {
    height: 40,
    borderColor: "#ccc",
    borderWidth: 1,
    borderRadius: 4,
    paddingHorizontal: 10,
    marginBottom: 10,
  },
  addButton: {
    backgroundColor: "#007bff",
    paddingVertical: 10,
    borderRadius: 4,
    marginBottom: 20,
  },
  addButtonText: {
    color: "#fff",
    textAlign: "center",
    fontWeight: "bold",
  },
  list: {
    flex: 1,
  },
  wordItem: {
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#ccc",
  },
  foreignText: {
    fontSize: 18,
    fontWeight: "bold",
  },
  translationText: {
    fontSize: 16,
    color: "#555",
  },
  suspendText: {
    color: "red",
  },
});

export default App;