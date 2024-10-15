import { NativeBaseProvider, Box, Button, Text, VStack } from 'native-base';
import { StyleSheet, ImageBackground, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import BackGround from "../../assets/images/bamboobg.png";
import { Ionicons } from '@expo/vector-icons';

export default function HomeScreen() {
    const router = useRouter();

    return (
        <NativeBaseProvider>
            <ImageBackground
                source={BackGround}
                style={styles.background}
                resizeMode="stretch"
            >
                <TouchableOpacity
                    style={styles.settingsButton}
                    onPress={() => router.push('../(setting)')}
                >
                    <Ionicons name="settings-outline" size={30} color="white" />
                </TouchableOpacity>

            </ImageBackground>
        </NativeBaseProvider>
    );
}

const styles = StyleSheet.create({
    background: {
        flex: 1,
        width: '100%',
        height: '100%',
    },
    settingsButton: {
        position: 'absolute',
        top: 10,
        right: 10,
        padding: 10,
    },
});