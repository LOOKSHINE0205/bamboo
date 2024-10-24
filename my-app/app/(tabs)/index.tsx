import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, StyleSheet, Image } from 'react-native';
import axios from 'axios';
import Ionicons from 'react-native-vector-icons/Ionicons';
// @ts-ignore
import BambooHead from '../../assets/images/bamboo_head.png';

// 메시지 구조를 정의하는 인터페이스
interface Message {
    sender: string; // 'user' 또는 'bot'을 나타내는 문자열로, 메시지의 발신자를 나타냅니다.
    text: string; // 메시지 내용
    avatar: any; // 발신자의 아바타 이미지 (React Native의 Image 컴포넌트에 사용될 수 있는 이미지)
    name: string; // 발신자의 이름 (사용자 이름 또는 챗봇 이름)
    timestamp: string; // 메시지가 전송된 시간을 저장하는 문자열
    showTimestamp?: boolean; // 시간 표시 여부를 결정하는 플래그 (옵션)
    evaluation?: 'like' | 'dislike' | null; // 메시지에 대한 평가 상태 ('like', 'dislike', 또는 평가 없음)
}

export default function ChatbotPage() {
    // 상태 변수들 정의
    const [messages, setMessages] = useState<Message[]>([]); // 메시지 리스트
    const [input, setInput] = useState(''); // 사용자 입력 텍스트
    const [userName, setUserName] = useState<string>(''); // 사용자 이름
    const [chatbotName, setChatbotName] = useState<string>(''); // 챗봇 이름
    const [userMessageCount, setUserMessageCount] = useState(0); // 사용자 메시지 개수 카운트
    const scrollViewRef = useRef<ScrollView>(null); // 스크롤뷰 참조

    // 서버 URL
    const serverUrl = 'http://192.168.21.142:8082/api/chat/message';
    const userInfoUrl = 'http://10.0.2.2:8082/api/user/info';

    // 사용자 정보 가져오기
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

    // 메시지가 추가될 때 스크롤을 하단으로 자동 이동
    useEffect(() => {
        if (scrollViewRef.current && messages.length > 0) {
            scrollViewRef.current.scrollToEnd({ animated: true });
        }
    }, [messages]);

    // 챗봇 응답을 서버에서 가져오는 함수
    const sendBotResponse = async (userInput: string) => {
        try {
            const response = await axios.post(serverUrl, userInput, {
                headers: { 'Content-Type': 'text/plain' },
            });

            // 챗봇 응답 메시지 생성
            const botMessage: Message = {
                sender: 'bot',
                text: response.data,
                avatar: BambooHead,
                name: chatbotName || '챗봇',
                timestamp: getCurrentTime(),
                showTimestamp: true,
            };

            // 메시지 리스트 업데이트 및 시간 표시 여부 설정
            setMessages(prevMessages => {
                const newMessages = [...prevMessages, botMessage];
                return newMessages.map((msg, index) => ({
                    ...msg,
                    showTimestamp: shouldShowTimestamp(index, msg, newMessages)
                }));
            });
            setUserMessageCount(0); // 사용자 메시지 개수 초기화
        } catch (error) {
            console.error('Error:', error);
            // 오류 발생 시 챗봇 응답 대체 메시지
            const errorMessage: Message = {
                sender: 'bot',
                text: '챗봇 응답을 가져올 수 없습니다.',
                avatar: BambooHead,
                name: chatbotName || '챗봇',
                timestamp: getCurrentTime(),
                showTimestamp: true,
            };

            setMessages(prevMessages => {
                const newMessages = [...prevMessages, errorMessage];
                return newMessages.map((msg, index) => ({
                    ...msg,
                    showTimestamp: shouldShowTimestamp(index, msg, newMessages)
                }));
            });
            setUserMessageCount(0); // 사용자 메시지 개수 초기화
        }
    };

    // 사용자가 메시지에 좋아요/싫어요 평가를 할 수 있게 하는 함수
    const handleEvaluation = (messageIndex: number, type: 'like' | 'dislike') => {
        setMessages(prevMessages => {
            return prevMessages.map((msg, index) => {
                if (index === messageIndex) {
                    // 같은 버튼을 다시 클릭하면 평가 취소
                    if (msg.evaluation === type) {
                        return { ...msg, evaluation: null };
                    }
                    return { ...msg, evaluation: type };
                }
                return msg;
            });
        });
    };

    // 챗봇 메시지에 대한 평가 버튼 컴포넌트
    const EvaluationButtons = ({ message, index }: { message: Message; index: number }) => {
        if (message.sender !== 'bot') return null;

        return (
            <View style={styles.evaluationContainer}>
                <TouchableOpacity
                    onPress={() => handleEvaluation(index, 'like')}
                    style={[
                        styles.evaluationButton,
                        message.evaluation === 'like' && styles.evaluationButtonActive
                    ]}
                >
                    <Ionicons
                        name={message.evaluation === 'like' ? "thumbs-up" : "thumbs-up-outline"}
                        size={14}  // 작은 크기의 아이콘
                        color={message.evaluation === 'like' ? "#4a9960" : "#666"}
                    />
                </TouchableOpacity>
                <TouchableOpacity
                    onPress={() => handleEvaluation(index, 'dislike')}
                    style={[
                        styles.evaluationButton,
                        message.evaluation === 'dislike' && styles.evaluationButtonActive
                    ]}
                >
                    <Ionicons
                        name={message.evaluation === 'dislike' ? "thumbs-down" : "thumbs-down-outline"}
                        size={14}  // 작은 크기의 아이콘
                        color={message.evaluation === 'dislike' ? "#e74c3c" : "#666"}
                    />
                </TouchableOpacity>
            </View>
        );
    };

    // 현재 시간을 가져오는 함수 (오전/오후 형식)
    const getCurrentTime = (): string => {
        const now = new Date();
        let hours = now.getHours();
        const minutes = now.getMinutes().toString().padStart(2, '0');
        const ampm = hours >= 12 ? '오후' : '오전';
        hours = hours % 12;
        hours = hours ? hours : 12;
        return `${ampm} ${hours}:${minutes}`;
    };

    // 시간 표시 여부를 결정하는 함수
    const shouldShowTimestamp = (messageIndex: number, currentMessage: Message, allMessages: Message[]): boolean => {
        // 봇 메시지는 항상 시간 표시
        if (currentMessage.sender === 'bot') return true;

        // 사용자 메시지의 경우, 다음 조건들을 확인
        let nextMessage = allMessages[messageIndex + 1];

        // 1. 현재 메시지가 마지막 메시지인 경우
        if (!nextMessage) return true;

        // 2. 다음 메시지가 봇 메시지인 경우
        if (nextMessage.sender === 'bot') return true;

        // 3. 다음 메시지와 시간이 다른 경우
        if (nextMessage.timestamp !== currentMessage.timestamp) return true;

        // 그 외의 경우는 시간을 표시하지 않음
        return false;
    };

    // 사용자 메시지를 전송하는 함수
    const sendMessage = () => {
        if (input.trim()) {
            const currentTime = getCurrentTime();
            const userMessage: Message = {
                sender: 'user',
                text: input.trim(),
                avatar: BambooHead,
                name: userName || '사용자',
                timestamp: currentTime,
                showTimestamp: false, // 초기값은 false로 설정
            };

            // 메시지 리스트 업데이트 및 시간 표시 여부 설정
            setMessages(prevMessages => {
                const newMessages = [...prevMessages, userMessage];
                return newMessages.map((msg, index) => ({
                    ...msg,
                    showTimestamp: shouldShowTimestamp(index, msg, newMessages)
                }));
            });

            setInput('');
            setUserMessageCount(prev => prev + 1);

            // 사용자 메시지가 2개가 되면 챗봇 응답 전송
            if (userMessageCount + 1 >= 2) {
                sendBotResponse(input.trim());
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
                        {/* 챗봇 아바타 */}
                        {msg.sender === 'bot' && (
                            <View style={styles.avatarContainer}>
                                <Image source={msg.avatar} style={styles.avatar} />
                            </View>
                        )}
                        <View style={[
                            styles.messageContent,
                            msg.sender === 'user' ? styles.userMessageContent : styles.botMessageContent
                        ]}>
                            {/* 발신자 이름 */}
                            <Text style={[
                                styles.senderName,
                                msg.sender === 'user' ? styles.userSenderName : styles.botSenderName
                            ]}>
                                {msg.name}
                            </Text>
                            <View style={styles.messageTimeContainer}>
                                {/* 사용자 메시지 시간 표시 */}
                                {msg.sender === 'user' && msg.showTimestamp && (
                                    <Text style={styles.timeText}>
                                        {msg.timestamp}
                                    </Text>
                                )}
                                {/* 메시지 버블 */}
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
                                {/* 챗봇 메시지 시간과 평가 버튼 */}
                                {msg.sender === 'bot' && msg.showTimestamp && (
                                    <View style={styles.timeContainer}>
                                        {/* 평가 버튼 컨테이너 */}
                                        <View style={styles.evaluationContainer}>
                                            <TouchableOpacity
                                                onPress={() => handleEvaluation(index, 'like')}
                                                style={[
                                                    styles.evaluationButton,
                                                    msg.evaluation === 'like' && styles.evaluationButtonActive
                                                ]}
                                            >
                                                <Ionicons
                                                    name={msg.evaluation === 'like' ? "thumbs-up" : "thumbs-up-outline"}
                                                    size={14}
                                                    color={msg.evaluation === 'like' ? "#4a9960" : "#666"}
                                                />
                                            </TouchableOpacity>
                                            <TouchableOpacity
                                                onPress={() => handleEvaluation(index, 'dislike')}
                                                style={[
                                                    styles.evaluationButton,
                                                    msg.evaluation === 'dislike' && styles.evaluationButtonActive
                                                ]}
                                            >
                                                <Ionicons
                                                    name={msg.evaluation === 'dislike' ? "thumbs-down" : "thumbs-down-outline"}
                                                    size={14}
                                                    color={msg.evaluation === 'dislike' ? "#e74c3c" : "#666"}
                                                />
                                            </TouchableOpacity>
                                        </View>
                                        {/* 시간 표시 */}
                                        <Text style={styles.timeText}>
                                            {msg.timestamp}
                                        </Text>
                                    </View>
                                )}
                            </View>
                        </View>
                        {/* 사용자 아바타 */}
                        {msg.sender === 'user' && (
                            <View style={styles.avatarContainer}>
                                <Image source={msg.avatar} style={styles.avatar} />
                            </View>
                        )}
                    </View>
                ))}
            </ScrollView>
            {/* 입력 영역 */}
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
        left:-5,
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
        marginLeft: 12,  // 말풍선 꼬리 공간 확보
        borderTopRightRadius: 3, // 오른쪽 상단 모서리를 더 둥글게
        top:5,
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
        marginBottom: 24, // 메시지 간격
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

    // 아바타 이미지 스타일
    avatar: {
        width: '100%', // 아바타 너비 100%
        height: '100%', // 아바타 높이 100%
        top: 2, // 약간 위로 위치 조정
        resizeMode: 'contain', // 이미지가 컨테이너에 맞춰 조정됨
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
       marginBottom:7,
    },

    // 발신자 이름 텍스트 스타일
    senderName: {
       fontSize: 13, // 텍스트 크기
       fontWeight: 'bold', // 텍스트 두껍게
       marginBottom: 2, // 버블과의 간격을 최소화
       color: '#555', // 텍스트 색상
       paddingLeft: 1, // 말풍선 꼬리 공간 확보
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