import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { saveUserInfo } from '../../storage/storageHelper';  // storageHelper 함수 호출
import axios from "axios"
import { useNavigation } from '@react-navigation/native';


// @ts-ignore
export default function LoginScreen() {
    const router = useRouter();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const navigation = useNavigation();

    const handleLogin = async () => {
        if (!email || !password) {
            Alert.alert('경고', '이메일과 비밀번호를 모두 입력하세요.');
            return;
        }

        setIsLoading(true);

        try {
            const response = await axios.post('http://10.0.2.2:8082/api/users/login', {
                userEmail: email,
                userPw: password,
            })

            // 서버에서 받은 응답 데이터를 `AsyncStorage`에 저장
            const { message, user } = response.data;
            if (message === '로그인 성공' && user) {
                await saveUserInfo(user); // 응답에 포함된 사용자 정보 저장
                navigation.navigate('(tabs)'); // 메인 화면으로 이동
            } else {
                setError('로그인 실패: 서버 응답 확인 필요');
            }
        } catch (error) {
            console.error('Login failed:', error);
            if (error.response) {
                console.error('Server response:', error.response.data); // 서버의 응답 데이터 확인
                setError(`로그인 실패: ${error.response.data.message || '다시 시도해주세요.'}`);
            } else {
                setError('로그인에 실패했습니다. 다시 시도해주세요.');
            }
        }
    };

    return (
        <View style={styles.container}>
            <Text style={styles.label}>이메일</Text>
            <TextInput
                style={styles.input}
                value={email}
                onChangeText={setEmail}
                placeholder="이메일 주소를 입력하세요"
                keyboardType="email-address"
            />
            <Text style={styles.label}>비밀번호</Text>
            <TextInput
                style={styles.input}
                value={password}
                onChangeText={setPassword}
                placeholder="비밀번호를 입력하세요"
                secureTextEntry
            />
            <TouchableOpacity
                style={styles.button}
                onPress={handleLogin}
                disabled={isLoading}
            >
                <Text style={styles.buttonText}>{isLoading ? '로그인 중...' : '로그인'}</Text>
            </TouchableOpacity>

            {/* DEBUG: 패스 버튼 - 개발 완료 후 제거 */}
            <TouchableOpacity
                style={styles.passButton}
                onPress={() => router.push('/(tabs)')} // 로그인 없이 탭으로 이동
            >
                <Text style={styles.passButtonText}>패스</Text>
            </TouchableOpacity>
            {/* 여기까지 패스 버튼 */}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 20,
        backgroundColor: '#ffffff',
    },
    label: {
        fontSize: 16,
        marginBottom: 5,
    },
    input: {
        backgroundColor: '#e8f5e9',
        borderRadius: 8,
        padding: 10,
        marginBottom: 15,
    },
    button: {
        backgroundColor: '#ffffff',
        borderColor: '#000000',
        borderWidth: 1,
        paddingVertical: 12,
        borderRadius: 8,
        alignItems: 'center',
    },
    buttonText: {
        color: '#000000',
        fontSize: 16,
        fontWeight: 'bold',
    },
    // DEBUG: 패스 버튼 스타일 - 개발 완료 후 제거
    passButton: {
        backgroundColor: '#ff9800',
        paddingVertical: 12,
        borderRadius: 8,
        alignItems: 'center',
        marginTop: 10,
    },
    passButtonText: {
        color: '#ffffff',
        fontSize: 16,
        fontWeight: 'bold',
    },
});
