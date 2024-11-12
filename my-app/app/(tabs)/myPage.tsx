import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Alert, ImageBackground, Image, ScrollView, useWindowDimensions } from 'react-native';

// 사용자 정보 가져오는 헬퍼 함수 불러오기
import { getUserInfo } from '../../storage/storageHelper';

// 이미지 경로
const backgroundImage = require('../../assets/images/긴배경.png');
const pandaImage = require('../../assets/images/판다.png');
const bambooBody = require('../../assets/images/bamboo_body.png');
const bambooHead = require('../../assets/images/bamboo_head.png');

export default function MyPage() {
    const { width, height } = useWindowDimensions();
    const scrollViewRef = useRef(null);
    const [chatbotLevel, setChatbotLevel] = useState(null);
    const [chatbotName, setChatbotName] = useState('');
    const gapBetweenBodies = -7; // 밤부 바디 간격을 조절하는 변수

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

        // 페이지 로드 시 자동으로 하단으로 스크롤
        setTimeout(() => {
            scrollViewRef.current?.scrollToEnd({ animated: false });
        }, 0);
    }, []);

    const displayLevel = chatbotLevel !== null ? (chatbotLevel - 1) % 30 + 1 : 1;
    const treeLevel = `Lv ${displayLevel}`;

    // 밤부 레벨에 맞춰 밤부 바디와 밤부 헤드를 쌓아 올리는 함수
    const renderBambooStack = () => {
        const bambooElements = [];

        // 대나무 몸체 너비와 높이 설정
        const bambooBodyWidth = width * 0.5;
        const bambooBodyHeight = height * 0.07;

        // 대나무 머리 추가 (대나무 몸체와 동일한 너비와 비례하는 높이로 설정)
        bambooElements.push(
            <Image
                key="bamboo-head"
                source={bambooHead}
                style={[
                    styles.bambooHead,
                    {
                        width: bambooBodyWidth,
                        height: bambooBodyHeight*1.25,
                        zIndex: displayLevel + 1,
                        marginBottom:-7
                    },
                ]}
                resizeMode="contain"
            />
        );

        // 대나무 바디를 레벨에 맞춰 쌓기
        for (let i = 0; i < displayLevel; i++) {
            bambooElements.push(
                <Image
                    key={`bamboo-body-${i}`}
                    source={bambooBody}
                    style={[
                        styles.bambooBody,
                        {
                            width: bambooBodyWidth,
                            height: bambooBodyHeight,
                            marginBottom: gapBetweenBodies,
                            zIndex: displayLevel - i,
                        },
                    ]}
                    resizeMode="contain"
                />
            );
        }

        return bambooElements;
    };

    return (
        <View style={styles.backgroundContainer}>
            {/* 오른쪽 위에 고정된 이름과 레벨 */}
            <View style={styles.fixedInfoContainer}>
                <Text style={styles.levelText}>{treeLevel}</Text>
                <Text style={styles.treeNameText}>{chatbotName}</Text>
            </View>

            <ScrollView
                ref={scrollViewRef}
                style={styles.scrollContainer}
                contentContainerStyle={styles.scrollContent}
            >
                <ImageBackground source={backgroundImage} style={[styles.background, { height: height * 2.5 }]} resizeMode="cover">
                    {/* 대나무 바디와 헤드를 화면에 표시 */}
                    <View style={styles.bambooContainer}>
                        {renderBambooStack()}
                    </View>
                    {/* 판다 이미지 */}
                    <Image source={pandaImage} style={[styles.pandaImage, { width: width * 0.2, height: height * 0.2 }]} resizeMode="contain" />
                </ImageBackground>
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    backgroundContainer: { flex: 1 },
    scrollContainer: { flex: 1 },
    scrollContent: { flexGrow: 1, justifyContent: 'flex-end' },
    background: { flex: 1, width: '100%' },

    // 고정된 이름과 레벨 컨테이너 스타일
    fixedInfoContainer: {
        position: 'absolute',
        top: 20,
        right: 20,
        alignItems: 'flex-end',
        zIndex: 1,
    },
    levelText: { fontSize: 18, color: '#333', fontWeight: 'bold' },
    treeNameText: { fontSize: 20, fontWeight: 'bold', color: '#333' },

    // 대나무 바디와 헤드를 쌓는 컨테이너 스타일
    bambooContainer: {
        alignItems: 'center',
        justifyContent: 'flex-end',
        position: 'absolute',
        bottom: '3%',
        left: '25%',
    },

    // 판다 이미지 스타일
    pandaImage: {
        position: 'absolute',
        bottom: '6%',
        left: '20%',
    },

    // 대나무 바디 이미지 스타일
    bambooBody: {
        alignSelf: 'center',
    },

    // 대나무 헤드 이미지 스타일
    bambooHead: {
        alignSelf: 'center',
    },
});
