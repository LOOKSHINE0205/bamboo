import React, { useState } from 'react';
import { Alert, View, Text, TextInput, TouchableOpacity, StyleSheet, SafeAreaView, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import {tls} from "node-forge";

export default function JoinScreen() {
    const router = useRouter();
    const [userEmail, setEmail] = useState('');
    const [userPw, setPassword] = useState('');
    const [userNick, setNickname] = useState('');
    const [userBirthdate, setBirthdate] = useState('');
    const [message, setMessage] = useState('');

    const handleJoin = async () => {
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
            userBirthdate: birthdateString,
        };

        try {
//             const response = await fetch('http://192.168.21.23:8082/api/users/checkEmail', {
            const response = await fetch('http://10.0.2.2:8082/api/users/checkEmail', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(userData),
            });

            const result = await response.text();
            setMessage(result);
            if (result !== '중복된 이메일입니다') {
                router.push({
                    pathname: '/index2',
                    params: { userData: JSON.stringify(userData) },
                });
            }

        } catch (error) {
            console.error('Error:', error);
            Alert.alert('Error', 'Something went wrong!');
        }
    };

    // 패스 버튼 핸들러 추가
    const handlePass = () => {
        router.push('/sendUserInfo');
    };

    const handleBirthdateChange = (text: string) => {
        // 숫자만 입력 가능하도록 필터링하고 최대 8자리까지 제한
        const filteredText = text.replace(/[^0-9]/g, '').slice(0, 8);
        setBirthdate(filteredText);
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
                            <Text style={styles.label}>이메일
                                {message ? <Text style={styles.message}>{message}</Text> : null}</Text>

                            <TextInput
                                style={styles.input}
                                value={userEmail}
                                onChangeText={setEmail}
                                placeholder="이메일 주소를 입력하세요"
                                keyboardType="email-address"
                            />

                            <Text style={styles.label}>비밀번호</Text>
                            <TextInput
                                style={styles.input}
                                value={userPw}
                                onChangeText={setPassword}
                                placeholder="비밀번호를 입력하세요"
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
                            style={styles.button}
                            onPress={handleJoin}
                        >
                            <Text style={styles.buttonText}>다음</Text>
                        </TouchableOpacity>

                        {/* 패스 버튼 추가 */}
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
    label: {
        fontSize: 16,
        marginBottom: 5,
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
        marginBottom: 10, // 버튼 사이 간격 추가
    },
    passButton: {
        backgroundColor: '#f5f5f5', // 패스 버튼 배경색 변경
    },
    buttonText: {
        color: '#000000',
        fontSize: 16,
        fontWeight: 'bold',
    },
    message: {
        marginTop: 20,
        color: 'red',
        textAlign: 'left',
    }
});
