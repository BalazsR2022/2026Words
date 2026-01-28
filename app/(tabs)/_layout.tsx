import { Tabs } from "expo-router";
import React from "react";
import { Platform } from "react-native";

import { HapticTab } from "@/components/haptic-tab";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { FontAwesome5 } from "@expo/vector-icons";

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,

        tabBarActiveTintColor: "#bbb6b6ff",
        tabBarInactiveTintColor: "#888888",
        // show only icon (no label) and center the single icon in the bar
        tabBarShowLabel: false,
        tabBarStyle: {
          backgroundColor: "#e5e5e5",
          height: 80,
          paddingBottom: Platform.OS === 'android'? 20:6,
          justifyContent: "center",
          alignItems: "center",
        },

        // Haptics: Androidon no-op, iOS-en működik
        tabBarButton: HapticTab,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Home",
          tabBarIcon: ({ color }) =>
            Platform.OS === "ios" ? (
              <IconSymbol size={28} name="house.fill" color={color} />
            ) : (
              <FontAwesome5 name="home" size={24} color={color} />
            ),
        }}
      />

      {/* Explicitly register other routes as hidden so expo-router doesn't show them as tabs */}
      <Tabs.Screen name="explore" options={{ href: null }} />
      <Tabs.Screen name="search" options={{ href: null }} />
      <Tabs.Screen name="wordlist" options={{ href: null }} />
      <Tabs.Screen name="wordsearch" options={{ href: null }} />
      <Tabs.Screen name="memoriterList" options={{ href: null }} />
      <Tabs.Screen name="memoriterEditor" options={{ href: null }} />
      <Tabs.Screen name="memoriterPlay" options={{ href: null }} />

      {/* Only Home is registered in the global tab bar to avoid extra arrows/chevrons. */}
    </Tabs>
  );
}
