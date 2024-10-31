import React, { useEffect } from 'react';
import { View, TouchableOpacity, StyleSheet } from 'react-native';
import { Tabs } from 'expo-router';
import { TabBarIcon } from '@/components/navigation/TabBarIcon';
import { useWindowDimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, { useSharedValue, withTiming, useAnimatedStyle } from 'react-native-reanimated';

function CustomTabBar({ state, descriptors, navigation }) {
    const { width } = useWindowDimensions();
    const insets = useSafeAreaInsets();
    const transition = useSharedValue(0);

    useEffect(() => {
        transition.value = withTiming(state.index, { duration: 300 });
    }, [state.index]);

    return (
        <View style={[styles.tabContainer, { paddingBottom: insets.bottom, width }]}>
            {state.routes.map((route, index) => {
                const { options } = descriptors[route.key];
                const label = options.title || route.name;

                const isFocused = state.index === index;
                const onPress = () => {
                    const event = navigation.emit({
                        type: 'tabPress',
                        target: route.key,
                    });

                    if (!event.defaultPrevented) {
                        navigation.navigate(route.name);
                    }
                };

                const iconName = route.name === 'index' ? (isFocused ? 'chatbubbles' : 'chatbubbles-outline') :
                    route.name === '(diary)' ? (isFocused ? 'calendar' : 'calendar-outline') :
                    route.name === 'myPage' ? (isFocused ? 'person' : 'person-outline') :
                    route.name === 'report' ? (isFocused ? 'analytics' : 'analytics-outline') :
                    route.name === 'setting' ? (isFocused ? 'settings' : 'settings-outline') : '';

                const animatedStyle = useAnimatedStyle(() => ({
                    transform: [
                        {
                            scale: withTiming(isFocused ? 1.2 : 1, { duration: 200 }),
                        },
                    ],
                }));

                return (
                    <TouchableOpacity
                        key={route.key}
                        accessibilityRole="button"
                        accessibilityLabel={options.tabBarAccessibilityLabel}
                        testID={options.tabBarTestID}
                        onPress={onPress}
                        style={styles.tabItem}
                    >
                        <Animated.View style={animatedStyle}>
                            <TabBarIcon name={iconName} color={isFocused ? '#4a9960' : '#999'} size={28} />
                        </Animated.View>
                    </TouchableOpacity>
                );
            })}
        </View>
    );
}

export default function TabLayout() {
    return (
        <Tabs
            tabBar={(props) => <CustomTabBar {...props} />}
        >
            <Tabs.Screen name="index"  options={{ title: "대화하기" }} />
            <Tabs.Screen name="(diary)" options={{ title: "다이어리" }} />
            <Tabs.Screen name="myPage" options={{ title: "마이 페이지" }} />
            <Tabs.Screen name="report" options={{ title: "보고서" }} />
            <Tabs.Screen name="setting" options={{ title: "설정" }} />
        </Tabs>
    );
}

const styles = StyleSheet.create({
    tabContainer: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        alignItems: 'center',
        height: 60,
        backgroundColor: '#ffffff',
        borderTopWidth: 1,
        borderColor: '#e0e0e0',
    },
    tabItem: {
        flex: 1,
        alignItems: 'center',
    },
});
