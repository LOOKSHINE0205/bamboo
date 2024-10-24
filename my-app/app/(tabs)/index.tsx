import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, StyleSheet, Image } from 'react-native';
import axios from 'axios';
import Ionicons from 'react-native-vector-icons/Ionicons';
// @ts-ignore
import BambooHead from '../../assets/images/bamboo_head.png';

interface Message {
    sender: string;
    text: string;
    avatar: any;
    name: string;
    timestamp: string;
}


export default function ChatbotPage() {
    const [messages, setMessages] = useState<Message[]>([]); // Message 인터페이스 사용
    const [input, setInput] = useState('');
    const [userName, setUserName] = useState<string>('');
    const [chatbotName, setChatbotName] = useState<string>('');
    const scrollViewRef = useRef<ScrollView>(null);

    const serverUrl = 'http://10.0.2.2:8082/api/chat/message';
    const userInfoUrl = 'http://10.0.2.2:8082/api/user/info';

    useEffect(() => {
        const fetchUserData = async () => {
            try {
                const response = await axios.get(userInfoUrl);
                setUserName(response.data.userName);
                setChatbotName(response.data.chatbotName);
            } catch (error) {
                console.error('Failed to fetch user data:', error);
            }
        };

        fetchUserData();
    }, []);

    useEffect(() => {
        if (scrollViewRef.current && messages.length > 0) {
            scrollViewRef.current.scrollToEnd({ animated: true });
        }
    }, [messages]);

    const getCurrentTime = (): string => {
        const now = new Date();
        let hours = now.getHours();
        const minutes = now.getMinutes().toString().padStart(2, '0');
        const ampm = hours >= 12 ? '오후' : '오전';

        // 12시간제로 변환
        hours = hours % 12;
        hours = hours ? hours : 12; // 0시를 12시로 표시

        return `${ampm} ${hours}:${minutes}`;
    };

    const sendMessage = async () => {
        if (input.trim()) {
            const userMessage: Message = {
                sender: 'user',
                text: input.trim(),
                avatar: BambooHead,
                name: userName || '사용자',
                timestamp: getCurrentTime(),
            };

            setMessages(prevMessages => [...prevMessages, userMessage]);
            setInput('');

            try {
                const response = await axios.post(serverUrl, input, {
                    headers: { 'Content-Type': 'text/plain' },
                });

                const botMessage: Message = {
                    sender: 'bot',
                    text: response.data,
                    avatar: BambooHead,
                    name: chatbotName || '챗봇',
                    timestamp: getCurrentTime(),
                };

                setMessages(prevMessages => [...prevMessages, botMessage]);
            } catch (error) {
                console.error('Error:', error);
                const errorMessage: Message = {
                    sender: 'bot',
                    text: '챗봇 응답을 가져올 수 없습니다.',
                    avatar: BambooHead,
                    name: chatbotName || '챗봇',
                    timestamp: getCurrentTime(),
                };

                setMessages(prevMessages => [...prevMessages, errorMessage]);
            }
        }
    };


    return (
        <View style={styles.container}>
            <ScrollView
                ref={scrollViewRef}
                style={styles.chatArea}
                contentContainerStyle={styles.chatContent}
                showsVerticalScrollIndicator={false}
            >
                {messages.map((msg, index) => (
                    <View
                        key={index}
                        style={[
                            styles.messageContainer,
                            msg.sender === 'user' ? styles.userMessageContainer : styles.botMessageContainer,
                        ]}
                    >
                        {msg.sender === 'bot' && (
                            <View style={styles.avatarContainer}>
                                <Image source={msg.avatar} style={styles.avatar} />
                            </View>
                        )}
                        <View style={[
                            styles.messageContent,
                            msg.sender === 'user' ? styles.userMessageContent : styles.botMessageContent
                        ]}>
                            <Text style={[
                                styles.senderName,
                                msg.sender === 'user' ? styles.userSenderName : styles.botSenderName
                            ]}>
                                {msg.name}
                            </Text>
                            <View style={styles.messageTimeContainer}>
                                {msg.sender === 'user' && (
                                    <Text style={styles.timeText}>
                                        {msg.timestamp}
                                    </Text>
                                )}
                                <View
                                    style={[
                                        styles.message,
                                        msg.sender === 'user' ? styles.userMessage : styles.botMessage,
                                    ]}
                                >
                                    <Text style={[
                                        styles.messageText,
                                        msg.sender === 'user' ? styles.userMessageText : styles.botMessageText
                                    ]}>
                                        {msg.text}
                                    </Text>
                                </View>
                                {msg.sender === 'bot' && (
                                    <Text style={styles.timeText}>
                                        {msg.timestamp}
                                    </Text>
                                )}
                            </View>
                        </View>
                        {msg.sender === 'user' && (
                            <View style={styles.avatarContainer}>
                                <Image source={msg.avatar} style={styles.avatar} />
                            </View>
                        )}
                    </View>
                ))}
            </ScrollView>
            <View style={styles.inputArea}>
                <TextInput
                    style={styles.input}
                    value={input}
                    onChangeText={setInput}
                    placeholder="이야기 입력하기.."
                    onSubmitEditing={sendMessage}
                />
                <TouchableOpacity onPress={sendMessage} style={styles.iconButton}>
                    <Ionicons name="volume-high" size={24} color="#fff" />
                </TouchableOpacity>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#FFFFFF',
        justifyContent: 'center',
        alignItems: 'center',
    },
    chatArea: {
        flex: 1,
        padding: 8,
        width: '100%',
    },
    chatContent: {
        paddingVertical: 10,
        flexGrow: 1,
    },
    messageContainer: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        marginVertical: 4,
        paddingHorizontal: 6,
    },
    userMessageContainer: {
        justifyContent: 'flex-end',
    },
    botMessageContainer: {
        justifyContent: 'flex-start',
    },
    avatarContainer: {
        width: 36,
        height: 36,
        borderRadius: 18,
        overflow: 'hidden',
        marginTop: 2,
    },
    avatar: {
        width: '100%',
        height: '100%',
        resizeMode: 'contain',
    },
    messageContent: {
        maxWidth: '70%',
        marginHorizontal: 8,
    },
    userMessageContent: {
        alignItems: 'flex-end',
    },
    botMessageContent: {
        alignItems: 'flex-start',
    },
    messageTimeContainer: {
        flexDirection: 'row',
        alignItems: 'flex-end',
        gap: 2,
    },
    senderName: {
        fontSize: 13,
        fontWeight: 'bold',
        marginBottom: 2,
        color: '#555',
    },
    userSenderName: {
        textAlign: 'right',
    },
    botSenderName: {
        textAlign: 'left',
    },
    message: {
        padding: 8,
        borderRadius: 15,
        maxWidth: '100%',
    },
    userMessage: {
        backgroundColor: '#4a9960',
        borderTopRightRadius: 3,
    },
    botMessage: {
        backgroundColor: '#ECECEC',
        borderTopLeftRadius: 3,
    },
    messageText: {
        fontSize: 16,
    },
    userMessageText: {
        color: '#FFFFFF',
    },
    botMessageText: {
        color: '#000000',
    },
    timeText: {
        fontSize: 12,
        color: '#999',
        paddingBottom: 4,
        marginHorizontal: 2,
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
        paddingHorizontal: 15,
        paddingVertical: 8,
    },
    iconButton: {
        backgroundColor: '#4a9960',
        borderRadius: 25,
        padding: 10,
        justifyContent: 'center',
        alignItems: 'center',
    },
});