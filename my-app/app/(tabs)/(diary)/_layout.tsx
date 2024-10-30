import { Stack } from "expo-router";

export default function TabsLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="mood" />
      {/* 다른 화면들도 추가 */}
    </Stack>
  );
}
