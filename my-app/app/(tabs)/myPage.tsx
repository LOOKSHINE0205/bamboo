import React, { useState, useEffect, useRef } from 'react'; // React 모듈과 훅 불러오기
import { View, Text, StyleSheet, ImageBackground, Image, Dimensions, Animated, Easing, Alert } from 'react-native'; // React Native 컴포넌트 불러오기

// 배경, 대나무, 팬더, 구름 이미지 불러오기
import BackgroundImage from "../../assets/images/bamboobg2.png";
import BambooBody from "../../assets/images/bamboo_body.png";
import BambooHead from "../../assets/images/bamboo_head.png";
import BambooPanda from "../../assets/images/bamboo_panda.png";
import CloudImage from "../../assets/images/cloud.png";

// 감정을 나타내는 이모티콘 이미지들 불러오기
import em_happy from "../../assets/images/기쁨2.png";
import em_angry from "../../assets/images/화남2.png";
import em_surprise from "../../assets/images/놀람2.png";
import em_fear from "../../assets/images/두려움2.png";
import em_sad from "../../assets/images/슬픔2.png";
import em_dislike from "../../assets/images/싫음2.png";
import em_soso from "../../assets/images/쏘쏘2.png";

// 일기 감정을 나타내는 이모티콘 이미지들 불러오기
import diary_angry from "../../assets/images/diary_angry.png";
import diary_dislike from "../../assets/images/diary_dislike.png";
import diary_fear from "../../assets/images/diary_fear.png";
import diary_happy from "../../assets/images/diary_happy.png";
import diary_neutral from "../../assets/images/diary_neutral.png";
import diary_sad from "../../assets/images/diary_sad.png";
import diary_surprise from "../../assets/images/diary_surprise.png";

// 사용자 정보 가져오는 함수 불러오기
import { getUserInfo } from '../../storage/storageHelper';

