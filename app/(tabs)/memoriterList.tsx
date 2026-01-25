import React, { useEffect, useState } from "react";
import { FlatList, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import CountryFlag from "react-native-country-flag";
import { FontAwesome5 } from "@expo/vector-icons";

import { ThemedView } from "../../components/ui/themed-view";
import { loadMemoriters, deleteMemoriter } from "../../storage/memoriterStorage";
import { Memoriter } from "../../types/Memoriter";

export default function MemoriterList() {
  const { lang } = useLocalSearchParams();
  const router = useRouter();
  const [language, setLanguage] = useState((lang as any) ?? "en");
  const [items, setItems] = useState<Memoriter[]>([]);
  const [filter, setFilter] = useState("");

  useEffect(() => {
    async function load() {
      const all = await loadMemoriters();
      setItems(all.filter(m => m.language === language));
    }
    load();
  }, [language]);

  function isoCodeForLang(l: string) {
    return l === "de" ? "DE" : l === "ru" ? "RU" : l === "it" ? "IT" : "GB";
  }

  return (
    <LinearGradient colors={["#2f3e5c", "#445b84"]} style={styles.container}>
      <ThemedView style={styles.content}>
        <View style={styles.headerRow}>
          <CountryFlag isoCode={isoCodeForLang(language)} size={28} />
          <Text style={styles.headerTitle}>Memoriterek — {language.toUpperCase()}</Text>
        </View>

        <TextInput
          value={filter}
          onChangeText={setFilter}
          placeholder="Keresés cím szerint..."
          placeholderTextColor="#ccc"
          style={styles.input}
        />

        <TouchableOpacity onPress={() => router.push({ pathname: "./memoriterEditor", params: { lang: language } })} style={styles.button}>
          <Text>Új memoriter</Text>
        </TouchableOpacity>

        <FlatList
          data={items.filter(i => i.title.toLowerCase().includes(filter.toLowerCase()))}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <View style={styles.item}>
              <View style={{ flex: 1 }}>
                <Text style={styles.title}>{item.title}</Text>
                <Text style={styles.preview}>{item.text.slice(0, 120)}{item.text.length>120?"...":""}</Text>
              </View>

              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <TouchableOpacity style={{ marginRight: 10 }} onPress={() => router.push({ pathname: "./memoriterPlay", params: { id: item.id } })}>
                  <FontAwesome5 name="play" size={18} color="white" />
                </TouchableOpacity>

                <TouchableOpacity style={{ marginRight: 10 }} onPress={() => router.push({ pathname: "./memoriterEditor", params: { id: item.id } })}>
                  <FontAwesome5 name="pen" size={18} color="white" />
                </TouchableOpacity>

                <TouchableOpacity onPress={() => { deleteMemoriter(item.id); setItems(items.filter(i=>i.id!==item.id)); }}>
                  <FontAwesome5 name="trash" size={18} color="white" />
                </TouchableOpacity>
              </View>
            </View>
          )}
        />
      </ThemedView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { flex: 1, marginTop: 60, paddingHorizontal: 20, backgroundColor: 'transparent' },
  headerRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 10 },
  headerTitle: { color: 'white', marginLeft: 10, fontWeight: 'bold' },
  input: { backgroundColor: 'rgba(255,255,255,0.22)', padding: 14, borderRadius: 10, color: 'white', marginBottom: 12 },
  button: { backgroundColor: 'rgba(255,255,255,0.35)', padding: 14, borderRadius: 10, alignItems: 'center', marginBottom: 20 },
  item: { flexDirection: 'row', alignItems: 'center', padding: 10, borderRadius: 8, marginBottom: 8, backgroundColor: 'rgba(255,255,255,0.06)' },
  title: { color: 'white', fontWeight: 'bold' },
  preview: { color: '#fff', opacity: 0.8 }
});
