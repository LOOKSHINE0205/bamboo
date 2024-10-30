import React, { useState, useEffect  } from 'react';
import { View, Text, StyleSheet, ImageBackground, Image, Dimensions, } from 'react-native';
import { useFocusEffect } from '@react-navigation/native'; // 화면 포커스 감지를 위한 훅
import BackgroundImage from "../../assets/images/bamboobg2.png"; // 배경 이미지
import BambooBody from "../../assets/images/bamboo_body.png";    // 대나무 몸체 이미지
import BambooHead from "../../assets/images/bamboo_head.png";    // 대나무 머리 이미지
import BambooPanda from "../../assets/images/bamboo_panda.png";  // 팬더 이미지

// 화면의 크기 정보를 가져옴
const { height: screenHeight } = Dimensions.get('window');
const { width: screenWidth } = Dimensions.get('window');

export default function MyPage() {
    // === 상태 관리 ===
    const [level, setLevel] = useState(32);                                    // 대나무 성장 레벨
    const [screenDimensions, setScreenDimensions] = useState(Dimensions.get("window")); // 화면 크기 정보

    // === 상수 설정 ===
    const bambooBodyWidth = 60;             // 대나무 몸체의 너비
    const bambooBodyHeight = 40;            // 대나무 몸체의 높이
    const gapBetweenBodies = -13;          // 대나무 마디 사이의 간격 (음수값으로 겹치게 설정)
    const gapBetweenHeadAndBody = 0.8;     // 대나무 머리와 몸체 사이의 간격
    const treeName = "밤뷰";               // 대나무 이름

    // === 레벨 관련 계산 ===
    // 레벨을 1-30 사이로 순환하도록 계산 (31 -> 1, 32 -> 2, ...)
    const displayLevel = (level - 1) % 30 + 1;
    const treeLevel = `Lv ${displayLevel}`;    // 화면에 표시할 레벨 텍스트
    const maxTreeHeight = screenHeight * 0.8;   // 최대 트리 높이 (화면 높이의 80%)
    const effectiveLevel = displayLevel;        // 실제 사용할 레벨 값
    const countPanda = Math.floor(level / 30); // 30레벨마다 추가되는 팬더 수 계산

    // 대나무 전체 높이 계산 함수
    const getBambooHeight = () => effectiveLevel * (bambooBodyHeight + gapBetweenBodies);

    // === 화면 크기 변경 감지 ===
    useEffect(() => {
        // 화면 크기 변경 시 호출될 핸들러
        const handleResize = () => setScreenDimensions(Dimensions.get("window"));

        // 화면 크기 변경 이벤트 리스너 등록
        const subscription = Dimensions.addEventListener("change", handleResize);

        // 컴포넌트 언마운트 시 이벤트 리스너 제거
        return () => subscription?.remove();
    }, []);

    // === 팬더 렌더링 함수 ===
    const renderPandas = () => (
        Array.from({ length: countPanda }).map((_, index) => {
            // 랜덤한 X 위치 범위 설정 (좌우로 이동할 범위)
            const randomX = (Math.random() * bambooBodyWidth * 2) * (index % 2 === 0 ? -1 : 1);

            // 랜덤한 Y 위치 범위 설정 (수직 이동할 범위)
            const randomY = Math.random() * -5; // 0부터 50 사이의 값으로 랜덤 생성

            return (
                <Image
                    key={index}
                    source={BambooPanda}
                    style={[
                        styles.pandaImage,
                        {
                            width: bambooBodyWidth * 0.7,
                            height: bambooBodyHeight * 0.7,
                            bottom: effectiveLevel * (bambooBodyHeight + gapBetweenBodies) - index * (bambooBodyHeight * -1) + randomY,
                            // 나무 옆의 랜덤한 위치에 팬더 배치
                            transform: [{ translateX: randomX }],
                        }
                    ]}
                />
            );
        })
    );


    // === 대나무 몸체 렌더링 함수 ===
    const renderBambooBodies = () => (
        Array.from({ length: effectiveLevel }).map((_, index) => (
            <Image
                key={index}
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

    // === 메인 렌더링 ===
    return (
        <ImageBackground source={BackgroundImage} style={styles.background}>
            <View style={styles.container}>

                {/* 대나무 이름과 레벨 표시 */}
                <Text style={styles.treeNameText}>{treeName}</Text>
                <Text style={styles.levelText}>{treeLevel}</Text>

                {/* 대나무와 팬더들을 포함하는 컨테이너 */}
                <View style={[styles.imageContainer, { height: getBambooHeight() + bambooBodyHeight * 1.5 }]}>
                    {/* 대나무 몸체들 렌더링 */}
                    {renderBambooBodies()}

                    {/* 대나무 옆에 팬더 렌더링 */}
                    {renderPandas()}

                    {/* 메인 팬더 (대나무 머리 뒤에 위치) */}
                    <Image
                        source={BambooPanda}
                        style={[
                            styles.pandaImage,
                            {
                                width: bambooBodyWidth * 0.7,
                                height: bambooBodyHeight * 0.7,
                                bottom: effectiveLevel * (bambooBodyHeight + gapBetweenBodies) + gapBetweenHeadAndBody,
                                transform: [{ translateX: 16 }, { translateY: -3 }]
                            }
                        ]}
                    />

                    {/* 대나무 머리 */}
                    <Image
                        source={BambooHead}
                        style={[
                            styles.bambooHead,
                            {
                                width: bambooBodyWidth,
                                height: bambooBodyHeight,
                                bottom: effectiveLevel * (bambooBodyHeight + gapBetweenBodies) + gapBetweenHeadAndBody,
                            }
                        ]}
                    />
                </View>
            </View>
        </ImageBackground>
    );
}
// 스타일 정의
const styles = StyleSheet.create({
    background: {
        flex: 1,                      // 화면 전체를 덮도록 설정
        resizeMode: 'cover',          // 이미지가 화면을 가득 채우도록 설정
    },
    container: {
        flex: 1,                      // 화면 전체를 차지하도록 설정
        justifyContent: 'center',     // 컨텐츠를 수직 가운데 정렬
        alignItems: 'center',         // 컨텐츠를 수평 가운데 정렬
    },
    treeNameText: {
        position: 'absolute',         // 절대 위치 설정
        top: 30,                      // 화면 위쪽에서 10px 아래에 배치
        right: 20,                    // 화면 오른쪽에서 20px 떨어진 위치에 배치
        fontSize: 20,                 // 폰트 크기 설정
        fontWeight: 'bold',           // 글씨 굵기 설정
        textAlign: 'right',           // 오른쪽 정렬
        color: '#333333',             // 텍스트 색상 설정 (진한 회색)
        zIndex: 10,                   // 화면 내 우선순위 설정
    },
    levelText: {
        position: 'absolute',         // 절대 위치 설정
        top: 10,                      // 화면 위쪽에서 40px 아래에 배치 (나무 이름 아래)
        right: 20,                    // 화면 오른쪽에서 20px 떨어진 위치에 배치
        fontSize: 18,                 // 폰트 크기 설정
        color: '#333333',             // 텍스트 색상 설정 (진한 회색)
        fontWeight: 'bold',           // 글씨 굵기 설정
        textAlign: 'right',           // 오른쪽 정렬
        zIndex: 10,                   // 화면 내 우선순위 설정
    },
    imageContainer: {
        alignItems: 'center',         // 이미지들을 수평 가운데 정렬
        position: 'absolute',         // 절대 위치 설정
        bottom: 0,                    // 화면의 맨 아래에 고정
    },
    bambooBody: {
        position: 'absolute',         // 절대 위치 설정
        resizeMode: 'contain',        // 이미지 크기 조절 방식
        zIndex: 2,                    // 가장 아래에 위치
    },
    bambooHead: {
        position: 'absolute',         // 절대 위치 설정
        resizeMode: 'contain',        // 이미지 크기 조절 방식
        zIndex: 3,                    // 팬더보다 앞에 위치
    },
    pandaImage: {
        position: 'absolute',         // 절대 위치 설정
        resizeMode: 'contain',        // 이미지 크기 조절 방식
        zIndex: 1,                    // 대나무 머리 뒤에 위치
    },

});
