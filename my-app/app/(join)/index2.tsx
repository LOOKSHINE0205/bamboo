import React, { useState, useRef, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, useWindowDimensions, TextInput, Image, Animated } from 'react-native';
import { useRouter } from 'expo-router';
import JoinBG from '../../components/JoinBG';

const KeywordSelectionScreen = () => {
  const router = useRouter();
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [bambooName, setBambooName] = useState('');

  const { width: screenWidth, height: screenHeight } = useWindowDimensions();

  const slideAnim = useRef(new Animated.Value(0)).current;
  const responseAnim = useRef(new Animated.Value(screenWidth)).current;
  const cloudAnim = useRef(new Animated.Value(1)).current;
  const cloudScale = useRef(new Animated.Value(0.3)).current; // 초기 구름 크기는 30%
  const bambooScale = useRef(new Animated.Value(0)).current;

  const question = '밤부의 성격을 형성하는 단계 입니다.\n답변을 선택해주세요.';
  const questions = [
    {
      question: question,
      aiResponse: "나는 '무인도에 떨어지면 어떡하지?' 같은 생각을",
      responses: [
        '종종 있다',
        '없거나 드물다',
      ]
    },
    {
      question: "다음 질문입니다.\n어떻게 생각하시나요?",
      aiResponse: "당신이 무인도에 떨어진다면",
      responses: [
        '혼자라서 너무 외로울것 같다',
        '무섭지만 혼자라 편할 것 같기도 하다',
      ]
    },
    {
      question: "마지막 질문입니다.\n이 대화가 도움이 되셨나요?",
      aiResponse: "같이 무인도에 떨어진 사람이 계속 울고있다. 이때 나는?",
      responses: [
        '무섭긴 하겠지만.. 빨리 일을 시작해야 하는데.. 약간 답답하다',
        '나도 무서워.. 옆에 앉아서 같이 운다',
      ]
    },
    {
      question: "마지막 질문입니다.\n이 대화가 도움이 되셨나요?",
      aiResponse: "무인도에서 계속 살아가야 한다면 나는",
      responses: [
        '이렇게 된 김에 자유로운 삶을 산다',
        '안정적으로 살기 위해 집도 짓고 시설을 설치한다',
      ]
    },
    {
      question: "밤부의 이름을 지어주세요",
      aiResponse: "좋은 이름을 기대할게요!",
      responses: [],
    },
  ];

  const validIndex = Math.min(Math.max(currentQuestionIndex, 0), questions.length - 1);
  const currentQuestion = questions[validIndex];
  const isLastQuestion = validIndex === questions.length - 1;
  const isFirstQuestion = validIndex === 0;

  const startBambooAnimation = () => {
    bambooScale.setValue(0);
    Animated.timing(bambooScale, {
      toValue: 1,
      duration: 500,
      useNativeDriver: true,
    }).start();
  };

  const handleResponsePress = (response) => {
    if (currentQuestionIndex === questions.length - 2) {
      startCloudAnimation();
    }

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
      slideAnim.setValue(-screenWidth);
      responseAnim.setValue(screenWidth);
      setCurrentQuestionIndex((prevIndex) => prevIndex + 1);

      resetCloudAnimation();

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
    });
  };

  const handlePrevious = () => {
    if (!isFirstQuestion) {
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: screenWidth,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(responseAnim, {
          toValue: -screenWidth,
          duration: 300,
          useNativeDriver: true,
        })
      ]).start(() => {
        setCurrentQuestionIndex((prevIndex) => Math.max(prevIndex - 1, 0));

        slideAnim.setValue(-screenWidth);
        responseAnim.setValue(screenWidth);

        Animated.sequence([
          Animated.timing(slideAnim, {
            toValue: 0,
            duration: 300,
            useNativeDriver: true,
          }),
          Animated.timing(responseAnim, {
            toValue: 0,
            duration: 300,
            useNativeDriver: true,
          }),
        ]).start();
      });
    }
  };

  const startCloudAnimation = () => {
    Animated.timing(cloudAnim, {
      toValue: 0,
      duration: 300,
      useNativeDriver: true,
    }).start();
  };

  const resetCloudAnimation = () => {
    cloudAnim.setValue(1);
  };

  const updateCloudScale = () => {
    let targetScale = 1;
    if (validIndex === 0) targetScale = 0.3;
    else if (validIndex === 1) targetScale = 0.6;
    else if (validIndex === 2) targetScale = 1;

    Animated.timing(cloudScale, {
      toValue: targetScale,
      duration: 300,
      useNativeDriver: true,
    }).start();
  };

  useEffect(() => {
    startResponseAnimation();

    if (isLastQuestion) {
      startBambooAnimation();
    } else {
      updateCloudScale();
    }
  }, [currentQuestionIndex]);

  const startResponseAnimation = () => {
    responseAnim.setValue(screenWidth);
    Animated.timing(responseAnim, {
      toValue: 0,
      duration: 300,
      useNativeDriver: true,
    }).start();
  };

  const handleConfirm = () => {
    if (bambooName.trim()) {
      router.push('../../(init)');
    }
  };

  return (
    <JoinBG>
      <ScrollView contentContainerStyle={[styles.container, { paddingVertical: screenHeight * 0.05 }]}>
        <View style={[styles.chatBubble, { width: screenWidth * 0.9 }]}>
          <Text style={styles.chatText}>{currentQuestion.question}</Text>
        </View>

        <Animated.View style={[styles.aiResponse, { transform: [{ translateX: slideAnim }], width: screenWidth * 0.85 }]}>
          <Text style={styles.aiResponseText}>{currentQuestion.aiResponse}</Text>
        </Animated.View>

        {!isLastQuestion && (
          <Animated.View
            style={{
              transform: [{ scale: cloudScale }],
              opacity: cloudAnim,
              width: screenWidth * 0.6,
              height: screenWidth * 0.3,
              marginBottom: '5%',
              alignSelf: 'center',
            }}
          >
            <Image
              source={require('../../assets/images/구름.png')}
              style={{ width: '100%', height: '100%' }}
              resizeMode="contain"
            />
          </Animated.View>
        )}

        {isLastQuestion && (
          <View style={styles.bambooContainer}>
            <Animated.Image
              source={require('../../assets/images/bamboo_head.png')}
              style={[
                styles.bambooImage,
                {
                  width: screenWidth * 0.4,
                  height: screenWidth * 0.4,
                  transform: [{ scale: bambooScale }],
                },
              ]}
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
              <TouchableOpacity
                style={[styles.navButton, { paddingVertical: screenHeight * 0.02, backgroundColor: bambooName.trim() ? '#00f' : '#ccc' }]}
                onPress={handleConfirm}
                disabled={!bambooName.trim()}
              >
                <Text style={[styles.navButtonText, { color: '#fff' }]}>확인</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {!isLastQuestion && (
          <View style={[styles.responseContainer, { width: screenWidth * 0.9 }]}>
            {currentQuestion.responses.map((response, index) => (
              <Animated.View key={index} style={[styles.responseButton, { transform: [{ translateX: responseAnim }], width: screenWidth * 0.85 }]}>
                <TouchableOpacity onPress={() => handleResponsePress(response)}>
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
