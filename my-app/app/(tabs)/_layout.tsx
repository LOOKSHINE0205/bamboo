import { Tabs } from 'expo-router';
import React from 'react';

import { TabBarIcon } from '@/components/navigation/TabBarIcon';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';

export default function TabLayout() {
  const colorScheme = useColorScheme();

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors[colorScheme ?? 'light'].tint,
        headerShown: false,
          tabBarStyle: {
              height: 60, // 원하는 높이로 설정 (기본 높이보다 살짝 높게)
              paddingBottom: 10, // 아이콘과 텍스트를 살짝 위로 조절
              paddingTop: 10,
          },
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: '대화하기',
          tabBarIcon: ({ color, focused }) => (
            <TabBarIcon name={focused ? 'chatbubbles' : 'chatbubbles-outline'} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="explore"
        options={{
          title: '일기',
          tabBarIcon: ({ color, focused }) => (
            <TabBarIcon name={focused ? 'book' : 'book-outline'} color={color} />
          ),
        }}
      />
        <Tabs.Screen
            name="index2"
            options={{
                title: '보고서',
                tabBarIcon: ({ color, focused }) => (
                    <TabBarIcon name={focused ? 'home' : 'home-outline'} color={color} />
                ),
            }}
        />
        <Tabs.Screen
            name="index3"
            options={{
                title: '마이페이지',
                tabBarIcon: ({ color, focused }) => (
                    <TabBarIcon name={focused ? 'home' : 'home-outline'} color={color} />
                ),
            }}
        />
    </Tabs>
  );
}
