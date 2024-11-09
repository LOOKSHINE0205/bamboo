import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, ImageBackground, Image, Dimensions, Animated, Easing, Alert } from 'react-native';

// 이미지 가져오기
import BackgroundImage from "../../assets/images/bamboobg2.png";
import BambooBody from "../../assets/images/bamboo_body.png";
import BambooHead from "../../assets/images/bamboo_head.png";
import BambooPanda from "../../assets/images/bamboo_panda.png";
import CloudImage from "../../assets/images/cloud.png";

// 감정 및 일기 이모티콘 이미지 가져오기
import em_happy from "../../assets/images/기쁨2.png";
import em_angry from "../../assets/images/화남2.png";
import em_surprise from "../../assets/images/놀람2.png";
import em_fear from "../../assets/images/두려움2.png";
import em_sad from "../../assets/images/슬픔2.png";
import em_dislike from "../../assets/images/싫음2.png";
import em_soso from "../../assets/images/쏘쏘2.png";
import diary_angry from "../../assets/images/diary_angry.png";
import diary_dislike from "../../assets/images/diary_dislike.png";
import diary_fear from "../../assets/images/diary_fear.png";
import diary_happy from "../../assets/images/diary_happy.png";
import diary_neutral from "../../assets/images/diary_neutral.png";
import diary_sad from "../../assets/images/diary_sad.png";
import diary_surprise from "../../assets/images/diary_surprise.png";

// 사용자 정보 가져오는 헬퍼 함수 불러오기
import { getUserInfo } from '../../storage/storageHelper';

