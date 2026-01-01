// components/Flashcard.tsx
import { Language } from "@/types/Word";
import { useState } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

type Gender = "m" | "f" | "n";

type Props = {
  front: string;
  back: string;
  gender?: Gender;
  language?: Language;
};

/* ---------- SZÍNEK ---------- */
function getGenderColor(gender?: Gender) {
  if (!gender) return "#bfc1c5ff";
  return gender === "m"
    ? "#6b8fb3"
    : gender === "f"
    ? "#c58aa6"
    : "#8fb8a2";
}

/* ---------- NÉMET NÉVELŐ ---------- */
function getArticle(language?: Language, gender?: Gender) {
  if (language !== "de" || !gender) return "";
  return gender === "m" ? "der" : gender === "f" ? "die" : "das";
}

/* ---------- OROSZ VÉGZŐDÉS ---------- */
function splitRussianEnding(word: string) {
  if (!word) return { base: word, ending: "" };
  return {
    base: word.slice(0, -1),
    ending: word.slice(-1),
  };
}

export default function Flashcard({
  front,
  back,
  gender,
  language,
}: Props) {
  const [flipped, setFlipped] = useState(false);

  const backgroundColor = flipped
    ? "#bfc1c5ff"
    : getGenderColor(gender);

  const isRussian = language === "ru";
  const isSoftSign = isRussian && front.endsWith("ь");

  const { base, ending } =
    isRussian && !flipped ? splitRussianEnding(front) : { base: front, ending: "" };

  return (
    <TouchableOpacity
      style={[styles.card, { backgroundColor }]}
      onPress={() => setFlipped(!flipped)}
      activeOpacity={0.85}
    >
      {!flipped ? (
        <View style={{ alignItems: "center" }}>
          <Text style={styles.text}>
            {language === "de" && (
              <Text style={styles.article}>
                {getArticle(language, gender)}{" "}
              </Text>
            )}
            {isRussian ? (
              <>
                <Text>{base}</Text>
                <Text style={styles.ending}>{ending}</Text>
              </>
            ) : (
              front
            )}
          </Text>

          {isSoftSign && (
            <Text style={styles.softSignHint}>ь</Text>
          )}
        </View>
      ) : (
        <Text style={styles.text}>{back}</Text>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    width: 280,
    height: 180,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
  },

  text: {
    fontSize: 26,
    textAlign: "center",
    color: "#222",
  },

  article: {
    fontSize: 18,
    opacity: 0.6,
  },

  ending: {
    fontSize: 26,
    opacity: 0.55,
  },

  softSignHint: {
    marginTop: 6,
    fontSize: 14,
    opacity: 0.4,
  },
});
