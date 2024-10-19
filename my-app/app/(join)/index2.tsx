import React, { useState, useRef, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, useWindowDimensions, TextInput, Image, Animated } from 'react-native';
import { useRouter } from 'expo-router';
import JoinBG from '../../components/JoinBG';

const KeywordSelectionScreen = () => {
  const router = useRouter();
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [bambooName, setBambooName] = useState('');

  // 화면 크기를 가져오는 useWindowDimensions() 훅
  const { width: screenWidth, height: screenHeight } = useWindowDimensions();

  // 애니메이션을 위한 Animated Value
  const slideAnim = useRef(new Animated.Value(0)).current;
  const responseAnim = useRef(new Animated.Value(screenWidth)).current;

  const question = '밤부의 성격을 형성하는 단계 입니다.\n답변을 선택해주세요.';
  const questions = [
    {
      question: question,
      aiResponse: "아 바보야",
      responses: [
        '응..',
        '뭐라고 했나',
        '네가바보라는건인정할수가없군',
        '솔직히 바보는 너인거 같아..'
      ]
    },
    {
      question: "다음 질문입니다.\n어떻게 생각하시나요?",
      aiResponse: "흠... 어렵네요",
      responses: [
        '그렇군요',
        '동의합니다',
        '잘 모르겠어요',
        '다시 설명해주세요'
      ]
    },
    {
      question: "마지막 질문입니다.\n이 대화가 도움이 되셨나요?",
      aiResponse: "솔직히 말씀해 주세요",
      responses: [
        '네, 많은 도움이 되었어요',
        '조금 도움이 되었어요',
        '별로 도움이 되지 않았어요',
        '전혀 도움이 되지 않았어요'
      ]
    },
    {
      question: "밤부의 이름을 지어주세요",
      aiResponse: "좋은 이름을 기대할게요!",
      responses: [], // 입력 필드를 보여줄 것이므로 빈 배열로 남겨둠
    },
  ];

  const currentQuestion = questions[currentQuestionIndex];
  const isLastQuestion = currentQuestionIndex === questions.length - 1;
  const isFirstQuestion = currentQuestionIndex === 0;

  const startSlideAnimation = () => {
    const toValueStart = -screenWidth;
    const toValueEnd = 0;

    Animated.sequence([
      Animated.timing(slideAnim, {
        toValue: toValueStart,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: -screenWidth,
        duration: 0,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: toValueEnd,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const startResponseAnimation = () => {
    responseAnim.setValue(screenWidth);
    Animated.timing(responseAnim, {
      toValue: 0,
      duration: 300,
      useNativeDriver: true,
    }).start();
  };

  const endResponseAnimation = (callback) => {
    Animated.timing(responseAnim, {
      toValue: screenWidth,
      duration: 300,
      useNativeDriver: true,
    }).start(callback);
  };

  const handleResponsePress = (response) => {
    Animated.parallel([
      Animated.timing(slideAnim, {
        toValue: -screenWidth,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(responseAnim, {
        toValue: screenWidth,
        duration: 300,
        useNativeDriver: true,
      })
    ]).start(() => {
      if (isLastQuestion) {
        router.push('../../(init)');
      } else {
        slideAnim.setValue(-screenWidth);
        responseAnim.setValue(screenWidth);
        setCurrentQuestionIndex((prevIndex) => prevIndex + 1);

        Animated.sequence([
          Animated.timing(slideAnim, {
            toValue: 0,
            duration: 300,
            useNativeDriver: true,
          }),
          Animated.delay(500),
          Animated.timing(responseAnim, {
            toValue: 0,
            duration: 300,
            useNativeDriver: true,
          })
        ]).start();
      }
    });
  };

  useEffect(() => {
    startResponseAnimation();
  }, [currentQuestionIndex]);

  const handlePrevious = () => {
    startSlideAnimation();

    endResponseAnimation(() => {
      if (!isFirstQuestion) {
        setCurrentQuestionIndex((prevIndex) => prevIndex - 1);
      }
      startResponseAnimation();
    });
  };

  return (
    <JoinBG>
      <ScrollView contentContainerStyle={[styles.container, { paddingVertical: screenHeight * 0.05 }]}>
        {/* 질문 표시 영역 */}
        <View style={[styles.chatBubble, { width: screenWidth * 0.9 }]}>
          <Text style={styles.chatText}>{currentQuestion.question}</Text>
        </View>

        {/* AI 응답 부분을 질문 아래로 이동 */}
        <Animated.View style={[styles.aiResponse, { transform: [{ translateX: slideAnim }], width: screenWidth * 0.85 }]}>
          <Text style={styles.aiResponseText}>{currentQuestion.aiResponse}</Text>
        </Animated.View>

        {/* 구름 이미지 (마지막 질문 전까지 표시) */}
        {!isLastQuestion && (
          <Image
            source={require('../../assets/images/구름.png')}
            style={[styles.cloudImage, { width: screenWidth * 0.6, height: screenWidth * 0.3 }]}
            resizeMode="contain"
          />
        )}

        {/* 밤부 이미지 및 이름 입력 영역 (마지막 질문일 때만 표시) */}
        {isLastQuestion && (
          <View style={styles.bambooContainer}>
            <Image
              source={require('../../assets/images/bamboo_head.png')}
              style={[styles.bambooImage, { width: screenWidth * 0.4, height: screenWidth * 0.4 }]}
              resizeMode="contain"
            />
            <TextInput
              style={[styles.nameInput, { width: screenWidth * 0.8 }]}
              value={bambooName}
              onChangeText={setBambooName}
              placeholder="밤부의 이름을 입력하세요"
              placeholderTextColor="#999"
            />

            <View style={styles.navigationButtons}>
              {currentQuestionIndex > 0 && (
                <TouchableOpacity style={[styles.navButton, { paddingVertical: screenHeight * 0.02 }]} onPress={handlePrevious}>
                  <Text style={styles.navButtonText}>이전</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
        )}

        {/* 응답 옵션 영역 (마지막 질문이 아닐 때만) */}
        {!isLastQuestion && (
          <View style={[styles.responseContainer, { width: screenWidth * 0.9 }]}>
            {currentQuestion.responses.map((response, index) => (
              <Animated.View key={index} style={[styles.responseButton, { transform: [{ translateX: responseAnim }], width: screenWidth * 0.85 }]}>
                <TouchableOpacity onPress={() => handleResponsePress(response)}>
                  <Text style={styles.responseText}>{response}</Text>
                </TouchableOpacity>
              </Animated.View>
            ))}

            <View style={styles.navigationButtons}>
              {currentQuestionIndex > 0 && (
                <TouchableOpacity style={[styles.navButton, { paddingVertical: screenHeight * 0.02 }]} onPress={handlePrevious}>
                  <Text style={styles.navButtonText}>이전</Text>
                </TouchableOpacity>
              )}
            </View>
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
  bambooContainer: {
    alignItems: 'center',
    marginVertical: '5%',
  },
  bambooImage: {
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
  cloudImage: {
    marginBottom: '5%',
    alignSelf: 'center',
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
