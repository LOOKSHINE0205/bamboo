import React, { useState } from 'react';
import { View, StyleSheet, useWindowDimensions } from 'react-native';
import { useRouter } from 'expo-router';
import BackGround from "../../components/FirstBG";
import SmoothCurvedButton from '../../components/SmoothCurvedButton';

export default function InitialScreen() {
    const router = useRouter();
    const { height, width } = useWindowDimensions();
    console.log(height,width)
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
            <View style={[styles.backgroundContainer, { width, height }]}>
                <BackGround width={width} height={height} />
            </View>
            <View style={[styles.buttonsContainer, dynamicStyles(height).buttonsContainer]}>
                <View style={[styles.buttonWrapper, dynamicStyles(height).buttonWrapper]}>
                    <SmoothCurvedButton
                        title="로그인"
                        onPress={() => handlePress('../(join)/login')}
                        disabled={isNavigating}
                    />
                </View>
                <View style={[styles.buttonWrapper, dynamicStyles(height).buttonWrapper]}>
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

// height에 따라 동적 스타일을 반환하는 함수
const dynamicStyles = (height) => StyleSheet.create({
    buttonsContainer: {
        bottom: height < 970 ? 100 : height * 0.19, // 위아래 조절
        width: '100%', // 버튼 컨테이너가 화면 전체 너비를 차지하도록 설정
        alignItems: 'center', // 중앙 정렬
    },
    buttonWrapper: {
        height: height < 900 ? 40 : height * 0.06, // 작은 화면은 고정된 높이, 큰 화면은 동적 조절
        width: '60%', // 버튼 너비는 60%
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
