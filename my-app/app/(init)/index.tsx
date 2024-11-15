// app/(init)/index.tsx
import React, { useState } from 'react';
import { View, StyleSheet, useWindowDimensions } from 'react-native';
import { useRouter } from 'expo-router'; // expo-router의 useRouter 사용
import BackGround from "../../components/FirstBG";
import SmoothCurvedButton from '../../components/SmoothCurvedButton';

export default function InitialScreen() {
    const router = useRouter(); // useRouter 가져오기
    const { height, width } = useWindowDimensions();
    const [isNavigating, setIsNavigating] = useState(false);

    const handlePress = (path) => {
        if (!isNavigating) {
            setIsNavigating(true);
            router.push(path); // router.push로 경로 이동
            setTimeout(() => setIsNavigating(false), 1000);
        }
    };

    return (
        <View style={styles.container}>
            <View style={[styles.backgroundContainer, { width, height }]}>
                <BackGround width={width} height={height} />
            </View>
            <View style={[styles.buttonsContainer, dynamicStyles(height).buttonsContainer]}>
                <View style={[styles.buttonWrapper, dynamicStyles(height).buttonWrapper]}>
                    <SmoothCurvedButton
                        title="로그인"
                        onPress={() => handlePress('/(join)/login')} // 절대 경로 사용
                        disabled={isNavigating}
                    />
                </View>
                <View style={[styles.buttonWrapper, dynamicStyles(height).buttonWrapper]}>
                    <SmoothCurvedButton
                        title="회원 가입"
                        onPress={() => handlePress('/(join)')} // 절대 경로 사용
                        disabled={isNavigating}
                    />
                </View>
            </View>
        </View>
    );
}

const dynamicStyles = (height) => StyleSheet.create({
    buttonsContainer: {
        bottom: height < 970 ? 100 : height * 0.15,
        width: '100%',
        alignItems: 'center',
    },
    buttonWrapper: {
        height: height < 900 ? 40 : height * 0.06,
        width: '60%',
    },
});

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#ffffff',
    },
    backgroundContainer: {
        position: 'absolute',
        top: 0,
    },
    buttonsContainer: {
        position: 'absolute',
        alignItems: 'center',
        justifyContent: 'center',
    },
    buttonWrapper: {
        marginVertical: 15,
    },
});
