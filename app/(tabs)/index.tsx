import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import {
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import CountryFlag from "react-native-country-flag";

export default function HomeScreen() {
  const router = useRouter();

  function go(lang: "en" | "de" | "ru" | "it") {
    router.replace({
      pathname: "/explore",
      params: { lang },
    });
  }

  function Flag({ iso }: { iso: string }) {
    return iso ? (
      <CountryFlag isoCode={iso} size={40} />
    ) : (
      <Text style={{ fontSize: 32 }}>🏳️</Text>
    );
  }

  return (
    <LinearGradient
      colors={["#a9a9a9", "#c0c0c0", "#e5e5e5"]}
      style={styles.container}
    >
      <Text style={styles.title}>Nyelv kiválasztása</Text>

      <View style={styles.cardsWrapper}>
        <TouchableOpacity style={styles.card} onPress={() => go("en")}>
          <Flag iso="GB" />
        </TouchableOpacity>

        <TouchableOpacity style={styles.card} onPress={() => go("it")}>
          <Flag iso="IT" />
        </TouchableOpacity>

        <TouchableOpacity style={styles.card} onPress={() => go("de")}>
          <Flag iso="DE" />
        </TouchableOpacity>

        <TouchableOpacity style={styles.card} onPress={() => go("ru")}>
          <Flag iso="RU" />
        </TouchableOpacity>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "flex-start",
    alignItems: "center",
    paddingTop: Platform.OS === "ios" ? 100 : 80,
  },

  title: {
    fontSize: 24,
    color: "#77748dff",
    fontWeight: Platform.OS === "ios" ? "600" : "bold",
    marginBottom: 20,
  },

  cardsWrapper: {
    alignItems: "center",
  },

  card: {
    width: 160,
    height: 100,
    backgroundColor: "#d9d9d9",
    borderRadius: 18,
    justifyContent: "center",
    alignItems: "center",
    marginVertical: 10,

    // iOS shadow
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,

    // Android shadow
    elevation: 3,
  },
});
