import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';

import { loadMemoriters, saveMemoriters, addMemoriter } from '../../storage/memoriterStorage';
import { Memoriter } from '../../types/Memoriter';

export default function MemoriterEditor() {
  const params = useLocalSearchParams();
  const router = useRouter();
  const id = typeof params.id === 'string' ? params.id : undefined;
  const lang = typeof params.lang === 'string' ? params.lang : 'en';

  const [title, setTitle] = useState('');
  const [text, setText] = useState('');

  useEffect(() => {
    let mounted = true;
    async function load() {
      if (id) {
        const all = await loadMemoriters();
        const found = all.find(m => m.id === id);
        if (found && mounted) {
          setTitle(found.title);
          setText(found.text);
        }
      }
    }
    load();
    return () => { mounted = false };
  }, [id]);

  async function save() {
    if (!title.trim() || !text.trim()) return;
    const item: Memoriter = {
      id: id ?? `${Date.now()}-${Math.random()}`,
      title: title.trim(),
      text: text.trim(),
      language: lang as any,
      createdAt: Date.now(),
    };

    if (id) {
      const all = await loadMemoriters();
      const updated = all.map(m => m.id === id ? item : m);
      await saveMemoriters(updated);
    } else {
      await addMemoriter(item);
    }

    // Navigate to the memoriter list so the new/updated item is visible and we don't end up at the app root
    router.replace({ pathname: "./memoriterList", params: { lang } });
  }

  return (
    <LinearGradient colors={["#2f3e5c", "#445b84"]} style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.label}>Cím</Text>
        <TextInput value={title} onChangeText={setTitle} placeholder="Cím..." placeholderTextColor="#ccc" style={styles.input} />
        <Text style={styles.label}>Szöveg</Text>
        <TextInput value={text} onChangeText={setText} placeholder="Írd be a memoritert..." placeholderTextColor="#ccc" style={[styles.input, { height: 140 }]} multiline />
        <TouchableOpacity onPress={save} style={styles.button}><Text>Mentés</Text></TouchableOpacity>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { flex: 1, marginTop: 60, paddingHorizontal: 20 },
  label: { color: 'white', marginBottom: 6 },
  input: { backgroundColor: 'rgba(255,255,255,0.22)', padding: 14, borderRadius: 10, color: 'white', marginBottom: 12 },
  button: { backgroundColor: 'rgba(255,255,255,0.35)', padding: 14, borderRadius: 10, alignItems: 'center' }
});