// 메인 컴포넌트 함수 정의
export default function MyPage() {
    // === 상태 관리 ===
    const [level, setLevel] = useState(null); // 대나무 성장 레벨 상태 (초기값 1)
    const [nickname, setNickname] = useState(''); // 사용자 닉네임 상태
    const [screenDimensions, setScreenDimensions] = useState(Dimensions.get("window")); // 현재 화면 크기 정보 상태

    // === 상수 설정 ===
    const bambooBodyWidth = 60;             // 대나무 몸체의 너비
    const bambooBodyHeight = 40;            // 대나무 몸체의 높이
    const gapBetweenBodies = -13;           // 대나무 마디 사이의 간격 (음수값으로 겹치도록 설정)
    const gapBetweenHeadAndBody = 0.8;      // 대나무 머리와 몸체 사이의 간격

    // === 레벨 관련 계산 ===
    const displayLevel = level !== null ? (level - 1) % 30 + 1 : 1; // 레벨을 1-30 사이로 순환하도록 계산 (31 -> 1, 32 -> 2, ...)
    const treeLevel = `Lv ${displayLevel}`;    // 화면에 표시할 레벨 텍스트 (Lv 1, Lv 2, ...)
    const effectiveLevel = displayLevel;       // 현재 레벨 값으로 실제 렌더링에 사용할 값

    // 대나무 전체 높이 계산 함수
    const getBambooHeight = () => effectiveLevel * (bambooBodyHeight + gapBetweenBodies);

    // === 화면 크기 변경 감지 ===
    useEffect(() => {
        const handleResize = () => setScreenDimensions(Dimensions.get("window"));
        const subscription = Dimensions.addEventListener("change", handleResize);
        return () => subscription.remove();
    }, []);

    // === 사용자 정보 불러오기 ===
    useEffect(() => {
        const loadUserInfo = async () => {
            try {
                const userInfo = await getUserInfo();
                console.log('Fetched user info:', userInfo); // 디버깅 로그
                if (userInfo) {
                    setNickname(userInfo.userNick);  // 닉네임 설정
                    setLevel(userInfo.chatbotLevel || 1);  // 레벨 설정, 기본값 1
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

    // === 팬더 크기 상태 및 조정 ===
    const [pandaScale, setPandaScale] = useState(0.7); // pandaScale: 팬더 크기 비율 상태 (초기값 0.7)

    useEffect(() => {
        // 특정 레벨에 도달할 때마다 팬더 크기 증가
        if (level >= 151) setPandaScale(2.5);  // 151 이상일 때 2.5배 크기
        else if (level >= 121) setPandaScale(2);     // 121 이상일 때 2배 크기
        else if (level >= 91) setPandaScale(1.8);     // 91 이상일 때 1.8배 크기
        else if (level >= 61) setPandaScale(1.4);     // 61 이상일 때 1.4배 크기
        else if (level >= 31) setPandaScale(1);       // 31 이상일 때 1배 크기
    }, [level]);

    // 팬더의 오른쪽 위치 조정 함수
    const getPandaPosition = () => {
        // 각 레벨에 따라 팬더의 오른쪽 위치 값을 반환
        if (level >= 151) return bambooBodyWidth * -2.9;
        if (level >= 121) return bambooBodyWidth * -2.6;
        if (level >= 91) return bambooBodyWidth * -2.5;
        if (level >= 61) return bambooBodyWidth * -2.3;
        if (level >= 31) return bambooBodyWidth * -2.1;
        return bambooBodyWidth * -2; // 기본 위치
    };

    // 대나무 몸체를 여러 개 렌더링하는 함수
    const renderBambooBodies = () => (
        Array.from({ length: effectiveLevel }).map((_, index) => (
            <Image
                key={index} // 각각의 대나무 몸체에 고유 키 값
                source={BambooBody}
                style={[
                    styles.bambooBody,
                    {
                        // 아래에서부터 순차적으로 쌓이도록 위치 계산
                        bottom: index * (bambooBodyHeight + gapBetweenBodies),
                        width: bambooBodyWidth,
                        height: bambooBodyHeight,
                    }
                ]}
            />
        ))
    );

    // 구름 애니메이션에서 화면 너비 참조 변경
    const cloudAnimation1 = useRef(new Animated.Value(-screenDimensions.width)).current;
    const cloudAnimation2 = useRef(new Animated.Value(-screenDimensions.width * 1.5)).current;

    // 애니메이션 함수에서 screenWidth 대신 screenDimensions.width 사용
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

    // 컴포넌트가 처음 렌더링될 때 구름 애니메이션 시작
    useEffect(() => {
        animateCloud(cloudAnimation1, 0);      // 첫 번째 구름 지연 없이 시작
        animateCloud(cloudAnimation2, 2000);   // 두 번째 구름 2초 지연 후 시작
    }, []);

    // === 감정을 나타내는 이모티콘 이미지들 ===
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

    // === 랜덤 이모티콘 위치와 투명도 애니메이션 ===
    const renderEmojis = () => emojiImages.map((emoji, index) => {
        const opacity = useRef(new Animated.Value(0)).current;  // 초기 투명도 상태
        const translateY = useRef(new Animated.Value(0)).current;
        const translateX = useRef(new Animated.Value(0)).current;

        const animateEmoji = () => {
            const randomX = Math.random() * screenDimensions.width - (screenDimensions.width / 2);
            const randomY = Math.random() * screenDimensions.height - (screenDimensions.height / 2);

            Animated.sequence([
                Animated.timing(opacity, {
                    toValue: 1,                               // 이모티콘 나타나기
                    duration: Math.random() * 2000 + 1000,     // 랜덤 시간으로 나타남
                    useNativeDriver: true,
                }),
                Animated.timing(opacity, {
                    toValue: 0,                               // 이모티콘 사라짐
                    duration: Math.random() * 2000 + 1000,     // 랜덤 시간으로 사라짐
                    useNativeDriver: true,
                }),
            ]).start(() => {
                translateY.setValue(randomY);
                translateX.setValue(randomX);
                animateEmoji();  // 애니메이션 반복 호출
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
                source={emoji.image} // `emoji.image`로 변경
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

    // === 팬더 추가 애니메이션 설정 ===
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
                <Text style={styles.treeNameText}>{nickname}</Text>
                <Text style={styles.levelText}>{treeLevel}</Text>

                <Animated.Image source={CloudImage} style={[styles.cloudImage, { transform: [{ translateX: cloudAnimation1 }] }]} />
                <Animated.Image source={CloudImage} style={[styles.cloudImageLower, { transform: [{ translateX: cloudAnimation2 }] }]} />

                <View style={[styles.imageContainer, { height: getBambooHeight() + bambooBodyHeight * 1.5 }]}>
                    {renderBambooBodies()}
                    <Animated.Image source={BambooPanda} style={[styles.pandaImage, { width: bambooBodyWidth * pandaScale, height: bambooBodyHeight * pandaScale, bottom: 40, right: getPandaPosition(), transform: [{ rotate: pandaTwistAnimation.interpolate({ inputRange: [-1, 1], outputRange: ['310deg', '330deg'] }) }] }]} />
                    <Image source={BambooPanda} style={[styles.pandaImage, { width: bambooBodyWidth * 0.7, height: bambooBodyHeight * 0.7, bottom: effectiveLevel * (bambooBodyHeight + gapBetweenBodies) + gapBetweenHeadAndBody, transform: [{ translateX: 16 }, { translateY: -3 }] }]} />
                    <Image source={BambooHead} style={[styles.bambooHead, { width: bambooBodyWidth, height: bambooBodyHeight, bottom: effectiveLevel * (bambooBodyHeight + gapBetweenBodies) + gapBetweenHeadAndBody }]} />
                </View>

                {renderEmojis()}
            </View>
        </ImageBackground>
    );
}

// === 스타일 정의 ===
const styles = StyleSheet.create({
    background: {
        flex: 1,                      // 전체 화면을 덮도록 설정
        resizeMode: 'cover',          // 배경 이미지가 화면을 가득 채우도록 설정
    },
    container: {
        flex: 1,                      // 전체 화면을 차지하도록 설정
        justifyContent: 'center',     // 컨텐츠를 수직 가운데 정렬
        alignItems: 'center',         // 컨텐츠를 수평 가운데 정렬
    },
    treeNameText: {
        position: 'absolute',
        top: 30,                      // 화면 위쪽에서 30px 아래에 배치
        right: 20,                    // 화면 오른쪽에서 20px 떨어진 위치에 배치
        fontSize: 20,                 // 폰트 크기 설정
        fontWeight: 'bold',           // 글씨 굵기 설정
        textAlign: 'right',           // 오른쪽 정렬
        color: '#333333',             // 텍스트 색상 설정 (진한 회색)
        zIndex: 10,                   // 화면 내 우선순위 설정 (앞에 위치하도록)
    },
    levelText: {
        position: 'absolute',
        top: 10,                      // 화면 위쪽에서 10px 아래에 배치 (나무 이름 아래)
        right: 20,                    // 화면 오른쪽에서 20px 떨어진 위치에 배치
        fontSize: 18,                 // 폰트 크기 설정
        color: '#333333',             // 텍스트 색상 설정 (진한 회색)
        fontWeight: 'bold',           // 글씨 굵기 설정
        textAlign: 'right',           // 오른쪽 정렬
        zIndex: 10,                   // 화면 내 우선순위 설정
    },
    cloudImage: {
        position: 'absolute',
        top: 60,                      // '밤뷰' 이름 텍스트 아래에 위치하도록 설정
        width: 100,                   // 구름 이미지 너비
        height: 100,                  // 구름 이미지 높이
        resizeMode: 'contain',        // 이미지 크기 조절 방식
        zIndex: 5,                    // 다른 요소보다 뒤에 위치
    },
    cloudImageLower: {
        position: 'absolute',
        top: 130,                     // 첫 번째 구름 아래에 위치
        width: 80,                    // 두 번째 구름 이미지 너비
        height: 80,                   // 두 번째 구름 이미지 높이
        resizeMode: 'contain',        // 이미지 크기 조절 방식
        zIndex: 5,
    },
    imageContainer: {
        alignItems: 'center',         // 이미지들을 수평 가운데 정렬
        position: 'absolute',
        bottom: 0,                    // 화면의 맨 아래에 고정
    },
    bambooBody: {
        position: 'absolute',         // 절대 위치 설정
        resizeMode: 'contain',        // 이미지 크기 조절 방식
        zIndex: 2,
    },
    bambooHead: {
        position: 'absolute',
        resizeMode: 'contain',
        zIndex: 3,
    },
    pandaImage: {
        position: 'absolute',
        resizeMode: 'contain',
        zIndex: 1,
    },
    emoji: {
        position: 'absolute',
        width: 25,                    // 이모티콘 너비
        height: 25,                   // 이모티콘 높이
        resizeMode: 'contain',
        zIndex: 6,                    // 이모티콘이 가장 앞에 위치하도록 설정
    },
    diaryEmoji: {
        width: 20,       // 일기 이모티콘의 너비
        height: 20,      // 일기 이모티콘의 높이
    },

});
