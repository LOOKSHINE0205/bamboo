import React, { useEffect } from 'react';
import { View, Text, Alert } from 'react-native';
import { useLocalSearchParams } from 'expo-router';

const SendUserInfo = () => {
    const { userData, testResults, chatbotName } = useLocalSearchParams();

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
                    chatbotLevel : 1,
                };

                const response = await fetch('http://10.0.2.2:8082/api/users/join', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(data),
                });

                // 응답 상태 확인
                console.log('Response status: ', response.status);
                console.log('Response headers: ', response.headers.get('content-type'));

                // JSON으로 파싱 시도
                if (response.headers.get('content-type')?.includes('application/json')) {
                    const result = await response.json();
                    console.log('JSON Response: ', result);
                } else {
                    const result = await response.text();
                    console.log('Text Response: ', result);
                }

                if (!response.ok) {
                    throw new Error(`HTTP 에러: ${response.status}`);
                }

                Alert.alert('성공', '회원 정보가 성공적으로 전송되었습니다.');
            } catch (error) {
                console.error('Error:', error);
                // @ts-ignore
                Alert.alert('오류', `서버로 데이터를 전송하는 중 문제가 발생했습니다: ${error.message}`);
            }
        };

        sendDataToServer();
    }, []);

    return (
        <View>
            <Text>정보를 서버로 전송 중입니다...</Text>
        </View>
    );
};

export default SendUserInfo;
