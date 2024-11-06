import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, StyleSheet, Image, KeyboardAvoidingView, Platform } from 'react-native';
import axios from 'axios';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { getUserInfo, getUserProfileImage } from '../../storage/storageHelper';
import { useFocusEffect } from '@react-navigation/native';
import BambooHead from '../../assets/images/bamboo_head.png';
import BambooPanda from '../../assets/images/bamboo_panda.png';
import AsyncStorage from "@react-native-async-storage/async-storage";
import { serverAddress } from '../../components/Config';

// 메시지 구조를 정의하는 인터페이스
interface Message {
    sender: string;
    text: string;
    avatar: any;
    name: string;
    timestamp: string;
    showTimestamp?: boolean;
    evaluation?: 'like' | 'dislike' | null;
}

export default function ChatbotPage() {
    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState('');
    const [userName, setUserName] = useState<string>('');
    const [chatbotName, setChatbotName] = useState<string>('챗봇');
    const [userAvatar, setUserAvatar] = useState(BambooPanda);
    const [isTyping, setIsTyping] = useState(false);
    const scrollViewRef = useRef<ScrollView>(null);
    const serverUrl = 'http://10.0.2.2:8082/api/chat/getChatResponse';

    let countdownInterval: NodeJS.Timeout | null = null;
    let messagesToSend: string[] = [];
    const countdownDuration = 5; // 5초 카운트다운
    const messagesToSendRef = useRef<string[]>([]);
    const countdownIntervalRef = useRef<NodeJS.Timeout | null>(null);

    useFocusEffect(
        React.useCallback(() => {
            const fetchData = async () => {
                try {
                    const userData = await getUserInfo();
                    if (userData) {
                        setUserName(userData.userNick || '');
                        setChatbotName(userData.chatbotName || '챗봇');
                    }
                    const profileImage = await getUserProfileImage();
                    setUserAvatar(profileImage ? { uri: `${profileImage}?${new Date().getTime()}` } : BambooPanda);
                } catch (error) {
                    console.error('데이터를 가져오는 데 실패했습니다:', error);
                }
            };

            fetchData();
        }, [])
    );

    // 평가 처리
    const handleEvaluation = (messageIndex: number, type: 'like' | 'dislike') => {
        setMessages(prevMessages =>
            prevMessages.map((msg, index) => {
                if (index === messageIndex) {
                    return { ...msg, evaluation: msg.evaluation === type ? null : type };
                }
                return msg;
            })
        );
    };

    useEffect(() => {
        if (scrollViewRef.current && messages.length > 0) {
            scrollViewRef.current.scrollToEnd({ animated: true });
        }
    }, [messages]);

    // 카운트다운 시작 함수
    const startCountdown = () => {
        stopCountdown(); // 기존 카운트다운 중지

        let countdown = countdownDuration;
        console.log(`카운트다운 시작: ${countdown}초 남음`);

        countdownIntervalRef.current = setInterval(() => {
            countdown -= 1;
            console.log(`${countdown}초 남음`);

            if (countdown <= 0) {
                clearInterval(countdownIntervalRef.current!);
                countdownIntervalRef.current = null;
                console.log('카운트다운 종료. 메시지 전송.');
                sendBotResponse(); // 메시지 전송
            }
        }, 1000);
    };

    // 카운트다운 중지 함수
    const stopCountdown = () => {
        if (countdownIntervalRef.current !== null) {
            clearInterval(countdownIntervalRef.current);
            countdownIntervalRef.current = null;
        }
    };

    // 챗봇 응답 전송 함수
    const sendBotResponse = async () => {
        if (messagesToSendRef.current.length > 0) {
            const combinedMessages = messagesToSendRef.current.join(' ');
            const croomIdx = await AsyncStorage.getItem('croomIdx');

            if(!croomIdx){
                console.error("croomIdx not found in AsyncStorage")
                return;
            }
            console.log("croomIdx found in AsyncStorage",croomIdx);

            const payload = {
                croomIdx:parseInt(croomIdx),
                chatter : "user",
                chatContent : combinedMessages,
                emotionTag :"happy"
            }
            try {
                const response = await axios.post(serverUrl, payload,
                    { headers: { 'Content-Type': 'application/json' } });
                setMessages((prevMessages) => [
                    ...prevMessages,
                    {
                        sender: 'bot',
                        text: response.data,
                        avatar: BambooHead,
                        name: chatbotName,
                        timestamp: getCurrentTime(),
                        showTimestamp: true,
                    }]);
                messagesToSendRef.current = []; // 초기화
            } catch (error) {
                console.error('Error sending bot response:', error);
                // 추가: 오류의 상세 정보 출력
                if (error.response) {
                    console.error("Server responded with an error:", error.response.data);
                    console.error("Status code:", error.response.status);
                } else if (error.request) {
                    console.error("Request was made but no response received", error.request);
                } else {
                    console.error("Error setting up the request:", error.message);
                }
            }
        }
    };

    const handleInputChange = (text: string) => {
        setInput(text);
        setIsTyping(true);

        // 사용자가 입력 중일 때는 카운트다운 멈춤
        stopCountdown();
    };

    // 메시지 전송 버튼을 눌렀을 때 호출되는 함수
    const sendMessage = () => {
        if (input.trim()) {
            const userMessage: Message = {
                sender: 'user',
                text: input.trim(),
                avatar: userAvatar,
                name: userName,
                timestamp: getCurrentTime(),
                showTimestamp: false,
            };

            setMessages(prevMessages => {
                const newMessages = [...prevMessages, userMessage];
                return updateTimestamps(newMessages);
            });

            // 메시지를 배열에 추가
            messagesToSendRef.current.push(input.trim());
            setInput('');
            setIsTyping(false);

            // 새로운 메시지를 보낼 때 카운트다운 시작
            startCountdown();
        } else {
            console.log('빈 메시지는 전송되지 않습니다.');
        }
    };

    const getCurrentTime = (): string => {
        const now = new Date();
        let hours = now.getHours();
        const minutes = now.getMinutes().toString().padStart(2, '0');
        const ampm = hours >= 12 ? '오후' : '오전';
        hours = hours % 12 || 12;
        return `${ampm} ${hours}:${minutes}`;
    };

    const updateTimestamps = (messages: Message[]): Message[] => {
        return messages.map((msg, index) => ({
            ...msg,
            showTimestamp: shouldShowTimestamp(index, msg, messages)
        }));
    };

    const shouldShowTimestamp = (messageIndex: number, currentMessage: Message, allMessages: Message[]): boolean => {
        if (currentMessage.sender === 'bot') return true;
        const nextMessage = allMessages[messageIndex + 1];
        if (!nextMessage) return true;
        if (nextMessage.sender === 'bot') return true;
        if (nextMessage.timestamp !== currentMessage.timestamp) return true;
        return false;
    };

    // 메시지에 대한 평가 버튼 컴포넌트
    const EvaluationButtons = ({ message, index }: { message: Message; index: number }) => {
        if (message.sender !== 'bot') return null;
        return (
            <View style={styles.evaluationContainer}>
                <TouchableOpacity
                    onPress={() => handleEvaluation(index, 'like')}
                    style={[styles.evaluationButton, message.evaluation === 'like' && styles.evaluationButtonActive]}
                >
                    <Ionicons
                        name={message.evaluation === 'like' ? "thumbs-up" : "thumbs-up-outline"}
                        size={14}
                        color={message.evaluation === 'like' ? "#4a9960" : "#666"}
                    />
                </TouchableOpacity>
                <TouchableOpacity
                    onPress={() => handleEvaluation(index, 'dislike')}
                    style={[styles.evaluationButton, message.evaluation === 'dislike' && styles.evaluationButtonActive]}
                >
                    <Ionicons
                        name={message.evaluation === 'dislike' ? "thumbs-down" : "thumbs-down-outline"}
                        size={14}
                        color={message.evaluation === 'dislike' ? "#e74c3c" : "#666"}
                    />
                </TouchableOpacity>
            </View>
        );
    };

    return (
        <KeyboardAvoidingView
            style={{ flex: 1 }}
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
            keyboardVerticalOffset={Platform.OS === 'ios' ? 100 : 0} // iOS에서는 80, Android에서는 0 설정
        >
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
                                msg.sender === 'user' ? styles.userMessageContainer : styles.botMessageContainer
                            ]}
                        >
                            {msg.sender === 'bot' && (
                                <View style={styles.avatarContainer}>
                                    <Image source={msg.avatar} style={styles.botAvatar} />
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
                                    {msg.sender === 'user' && msg.showTimestamp && (
                                        <Text style={styles.timeText}>{msg.timestamp}</Text>
                                    )}

                                    <View style={[
                                        styles.message,
                                        msg.sender === 'user' ? styles.userMessage : styles.botMessage
                                    ]}>

                                        <Text style={[
                                            styles.messageText,
                                            msg.sender === 'user' ? styles.userMessageText : styles.botMessageText
                                        ]}>
                                            {msg.text}
                                        </Text>
                                    </View>

                                    {msg.sender === 'bot' && msg.showTimestamp && (
                                        <View style={styles.timeContainer}>
                                            <EvaluationButtons message={msg} index={index} />
                                            <Text style={styles.timeText}>{msg.timestamp}</Text>
                                        </View>
                                    )}

                                </View>
                            </View>

                            {msg.sender === 'user' && (
                                <View style={styles.avatarContainer}>
                                    <Image
                                        source={userAvatar}
                                        style={styles.userAvatar}
                                        onError={(error) => console.log('Failed to load user avatar:', error.nativeEvent.error)}
                                    />
                                </View>

                            )}

                            {/* 평가 버튼 추가 */}

                        </View>
                    ))}
                </ScrollView>
                <View style={styles.inputArea}>
                    <TextInput
                        style={styles.input}
                        value={input}
                        onChangeText={handleInputChange}
                        placeholder="이야기 입력하기.."
                        onSubmitEditing={sendMessage}
                        placeholderTextColor="#707070" // placeholder 색상을 연한 회색으로 설정
                    />
                    <TouchableOpacity onPress={sendMessage} style={styles.iconButton}>
                        <Ionicons name="volume-high" size={24} color="#fff" />
                    </TouchableOpacity>
                </View>
            </View>
        </KeyboardAvoidingView>
    );
}
const styles = StyleSheet.create({
    // 시간과 평가 버튼을 함께 감싸는 컨테이너
    timeContainer: {
        flexDirection: 'column', // 평가 버튼과 시간을 세로로 정렬
        alignItems: 'flex-start', // 왼쪽 정렬
        gap: 2, // 평가 버튼과 시간 사이 간격
    },

    // 평가 버튼을 감싸는 컨테이너
    evaluationContainer: {
        flexDirection: 'row', // 버튼들을 가로로 정렬
        alignItems: 'center', // 버튼들을 수직으로 중앙 정렬
        backgroundColor: 'white', // 배경색 흰색
        borderRadius: 12, // 모서리 둥글게
        padding: 2, // 내부 여백
        marginBottom: 2, // 시간과의 세로 간격
        shadowColor: "#000", // 그림자 색상
        left: -5,
        shadowOffset: {
            width: 0,
            height: 1,
        },
        shadowOpacity: 0.18,
        shadowRadius: 1.0,
        elevation: 1,
    },
    // 평가 버튼의 스타일
    evaluationButton: {
        padding: 2,
        marginHorizontal: 2,
    },

    // 활성화된 평가 버튼의 스타일
    evaluationButtonActive: {
        backgroundColor: '#f8f9fa',
        borderRadius: 8,
    },

    // 메시지와 시간 텍스트를 감싸는 컨테이너
    messageTimeContainer: {
        flexDirection: 'row', // 시간과 메시지를 가로로 정렬
        alignItems: 'flex-end', // 메시지를 수직으로 아래 정렬
        gap: 0, // 요소 간 간격 설정
        marginTop: -3, // 이름과의 간격을 좁히기 위해 위치를 위로 조정
    },

    // 메시지 시간 텍스트 스타일
    timeText: {
        fontSize: 12, // 텍스트 크기
        color: '#999', // 텍스트 색상
        marginTop: 2, // 평가 버튼과의 간격
        left: -5,
    },

    // 메시지의 기본 스타일
    message: {
        padding: 8, // 내부 여백
        borderRadius: 15, // 둥근 모서리 적용
        maxWidth: '100%', // 최대 너비 100%
    },

    // 사용자 메시지의 스타일
    userMessage: {
        backgroundColor: '#4a9960', // 사용자 메시지 배경색
        marginLeft: 5,  // 말풍선 꼬리 공간 확보
        borderTopRightRadius: 3, // 오른쪽 상단 모서리를 더 둥글게
        top: 5,
        left: -5,
    },

    // 전체 컨테이너 스타일
    container: {
        flex: 1, // 화면을 가득 채움
        backgroundColor: '#FFFFFF', // 배경색 흰색
        justifyContent: 'center', // 세로 중앙 정렬
        alignItems: 'center', // 가로 중앙 정렬
    },

    // 채팅 영역 스타일
    chatArea: {
        flex: 1, // 화면을 가득 채움
        padding: 8, // 내부 여백
        width: '100%', // 전체 너비 사용
    },

    // 메시지 컨테이너 스타일
    messageContainer: {
        flexDirection: 'row', // 메시지와 아바타를 가로로 정렬
        alignItems: 'flex-start', // 수직으로 위쪽 정렬
        marginVertical: 4, // 위아래 여백
        marginBottom: 20, // 메시지 간격
        paddingHorizontal: 6, // 좌우 여백
        position: 'relative', // 자식 요소의 위치 설정
    },

    // 사용자 메시지 컨테이너 스타일
    userMessageContainer: {
        justifyContent: 'flex-end', // 오른쪽 정렬
    },

    // 봇 메시지 컨테이너 스타일
    botMessageContainer: {
        justifyContent: 'flex-start', // 왼쪽 정렬
    },

    // 아바타 컨테이너 스타일
    avatarContainer: {
        width: 36, // 아바타 너비
        height: 36, // 아바타 높이
        top: 2, // 약간 위로 위치 조정
        borderRadius: 18, // 원형 모양
        overflow: 'hidden', // 넘치는 부분을 숨김
    },

    // 사용자 아바타 이미지 스타일
    userAvatar: {
        width: '100%',
        height: '100%',
        top: 2,
        resizeMode: 'cover', // 사용자가 설정한 프로필 사진에 맞춰서 조정
        borderRadius: 18, // 원형으로 조정
        borderWidth: 1,
    },

    // 챗봇 아바타 이미지 스타일
    botAvatar: {
        width: '100%',
        height: '100%',
        top: 2,
        resizeMode: 'contain', // 기본 이미지에 맞춰 조정
        borderRadius: 10, // 사각형에 더 가까운 스타일
        borderWidth: 1,
    },

    // 메시지 컨텐츠 스타일
    messageContent: {
        maxWidth: '70%', // 메시지 최대 너비
        marginHorizontal: -3, // 좌우 마진
        position: 'relative', // 자식 요소의 위치 설정
    },

    // 사용자 메시지 컨텐츠 정렬 스타일
    userMessageContent: {
        alignItems: 'flex-end', // 오른쪽 정렬
    },

    // 봇 메시지 컨텐츠 정렬 스타일
    botMessageContent: {
        alignItems: 'flex-start', // 왼쪽 정렬
        marginTop: -2, // 이름과 메시지 버블 사이의 간격을 줄이기 위한 위치 조정
    },

    // 채팅 컨텐츠 스타일
    chatContent: {
        paddingVertical: 10, // 위아래 여백
        flexGrow: 1, // 컨텐츠가 적을 때도 스크롤 가능하도록
    },

    // 봇 메시지 컨텐츠 정렬 스타일
    botMessage: {
        backgroundColor: '#ECECEC', // 배경색 설정
        marginRight: 12, // 말풍선 꼬리 공간 확보
        borderTopLeftRadius: 3, // 왼쪽 상단 모서리를 더 둥글게
        position: 'relative', // 상대적 위치 설정으로 정확한 배치 가능
        top: 5, // 기본 위치 설정 (위치 조정이 필요한 경우 수정)
        marginBottom: 7,
    },

    // 발신자 이름 텍스트 스타일
    senderName: {
        fontSize: 13, // 텍스트 크기
        fontWeight: 'bold', // 텍스트 두껍게
        marginBottom: 2, // 버블과의 간격을 최소화
        color: '#555', // 텍스트 색상
        paddingLeft: 1, // 말풍선 꼬리 공간 확보
        left: -5,
    },

    // 봇 발신자 이름 정렬 스타일
    botSenderName: {
        textAlign: 'left', // 텍스트 왼쪽 정렬
    },

    // 사용자 발신자 이름 정렬 스타일
    userSenderName: {
        textAlign: 'right', // 텍스트 오른쪽 정렬
        paddingLeft: 0, // 왼쪽 여백 제거
        paddingRight: 1, // 오른쪽 여백
    },

    // 메시지 꼬리 스타일
    messageTail: {
        position: 'absolute',
        width: 0,
        height: 0,
        borderStyle: 'solid',
        borderWidth: 6,
    },

    // 사용자 메시지 꼬리 스타일
    userMessageTail: {
        right: -8,
        top: 8,
        borderColor: 'transparent transparent transparent #4a9960',
    },

    // 봇 메시지 꼬리 스타일
    botMessageTail: {
        left: -8,
        top: 8,
        borderColor: 'transparent #ECECEC transparent transparent',
    },

    // 메시지 텍스트 스타일
    messageText: {
        fontSize: 16, // 텍스트 크기
    },

    // 사용자 메시지 텍스트 색상
    userMessageText: {
        color: '#FFFFFF', // 흰색 텍스트
    },

    // 봇 메시지 텍스트 색상
    botMessageText: {
        color: '#000000', // 검은색 텍스트
    },

    // 입력 영역 스타일
    inputArea: {
        flexDirection: 'row', // 입력창과 버튼을 가로로 정렬
        padding: 10, // 내부 여백
        borderTopWidth: 1, // 위쪽 테두리
        borderColor: '#ddd', // 테두리 색상
        backgroundColor: '#fff', // 배경색 흰색
        width: '100%', // 전체 너비 사용
    },

    // 입력창 스타일
    input: {
        flex: 1, // 남은 공간 모두 사용
        marginRight: 10, // 오른쪽 여백
        borderWidth: 1, // 테두리 너비
        borderColor: '#ccc', // 테두리 색상
        borderRadius: 20, // 둥근 모서리
        paddingHorizontal: 10, // 좌우 여백
    },

    // 아이콘 버튼 스타일 (메시지 전송 버튼)
    iconButton: {
        backgroundColor: '#4a9960', // 버튼 배경색
        borderRadius: 25, // 둥근 모서리
        padding: 10, // 내부 여백
        justifyContent: 'center', // 중앙 정렬
        alignItems: 'center', // 중앙 정렬
    },
});
