import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { saveUserInfo } from '../../storage/storageHelper'; // 사용자 정보를 저장하는 helper 함수
import axios from "axios"; // 서버와의 통신을 위해 axios 라이브러리 사용
import { useNavigation } from '@react-navigation/native';

// 로그인 화면 컴포넌트
export default function LoginScreen() {
    const router = useRouter(); // expo-router로 페이지 이동을 관리
    const [email, setEmail] = useState(''); // 이메일 입력 상태 관리
    const [password, setPassword] = useState(''); // 비밀번호 입력 상태 관리
    const [isLoading, setIsLoading] = useState(false); // 로그인 진행 중인지 표시
    const [error, setError] = useState<string | null>(null); // 에러 메시지 관리
    const navigation = useNavigation(); // React Navigation으로 페이지 이동을 관리

    // 로그인 버튼 클릭 시 실행되는 함수
    const handleLogin = async () => {
        // 이메일이나 비밀번호가 없으면 에러 메시지를 설정하고 함수 종료
        if (!email || !password) {
            setError('이메일과 비밀번호를 모두 입력하세요.');
            return;
        }

        setIsLoading(true); // 로그인 진행 상태로 설정
        setError(null); // 이전 에러 메시지 초기화

        try {
            // 로그인 API 요청
            const response = await axios.post('http://192.168.20.97:8082/api/users/login', {
                userEmail: email,
                userPw: password,
            });

            // 서버에서 받은 응답을 분석하여 처리
            const { message, user } = response.data;
            if (message === '로그인 성공' && user) {
                await saveUserInfo(user); // 로그인 성공 시 사용자 정보 저장
                navigation.navigate('(tabs)'); // 메인 화면으로 이동
            } else {
                setError('로그인 실패: 서버 응답 확인 필요'); // 로그인 실패 시 에러 메시지 설정
            }
        } catch (error) {
            console.error('Login failed:', error);
            if (error.response) {
                setError(error.response.data.message || '로그인에 실패했습니다. 다시 시도해주세요.'); // 서버에서 온 에러 메시지 표시
            } else {
                setError('서버와 연결할 수 없습니다. 인터넷 연결을 확인하세요.'); // 네트워크 오류 시 메시지 표시
            }
            setPassword(''); // 로그인 실패 시 비밀번호 초기화
        } finally {
            setIsLoading(false); // 요청이 완료된 후 로딩 상태 해제
        }
    };

    return (
        <View style={styles.container}>
            {/* 이메일 입력 필드 */}
            <Text style={styles.label}>이메일</Text>
            <TextInput
                style={styles.input}
                value={email}
                onChangeText={setEmail}
                placeholder="이메일 주소를 입력하세요"
                keyboardType="email-address"
                autoCapitalize="none" // 이메일 입력 시 자동 대문자 비활성화
            />
            {/* 비밀번호 입력 필드 */}
            <Text style={styles.label}>비밀번호</Text>
            <TextInput
                style={styles.input}
                value={password}
                onChangeText={setPassword}
                placeholder="비밀번호를 입력하세요"
                secureTextEntry // 비밀번호 가리기 활성화
            />
            {/* 에러 메시지가 있을 경우 화면에 표시 */}
            {error && <Text style={styles.errorText}>{error}</Text>}

            {/* 로그인 버튼, 로딩 중일 경우 비활성화 상태 */}
            <TouchableOpacity
                style={[styles.button, isLoading && styles.disabledButton]}
                onPress={handleLogin}
                disabled={isLoading}
            >
                <Text style={styles.buttonText}>{isLoading ? '로그인 중...' : '로그인'}</Text>
            </TouchableOpacity>

            {/* 개발 및 테스트 용도로 사용되는 패스 버튼 */}
            <TouchableOpacity
                style={styles.passButton}
                onPress={() => router.push('/(tabs)/myPage')} // 로그인 없이 페이지 이동
            >
                <Text style={styles.passButtonText}>패스</Text>
            </TouchableOpacity>
        </View>
    );
}
const styles = StyleSheet.create({
    container: {
        flex: 1, // 화면의 전체 높이를 차지
        padding: 20, // 모든 방향에서의 여백 설정
        backgroundColor: '#ffffff', // 배경색 흰색으로 설정
    },
    label: {
        fontSize: 16, // 텍스트 크기를 16으로 설정
        marginBottom: 5, // 텍스트 하단에 5의 여백 추가
    },
    input: {
        backgroundColor: '#e8f5e9', // 입력 필드의 배경색을 연한 녹색으로 설정
        borderRadius: 8, // 입력 필드의 모서리를 둥글게 만듦
        padding: 10, // 입력 필드 안의 여백 설정
        marginBottom: 15, // 입력 필드 하단에 15의 여백 추가
    },
    button: {
        backgroundColor: '#ffffff', // 버튼 배경색을 흰색으로 설정
        borderColor: '#000000', // 버튼 테두리 색상을 검정으로 설정
        borderWidth: 1, // 버튼 테두리의 두께를 1로 설정
        paddingVertical: 12, // 버튼 위아래의 여백을 12로 설정
        borderRadius: 8, // 버튼 모서리를 둥글게 만듦
        alignItems: 'center', // 버튼 내 텍스트를 가운데 정렬
    },
    buttonText: {
        color: '#000000', // 버튼 텍스트 색상을 검정으로 설정
        fontSize: 16, // 텍스트 크기를 16으로 설정
        fontWeight: 'bold', // 텍스트를 굵게 표시
    },
    disabledButton: {
        opacity: 0.6, // 버튼이 비활성화 상태일 때 투명도를 낮춤
    },
    errorText: {
        color: '#ff0000', // 에러 메시지 텍스트 색상을 빨강으로 설정
        fontSize: 14, // 에러 메시지 텍스트 크기를 14로 설정
        marginBottom: 10, // 하단 여백을 10 추가
        textAlign: 'center', // 텍스트를 가운데 정렬
        top: 90, // 에러 메시지 위치를 90만큼 아래로 조정
    },
    passButton: {
        backgroundColor: '#ff9800', // 패스 버튼 배경색을 주황색으로 설정
        paddingVertical: 12, // 버튼 위아래 여백을 12로 설정
        borderRadius: 8, // 버튼 모서리를 둥글게 만듦
        alignItems: 'center', // 텍스트를 가운데 정렬
        marginTop: 10, // 상단 여백을 10 추가
        top: 50, // 버튼 위치를 50만큼 아래로 조정
    },
    passButtonText: {
        color: '#ffffff', // 패스 버튼 텍스트 색상을 흰색으로 설정
        fontSize: 16, // 텍스트 크기를 16으로 설정
        fontWeight: 'bold', // 텍스트를 굵게 표시
    },
});
