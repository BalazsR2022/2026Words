import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
} from "@react-navigation/native";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { Platform } from "react-native";
import "react-native-reanimated";

import { useColorScheme } from "@/hooks/use-color-scheme";

export const unstable_settings = {
  anchor: "(tabs)",
};

export default function RootLayout() {
  const scheme = useColorScheme();

  // Biztonságos fallback (Android app start edge-case)
  const colorScheme = scheme === "dark" ? "dark" : "light";

  return (
    <ThemeProvider
      value={colorScheme === "dark" ? DarkTheme : DefaultTheme}
    >
      <Stack>
        <Stack.Screen
          name="(tabs)"
          options={{ headerShown: false }}
        />

        <Stack.Screen
          name="modal"
          options={{
            presentation: "modal",
            title: "Modal",
          }}
        />
      </Stack>

      {/* Platform-biztos StatusBar */}
      <StatusBar
        style={colorScheme === "dark" ? "light" : "dark"}
        translucent={Platform.OS === "android"}
      />
    </ThemeProvider>
  );
}
