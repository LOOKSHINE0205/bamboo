import { Tabs } from 'expo-router';
import React from 'react';

import { TabBarIcon } from '@/components/navigation/TabBarIcon';
import { useColorScheme } from '@/hooks/useColorScheme';
import { Ionicons } from '@expo/vector-icons';

export default function TabLayout() {
    const colorScheme = useColorScheme();

    return (
        <Tabs
            screenOptions={{
                tabBarActiveTintColor: '#4a9960', // 대나무 색깔로 설정
                headerShown: true, // 각 탭의 헤더를 보여줍니다
                tabBarStyle: {
                    height: 60,
                    paddingTop: 10,
                },
            }}
        >
            <Tabs.Screen
                name="index"
                options={{
                    title: "대화하기",
                    tabBarLabel: '', // 텍스트 숨김
                    tabBarIcon: ({ color, focused }) => (
                        <TabBarIcon name={focused ? 'chatbubbles' : 'chatbubbles-outline'} color={color} />
                    ),
                }}
            />
            <Tabs.Screen
                name="diary"
                options={{
                    title: "일기",
                    tabBarLabel: '',
                    tabBarIcon: ({ color, focused }) => (
                        <TabBarIcon name={focused ? 'calendar' : 'calendar-outline'} color={color} />
                    ),
                }}
            />
            <Tabs.Screen
                name="myPage"
                options={{
                    title: "마이 페이지",
                    tabBarLabel: '',
                    tabBarIcon: ({ color, focused }) => (
                        <TabBarIcon name={focused ? 'person' : 'person-outline'} color={color} />
                    ),
                }}
            />
            <Tabs.Screen
                name="report"
                options={{
                    title: "보고서",
                    tabBarLabel: '',
                    tabBarIcon: ({ color, focused }) => (
                        <TabBarIcon name={focused ? 'analytics' : 'analytics-outline'} color={color} />
                    ),
                }}
            />
            <Tabs.Screen
                name="setting"
                options={{
                    title: "설정",
                    tabBarLabel: '',
                    tabBarIcon: ({ color, focused }) => (
                        <TabBarIcon name={focused ? 'settings' : 'settings-outline'} color={color} />
                    ),
                }}
            />
        </Tabs>
    );
}