export default function MyPage() {
    // 사용자 정보와 화면 크기 상태 관리
    const [chatbotLevel, setChatbotLevel] = useState(null);
    const [chatbotName, setChatbotName] = useState('');
    const [screenDimensions, setScreenDimensions] = useState(Dimensions.get("window"));
    const screenWidth = screenDimensions.width;
    const screenHeight = screenDimensions.height;

    // 대나무 크기와 간격 설정
    const bambooBodyWidth = screenWidth * 0.6;
    const bambooBodyHeight = screenHeight * 0.027;
    const gapBetweenBodies = -3.1;
    const gapBetweenHeadAndBody = 0.6;

    // 레벨을 통한 대나무의 성장 단계 계산
    const displayLevel = chatbotLevel !== null ? (chatbotLevel - 1) % 30 + 1 : 1;
    const treeLevel = `Lv ${displayLevel}`;
    const effectiveLevel = displayLevel;

    // 대나무 전체 높이 계산
    const getBambooHeight = () => effectiveLevel * (bambooBodyHeight + gapBetweenBodies);

    // 화면 크기 변경 감지
    useEffect(() => {
        const handleResize = () => setScreenDimensions(Dimensions.get("window"));
        const subscription = Dimensions.addEventListener("change", handleResize);
        return () => subscription.remove();
    }, []);

    // 사용자 정보 불러오기
    useEffect(() => {
        const loadUserInfo = async () => {
            try {
                const userInfo = await getUserInfo();
                if (userInfo) {
                    setChatbotName(userInfo.chatbotName);
                    setChatbotLevel(userInfo.chatbotLevel);
                } else {
                    Alert.alert("오류", "사용자 정보를 불러올 수 없습니다.");
                }
            } catch (error) {
                console.error('Error fetching user info:', error);
                Alert.alert("오류", "사용자 정보를 불러오는 중 문제가 발생했습니다.");
            }
        };
        loadUserInfo();
    }, []);

    // 레벨에 따른 팬더 크기 조정
    const [pandaScale, setPandaScale] = useState(0.7);
    useEffect(() => {
        if (chatbotLevel >= 151) setPandaScale(2.5);
        else if (chatbotLevel >= 121) setPandaScale(2);
        else if (chatbotLevel >= 91) setPandaScale(1.8);
        else if (chatbotLevel >= 61) setPandaScale(1.4);
        else if (chatbotLevel >= 31) setPandaScale(1);
    }, [chatbotLevel]);

    // 팬더 위치 계산 함수
    const getPandaPosition = () => {
        if (chatbotLevel >= 151) return bambooBodyWidth * -2.9;
        if (chatbotLevel >= 121) return bambooBodyWidth * -2.6;
        if (chatbotLevel >= 91) return bambooBodyWidth * -2.5;
        if (chatbotLevel >= 61) return bambooBodyWidth * -2.3;
        if (chatbotLevel >= 31) return bambooBodyWidth * -2.1;
        return bambooBodyWidth * -2;
    };

    // 대나무 몸체 여러 개 렌더링 함수
    const renderBambooBodies = () => (
        Array.from({ length: effectiveLevel }).map((_, index) => (
            <Image
                key={index}
                source={BambooBody}
                style={[
                    styles.bambooBody,
                    {
                        bottom: index * (bambooBodyHeight + gapBetweenBodies),
                        width: bambooBodyWidth,
                        height: bambooBodyHeight,
                    }
                ]}
            />
        ))
    );

    // 구름 애니메이션 설정
    const cloudAnimation1 = useRef(new Animated.Value(-screenDimensions.width)).current;
    const cloudAnimation2 = useRef(new Animated.Value(-screenDimensions.width * 1.5)).current;

    const animateCloud = (animation, delay) => {
        Animated.loop(
            Animated.sequence([
                Animated.timing(animation, {
                    toValue: screenDimensions.width,
                    duration: 10000,
                    easing: Easing.linear,
                    useNativeDriver: true,
                    delay,
                }),
                Animated.timing(animation, {
                    toValue: -screenDimensions.width,
                    duration: 0,
                    useNativeDriver: true,
                })
            ])
        ).start();
    };

    useEffect(() => {
        animateCloud(cloudAnimation1, 0);
        animateCloud(cloudAnimation2, 2000);
    }, []);

    // 감정을 나타내는 이모티콘 이미지 배열 정의
    const emojiImages = [
        { image: em_happy, type: 'regular' },
        { image: em_angry, type: 'regular' },
        { image: em_surprise, type: 'regular' },
        { image: em_fear, type: 'regular' },
        { image: em_sad, type: 'regular' },
        { image: em_dislike, type: 'regular' },
        { image: em_soso, type: 'regular' },
        { image: diary_angry, type: 'diary' },
        { image: diary_dislike, type: 'diary' },
        { image: diary_fear, type: 'diary' },
        { image: diary_happy, type: 'diary' },
        { image: diary_neutral, type: 'diary' },
        { image: diary_sad, type: 'diary' },
        { image: diary_surprise, type: 'diary' }
    ];

    // 랜덤 이모티콘 위치와 애니메이션 렌더링
    const renderEmojis = () => emojiImages.map((emoji, index) => {
        const opacity = useRef(new Animated.Value(0)).current;
        const translateY = useRef(new Animated.Value(0)).current;
        const translateX = useRef(new Animated.Value(0)).current;

        const animateEmoji = () => {
            const randomX = Math.random() * screenDimensions.width - (screenDimensions.width / 2);
            const randomY = Math.random() * screenDimensions.height - (screenDimensions.height / 2);

            Animated.sequence([
                Animated.timing(opacity, { toValue: 1, duration: Math.random() * 2000 + 1000, useNativeDriver: true }),
                Animated.timing(opacity, { toValue: 0, duration: Math.random() * 2000 + 1000, useNativeDriver: true }),
            ]).start(() => {
                translateY.setValue(randomY);
                translateX.setValue(randomX);
                animateEmoji();
            });
        };

        useEffect(() => {
            const initialRandomX = Math.random() * screenDimensions.width - (screenDimensions.width / 2);
            const initialRandomY = Math.random() * screenDimensions.height - (screenDimensions.height / 2);

            translateY.setValue(initialRandomY);
            translateX.setValue(initialRandomX);
            animateEmoji();
        }, [screenDimensions]);

        return (
            <Animated.Image
                key={index}
                source={emoji.image}
                style={[
                    styles.emoji,
                    emoji.type === 'diary' ? styles.diaryEmoji : {},
                    {
                        opacity: opacity,
                        transform: [
                            { translateY: translateY },
                            { translateX: translateX },
                        ],
                    }
                ]}
            />
        );
    });

    // 팬더 회전 애니메이션 설정
    const pandaTwistAnimation = useRef(new Animated.Value(0)).current;

    const animatePandaTwist = () => {
        const randomTimingDuration = Math.random() * 1000 + 1000;
        const randomTwistCount = Math.floor(Math.random() * 3) + 2;

        const twistAnimations = [];
        for (let i = 0; i < randomTwistCount; i++) {
            twistAnimations.push(
                Animated.timing(pandaTwistAnimation, {
                    toValue: 1,
                    duration: randomTimingDuration,
                    easing: Easing.inOut(Easing.ease),
                    useNativeDriver: true,
                }),
                Animated.timing(pandaTwistAnimation, {
                    toValue: -1,
                    duration: randomTimingDuration,
                    easing: Easing.inOut(Easing.ease),
                    useNativeDriver: true,
                })
            );
        }

        twistAnimations.push(
            Animated.spring(pandaTwistAnimation, {
                toValue: 0,
                damping: 2,
                stiffness: 200,
                useNativeDriver: true,
            })
        );

        Animated.sequence(twistAnimations).start(() => {
            animatePandaTwist();
        });
    };

    useEffect(() => {
        animatePandaTwist();
    }, []);

    return (
        <ImageBackground source={BackgroundImage} style={styles.background}>
            <View style={styles.container}>
                <Text style={styles.treeNameText}>{chatbotName}</Text>
                <Text style={styles.levelText}>{treeLevel}</Text>

                {/* 구름 애니메이션 */}
                <Animated.Image source={CloudImage} style={[styles.cloudImage, { transform: [{ translateX: cloudAnimation1 }] }]} />
                <Animated.Image source={CloudImage} style={[styles.cloudImageLower, { transform: [{ translateX: cloudAnimation2 }] }]} />

                {/* 대나무, 팬더, 머리 이미지 */}
                <View style={[styles.imageContainer, { height: getBambooHeight() + bambooBodyHeight * 1.5 }]}>
                    {renderBambooBodies()}
                    <Animated.Image source={BambooPanda} style={[styles.pandaImage, { width: bambooBodyWidth * pandaScale, height: bambooBodyHeight * pandaScale, bottom: 40, right: getPandaPosition(), transform: [{ rotate: pandaTwistAnimation.interpolate({ inputRange: [-1, 1], outputRange: ['310deg', '330deg'] }) }] }]} />
                    <Image source={BambooPanda} style={[styles.pandaImage, { width: bambooBodyWidth * 0.7, height: bambooBodyHeight * 0.8, bottom: effectiveLevel * (bambooBodyHeight + gapBetweenBodies) + gapBetweenHeadAndBody, transform: [{ translateX: screenWidth * 0.03 }, { translateY: screenHeight * -0.005 }] }]} />
                    <Image source={BambooHead} style={[styles.bambooHead, { width: bambooBodyWidth, height: bambooBodyHeight * 1.3, bottom: effectiveLevel * (bambooBodyHeight - 0.02 + gapBetweenBodies) + gapBetweenHeadAndBody }]} />
                </View>

                {renderEmojis()}
            </View>
        </ImageBackground>
    );
}

// 스타일 정의
const styles = StyleSheet.create({
    background: { flex: 1, resizeMode: 'cover' },
    container: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    treeNameText: { position: 'absolute', top: 30, right: 20, fontSize: 20, fontWeight: 'bold', textAlign: 'right', color: '#333', zIndex: 10 },
    levelText: { position: 'absolute', top: 10, right: 20, fontSize: 18, color: '#333', fontWeight: 'bold', textAlign: 'right', zIndex: 10 },
    cloudImage: { position: 'absolute', top: 60, width: 100, height: 100, resizeMode: 'contain', zIndex: 5 },
    cloudImageLower: { position: 'absolute', top: 130, width: 80, height: 80, resizeMode: 'contain', zIndex: 5 },
    imageContainer: { alignItems: 'center', position: 'absolute', bottom: 0 },
    bambooBody: { position: 'absolute', resizeMode: 'contain', zIndex: 2 },
    bambooHead: { position: 'absolute', resizeMode: 'contain', zIndex: 3 },
    pandaImage: { position: 'absolute', resizeMode: 'contain', zIndex: 1 },
    emoji: { position: 'absolute', width: 15, height: 15, resizeMode: 'contain', zIndex: 6 },
    diaryEmoji: { width: 20, height: 20 },
});
