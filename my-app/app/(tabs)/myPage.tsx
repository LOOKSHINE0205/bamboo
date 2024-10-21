import React, { useRef, useEffect } from 'react';
import { Animated, StyleSheet, ImageBackground, TouchableOpacity, Image, Dimensions } from 'react-native';
import { useRouter } from 'expo-router';
import BackGround from "../../assets/images/bamboobg.png";
import BambooHead from "../../assets/images/bamboo_head.png";
import BambooBody from "../../assets/images/bamboo_body.png";
import BambooPanda from "../../assets/images/bamboo_panda.png";
import em_happy from "../../assets/images/기쁨2.png";
import em_angly from "../../assets/images/화남2.png";
import em_surprise from "../../assets/images/놀람2.png";
import em_fear from "../../assets/images/두려움2.png";
import em_sad from "../../assets/images/슬픔2.png";
import em_dislike from "../../assets/images/싫음2.png";
import em_soso from "../../assets/images/쏘쏘2.png";
import { Ionicons } from '@expo/vector-icons';
import { NativeBaseProvider } from 'native-base';


// 애니메이션 컴포넌트 불러오기
import CloudAnimation from '../../components/animation/CloudAnimation';
import BambooAnimation from '../../components/animation/BambooAnimation';
import ButterflyAnimation from '../../components/animation/ButterflyAnimation';
import GrassAnimation from '../../components/animation/GrassAnimation';

const { width, height } = Dimensions.get('window');

