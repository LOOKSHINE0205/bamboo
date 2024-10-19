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

  // startSlideAnimation 함수에서 duration을 응답 애니메이션과 동일하게 설정
  const startSlideAnimation = () => {
    const toValueStart = -screenWidth;
    const toValueEnd = 0;

    Animated.sequence([
      Animated.timing(slideAnim, {
        toValue: toValueStart,
        duration: 300, // 동일한 시간으로 설정
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: -screenWidth,
        duration: 0,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: toValueEnd,
        duration: 300, // 동일한 시간으로 설정
        useNativeDriver: true,
      }),
    ]).start();
  };


  // startResponseAnimation 함수에서 duration을 aiResponse 애니메이션과 동일하게 설정
  const startResponseAnimation = () => {
    responseAnim.setValue(screenWidth); // 초기 위치를 오른쪽 화면 밖으로 설정
    Animated.timing(responseAnim, {
      toValue: 0,
      duration: 300, // 동일한 시간으로 설정
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
    // aiResponse와 응답 버튼이 동시에 사라지도록 애니메이션 처리
    Animated.parallel([
      // aiResponse가 왼쪽으로 사라지도록 애니메이션
      Animated.timing(slideAnim, {
        toValue: -screenWidth,
        duration: 300,
        useNativeDriver: true,
      }),
      // 응답 버튼이 오른쪽으로 사라지도록 애니메이션
      Animated.timing(responseAnim, {
        toValue: screenWidth,
        duration: 300,
        useNativeDriver: true,
      })
    ]).start(() => {
      if (isLastQuestion) {
        router.push('../../(init)');
      } else {
        // 상태 업데이트 후 새 aiResponse 애니메이션 시작
        slideAnim.setValue(-screenWidth); // 새 aiResponse가 왼쪽에서 시작
        responseAnim.setValue(screenWidth); // 응답 버튼이 오른쪽에서 시작
        setCurrentQuestionIndex((prevIndex) => prevIndex + 1);

        // aiResponse가 먼저 나타나고, 0.5초 뒤에 응답 버튼이 나타나도록 설정
        Animated.sequence([
          Animated.timing(slideAnim, {
            toValue: 0,
            duration: 300,
            useNativeDriver: true,
          }),
          Animated.delay(500), // 0.5초 지연
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
    // 기존 aiResponse 애니메이션을 왼쪽으로 이동시키고, 응답 버블은 오른쪽으로 이동 후 다시 오른쪽에서 나타나게 처리
    startSlideAnimation(); // aiResponse가 왼쪽으로 이동했다가 나타나게 함

    endResponseAnimation(() => {
      if (!isFirstQuestion) {
        setCurrentQuestionIndex((prevIndex) => prevIndex - 1);
      }
      // 애니메이션 완료 후 새로운 응답 버블이 오른쪽에서 나타나도록
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
        <Animated.View style={[styles.aiResponse, { transform: [{ translateX: slideAnim }] }]}>
          <Text style={styles.aiResponseText}>{currentQuestion.aiResponse}</Text>
        </Animated.View>

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
            {currentQuestion.responses.map((response, index) => (
              <Animated.View key={index} style={[styles.responseButton, { transform: [{ translateX: responseAnim }] }]}>
                <TouchableOpacity onPress={() => handleResponsePress(response)}>
                  <Text style={styles.responseText}>{response}</Text>
                </TouchableOpacity>
              </Animated.View>
            ))}

            {/* 네비게이션 버튼 - 응답 영역 바로 아래에 위치 */}
            <View style={styles.navigationButtons}>
              {!isFirstQuestion ? (
                <TouchableOpacity style={styles.navButton} onPress={handlePrevious}>
                  <Text style={styles.navButtonText}>이전</Text>
                </TouchableOpacity>
              ) : (
                <View style={[styles.navButtonPlaceholder,{height:50 , width:'30%'}]} /> // 빈 공간을 유지
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
    // 배경 색상 제거
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
    position: 'absolute', // 화면 하단에 고정
    bottom: 20,
    width: '100%',
    paddingHorizontal: '5%',
  },
  aiResponse: {
    backgroundColor: '#E8E8E8',
    borderRadius: 20,
    padding: '4%',
    alignSelf: 'flex-start',
    marginBottom: '5%',
    maxWidth: '90%',
    // 그림자 효과 추가
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3.84,
    elevation: 5, // Android용 그림자
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
    // 그림자 효과 추가
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3.84,
    elevation: 5, // Android용 그림자
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
  navigationButtons: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: '5%',
    marginBottom: 20, // 네비게이션 버튼과 응답 영역 사이의 간격 유지
  },
  navButtonPlaceholder: {
    height: 50, // navButton과 동일한 높이를 설정해 빈 공간을 유지
    width: 100, // 버튼의 너비와 동일하게 설정하여 빈 공간 유지
    marginHorizontal: '2%',
  },
});

export default KeywordSelectionScreen;
