import React, { useState } from 'react';
import { View, StyleSheet, useWindowDimensions } from 'react-native';
import { useRouter } from 'expo-router';
import BackGround from "../../components/FirstBG";
import SmoothCurvedButton from '../../components/SmoothCurvedButton';

export default function InitialScreen() {
    const router = useRouter();
    const { height, width } = useWindowDimensions(); // 화면 너비와 높이 가져오기
    const [isNavigating, setIsNavigating] = useState(false);

    const handlePress = (path) => {
        if (!isNavigating) {
            setIsNavigating(true);
            router.push(path);
            setTimeout(() => setIsNavigating(false), 1000);
        }
    };

    return (
        <View style={styles.container}>
            <View style={styles.backgroundContainer}>
                <BackGround />
            </View>
            <View style={[styles.buttonsContainer, { bottom: height * 0.15 }]}>
                <View style={styles.buttonWrapper}>
                    <SmoothCurvedButton
                        title="로그인"
                        onPress={() => handlePress('../(join)/login')}
                        disabled={isNavigating}
                    />
                </View>
                <View style={styles.buttonWrapper}>
                    <SmoothCurvedButton
                        title="회원 가입"
                        onPress={() => handlePress('../(join)')}
                        disabled={isNavigating}
                    />
                </View>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#ffffff',
    },
    backgroundContainer: {
        position: 'absolute',
        top: -60, // 배경을 위로 조정
        width: '100%',
        height: '100%',
    },
    buttonsContainer: {
        position: 'absolute',
        alignItems: 'center',
        justifyContent: 'center',
        width: '80%', // 너비를 60%로 설정하여 더 넓게 배치
    },
    buttonWrapper: {
        marginVertical: 15, // 버튼 상하 간격 조정
    },
});

export default InitialScreen;
