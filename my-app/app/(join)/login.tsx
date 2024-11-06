import React, { useState, useRef } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { saveUserInfo } from '../../storage/storageHelper';
import axios from 'axios';
import { useNavigation } from '@react-navigation/native';
import SmoothCurvedButton from '../../components/SmoothCurvedButton';
import {serverAddress} from '../../components/Config';

export default function LoginScreen() {
    const router = useRouter();
    const navigation = useNavigation();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // 이메일과 비밀번호 입력 필드에 대한 참조 생성
    const emailInputRef = useRef<TextInput>(null);
    const passwordInputRef = useRef<TextInput>(null);

    // 로그인 핸들러 함수
    const handleLogin = async () => {
        if (!email) {
            setError('이메일을 입력하세요.');
            emailInputRef.current?.focus();
            return;
        }
        if (!password) {
            setError('비밀번호를 입력하세요.');
            passwordInputRef.current?.focus();
            return;
        }

        setIsLoading(true);
        setError(null);

        try {
            const response = await axios.post(`${serverAddress}/api/users/login`, {
                userEmail: email,
                userPw: password,
            });

            const { message, user } = response.data;
            if (message === '로그인 성공' && user) {
                await saveUserInfo(user);
                navigation.navigate('(tabs)');
            } else {
                setError('로그인 실패: 서버 응답 확인 필요');
            }
        } catch (error) {
            console.error('Login failed:', error);
            setError(error.response?.data.message || '로그인에 실패했습니다. 다시 시도해주세요.');
            setPassword('');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <View style={styles.container}>
            {/* 이메일 입력 필드 */}
            <View style={styles.labelContainer}>
                <Text style={styles.label}>이메일</Text>
                {error === '이메일을 입력하세요.' && <Text style={styles.errorText}>{error}</Text>}
            </View>
            <TextInput
                ref={emailInputRef}
                style={styles.input}
                value={email}
                onChangeText={setEmail}
                placeholder="이메일 주소를 입력하세요"
                keyboardType="email-address"
                autoCapitalize="none"
                placeholderTextColor="#707070"
            />

            {/* 비밀번호 입력 필드 */}
            <View style={styles.labelContainer}>
                <Text style={styles.label}>비밀번호</Text>
                {error === '비밀번호를 입력하세요.' && <Text style={styles.errorText}>{error}</Text>}
            </View>
            <TextInput
                ref={passwordInputRef}
                style={styles.input}
                value={password}
                onChangeText={setPassword}
                placeholder="비밀번호를 입력하세요"
                secureTextEntry
                placeholderTextColor="#707070"
            />

            <View style={styles.buttonWrapper}>
              <SmoothCurvedButton
                title={isLoading ? '로그인 중...' : '로그인'}
                onPress={handleLogin}
                disabled={isLoading}
                style={[
                  isLoading && styles.disabledButton,
                ]}
              />
              <TouchableOpacity
                style={styles.passButton}
                onPress={() => router.push('/index3')}
              >
                <Text style={styles.passButtonText}>패스</Text>
              </TouchableOpacity>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 20,
        backgroundColor: '#ffffff',
    },
    labelContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 5,
    },
    label: {
        fontSize: 16,
    },
    input: {
        backgroundColor: '#e8f5e9',
        borderRadius: 16,
        padding: 10,
        marginBottom: 15,
    },
    buttonWrapper: {
      flex: 1,
      alignItems: 'center',
      marginTop:20,
    },
    disabledButton: {
        opacity: 0.6,
    },
    errorText: {
        color: '#ff0000',
        fontSize: 12,
        marginLeft: 10, // label과의 간격
    },
    passButton: {
        backgroundColor: '#ff9800',
        paddingVertical: 12,
        borderRadius: 8,
        alignItems: 'center',
        marginTop: 10,
        top: 50,
    },
    passButtonText: {
        color: '#ffffff',
        fontSize: 16,
        fontWeight: 'bold',
    },
});
