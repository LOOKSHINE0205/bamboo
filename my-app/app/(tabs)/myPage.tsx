import { NativeBaseProvider, Box, Button, Text } from 'native-base';

export default function HomeScreen() {
  return (
      <NativeBaseProvider>
          <Box flex={1} justifyContent="center" alignItems="center">
              <Text fontSize={60}>마이페이지</Text>

          </Box>
      </NativeBaseProvider>
  );
}