export default function HomeScreen() {
    const router = useRouter();
    const level = 4;
    const imageHeight = 150 * 0.4;
    const gapBetweenImages = -8;

    // 각 감정 이미지에 애니메이션을 적용하기 위한 Animated.Value 선언
    const jumpAnimationHappy = useRef(new Animated.Value(0)).current;
    const jumpAnimationAngly = useRef(new Animated.Value(0)).current;
    const jumpAnimationSurprise = useRef(new Animated.Value(0)).current;
    const jumpAnimationFear = useRef(new Animated.Value(0)).current;
    const jumpAnimationSad = useRef(new Animated.Value(0)).current;
    const jumpAnimationDislike = useRef(new Animated.Value(0)).current;
    const jumpAnimationSoso = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        // 애니메이션 설정
        const createJumpAnimation = (animation, delay, duration) => {
            Animated.loop(
                Animated.sequence([
                    Animated.timing(animation, {
                        toValue: -30, // 위로 30px 이동
                        duration: duration, // 각 이미지마다 다른 속도로 애니메이션 설정
                        useNativeDriver: true,
                    }),
                    Animated.timing(animation, {
                        toValue: 0, // 원래 위치로 돌아옴
                        duration: duration, // 동일한 속도로 원위치로 돌아옴
                        useNativeDriver: true,
                    }),
                ]),
                { iterations: -1, delay } // 무한 반복, 각 애니메이션에 다른 딜레이를 적용
            ).start();
        };

        // 각각의 애니메이션 실행 (각 감정 이미지에 다른 속도 적용)
        createJumpAnimation(jumpAnimationHappy, 0, 500);    // 0.5초
        createJumpAnimation(jumpAnimationAngly, 100, 600);  // 0.6초
        createJumpAnimation(jumpAnimationSurprise, 200, 700); // 0.7초
        createJumpAnimation(jumpAnimationFear, 300, 800);   // 0.8초
        createJumpAnimation(jumpAnimationSad, 400, 900);    // 0.9초
        createJumpAnimation(jumpAnimationDislike, 500, 1000); // 1초
        createJumpAnimation(jumpAnimationSoso, 600, 1100);  // 1.1초
    }, [jumpAnimationHappy, jumpAnimationAngly, jumpAnimationSurprise, jumpAnimationFear, jumpAnimationSad, jumpAnimationDislike, jumpAnimationSoso]);

    const renderBambooBodies = () => {
        return Array.from({ length: level - 1 }).map((_, i) => (
            <Image
                key={i}
                source={BambooBody}
                style={[styles.bambooBody, { bottom: i * (imageHeight + gapBetweenImages) }]}
            />
        ));
    };

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

                {/* 나무 몸체 생성 */}
                {renderBambooBodies()}

                {/* 판다 이미지 */}
                <Image
                    source={BambooPanda}
                    style={[styles.bambooPanda, { bottom: (level - 1) * (imageHeight + gapBetweenImages) }]}
                />

                {/* 나무 머리 */}
                <Image
                    source={BambooHead}
                    style={[styles.bambooHead, { bottom: (level - 1) * (imageHeight + gapBetweenImages) }]}
                />

                {/* 감정 이미지 - 애니메이션 적용 */}
                <Animated.Image
                    source={em_happy}
                    style={[styles.emotionStyle, styles.em_happy, { transform: [{ translateY: jumpAnimationHappy }] }]}
                />
                <Animated.Image
                    source={em_angly}
                    style={[styles.emotionStyle, styles.em_angly, { transform: [{ translateY: jumpAnimationAngly }] }]}
                />
                <Animated.Image
                    source={em_surprise}
                    style={[styles.emotionStyle, styles.em_surprise, { transform: [{ translateY: jumpAnimationSurprise }] }]}
                />
                <Animated.Image
                    source={em_fear}
                    style={[styles.emotionStyle, styles.em_fear, { transform: [{ translateY: jumpAnimationFear }] }]}
                />
                <Animated.Image
                    source={em_sad}
                    style={[styles.emotionStyle, styles.em_sad, { transform: [{ translateY: jumpAnimationSad }] }]}
                />
                <Animated.Image
                    source={em_dislike}
                    style={[styles.emotionStyle, styles.em_dislike, { transform: [{ translateY: jumpAnimationDislike }] }]}
                />
                <Animated.Image
                    source={em_soso}
                    style={[styles.emotionStyle, styles.em_soso, { transform: [{ translateY: jumpAnimationSoso }] }]}
                />
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
    bambooBody: {
        position: 'absolute',
        zIndex: 2,
        left: (width - (200 * 0.4)) / 2,
        width: 200 * 0.4,
        height: 150 * 0.4,
        resizeMode: 'contain',
    },
    bambooPanda: {
        position: 'absolute',
        zIndex: 1,
        left: (width - (200 * 0.5) + 85) / 2,
        width: 200 * 0.4,
        height: 200 * 0.4,
        resizeMode: 'contain',
    },
    bambooHead: {
        position: 'absolute',
        zIndex: 2,
        left: (width - (200 * 0.5)) / 2,
        width: 200 * 0.5,
        height: 150 * 0.5,
        resizeMode: 'contain',
    },
    emotionStyle: {
        position: 'absolute',
        zIndex: 3,
        width: 50,
        height: 50,
        resizeMode: 'contain',
    },
    em_happy: {
        left: (width - (200 * 0.6)) / 2,
        top: (height - (150 * -1.7)) / 2,
        bottom: 20,
    },
    em_angly: {
        left: (width - (200 * 1.3)) / 2,
        top: (height - (150 * -2.7)) / 2,
    },
    em_surprise: {
        left: (width - (200 * -1.6)) / 2,
        top: (height - (150 * -2)) / 2,
    },
    em_fear: {
        left: (width - (200 * -0.7)) / 2,
        top: (height - (150 * -2.5)) / 2,
    },
    em_sad: {
        left: (width - (200 * 0.95)) / 2,
        top: (height - (150 * -2.3)) / 2,
    },
    em_dislike: {
        left: (width - (200 * -1.2)) / 2,
        top: (height - (150 * -2.8)) / 2,
    },
    em_soso: {
        left: (width - (200 * 2)) / 2,
        top: (height - (150 * -2.8)) / 2,
    },
});
