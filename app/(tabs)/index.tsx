import { useRouter } from "expo-router";
import { StyleSheet, TouchableOpacity, View } from "react-native";
import CountryFlag from "react-native-country-flag";

export default function HomeScreen() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.card} onPress={() => router.push("/explore")}>
        <CountryFlag isoCode="GB" size={64} />
      </TouchableOpacity>

      <TouchableOpacity style={styles.card} onPress={() => router.push("/explore")}>
        <CountryFlag isoCode="DE" size={64} />
      </TouchableOpacity>

      <TouchableOpacity style={styles.card} onPress={() => router.push("/explore")}>
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
  card: {
    width: 160,
    height: 100,
    backgroundColor: "#bfc1c5ff",
    borderRadius: 18,
    justifyContent: "center",
    alignItems: "center",
  },
});
