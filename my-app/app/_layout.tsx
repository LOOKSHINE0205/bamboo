// app/_layout.tsx

import { DarkTheme, DefaultTheme, NavigationContainer, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack, useRouter } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';
import 'react-native-reanimated';
import { useColorScheme } from '@/hooks/useColorScheme';

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const [loaded] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
  });

  const router = useRouter();

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  if (!loaded) {
    return null;
  }

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
