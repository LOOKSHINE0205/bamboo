import { DarkTheme, DefaultTheme, NavigationContainer, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack, useRouter } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';
import 'react-native-reanimated';
import { useColorScheme } from '@/hooks/useColorScheme';
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import { AppState, AppStateStatus } from "react-native";

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const [loaded] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
  });

  const router = useRouter();

  // 앱 로딩 시 스플래시 화면 숨김
  useEffect(() => {
    if (loaded) {
      console.log("Fonts loaded, hiding splash screen.");
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  if (!loaded) {
    return null;
  }

  // 앱 상태 변경 이벤트 처리
  useEffect(() => {
    const handleAppStateChange = async (nextAppState: AppStateStatus) => {
      const userEmail = await AsyncStorage.getItem('userEmail');
      console.log(`App state changed to: ${nextAppState}`); // 상태 변경 로그

      if (userEmail) {
        if (nextAppState === 'active') {
          console.log("App is active, updating status to 'active'.");
          await updateUserStatus(userEmail, 'active');
        } else if (nextAppState === 'background') {
          console.log("App is in background, updating status to 'inactive'.");
          await updateUserStatus(userEmail, 'inactive');
        }
      } else {
        console.log("User email not found in storage.");
      }
    };

    // 앱 상태 변경 이벤트 리스너 추가
    const subscription = AppState.addEventListener('change', handleAppStateChange);

    // 앱 첫 로드 시 현재 상태 업데이트
    (async () => {
      const userEmail = await AsyncStorage.getItem('userEmail');
      if (userEmail) {
        const initialState = AppState.currentState === 'active' ? 'active' : 'inactive';
        console.log(`Initial app state is ${initialState}, updating status.`);
        await updateUserStatus(userEmail, initialState);
      }
    })();

    // 언마운트 시 이벤트 리스너 제거
    return () => {
      console.log("Removing app state change listener.");
      subscription.remove();
    };
  }, []);

  // 사용자 상태 업데이트 API 호출
  const updateUserStatus = async (userEmail: string, status: string) => {
    try {
      console.log(`Sending status update to server: ${status} for user ${userEmail}`);
      const response = await axios.post('https://your-server-url.com/api/updateUserStatus', {
        userEmail: userEmail,
        status: status,
      });
      console.log("User status updated successfully:", response.data);
    } catch (error) {
      console.error("Error updating user status:", error);
    }
  };

  return (
      <NavigationContainer>
        {/* 전체 앱을 감싸는 NavigationContainer 추가 */}
        <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
          <Stack initialRouteName="(init)">
            <Stack.Screen name="(init)" options={{ headerShown: false }} />
            <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
            <Stack.Screen name="(join)" options={{ headerShown: false }} />
            <Stack.Screen name="+not-found" />
          </Stack>
        </ThemeProvider>
      </NavigationContainer>
  );
}
