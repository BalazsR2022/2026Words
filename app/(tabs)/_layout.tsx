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
        tabBarStyle: {
          backgroundColor: "#e5e5e5",
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
              <IconSymbol
                size={28}
                name="house.fill"
                color={color}
              />
            ) : (
              <FontAwesome5
                name="home"
                size={24}
                color={color}
              />
            ),
        }}
      />

      <Tabs.Screen
        name="explore"
        options={{
          href: null, // rejtett tab, Android + iOS OK
        }}
      />
    </Tabs>
  );
}
