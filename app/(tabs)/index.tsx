import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { StyleSheet, Text, TouchableOpacity } from "react-native";
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
    <LinearGradient
      colors={["#a9a9a9", "#c0c0c0", "#e5e5e5"]} // statikus ezüst gradient
      style={styles.container}
    >
      <Text style={styles.title}>Nyelv kiválasztása</Text>

      <TouchableOpacity style={styles.card} onPress={() => go("en")}>
        <CountryFlag isoCode="GB" size={40} style={{ borderRadius: 5 }} />
      </TouchableOpacity>

      <TouchableOpacity style={styles.card} onPress={() => go("de")}>
        <CountryFlag isoCode="DE" size={40} style={{ borderRadius: 5 }} />
      </TouchableOpacity>

      <TouchableOpacity style={styles.card} onPress={() => go("ru")}>
        <CountryFlag isoCode="RU" size={40} style={{ borderRadius: 5 }} />
      </TouchableOpacity>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "flex-start",
    alignItems: "center",
    gap: 20,
    paddingTop: 80, // kicsit feljebb a szöveg
  },
  title: {
    fontSize: 24, // kicsit nagyobb szöveg
    color: "#77748dff", // elegáns, visszafogott szín
    fontFamily: "sans-serif-light",
    fontWeight: "600",
    marginBottom: 20,
  },
  card: {
    width: 160,
    height: 100,
    backgroundColor: "#d9d9d9", // harmonikus az ezüst gradienthez
    borderRadius: 18,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    marginVertical: 10,
  },
});
