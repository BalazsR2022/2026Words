import { useRouter } from "expo-router";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import CountryFlag from "react-native-country-flag";

export default function HomeScreen() {
  const router = useRouter();

  function go(lang: "en" | "de" | "ru") {
    router.push({
      pathname: "/explore",
      params: { lang },
    });
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Nyelv kiválasztása</Text>

      <TouchableOpacity style={styles.card} onPress={() => go("en")}>
        <CountryFlag isoCode="GB" size={64} />
      </TouchableOpacity>

      <TouchableOpacity style={styles.card} onPress={() => go("de")}>
        <CountryFlag isoCode="DE" size={64} />
      </TouchableOpacity>

      <TouchableOpacity style={styles.card} onPress={() => go("ru")}>
        <CountryFlag isoCode="RU" size={64} />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#d2d6ddff",
    justifyContent: "center",
    alignItems: "center",
    gap: 20,
  },
  title: {
    fontSize: 20,
    marginBottom: 10,
  },
  card: {
    width: 160,
    height: 100,
    backgroundColor: "#bfc1c5ff",
    borderRadius: 18,
    justifyContent: "center",
    alignItems: "center",
  },
});
