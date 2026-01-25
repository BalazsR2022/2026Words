import React, { useEffect, useMemo, useState } from 'react';
import { StyleSheet, Text, TextInput, TouchableOpacity, View, ScrollView } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';

import { loadMemoriters } from '../../storage/memoriterStorage';
import { Memoriter } from '../../types/Memoriter';

// Replace up to 10 words in the memoriter with blanks (simple algorithm: pick 10 longest words distinct)
function pickWordsToBlank(text: string) {
  const words = text.split(/(\s+)/).filter(Boolean);
  const candidates = words.filter(w => /[\p{L}]/u.test(w)).map(w => w.replace(/[^\p{L}]/gu, ''));
  const unique = Array.from(new Set(candidates.map(w=>w))).sort((a,b)=>b.length-a.length);
  return unique.slice(0,10);
}

export default function MemoriterPlay(){
  const params = useLocalSearchParams();
  const id = typeof params.id === 'string' ? params.id : undefined;

  const [item, setItem] = useState<Memoriter | null>(null);
  const [blanks, setBlanks] = useState<string[]>([]);
  const [answers, setAnswers] = useState<Record<string,string>>({});
  const [checked, setChecked] = useState(false);
  const [score, setScore] = useState(0);

  useEffect(()=>{
    let mounted = true;
    async function load(){
      if(!id) return;
      const all = await loadMemoriters();
      const found = all.find(m=>m.id===id);
      if(found && mounted){
        setItem(found);
        const picks = pickWordsToBlank(found.text);
        setBlanks(picks);
      }
    }
    load();
    return ()=>{ mounted=false };
  },[id]);

  type RenderPart =
    | { type: 'text'; text: string }
    | { type: 'blank'; key: string; text: string };

  const rendered = useMemo<RenderPart[] | null>(() => {
    if (!item) return null;
    const parts = item.text.split(/(\s+)/);
    return parts.map((p) => {
      const plain = p.replace(/[^\p{L}]/gu, '');
      if (blanks.includes(plain)) {
        return { type: 'blank', key: plain, text: p } as RenderPart;
      }
      return { type: 'text', text: p } as RenderPart;
    });
  }, [item, blanks]);

  function onChange(key:string, val:string){
    setAnswers(a=>({...a, [key]: val}));
  }

  function check(){
    if(!item) return;
    let sc = 0;
    for(const b of blanks){
      const expected = b.toLowerCase();
      const got = (answers[b] || '').toLowerCase();
      // partial match: contains expected or expected contains got
      if(got && (got.includes(expected) || expected.includes(got) || expected===got)) sc++;
    }
    setScore(sc);
    setChecked(true);
  }

  if(!item) return (
    <LinearGradient colors={["#2f3e5c", "#445b84"]} style={styles.container}>
      <View style={styles.content}><Text style={{color:'white'}}>Memoriter nem található</Text></View>
    </LinearGradient>
  );

  return (
    <LinearGradient colors={["#2f3e5c", "#445b84"]} style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.title}>{item.title}</Text>

        <View style={{flexDirection:'row', flexWrap:'wrap'}}>
          {rendered!.map((r, i)=> r.type==='text' ? (
            <Text key={i} style={styles.text}>{r.text}</Text>
          ) : (
            <View key={i} style={styles.blankWrap}>
              {!checked ? (
                <TextInput style={styles.blank} value={answers[r.key] ?? ''} onChangeText={(v:string)=>onChange(r.key as string, v)} />
              ) : (
                <Text style={styles.blankResult}>{r.text} → {answers[r.key as string] ?? '—'}</Text>
              )}
            </View>
          ))}
        </View>

        {!checked ? (
          <TouchableOpacity onPress={check} style={styles.button}><Text>Ellenőrzés</Text></TouchableOpacity>
        ) : (
          <View style={{alignItems:'center'}}>
            <Text style={{color:'white'}}>Pontszám: {score} / {blanks.length}</Text>
            <TouchableOpacity onPress={()=>{ setChecked(false); setAnswers({}); setScore(0); }} style={styles.button}><Text>Újra</Text></TouchableOpacity>
          </View>
        )}

      </ScrollView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: 20, paddingTop: 60 },
  title: { color: 'white', fontSize: 20, marginBottom: 12 },
  text: { color: 'white' },
  blankWrap: { minWidth: 80, marginHorizontal: 4 },
  blank: { backgroundColor: 'rgba(255,255,255,0.22)', color: 'white', padding: 6, borderRadius: 6 },
  blankResult: { color: 'white' },
  button: { backgroundColor: 'rgba(255,255,255,0.35)', padding: 12, borderRadius: 10, alignItems: 'center', marginTop: 20 }
});
