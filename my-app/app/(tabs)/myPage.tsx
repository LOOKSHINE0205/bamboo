import { NativeBaseProvider, Box, Button, Text, VStack } from 'native-base';
import { StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';

export default function HomeScreen() {
    const router = useRouter();

    return (
        <NativeBaseProvider>
            <Box flex={1} justifyContent="center" alignItems="center">
                <VStack space={4} alignItems="center">
                    <Text fontSize={60}>마이페이지</Text>
                    <Button
                        size="sm"
                        variant="outline"
                        onPress={() => router.push('../(init)')}
                    >
                        메인으로
                    </Button>
                </VStack>
            </Box>
        </NativeBaseProvider>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 20,
        backgroundColor: '#ffffff',
    },
    backButton: {
        position: 'absolute',
        top: 40,
        left: 20,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        marginTop: 60,
        marginBottom: 30,
    },
    inputContainer: {
        marginBottom: 20,
    },
    label: {
        fontSize: 16,
        marginBottom: 5,
    },
    input: {
        backgroundColor: '#e8f5e9',
        borderRadius: 8,
        padding: 10,
        marginBottom: 15,
    },
    button: {
        backgroundColor: '#ffffff',
        borderColor: '#000000',
        borderWidth: 1,
        paddingVertical: 12,
        borderRadius: 8,
        alignItems: 'center',
    },
    buttonText: {
        color: '#000000',
        fontSize: 16,
        fontWeight: 'bold',
    },
});