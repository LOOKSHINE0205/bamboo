import React, { useState } from 'react';
import { Alert, View, Text, TextInput, TouchableOpacity, StyleSheet, SafeAreaView, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { useRouter } from 'expo-router';

export default function JoinScreen() {
    const router = useRouter();
    const [userEmail, setEmail] = useState('');
    const [userPw, setPassword] = useState('');
    const [userPwConfirm, setPasswordConfirm] = useState('');
    const [userNick, setNickname] = useState('');
    const [userBirthdate, setBirthdate] = useState('');
    const [emailMessage, setEmailMessage] = useState('');
    const [passwordMessage, setPasswordMessage] = useState('');
    const [isEmailValid, setIsEmailValid] = useState(false); // 이메일 유효성 상태
    const [debounceTimeout, setDebounceTimeout] = useState<NodeJS.Timeout | null>(null);

    const handleEmailChange = (email: string) => {
        setEmail(email);
        setEmailMessage(''); // 초기 메시지 설정
        setIsEmailValid(false); // 이메일 변경 시 초기화

        // 입력 중일 때는 기존 타이머를 클리어
        if (debounceTimeout) {
            clearTimeout(debounceTimeout);
        }

        // 500ms 후에 이메일 중복 체크 실행
        const newTimeout = setTimeout(() => {
            checkEmailAvailability(email);
        }, 500);
        setDebounceTimeout(newTimeout);
    };

    const checkEmailAvailability = async (email: string) => {
        if (!email) {
            return;
        }

        try {
            const response = await fetch('http://192.168.21.142:8082/api/users/checkEmail', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ userEmail: email }),
            });

            // 서버 응답을 텍스트로 받음
            const result = await response.text();
            console.log('Email availability check response:', result);

            // 텍스트 응답에 따라 처리
            if (result.includes('중복된 이메일')) {
                setEmailMessage('중복된 이메일입니다.');
                setIsEmailValid(false);
            } else if (result.includes('사용 가능')) {
                setEmailMessage('사용 가능한 이메일입니다.');
                setIsEmailValid(true);
            } else {
                setEmailMessage('이메일 확인 중 오류가 발생했습니다.');
                setIsEmailValid(false);
            }
        } catch (error) {
            console.error('Error:', error);
            setEmailMessage('이메일 확인 중 오류가 발생했습니다.');
            setIsEmailValid(false);
        }
    };



    const handleJoin = async () => {
        if (!isEmailValid) {
            Alert.alert('경고', '올바른 이메일을 입력하세요.');
            return;
        }

        let birthdateString;

        if (userBirthdate.length === 8) {
            const year = userBirthdate.slice(0, 4);
            const month = userBirthdate.slice(4, 6);
            const day = userBirthdate.slice(6, 8);
            birthdateString = `${year}-${month}-${day}T00:00:00`;
        } else {
            birthdateString = null;
        }

        // 비밀번호 검증 (최종적으로 가입 시에도 확인)
        if (userPw !== userPwConfirm) {
            setPasswordMessage('비밀번호가 다릅니다.');
            return;
        }

        const userData = {
            userEmail,
            userPw,
            userNick,
            userBirthdate: birthdateString,
        };

        try {
            router.push({
                pathname: '/index2',
                params: { userData: JSON.stringify(userData) },
            });
        } catch (error) {
            console.error('Error:', error);
            Alert.alert('Error', 'Something went wrong!');
        }
    };

    const handlePass = () => {
        router.push('/sendUserInfo');
    };

    const handleBirthdateChange = (text: string) => {
        const filteredText = text.replace(/[^0-9]/g, '').slice(0, 8);
        setBirthdate(filteredText);
    };

    const handlePasswordConfirmChange = (text: string) => {
        setPasswordConfirm(text);
        if (text && text !== userPw) {
            setPasswordMessage('비밀번호가 다릅니다.');
        } else {
            setPasswordMessage('');
        }
    };

    return (
        <SafeAreaView style={styles.safeArea}>
            <KeyboardAvoidingView
                behavior={Platform.OS === "ios" ? "padding" : "height"}
                style={styles.container}
            >
                <ScrollView contentContainerStyle={styles.scrollView}>
                    <View style={styles.formContainer}>
                        <View style={styles.inputContainer}>
                            <View style={styles.emailLabelContainer}>
                                <Text style={styles.label}>이메일</Text>
                                {emailMessage && (
                                    <Text style={[styles.message, emailMessage.includes('중복') ? styles.errorMessage : styles.successMessage]}>
                                        {emailMessage}
                                    </Text>
                                )}
                            </View>
                            <TextInput
                                style={styles.input}
                                value={userEmail}
                                onChangeText={handleEmailChange}
                                placeholder="이메일 주소를 입력하세요"
                                keyboardType="email-address"
                            />

                            <View style={styles.passwordLabelContainer}>
                                <Text style={styles.label}>비밀번호</Text>
                                {passwordMessage && (
                                    <Text style={[styles.message, styles.errorMessage]}>
                                        {passwordMessage}
                                    </Text>
                                )}
                            </View>

                            <TextInput
                                style={styles.input}
                                value={userPw}
                                onChangeText={setPassword}
                                placeholder="비밀번호를 입력하세요"
                                secureTextEntry
                            />

                            <Text style={styles.label}>비밀번호 확인</Text>
                            <TextInput
                                style={styles.input}
                                value={userPwConfirm}
                                onChangeText={handlePasswordConfirmChange}
                                placeholder="비밀번호를 다시 입력하세요"
                                secureTextEntry
                            />

                            <Text style={styles.label}>닉네임</Text>
                            <TextInput
                                style={styles.input}
                                value={userNick}
                                onChangeText={setNickname}
                                placeholder="닉네임을 입력하세요"
                            />

                            <Text style={styles.label}>생년월일</Text>
                            <TextInput
                                style={styles.input}
                                value={userBirthdate}
                                onChangeText={handleBirthdateChange}
                                placeholder="YYYYMMDD"
                                keyboardType="numeric"
                            />
                        </View>
                        <TouchableOpacity
                            style={[styles.button, !isEmailValid && styles.buttonDisabled]}
                            onPress={handleJoin}
                            disabled={!isEmailValid}
                        >
                            <Text style={styles.buttonText}>다음</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={[styles.button, styles.passButton]}
                            onPress={handlePass}
                        >
                            <Text style={styles.buttonText}>패스</Text>
                        </TouchableOpacity>
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: '#ffffff',
    },
    container: {
        flex: 1,
    },
    scrollView: {
        flexGrow: 1,
    },
    formContainer: {
        padding: 20,
    },
    inputContainer: {
        marginBottom: 20,
    },
    emailLabelContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 5,
    },
    passwordLabelContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 5,
    },
    label: {
        fontSize: 16,
    },
    input: {
        backgroundColor: '#e8f5e9',
        borderRadius: 8,
        padding: 15,
        marginBottom: 15,
    },
    button: {
        backgroundColor: '#ffffff',
        borderColor: '#000000',
        borderWidth: 1,
        borderRadius: 8,
        padding: 15,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 10,
    },
    buttonDisabled: {
        backgroundColor: '#e0e0e0',
        borderColor: '#999',
    },
    passButton: {
        backgroundColor: '#f5f5f5',
    },
    buttonText: {
        color: '#000000',
        fontSize: 16,
        fontWeight: 'bold',
    },
    message: {
        fontSize: 12,
        marginLeft: 10,
    },
    errorMessage: {
        color: 'red',
    },
    successMessage: {
        color: 'green',
    },
});
