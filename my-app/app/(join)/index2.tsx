import React, { useState, useRef, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, useWindowDimensions, TextInput, Image, Animated } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import JoinBG from '../../components/JoinBG';

const KeywordSelectionScreen = () => {
  const router = useRouter();
  const { userData: initialUserData } = useLocalSearchParams();
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [testResults, setTestResults] = useState<string>('');
  const [chatbotName, setChatbotName] = useState('');

  const handleSelectResult = (value: '0' | '1') => {
    setTestResults((prevResults) => prevResults + value);
  };

  const { width: screenWidth, height: screenHeight } = useWindowDimensions();

  const fadeAnim = useRef(new Animated.Value(1)).current;
  const cloudAnim = useRef(new Animated.Value(1)).current;
  const cloudScale = useRef(new Animated.Value(0.1)).current;
  const chatbotScale = useRef(new Animated.Value(0)).current;

  const questions = [
    {
      question: '밤부의 성격을 형성하는 단계 입니다.\n답변을 선택해주세요.',
      aiResponse: "나는 '무인도에 떨어지면 어떡하지?' 같은 생각을",
      responses: ['종종 있다', '없거나 드물다'],
    },
    {
      question: '다음 질문입니다.\n어떻게 생각하시나요?',
      aiResponse: '당신이 만약 \n무인도에 떨어진다면',
      responses: ['혼자라서 너무 외로울것 같다', '무섭지만 혼자라 편할 것 같기도 하다'],
    },
    {
      question: '마지막 질문입니다.\n이 대화가 도움이 되셨나요?',
      aiResponse: '같이 무인도에 떨어진 사람이 계속 울고있다. 이때 나는?',
      responses: ['무섭긴 하겠지만.. 빨리 일을 시작해야 하는데.. 약간 답답하다', '나도 무서워.. 옆에 앉아서 같이 운다'],
    },
    {
      question: '마지막 질문입니다.\n이 대화가 도움이 되셨나요?',
      aiResponse: '무인도에서 계속 살아가야 한다면 나는',
      responses: ['이렇게 된 김에 자유로운 삶을 산다', '안정적으로 살기 위해 집도 짓고 시설을 설치한다'],
    },
    {
      question: '밤부의 이름을 지어주세요',
      aiResponse: '좋은 이름을 기대할게요!',
      responses: [],
    },
  ];

  const validIndex = Math.min(Math.max(currentQuestionIndex, 0), questions.length - 1);
  const currentQuestion = questions[validIndex];
  const isLastQuestion = validIndex === questions.length - 1;
  const isFirstQuestion = validIndex === 0;

  const startChatbotAnimation = () => {
    chatbotScale.setValue(0);
    Animated.timing(chatbotScale, {
      toValue: 1,
      duration: 500,
      useNativeDriver: true,
    }).start();
  };

  const hideChatbotAnimation = (callback: () => void) => {
    Animated.timing(chatbotScale, {
      toValue: 0,
      duration: 300,
      useNativeDriver: true,
    }).start(callback);
  };

  const handleResponsePress = (index: number) => {
    handleSelectResult(index === 0 ? '0' : '1');

    if (currentQuestionIndex === questions.length - 2) {
      startCloudAnimation();
    }

    Animated.timing(fadeAnim, {
      toValue: 0,
      duration: 300,
      useNativeDriver: true,
    }).start(() => {
      setCurrentQuestionIndex((prevIndex) => prevIndex + 1);
      fadeAnim.setValue(0);
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }).start();

      updateCloudScale(currentQuestionIndex + 1);
    });
  };

  const handlePrevious = () => {
    if (!isFirstQuestion) {
      if (currentQuestionIndex === questions.length - 1) {
        cloudAnim.setValue(1);
        hideChatbotAnimation(() => {
          Animated.timing(fadeAnim, {
            toValue: 0,
            duration: 300,
            useNativeDriver: true,
          }).start(() => {
            const newIndex = currentQuestionIndex - 1;
            setCurrentQuestionIndex(newIndex);
            fadeAnim.setValue(0);
            Animated.timing(fadeAnim, {
              toValue: 1,
              duration: 300,
              useNativeDriver: true,
            }).start();

            updateCloudScale(newIndex);
          });
        });
      } else {
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }).start(() => {
          const newIndex = currentQuestionIndex - 1;
          setCurrentQuestionIndex(newIndex);
          fadeAnim.setValue(0);
          Animated.timing(fadeAnim, {
            toValue: 1,
            duration: 300,
            useNativeDriver: true,
          }).start();

          updateCloudScale(newIndex);
        });
      }
    }
  };

  const startCloudAnimation = () => {
    Animated.timing(cloudAnim, {
      toValue: 0,
      duration: 300,
      useNativeDriver: true,
    }).start();
  };

  const updateCloudScale = (index: number) => {
    let targetScale = 1;
    if (index === 0) targetScale = 0.1;
    else if (index === 1) targetScale = 0.3;
    else if (index === 2) targetScale = 0.6;
    else if (index > 2) targetScale = 1;

    Animated.timing(cloudScale, {
      toValue: targetScale,
      duration: 300,
      useNativeDriver: true,
    }).start();
  };

  useEffect(() => {
    if (isLastQuestion) {
      startChatbotAnimation();
    } else {
      chatbotScale.setValue(0);
    }
  }, [currentQuestionIndex]);

  const handleConfirm = () => {
    if (chatbotName.trim()) {
      router.push({
        pathname: './sendUserInfo',
        params: {
          userData: initialUserData,
          testResults: testResults,
          chatbotName,
        },
      });
    } else {
      alert('챗봇 이름을 입력해주세요.');
    }
  };

  return (
    <JoinBG>
      <ScrollView contentContainerStyle={[styles.container, { paddingVertical: screenHeight * 0.05 }]}>
        <View style={[styles.chatBubble, { width: screenWidth * 0.9 }]}>
          <Text style={styles.chatText}>{currentQuestion.question}</Text>
        </View>

        <Animated.View style={[styles.aiResponse, { opacity: fadeAnim, width: screenWidth * 0.85 }]}>
          <Text style={styles.aiResponseText}>{currentQuestion.aiResponse}</Text>
        </Animated.View>

        {!isLastQuestion && (
          <Animated.View
            style={[
              styles.cloudContainer,
              {
                transform: [{ scale: cloudScale }],
                opacity: cloudAnim,
                width: screenWidth * 0.6,
                height: screenWidth * 0.3,
                alignSelf: 'center',
              },
            ]}
          >
            <Image
              source={require('../../assets/images/구름.png')}
              style={{ width: '100%', height: '100%' }}
              resizeMode="contain"
            />
          </Animated.View>
        )}

        {isLastQuestion && (
          <View style={styles.chatbotContainer}>
            <Animated.Image
              source={require('../../assets/images/bamboo_head.png')}
              style={[
                styles.chatbotImage,
                {
                  width: screenWidth * 0.4,
                  height: screenWidth * 0.4,
                  transform: [{ scale: chatbotScale }],
                },
              ]}
              resizeMode="contain"
            />
            <TextInput
              style={[styles.nameInput, { width: screenWidth * 0.8 }]}
              value={chatbotName}
              onChangeText={setChatbotName}
              placeholder="밤부의 이름을 입력하세요"
              placeholderTextColor="#999"
            />

            <View style={styles.navigationButtons}>
              {currentQuestionIndex > 0 && (
                <TouchableOpacity style={[styles.navButton, { paddingVertical: screenHeight * 0.02 }]} onPress={handlePrevious}>
                  <Text style={styles.navButtonText}>이전</Text>
                </TouchableOpacity>
              )}
              <TouchableOpacity
                style={[styles.navButton, { paddingVertical: screenHeight * 0.02, backgroundColor: chatbotName.trim() ? '#4a9960' : '#ccc' }]}
                onPress={handleConfirm}
                disabled={!chatbotName.trim()}
              >
                <Text style={[styles.navButtonText, { color: '#fff' }]}>확인</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {!isLastQuestion && (
          <View style={[styles.responseContainer, { width: screenWidth * 0.9, marginBottom: isFirstQuestion ? '11%' : '0%' }]}>
            {currentQuestion.responses.map((response, index) => (
              <Animated.View key={index} style={[styles.responseButton, { opacity: fadeAnim, width: screenWidth * 0.85 }]}>
                <TouchableOpacity onPress={() => handleResponsePress(index)}>
                  <Text style={styles.responseText}>{response}</Text>
                </TouchableOpacity>
              </Animated.View>
            ))}
            {currentQuestionIndex > 0 && (
              <View style={styles.navigationButtons}>
                <TouchableOpacity style={[styles.navButton, { paddingVertical: screenHeight * 0.02 }]} onPress={handlePrevious}>
                  <Text style={styles.navButtonText}>이전</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        )}
      </ScrollView>
    </JoinBG>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    alignItems: 'center',
  },
  chatBubble: {
    borderRadius: 20,
    padding: '4%',
    marginBottom: '5%',
  },
  chatText: {
    fontSize: 16,
    color: '#000',
    textAlign: 'center',
  },
  chatbotContainer: {
    alignItems: 'center',
    marginVertical: '5%',
  },
  chatbotImage: {
    marginBottom: 20,
  },
  nameInput: {
    borderWidth: 1,
    borderColor: '#999',
    borderRadius: 10,
    padding: 10,
    fontSize: 16,
    textAlign: 'center',
    backgroundColor: '#FFF',
  },
  responseContainer: {
    alignItems: 'center',
    position: 'absolute',
    bottom: 20,
    width: '100%',
    paddingHorizontal: '5%',
  },
  aiResponse: {
    backgroundColor: '#E8E8E8',
    borderRadius: 20,
    padding: '4%',
    alignSelf: 'center',
    marginBottom: '5%',
    maxWidth: '50%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3.84,
    elevation: 5,
  },
  aiResponseText: {
    fontSize: 16,
  },
  responseButton: {
    backgroundColor: '#FFF',
    borderRadius: 20,
    padding: '4%',
    marginBottom: '3%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3.84,
    elevation: 5,
  },
  responseText: {
    fontSize: 16,
    textAlign: 'center',
  },
  navigationButtons: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: '5%',
    marginBottom: 20,
  },
  navButton: {
    backgroundColor: '#FFF',
    borderRadius: 15,
    paddingHorizontal: '4%',
    marginHorizontal: '2%',
  },
  navButtonText: {
    fontSize: 14,
    color: '#000',
  },
});

export default KeywordSelectionScreen;