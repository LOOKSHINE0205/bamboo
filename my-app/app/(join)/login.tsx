import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons'; // 뒤로 가기 아이콘을 위해 추가

export default function LoginScreen() {
    const router = useRouter();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

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
              style={styles.button}
              onPress={() => router.push('/(tabs)')} // 대화하기 페이지로 이동
            >
              <Text style={styles.buttonText}>다음</Text>
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
    buttonText: {
        color: '#000000',
        fontSize: 16,
        fontWeight: 'bold',
    },
});