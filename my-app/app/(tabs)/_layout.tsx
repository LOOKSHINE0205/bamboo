import React, { useEffect, useState } from 'react';
import { View, TouchableOpacity, StyleSheet, Text, Alert } from 'react-native';
import { Tabs } from 'expo-router';
import { TabBarIcon } from '@/components/navigation/TabBarIcon';
import { useWindowDimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, { useSharedValue, withTiming, useAnimatedStyle } from 'react-native-reanimated';
import { getUserInfo, clearUserData } from '../../storage/storageHelper'; // 사용자 정보 가져오기 함수와 로그아웃 함수 import
import { useRouter } from 'expo-router';
import { ProfileProvider } from '../../context/ProfileContext';

function CustomTabBar({ state, descriptors, navigation }) {
    const { width, height } = useWindowDimensions();
    const insets = useSafeAreaInsets();
    const transition = useSharedValue(0);
    const [userInfo, setUserInfo] = useState(null);

    const aspectRatio = width / height;
    const iconSize = Math.max(30, Math.min(40, width * 0.08 * aspectRatio));
    const tabBarHeight = iconSize * 2.5;

    useEffect(() => {
        const fetchUserInfo = async () => {
            const data = await getUserInfo();
            setUserInfo(data);
        };

        fetchUserInfo();

        const unsubscribe = navigation.addListener('state', fetchUserInfo);
        return unsubscribe;
    }, [navigation]);

    useEffect(() => {
        transition.value = withTiming(state.index, { duration: 300 });
    }, [state.index]);

    return (
        <View style={[styles.tabContainer, { paddingBottom: insets.bottom, width, height: tabBarHeight }]}>
            {state.routes.map((route, index) => {
                const { options } = descriptors[route.key];
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
                        onPress={onPress}
                        style={styles.tabItem}
                    >
                        <Animated.View style={animatedStyle}>
                            <TabBarIcon name={iconName} color={isFocused ? '#4a9960' : '#999'} size={iconSize} />
                        </Animated.View>
                    </TouchableOpacity>
                );
            })}
        </View>
    );
}

export default function TabLayout() {
    const router = useRouter();

    const handleLogout = async () => {
        try {
            await clearUserData();
            Alert.alert('알림', '로그아웃 되었습니다.');
            router.replace('../(init)');
        } catch (error) {
            console.error("로그아웃 중 오류 발생:", error);
            Alert.alert("오류", "로그아웃 중 문제가 발생했습니다.");
        }
    };

    return (
        <ProfileProvider>
            <Tabs
                tabBar={(props) => <CustomTabBar {...props} />}
            >
                <Tabs.Screen name="index" options={{ title: "대화하기", headerTitleAlign: "center" }} />
                <Tabs.Screen name="(diary)" options={{ title: "다이어리", headerTitleAlign: "center" }} />
                <Tabs.Screen name="myPage" options={{ title: "마이 페이지", headerTitleAlign: "center" }} />
                <Tabs.Screen name="report" options={{ title: "보고서", headerTitleAlign: "center" }} />
                <Tabs.Screen
                    name="setting"
                    options={{
                        title: "설정",
                        headerTitleAlign: "center",
                        headerRight: () => (
                            <TouchableOpacity onPress={handleLogout}>
                                <Text style={{ color: 'black', marginRight: 10 }}>로그아웃</Text>
                            </TouchableOpacity>
                        ),
                    }}
                />
            </Tabs>
        </ProfileProvider>
    );
}

const styles = StyleSheet.create({
    tabContainer: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        alignItems: 'center',
        backgroundColor: '#ffffff',
        borderTopWidth: 1,
        borderColor: '#e0e0e0',
    },
    tabItem: {
        flex: 1,
        alignItems: 'center',
    },
});
