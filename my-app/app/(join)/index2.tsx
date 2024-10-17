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
  // 애니메이션을 위한 각 응답의 Animated.Value를 정의
  const responseAnim = useRef(new Animated.Value(screenWidth)).current;

  const questions = [
    {
      question: "어떻게 대답하실건가요????",
      aiResponse: "아 바보야",
      responses: [
        '응..',
        '뭐라고 했나',
        '네가바보라는건인정할수가없군',
        '솔직히 바보는 너인거 같아..'
      ]
    },
    {
      question: "다음 질문입니다. 어떻게 생각하시나요?",
      aiResponse: "흠... 어렵네요",
      responses: [
        '그렇군요',
        '동의합니다',
        '잘 모르겠어요',
        '다시 설명해주세요'
      ]
    },
    {
      question: "마지막 질문입니다. 이 대화가 도움이 되셨나요?",
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


  // 애니메이션 시작 함수
  const startSlideAnimation = () => {
    // 텍스트가 왼쪽으로 사라짐 (direction 상관없이 항상 왼쪽으로 사라지게 설정)
    const toValueStart = -screenWidth;  // 왼쪽으로 사라짐
    const toValueEnd = 0;  // 다시 왼쪽에서 들어옴

    Animated.sequence([
      // 텍스트가 왼쪽으로 사라지는 애니메이션
      Animated.timing(slideAnim, {
        toValue: toValueStart,
        duration: 300,
        useNativeDriver: true,
      }),
      // 즉시 텍스트를 화면 밖 왼쪽으로 이동
      Animated.timing(slideAnim, {
        toValue: -screenWidth,  // 텍스트가 화면 밖 왼쪽에서 시작
        duration: 0,  // 즉시 이동
        useNativeDriver: true,
      }),
      // 텍스트가 왼쪽에서 다시 들어오는 애니메이션
      Animated.timing(slideAnim, {
        toValue: toValueEnd,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start();
  };
 // 응답이 화면에 나타날 때 애니메이션
  const startResponseAnimation = () => {
    Animated.timing(responseAnim, {
      toValue: 0, // 오른쪽에서 화면 안으로 들어옴
      duration: 300,
      useNativeDriver: true,
    }).start();
  };

  // 응답이 선택되었을 때 오른쪽으로 사라지는 애니메이션
  const endResponseAnimation = (callback) => {
    Animated.timing(responseAnim, {
      toValue: screenWidth, // 화면 밖으로 오른쪽으로 사라짐
      duration: 300,
      useNativeDriver: true,
    }).start(callback);
  };

  // 응답이 선택되었을 때 처리
  const handleResponsePress = (response) => {
    endResponseAnimation(() => {
      // 응답이 사라진 후에 질문을 전환하거나 다른 로직을 실행
      if (isLastQuestion) {
        router.push('../../(init)');
      } else {
        setCurrentQuestionIndex((prevIndex) => prevIndex + 1);
      }
      startResponseAnimation(); // 새 질문의 응답 애니메이션 시작
    });
  };

  useEffect(() => {
    startResponseAnimation(); // 질문이 변경될 때마다 응답 애니메이션 실행
  }, [currentQuestionIndex]);


  const handleNext = () => {
    startSlideAnimation('next'); // 애니메이션 실행
    setTimeout(() => {
      if (isLastQuestion) {
        // 마지막 질문일 경우 메인 화면으로 이동
        console.log('Bamboo 이름:', bambooName);
        router.push('../../(init)');
      } else {
        setCurrentQuestionIndex(prevIndex => prevIndex + 1);
      }
    }, 300); // 애니메이션 완료 후 상태 변경
  };

  const handlePrevious = () => {
    startSlideAnimation('previous'); // 이전 버튼 눌렀을 때 애니메이션
    setTimeout(() => {
      if (!isFirstQuestion) {
        setCurrentQuestionIndex(prevIndex => prevIndex - 1);
      }
    }, 300); // 애니메이션 완료 후 상태 변경
  };



  return (
    <JoinBG>
      <ScrollView contentContainerStyle={[styles.container, { paddingVertical: screenHeight * 0.05 }]}>
        {/* 질문 표시 영역 */}
        <View style={[styles.chatBubble, { width: screenWidth * 0.9 }]}>
          <Text style={styles.chatText}>{currentQuestion.question}</Text>
        </View>

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
          </View>
        )}

        {/* 응답 옵션 영역 */}
        {!isLastQuestion && (
          <View style={[styles.responseContainer, { width: screenWidth * 0.9 }]}>
            {/* AI 응답 부분에 애니메이션 적용 */}
            <Animated.View style={[styles.aiResponse, { transform: [{ translateX: slideAnim }] }]}>
              <Text style={styles.aiResponseText}>{currentQuestion.aiResponse}</Text>
            </Animated.View>
            {currentQuestion.responses.map((response, index) => (
              <Animated.View key={index} style={[styles.responseButton, { transform: [{ translateX: responseAnim }] }]}>
                <TouchableOpacity onPress={() => handleResponsePress(response)}>
                  <Text style={styles.responseText}>{response}</Text>
                </TouchableOpacity>
              </Animated.View>
            ))}
          </View>
        )}

        {/* 네비게이션 버튼 */}
        <View style={styles.navigationButtons}>
          {!isFirstQuestion && (
            <TouchableOpacity style={styles.navButton} onPress={handlePrevious}>
              <Text style={styles.navButtonText}>이전</Text>
            </TouchableOpacity>
          )}
          <TouchableOpacity style={styles.navButton} onPress={handleNext}>
            <Text style={styles.navButtonText}>{isLastQuestion ? '완료' : '다음'}</Text>
          </TouchableOpacity>
        </View>
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
    backgroundColor: '#FFF',
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
  },
  aiResponse: {
    backgroundColor: '#E8E8E8',
    borderRadius: 20,
    padding: '4%',
    alignSelf: 'flex-start',
    marginBottom: '5%',
    maxWidth: '90%',
  },
  aiResponseText: {
    fontSize: 16,
  },
  responseButton: {
    backgroundColor: '#FFF',
    borderRadius: 20,
    padding: '4%',
    marginBottom: '3%',
    width: '100%',
  },
  responseText: {
    fontSize: 16,
    textAlign: 'center',
  },
  navigationButtons: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: '5%',
  },
  navButton: {
    backgroundColor: '#FFF',
    borderRadius: 15,
    paddingVertical: '2%',
    paddingHorizontal: '4%',
    marginHorizontal: '2%',
  },
  navButtonText: {
    fontSize: 14,
    color: '#000',
  },
});

export default KeywordSelectionScreen;
