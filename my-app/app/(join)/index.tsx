import React, { useState, useRef } from 'react';
import {
    View,
    Text,
    TextInput,
    SafeAreaView,
    ScrollView,
    KeyboardAvoidingView,
    Platform,
    StyleSheet,
} from 'react-native';
import { useRouter } from 'expo-router';
import SmoothCurvedButton from '../../components/SmoothCurvedButton';

export default function JoinScreen() {
    const router = useRouter();

    const [userEmail, setEmail] = useState('');
    const [userPw, setPassword] = useState('');
    const [userPwConfirm, setPasswordConfirm] = useState('');
    const [userNick, setNickname] = useState('');
    const [userBirthdate, setBirthdate] = useState('');
    const [emailMessage, setEmailMessage] = useState('');
    const [passwordMessage, setPasswordMessage] = useState('');
    const [isEmailValid, setIsEmailValid] = useState(false);
    const [debounceTimeout, setDebounceTimeout] = useState(null);

    // Input refs
    const emailInputRef = useRef<TextInput>(null);
    const passwordInputRef = useRef<TextInput>(null);
    const passwordConfirmInputRef = useRef<TextInput>(null);
    const nicknameInputRef = useRef<TextInput>(null);
    const birthdateInputRef = useRef<TextInput>(null);

    const handleEmailChange = (email) => {
        setEmail(email);
        setEmailMessage('');
        setIsEmailValid(false);

        if (debounceTimeout) {
            clearTimeout(debounceTimeout);
        }

        const newTimeout = setTimeout(() => {
            checkEmailAvailability(email);
        }, 500);

        setDebounceTimeout(newTimeout);
    };

    const checkEmailAvailability = async (email) => {
        if (!email) return;

        try {
            const response = await fetch('http://10.0.2.2:8082/api/users/checkEmail', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userEmail: email })
            });

            const result = await response.text();
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
        // Focus on empty fields in sequence and return early
        if (!userEmail) {
            emailInputRef.current?.focus();
            setEmailMessage('이메일을 입력하세요.');
            return;
        }

        if (!isEmailValid) {
            emailInputRef.current?.focus();
            return;
        }

        if (!userPw) {
            passwordInputRef.current?.focus();
            setPasswordMessage('비밀번호를 입력하세요.');
            return;
        }

        if (userPw !== userPwConfirm) {
            passwordConfirmInputRef.current?.focus();
            setPasswordMessage('비밀번호가 다릅니다.');
            return;
        }

        if (!userNick) {
            nicknameInputRef.current?.focus();
            return;
        }

        if (!userBirthdate) {
            birthdateInputRef.current?.focus();
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

        const userData = {
            userEmail,
            userPw,
            userNick,
            userBirthdate: birthdateString
        };

        try {
            router.push({
                pathname: '/index2',
                params: {
                    userData: JSON.stringify(userData)
                },
            });
        } catch (error) {
            console.error('Error:', error);
        }
    };

    const handleBirthdateChange = (text) => {
        const filteredText = text.replace(/[^0-9]/g, '').slice(0, 8);
        setBirthdate(filteredText);
    };

    const handlePasswordConfirmChange = (text) => {
        setPasswordConfirm(text);
        setPasswordMessage(
            text && text !== userPw ? '비밀번호가 다릅니다.' : '비밀번호가 일치합니다.'
        );
    };

    return (
        <SafeAreaView style={styles.safeArea}>
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={styles.container}
                keyboardVerticalOffset={Platform.select({ ios: 40, android: 0 })}
            >
                <ScrollView
                    contentContainerStyle={styles.scrollView}
                    keyboardShouldPersistTaps="handled"
                >
                    <View style={styles.formContainer}>
                        <View style={styles.inputContainer}>
                            <View style={styles.emailLabelContainer}>
                                <Text style={styles.label}>이메일</Text>
                                {emailMessage && (
                                    <Text style={[
                                        styles.message,
                                        emailMessage.includes('중복') ? styles.errorMessage : styles.successMessage
                                    ]}>
                                        {emailMessage}
                                    </Text>
                                )}
                            </View>
                            <TextInput
                                ref={emailInputRef}
                                style={styles.input}
                                value={userEmail}
                                onChangeText={handleEmailChange}
                                placeholder="이메일 주소를 입력하세요"
                                keyboardType="email-address"
                                placeholderTextColor="#707070"
                            />
                            <View style={styles.passwordLabelContainer}>
                                <Text style={styles.label}>비밀번호</Text>
                                {passwordMessage && (
                                    <Text style={[
                                        styles.message,
                                        passwordMessage.includes('일치') ? styles.successMessage : styles.errorMessage
                                    ]}>
                                        {passwordMessage}
                                    </Text>
                                )}
                            </View>
                            <TextInput
                                ref={passwordInputRef}
                                style={styles.input}
                                value={userPw}
                                onChangeText={setPassword}
                                placeholder="비밀번호를 입력하세요"
                                secureTextEntry
                                placeholderTextColor="#707070"
                            />
                            <Text style={styles.label}>비밀번호 확인</Text>
                            <TextInput
                                ref={passwordConfirmInputRef}
                                style={styles.input}
                                value={userPwConfirm}
                                onChangeText={handlePasswordConfirmChange}
                                placeholder="비밀번호를 다시 입력하세요"
                                secureTextEntry
                                placeholderTextColor="#707070"
                            />
                            <Text style={styles.label}>닉네임</Text>
                            <TextInput
                                ref={nicknameInputRef}
                                style={styles.input}
                                value={userNick}
                                onChangeText={setNickname}
                                placeholder="닉네임을 입력하세요"
                                placeholderTextColor="#707070"
                            />
                            <Text style={styles.label}>생년월일</Text>
                            <TextInput
                                ref={birthdateInputRef}
                                style={styles.input}
                                value={userBirthdate}
                                onChangeText={handleBirthdateChange}
                                placeholder="YYYYMMDD"
                                keyboardType="numeric"
                                placeholderTextColor="#707070"
                            />
                        </View>
                        <View style={styles.buttonContainer}>
                            <SmoothCurvedButton
                                title="다음"
                                onPress={handleJoin}
                                disabled={!isEmailValid}
                            />
                        </View>
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
        justifyContent: 'center',
        backgroundColor: '#ffffff',
    },
    scrollView: {
        flexGrow: 1,
        paddingBottom: 100,
    },
    formContainer: {
        padding: 20,
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
    inputContainer: {
        marginBottom: 20,
    },
    input: {
        backgroundColor: '#e8f5e9',
        borderRadius: 16,
        padding: 15,
        marginBottom: 15,
    },
    buttonContainer: {
        alignItems: 'center',
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
