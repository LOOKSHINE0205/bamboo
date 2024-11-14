import React, {useState, useEffect, useRef, useLayoutEffect} from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    ScrollView,
    StyleSheet,
    Image,
    KeyboardAvoidingView,
    Platform
} from 'react-native';
import axios from 'axios';
import Ionicons from 'react-native-vector-icons/Ionicons';
import {getUserInfo, getUserProfileImage} from '../../storage/storageHelper';
import {useFocusEffect} from '@react-navigation/native';
import BambooHead from '../../assets/images/bamboo_head.png';
import BambooPanda from '../../assets/images/bamboo_panda.png';
import AsyncStorage from "@react-native-async-storage/async-storage";
import {serverAddress} from '../../components/Config';
import{ ChatMessage,getChatHistory} from "../../components/getChatHistory";

// 메시지 구조를 정의하는 인터페이스
interface Message {
    createdAt: string;
    sender: string;
    text: string;
    avatar: any;
    name: string;
    timestamp: string;
    showTimestamp?: boolean;
    evaluation?: 'like' | 'dislike' | null;
    chatIdx?: number;
}


export default function ChatbotPage() {

    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState('');
    const [userNick, setUserNick] = useState<string>('');
    const [chatbotName, setChatbotName] = useState<string>('');
    const [userAvatar, setUserAvatar] = useState(BambooPanda);
    const [userEmail, setUserEmail] = useState<string>('');
    const [isTyping, setIsTyping] = useState(false);
    const scrollViewRef = useRef<ScrollView>(null);
    const serverUrl = `${serverAddress}/api/chat/getChatResponse`;
    const [typingDots, setTypingDots] = useState(''); // 점 애니메이션을 위한 상태
    const [isCountdownStarted, setIsCountdownStarted] = useState(false);

    let countdownInterval: NodeJS.Timeout | null = null;
    let messagesToSend: string[] = [];
    const countdownDuration = 3; // 5초 카운트다운
    const messagesToSendRef = useRef<string[]>([]);
    const countdownIntervalRef = useRef<NodeJS.Timeout | null>(null);
    useEffect(() => {
        if (scrollViewRef.current) {
            scrollViewRef.current.scrollToEnd({animated: true});
        }
    }, [messages, isTyping,typingDots]); // messages와 isTyping 상태가 변경될 때마다 실행

    useLayoutEffect(() => {
        if (scrollViewRef.current) {
            scrollViewRef.current.scrollToEnd({ animated: false });
        }
    }, []); // 초기 로드 시에만 실행

    useEffect(() => {
      const fetchData = async () => {
        try {
          const userData = await getUserInfo();
          if (userData) {
            setUserNick(userData.userNick || '');
            setChatbotName(userData.chatbotName || '챗봇');
            setUserEmail(userData.userEmail);
          }
          const profileImage = await getUserProfileImage();
                setUserAvatar(profileImage ? { uri: `${profileImage}?${new Date().getTime()}` } : BambooPanda);  // 기본 아이콘 설정
              } catch (error) {
                console.error('데이터를 가져오는 데 실패했습니다:', error);
                setUserAvatar(BambooPanda);  // 오류 발생 시 기본 아이콘 설정
              }
      };

      fetchData();
    }, []);
 // 초기 로딩용 useEffect
    useEffect(() => {
        // isTyping이 true일 때 점 애니메이션 시작
        if (isTyping) {
            const typingInterval = setInterval(() => {
                setTypingDots((prev) => {
                    if (prev === '...') return ''; // 세 점 이후 초기화
                    return prev + '.'; // 점 추가
                });
            }, 500); // 0.5초마다 업데이트

            return () => clearInterval(typingInterval); // 컴포넌트가 언마운트될 때 타이머 정리
        } else {
            setTypingDots(''); // 타이핑이 끝나면 초기화
        }
    }, [isTyping]);

    useFocusEffect(
        React.useCallback(() => {
            const fetchData = async () => {
                try {
                    const userData = await getUserInfo();
                    if (userData) {
                        setUserNick(userData.userNick || '');
                        setChatbotName(userData.chatbotName || '챗봇');
                        setUserEmail(userData.userEmail);

                    }
                    const profileImage = await getUserProfileImage();
                    setUserAvatar(profileImage ? {uri: `${profileImage}?${new Date().getTime()}`} : BambooPanda);

                } catch (error) {
                    console.error('데이터를 가져오는 데 실패했습니다:', error);
                }
            };

            fetchData();
        }, [])
    );

    // 새로운 useEffect 추가하여 DB에서 채팅 기록 가져오기
    useEffect(() => {
        if (!userNick || !chatbotName) return;

        const loadChatHistory = async () => {
            try {
                const chatHistory = await getChatHistory();
                const formattedMessages = chatHistory.map((chat: ChatMessage) => ({
                    sender: chat.chatter === 'bot' ? 'bot' : 'user',
                    text: chat.chatContent,
                    avatar: chat.chatter === 'bot' ? BambooHead : userAvatar,
                    name: chat.chatter === 'bot' ? chatbotName : userNick,
                    timestamp: new Date(chat.createdAt).toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' }),
                    createdAt: new Date(chat.createdAt).toLocaleDateString('ko-KR'),
                    showTimestamp: true,
                    evaluation: chat.evaluation,
                    chatIdx: chat.chatIdx
                }));
                setMessages(formattedMessages);
            } catch (error) {
                console.error("Failed to load chat history:", error);
            }
        };

        loadChatHistory();
    }, [userNick, chatbotName, userAvatar]);

    // 평가 처리 함수
    const handleEvaluation = async (messageIndex: number, type: 'like' | 'dislike') => {
        const messageToUpdate = messages[messageIndex];
        const newEvaluation = messageToUpdate.evaluation === type ? null : type;

        // 메시지 상태 업데이트
        setMessages(prevMessages =>
            prevMessages.map((msg, index) => {
                if (index === messageIndex && msg.sender === 'bot') {
                    return {...msg, evaluation: newEvaluation};
                }
                return msg;
            })
        );

        // DB 업데이트 요청
        try {
            await axios.put(`${serverAddress}/api/chat/updateEvaluation`, {
                chatIdx: messageToUpdate.chatIdx,
                evaluation: newEvaluation
            });
            console.log('Evaluation updated in DB:', newEvaluation);
        } catch (error) {
            console.error('Failed to update evaluation in DB:', error);
        }
    };

    useEffect(() => {
        if (scrollViewRef.current && messages.length > 0) {
            scrollViewRef.current.scrollToEnd({animated: true});
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
        setIsTyping(true); // 전송 중 상태 표시 시작
        if (messagesToSendRef.current.length > 0) {
            const combinedMessages = messagesToSendRef.current.join(' ');
            const croomIdx = await AsyncStorage.getItem('croomIdx');

            if (!croomIdx) {
                console.error("croomIdx not found in AsyncStorage");
                return;
            }
            // console.log("croomIdx found in AsyncStorage", croomIdx);

            const payload = {
                userEmail: userEmail,
                croomIdx: parseInt(croomIdx),
                chatter: "user",
                chatContent: combinedMessages,
            };

            try {
                const response = await axios.post(serverUrl, payload, {
                    headers: {'Content-Type': 'application/json'},
                });
                setIsTyping(false); // 응답이 도착하면 전송 중 상태 종료
                console.log(response.data)
                console.log(payload)
                // 구조화된 응답 데이터가 있는지 확인
                const botMessageContent = response.data.chatContent;
                const chatIdx = response.data.chatIdx || null;
                const evaluation = response.data.evaluation || null;

                if (typeof botMessageContent !== 'string') {
                    throw new Error('Invalid bot response format');
                }

                // 새 메시지를 상태에 추가
                setMessages((prevMessages) => [
                    ...prevMessages,
                    {
                        sender: 'bot',
                        text: botMessageContent,
                        avatar: BambooHead,
                        name: chatbotName,
                        timestamp: getCurrentTime(),
                        showTimestamp: true,
                        evaluation,
                        chatIdx,
                    },
                ]);

                messagesToSendRef.current = []; // 초기화
            } catch (error) {
                console.error('Error sending bot response:', error);
                setIsTyping(false); // 오류가 발생해도 전송 중 상태 종료
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
        setIsTyping(false); // 입력 시 typing 상태 초기화
        if (text.trim() === '') {
            setIsTyping(false); // 입력이 비어있을 때는 ... 애니메이션 비활성화

            startCountdown(); // 입력이 비어있으면 카운트다운 시작
        } else {
            setIsTyping(false); // 입력이 비어있을 때는 ... 애니메이션 비활성화
            stopCountdown(); // 입력 중에는 카운트다운 중지
        }
    };

    // 메시지 전송 버튼을 눌렀을 때 호출되는 함수
    const sendMessage = () => {
        if (input.trim()) {
            const userMessage: Message = {
                sender: 'user',
                text: input.trim(),
                avatar: userAvatar,
                name: userNick,
                timestamp: new Date().toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' }),
                createdAt: new Date().toLocaleDateString('ko-KR'),
                showTimestamp: true
            };

            setMessages(prevMessages => [...prevMessages, userMessage]);
            setInput('');
            setIsTyping(false);
            if (!isCountdownStarted) {
                startCountdown();
                setIsCountdownStarted(true);
            }
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

    // 평가 버튼 컴포넌트
    const EvaluationButtons = ({message, index}: { message: Message; index: number }) => {
        if (message.sender !== 'bot') return null;
        // console.log(`Message ${index} evaluation:`, message.evaluation);
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
    const renderDateHeaders = () => {
        let lastDate = '';

        return messages.map((msg, index) => {
            const showDateHeader = msg.createdAt !== lastDate;
            lastDate = msg.createdAt;

            return (
                <React.Fragment key={index}>
                    {showDateHeader && (
                        <View style={styles.dateHeaderContainer}>
                            <Text style={styles.dateHeader}>{msg.createdAt}</Text>

                        </View>
                    )}

                    <View
                        key={index}
                        style={[
                            styles.messageContainer,
                            msg.sender === 'user' ? styles.userMessageContainer : styles.botMessageContainer
                        ]}
                    >
                        {msg.sender === 'bot' && (
                            <View style={styles.avatarContainer}>
                                <Image source={msg.avatar} style={styles.botAvatar}/>
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
                                        <EvaluationButtons message={msg} index={index}/>
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
                                onError={() => {

                                  setUserAvatar(BambooPanda);  // 이미지 로드 오류 시 기본 이미지로 설정
                                }}
                              />
                            </View>
                        )}
                    </View>
                </React.Fragment>
            );
        });
    };

    return (
        <KeyboardAvoidingView
            style={{flex: 1}}
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
            keyboardVerticalOffset={Platform.OS === 'ios' ? 100 : 0}
        >
            <View style={styles.container}>
                <ScrollView
                    ref={scrollViewRef}
                    style={styles.chatArea}
                    contentContainerStyle={styles.chatContent}

                    showsVerticalScrollIndicator={false}
                    onContentSizeChange={() => scrollViewRef.current?.scrollToEnd({ animated: true })}
                >
                    {renderDateHeaders()}

                    {/* 챗봇이 응답을 작성 중일 때 점 애니메이션 표시 */}
                    {isTyping && (
                        <View style={[styles.messageContainer, styles.botMessageContainer]}>
                            <View style={styles.avatarContainer}>
                                <Image source={BambooHead} style={styles.botAvatar}/>
                            </View>
                            <View style={[styles.messageContent, styles.botMessageContent]}>
                                <View style={styles.message}>
                                    <Text style={styles.typingDots}>{typingDots || '.'}</Text>
                                </View>
                            </View>
                        </View>
                    )}
                </ScrollView>
                <View style={styles.inputArea}>
                    <TextInput
                        style={styles.input}
                        value={input}
                        onChangeText={handleInputChange}
                        placeholder="이야기 입력하기.."
                        onSubmitEditing={sendMessage}
                        placeholderTextColor="#707070"
                    />
                    <TouchableOpacity onPress={sendMessage} style={styles.iconButton}>
                        <Ionicons name="volume-high" size={24} color="#fff"/>
                    </TouchableOpacity>
                </View>
            </View>
        </KeyboardAvoidingView>
    );
}
const styles = StyleSheet.create({
    dateHeaderContainer: {
        backgroundColor: 'rgba(128, 128, 128, 0.2)', // 반투명 회색 배경
        marginVertical: 10, // 상하 여백 축소
        paddingVertical: 5, // 상하 패딩
        paddingHorizontal: 15, // 좌우 패딩 추가
        borderRadius: 15, // 둥근 테두리
        alignSelf: 'center', // 가운데 정렬
    },
    dateHeader: {
        textAlign: 'center',
        color: '#555', // 텍스트 색상 지정
        fontSize: 14, // 텍스트 크기 조정
    },
    // 시간과 평가 버튼을 함께 감싸는 컨테이너
    typingDots: {
        padding:0,
        fontSize: 30, // 점 크기를 크게 설정
        color: '#999999', // 점 색상을 회색으로 설정
        fontWeight: 'bold', // 점을 굵게 설정 (선택 사항)
    },
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
        padding: 10, // 내부 여백
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
        borderRadius: 15, // 원형으로 조정
    },

    // 챗봇 아바타 이미지 스타일
    botAvatar: {
        width: '100%',
        height: '100%',
        top: 2,
        resizeMode: 'contain', // 기본 이미지에 맞춰 조정
        borderRadius: 15, // 사각형에 더 가까운 스타일
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
