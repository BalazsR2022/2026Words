// components/Flashcard.tsx
import { useState } from "react";
import { StyleSheet, Text, TouchableOpacity } from "react-native";

type Props = {
  front: string;
  back: string;
};

export default function Flashcard({ front, back }: Props) {
  const [flipped, setFlipped] = useState(false);

  return (
    <TouchableOpacity
      style={styles.card}
      onPress={() => setFlipped(!flipped)}
      activeOpacity={0.85}
    >
      <Text style={styles.text}>
        {flipped ? back : front}
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    width: 280,
    height: 180,
    borderRadius: 20,
    backgroundColor: "#bfc1c5ff",
    justifyContent: "center",
    alignItems: "center",
  },
  text: {
    fontSize: 26,
    textAlign: "center",
  },
});
