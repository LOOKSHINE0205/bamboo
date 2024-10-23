import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, StyleSheet, Image } from 'react-native';
import axios from 'axios';
import Ionicons from 'react-native-vector-icons/Ionicons';
// @ts-ignore
import BambooHead from '../../assets/images/bamboo_head.png';

export default function ChatbotPage() {
    const [messages, setMessages] = useState<{ sender: string, text: string, avatar: any, name: string }[]>([]);
    const [input, setInput] = useState('');
    const [userName, setUserName] = useState<string>('');
    const [chatbotName, setChatbotName] = useState<string>('');
    const scrollViewRef = useRef<ScrollView>(null);

//     const serverUrl = 'http://192.168.21.23:8082/api/chat/message';
    const serverUrl = 'http://10.0.2.2:8082/api/chat/message';
//     const userInfoUrl = 'http://192.168.21.23:8082/api/user/info';
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

    // 메시지가 추가될 때마다 스크롤을 아래로 이동
    useEffect(() => {
        if (scrollViewRef.current && messages.length > 0) {
            scrollViewRef.current.scrollToEnd({ animated: true });
        }
    }, [messages]);

    const sendMessage = async () => {
        if (input.trim()) {
            setMessages([
                ...messages,
                {
                    sender: 'user',
                    text: input,
                    avatar: BambooHead,
                    name: userName || '사용자',
                },
            ]);
            setInput('');

            try {
                const response = await axios.post(serverUrl, input, {
                    headers: { 'Content-Type': 'text/plain' },
                });

                const botResponse = {
                    sender: 'bot',
                    text: response.data,
                    avatar: BambooHead,
                    name: chatbotName || '챗봇',
                };
                setMessages((prevMessages) => [...prevMessages, botResponse]);
            } catch (error) {
                console.error('Error:', error);
                setMessages((prevMessages) => [
                    ...prevMessages,
                    {
                        sender: 'bot',
                        text: '챗봇 응답을 가져올 수 없습니다.',
                        avatar: BambooHead,
                        name: chatbotName || '챗봇',
                    },
                ]);
            }
        }
    };

    return (
        <View style={styles.container}>
            <ScrollView
                ref={scrollViewRef}
                style={styles.chatArea}
                contentContainerStyle={styles.chatContent}
                showsVerticalScrollIndicator={false}  // 스크롤바 숨기기
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
                    onSubmitEditing={sendMessage}  // Enter 키로도 메시지 전송 가능하도록
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
        top: 2,
        borderRadius: 18,
        overflow: 'hidden',
    },
    avatar: {
        width: '100%',
        height: '100%',
        top:2,
        resizeMode: 'contain',
    },
    messageContent: {
        maxWidth: '70%',
        marginHorizontal: -3,
        position: 'relative',  // 꼬리 위치 지정을 위해 추가
    },
    userMessageContent: {
        alignItems: 'flex-end',
    },
    botMessageContent: {
        alignItems: 'flex-start',
    },
    chatContent: {
        paddingVertical: 10,  // 스크롤 영역 상하 여백 추가
        flexGrow: 1,  // 컨텐츠가 적을 때도 스크롤 가능하도록
    },
    senderName: {
        fontSize: 13,
        fontWeight: 'bold',
        marginBottom: 2,
        color: '#555',
        paddingLeft: 1,  // 말풍선 꼬리 공간 확보
    },
    userSenderName: {
        textAlign: 'right',
        paddingLeft: 0,
        paddingRight: 1,  // 사용자 메시지의 경우 오른쪽에 패딩
    },
    botSenderName: {
        textAlign: 'left',
    },
    message: {
        padding: 8,
        borderRadius: 15,
        position: 'relative',  // 꼬리 위치 지정을 위해 추가
    },
    userMessage: {
        backgroundColor: '#4a9960',
        marginLeft: 12,  // 말풍선 꼬리 공간 확보
        borderTopRightRadius: 3,  // 꼬리 쪽 모서리 더 날카롭게
    },
    botMessage: {
        backgroundColor: '#ECECEC',
        marginRight: 12,  // 말풍선 꼬리 공간 확보
        borderTopLeftRadius: 3,  // 꼬리 쪽 모서리 더 날카롭게
    },
    messageTail: {
        position: 'absolute',
        width: 0,
        height: 0,
        borderStyle: 'solid',
        borderWidth: 6,
    },
    userMessageTail: {
        right: -8,
        top: 8,
        borderColor: 'transparent transparent transparent #4a9960',
    },
    botMessageTail: {
        left: -8,
        top: 8,
        borderColor: 'transparent #ECECEC transparent transparent',
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