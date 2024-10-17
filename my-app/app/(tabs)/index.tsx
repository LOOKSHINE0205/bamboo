import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, StyleSheet, ImageBackground } from 'react-native';
import axios from 'axios';
import Ionicons from 'react-native-vector-icons/Ionicons';

export default function ChatbotPage() {
    const [messages, setMessages] = useState<{ sender: string, text: string }[]>([]);
    const [input, setInput] = useState('');

    const serverUrl = 'http://10.0.2.2:8082/api/chat/message';

    const sendMessage = async () => {
        if (input.trim()) {
            setMessages([...messages, { sender: 'user', text: input }]);
            setInput('');

            try {
                const response = await axios.post(serverUrl, input, {
                    headers: { 'Content-Type': 'text/plain' },
                });

                const botResponse = { sender: 'bot', text: response.data };
                setMessages((prevMessages) => [...prevMessages, botResponse]);
            } catch (error) {
                console.error('Error:', error);
                setMessages((prevMessages) => [
                    ...prevMessages,
                    { sender: 'bot', text: '챗봇 응답을 가져올 수 없습니다.' },
                ]);
            }
        }
    };

    return (
        <View style={styles.container}>
            <ImageBackground source={require('../../assets/images/reportbg.png')} style={styles.backgroundImage}>
                <ScrollView style={styles.chatArea}>
                    {messages.map((msg, index) => (
                        <View
                            key={index}
                            style={[
                                styles.message,
                                msg.sender === 'user' ? styles.userMessage : styles.botMessage,
                            ]}
                        >
                            <Text style={styles.messageText}>{msg.text}</Text>
                        </View>
                    ))}
                </ScrollView>
                <View style={styles.inputArea}>
                    <TextInput
                        style={styles.input}
                        value={input}
                        onChangeText={setInput}
                        placeholder="이야기 입력하기.."
                    />
                    <TouchableOpacity onPress={sendMessage} style={styles.iconButton}>
                        <Ionicons name="volume-high" size={24} color="#fff" />
                    </TouchableOpacity>
                </View>
            </ImageBackground>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#FFFFFF', // 단색 배경 설정
        justifyContent: 'center',
        alignItems: 'center',
    },
    chatArea: {
        flex: 1,
        padding: 10,
        width: '100%',
    },
    message: {
        padding: 10,
        borderRadius: 15,
        marginVertical: 5,
    },
    userMessage: {
        alignSelf: 'flex-end',
        backgroundColor: '#4a9960', // 아이콘 버튼 색상과 동일하게 설정
    },
    botMessage: {
        alignSelf: 'flex-start',
        backgroundColor: '#ECECEC',
    },
    messageText: {
        fontSize: 17,
    },
    inputArea: {
        flexDirection: 'row',
        padding: 10,
        borderTopWidth: 1,
        borderColor: '#ddd',
        backgroundColor: '#fff',
        width: '100%',
    },
    input: {
        flex: 1,
        marginRight: 10,
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 20,
        paddingHorizontal: 10,
    },
    iconButton: {
        backgroundColor: '#4a9960',
        borderRadius: 25,
        padding: 10,
        justifyContent: 'center',
        alignItems: 'center',
    },
});
