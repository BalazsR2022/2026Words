import { Tabs } from 'expo-router';
import React from 'react';

import { HapticTab } from '@/components/haptic-tab';
import { IconSymbol } from '@/components/ui/icon-symbol';


export default function TabLayout() {


  return (
    <Tabs
      screenOptions={{

      tabBarActiveTintColor: '#bbb6b6ff', // sötét, elegáns szürke/fekete
      tabBarInactiveTintColor: '#888888', // halványabb szürke az inaktív ikonokhoz
      tabBarStyle: { backgroundColor: '#e5e5e5' }, // harmonizáló ezüstös tab bar
        headerShown: false,
        tabBarButton: HapticTab,
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color }) => <IconSymbol size={28} name="house.fill" color={color} />,
        }}
      />
      <Tabs.Screen
        name="explore"
        options={{
           href: null,
        }}
      />
    </Tabs>
  );
}
