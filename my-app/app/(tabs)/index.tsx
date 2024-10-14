import {NativeBaseProvider, Box, Text, Button} from 'native-base';
import React from 'react';
import { router } from 'expo-router';
export default function HomeScreen() {
  return (
      <NativeBaseProvider>
          <Box flex={1} justifyContent="center" alignItems="center">
              <Text fontSize={60}>챗봇페이지</Text>
              <Button
                  onPress={() => router.push('/(init)')} // 명시적으로 index로 이동
              />

          </Box>
      </NativeBaseProvider>
  );
}
