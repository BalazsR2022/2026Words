// Replace the long list-screen implementation with a redirect helper so the old route forwards to the new wordlist route.
import React, { useEffect } from "react";
import { View, ActivityIndicator, StyleSheet } from "react-native";
import { useRouter } from "expo-router";

export default function WordSearchRedirect() {
  const router = useRouter();

  useEffect(() => {
    // Redirect tabs-local wordsearch to the new WordList route
    router.replace({ pathname: '/wordlist' });
  }, [router]);

  return (
    <View style={styles.center}>
      <ActivityIndicator size="large" color="#ffffff" />
    </View>
  );
}

const styles = StyleSheet.create({ center: { flex: 1, justifyContent: 'center', alignItems: 'center' } });
