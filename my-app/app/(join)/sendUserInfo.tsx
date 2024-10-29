import React, { useEffect, useRef } from 'react';
import { View, Text, Alert, StyleSheet, Image, Animated } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import JoinBG from '../../components/JoinBG';
import BambooHead from "../../assets/images/bamboo_head.png";
import em_happy from "../../assets/images/기쁨2.png";
import em_angry from "../../assets/images/화남2.png";
import em_surprise from "../../assets/images/놀람2.png";
import em_fear from "../../assets/images/두려움2.png";
import em_sad from "../../assets/images/슬픔2.png";
import em_dislike from "../../assets/images/싫음2.png";
import em_soso from "../../assets/images/쏘쏘2.png";

const SendUserInfo = () => {
    const { userData, testResults, chatbotName } = useLocalSearchParams();
    const router = useRouter();
    const fadeAnim = useRef(
        [new Animated.Value(0), new Animated.Value(0), new Animated.Value(0),
        new Animated.Value(0), new Animated.Value(0), new Animated.Value(0),
        new Animated.Value(0)]
    ).current;

    useEffect(() => {
        const sendDataToServer = async () => {
            try {
                let parsedUserData = {};

                if (typeof userData === 'string') {
                    parsedUserData = JSON.parse(userData);
                }

                const data = {
                    ...parsedUserData,
                    chatbotType: testResults,
                    chatbotName,
                    chatbotLevel: 1,
                };

                const response = await fetch('http://10.0.2.2:8082/api/users/join', {
//                 const response = await fetch('http://192.168.0.15:8082/api/users/join', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(data),
                });

                if (!response.ok) {
                    throw new Error(`HTTP 에러: ${response.status}`);
                }

                // 애니메이션 시퀀스 시작
                Animated.stagger(700, fadeAnim.map(anim =>
                    Animated.timing(anim, {
                        toValue: 1,
                        duration: 700,
                        useNativeDriver: true,
                    })
                )).start(() => {
                    // 애니메이션이 모두 끝난 후 Alert를 표시
                    Alert.alert('성공', '회원 정보가 성공적으로 전송되었습니다.', [
                        {
                            text: 'OK',
                            onPress: () => router.push('index3'),
                        },
                    ]);
                });

            } catch (error) {
                console.error('Error:', error);
                Alert.alert('오류', `서버로 데이터를 전송하는 중 문제가 발생했습니다: ${error.message}`);
            }
        };

        sendDataToServer();
    }, []);

    return (
        <JoinBG>
            <View style={styles.container}>
                <View style={styles.circle}>
                    <Image source={BambooHead} style={styles.bambooImage} />
                    <Animated.Image source={em_happy} style={[styles.emotionImage, styles.position1, { opacity: fadeAnim[0] }]} />
                    <Animated.Image source={em_angry} style={[styles.emotionImage, styles.position2, { opacity: fadeAnim[1] }]} />
                    <Animated.Image source={em_surprise} style={[styles.emotionImage, styles.position3, { opacity: fadeAnim[2] }]} />
                    <Animated.Image source={em_fear} style={[styles.emotionImage, styles.position4, { opacity: fadeAnim[3] }]} />
                    <Animated.Image source={em_sad} style={[styles.emotionImage, styles.position5, { opacity: fadeAnim[4] }]} />
                    <Animated.Image source={em_dislike} style={[styles.emotionImage, styles.position6, { opacity: fadeAnim[5] }]} />
                    <Animated.Image source={em_soso} style={[styles.emotionImage, styles.position7, { opacity: fadeAnim[6] }]} />
                </View>
                <Text style={styles.text}>정보를 서버로 전송 중입니다...</Text>
            </View>
        </JoinBG>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    circle: {
        position: 'relative',
        width: 300,
        height: 300,
        justifyContent: 'center',
        alignItems: 'center',
    },
    bambooImage: {
        width: 100,
        height: 100,
        resizeMode: 'contain',
    },
    emotionImage: {
        position: 'absolute',
        width: 50,
        height: 50,
        borderRadius: 25,
        resizeMode: 'cover',
    },
    position1: {
        top: 20,
        left: '50%',
        marginLeft: -25,
    },
    position2: {
        top: '20%',
        right: '20%',
    },
    position3: {
        top: '45%',
        right: 30,
    },
    position4: {
        bottom: '15%',
        right: '25%',
    },
    position5: {
        bottom: 45,
        left: '35%',
        marginLeft: -25,
    },
    position6: {
        bottom: '38.5%',
        left: '10%',
    },
    position7: {
        top: '20%',
        left: '20%',
    },
    text: {
        fontSize: 16,
        textAlign: 'center',
        marginTop: 20,
    },
});

export default SendUserInfo;
