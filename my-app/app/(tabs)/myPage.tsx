import { NativeBaseProvider } from 'native-base';
import { StyleSheet, ImageBackground, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import BackGround from "../../assets/images/bamboobg.png";
import { Ionicons } from '@expo/vector-icons';

// 애니메이션 컴포넌트 불러오기
import CloudAnimation from '../../components/animation/CloudAnimation';
import BambooAnimation from '../../components/animation/BambooAnimation';
import ButterflyAnimation from '../../components/animation/ButterflyAnimation';
import GrassAnimation from '../../components/animation/GrassAnimation';

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

                {/* 애니메이션 추가 */}
                <CloudAnimation />
                <BambooAnimation />
                <ButterflyAnimation />
                <GrassAnimation />

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
