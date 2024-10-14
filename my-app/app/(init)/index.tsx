import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import BackGround from "../../components/BackGround";

export default function InitialScreen() {
    const router = useRouter();

    return (
        <View style={styles.container}>
            <BackGround />
            <View style={styles.buttonsContainer}>
                <TouchableOpacity
                    style={styles.button}
                    onPress={() => router.push('/(join)/login')} // 로그인 버튼 클릭 시 이동할 경로
                >
                    <Text style={styles.buttonText}>로그인</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={styles.button}
                    onPress={() => router.push('/(join)')} // 회원가입 버튼 클릭 시 이동할 경로
                >
                    <Text style={styles.buttonText}>회원가입</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#ffffff',
    },
    buttonsContainer: {
        position: 'absolute',
        bottom: 50, // 버튼이 화면 아래에서 50px 정도 위로 올라오도록 설정
        width: '80%',
        alignItems: 'center',
    },
    button: {
        backgroundColor: '#4f772d',
        paddingVertical: 12,
        paddingHorizontal: 25,
        borderRadius: 8,
        marginVertical: 10,
        width: '100%',
        alignItems: 'center',
    },
    buttonText: {
        color: '#ffffff',
        fontSize: 16,
        fontWeight: 'bold',
    },
});
