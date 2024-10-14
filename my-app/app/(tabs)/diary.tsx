import { NativeBaseProvider, Box, Text } from 'native-base';

export default function TabTwoScreen() {
    return (
        <NativeBaseProvider>
            <Box flex={1} justifyContent="center" alignItems="center">
                <Text fontSize={60}>일기페이지</Text>
            </Box>
        </NativeBaseProvider>
    );
}
