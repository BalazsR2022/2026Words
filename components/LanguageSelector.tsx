import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Language } from "../types/Word";

type Props = {
  selected: Language;
  onSelect: (lang: Language) => void;
};

export function LanguageSelector({ selected, onSelect }: Props) {
  return (
    <View style={styles.container}>
      <LangButton flag="🇬🇧" lang="en" selected={selected} onSelect={onSelect} />
      <LangButton flag="🇩🇪" lang="de" selected={selected} onSelect={onSelect} />
      <LangButton flag="🇷🇺" lang="ru" selected={selected} onSelect={onSelect} />
    </View>
  );
}

function LangButton({
  flag,
  lang,
  selected,
  onSelect,
}: {
  flag: string;
  lang: Language;
  selected: Language;
  onSelect: (lang: Language) => void;
}) {
  return (
    <TouchableOpacity
      onPress={() => onSelect(lang)}
      style={[
        styles.button,
        selected === lang && styles.selected,
      ]}
    >
      <Text style={styles.flag}>{flag}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 16,
    marginBottom: 24,
  },
  button: {
    padding: 10,
    borderRadius: 30,
    backgroundColor: "rgba(255,255,255,0.25)",
  },
  selected: {
    backgroundColor: "rgba(255,255,255,0.5)",
  },
  flag: {
    fontSize: 28,
  },
});
