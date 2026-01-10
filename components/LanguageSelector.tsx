import { StyleSheet, TouchableOpacity, View } from "react-native";
import CountryFlag from "react-native-country-flag";
import { Language } from "../types/Word";

type Props = {
  selected: Language;
  onSelect: (lang: Language) => void;
};

export function LanguageSelector({ selected, onSelect }: Props) {
  const languages: { flag: string; lang: Language }[] = [
    { flag: "GB", lang: "en" },
    { flag: "IT", lang: "it" },
    { flag: "DE", lang: "de" },
    { flag: "RU", lang: "ru" },
  ];

  return (
    <View style={styles.container}>
      {languages.map(({ flag, lang }) => (
        <LangButton
          key={lang}
          flag={flag}
          lang={lang}
          selected={selected}
          onSelect={onSelect}
        />
      ))}
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
      style={[styles.button, selected === lang && styles.selected]}
    >
      <CountryFlag isoCode={flag} size={28} />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    justifyContent: "center",
    marginBottom: 24,
  },
  button: {
    padding: 10,
    borderRadius: 30,
    backgroundColor: "rgba(255,255,255,0.25)",
    marginHorizontal: 8, // gap helyett stabil cross-platform
  },
  selected: {
    backgroundColor: "rgba(255,255,255,0.5)",
  },
});
