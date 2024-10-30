import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function LoginScreen() {
    const router = useRouter();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    // DEBUG: 패스 버튼 핸들러
    const handlePass = () => {
        router.push('/(tabs)/myPage');
    };

    // 로그인 요청 함수
    const handleLogin = async () => {
        if (!email || !password) {
            Alert.alert('경고', '이메일과 비밀번호를 모두 입력하세요.');
            return;
        }

        setIsLoading(true);

        try {
            const response = await fetch('http://10.0.2.2:8082/api/users/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ userEmail: email, userPw: password }),
            });

            const result = await response.json();

            if (response.ok) {
                if (result.message === "로그인 성공") {
                    await AsyncStorage.setItem('userEmail', email);
                    Alert.alert('성공', '로그인에 성공했습니다!');
                    router.push('/(tabs)');
                } else {
                    Alert.alert('실패', '이메일 또는 비밀번호가 잘못되었습니다.');
                }
            } else {
                Alert.alert('오류', '서버에 문제가 발생했습니다. 다시 시도해주세요.');
            }
        } catch (error) {
            console.error('Error:', error);
            Alert.alert('오류', '네트워크 오류가 발생했습니다. 인터넷 연결을 확인하세요.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <View style={styles.container}>
            <View style={styles.inputContainer}>
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
            </View>
            <TouchableOpacity
                style={[styles.button, isLoading && styles.buttonDisabled]}
                onPress={handleLogin}
                disabled={isLoading}
            >
                <Text style={styles.buttonText}>{isLoading ? '로그인 중...' : '다음'}</Text>
            </TouchableOpacity>

            {/* DEBUG: 패스 버튼 - 개발 완료 후 제거 */}
            <TouchableOpacity
                style={[styles.passButton]}
                onPress={handlePass}
            >
                <Text style={styles.passButtonText}>패스</Text>
            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 20,
        backgroundColor: '#ffffff',
    },
    backButton: {
        position: 'absolute',
        top: 40,
        left: 20,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        marginTop: 60,
        marginBottom: 30,
    },
    inputContainer: {
        marginBottom: 20,
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
    buttonDisabled: {
        backgroundColor: '#e0e0e0',
        borderColor: '#999',
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