import {DarkTheme, DefaultTheme, ThemeProvider, useNavigation} from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';
import 'react-native-reanimated';
import { useColorScheme } from '@/hooks/useColorScheme';

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const [loaded] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
  });

  // 로그 출력 추가
  console.log('App is using color scheme:', colorScheme);
  console.log('Font loaded status:', loaded);

  useEffect(() => {
    if (loaded) {
      console.log('Fonts are loaded. Hiding Splash Screen.');
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  if (!loaded) {
    console.log('Fonts not loaded yet. Returning null.');
    return null;
  }
  const goToDiaryIndex = () => {
    const navigation = useNavigation();

    navigation.navigate("(diary)");
  };

  return (
      <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
        <Stack initialRouteName="(init)">
          {/* init 폴더의 index.tsx 파일을 첫 화면으로 설정 */}
          <Stack.Screen name="(init)" options={{ headerShown: false }} />

          {/* Diary, Tabs 등의 다른 화면 */}
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen name="(join)" options={{ headerShown: false }} />
          <Stack.Screen name="+not-found" />
        </Stack>
      </ThemeProvider>
  );
}
