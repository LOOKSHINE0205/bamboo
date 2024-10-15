import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, useWindowDimensions } from 'react-native';
import { useRouter } from 'expo-router';
import JoinBG from '../../components/JoinBG'; // 경로는 실제 파일 위치에 맞게 조정하세요

// KeywordSelectionScreen 컴포넌트: 사용자에게 질문을 표시하고 응답을 받는 화면
const KeywordSelectionScreen = () => {
  const router = useRouter();
  // 현재 질문 인덱스를 관리하는 상태
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  // useWindowDimensions 훅을 사용하여 화면 너비를 가져옴 (반응형 디자인을 위해 사용)
  const { width: screenWidth } = useWindowDimensions();

  // 질문과 응답 옵션을 포함하는 배열
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
    }
    // ... (다른 질문들)
  ];

  // 현재 표시할 질문 객체
  const currentQuestion = questions[currentQuestionIndex];
  // 마지막 질문인지 확인
  const isLastQuestion = currentQuestionIndex === questions.length - 1;
  // 첫 번째 질문인지 확인
  const isFirstQuestion = currentQuestionIndex === 0;

  // '다음' 또는 '완료' 버튼 클릭 시 실행되는 함수
  const handleNext = () => {
    if (isLastQuestion) {
      // 마지막 질문이면 메인 화면으로 이동
      router.push('../../(init)');
    } else {
      // 다음 질문으로 이동
      setCurrentQuestionIndex(prevIndex => prevIndex + 1);
    }
  };

  // '이전' 버튼 클릭 시 실행되는 함수
  const handlePrevious = () => {
    setCurrentQuestionIndex(prevIndex => prevIndex - 1);
  };

  // 컴포넌트 UI 렌더링
  return (
    <JoinBG>
      <ScrollView contentContainerStyle={styles.container}>
        {/* 질문 표시 영역 */}
        <View style={[styles.chatBubble, { width: screenWidth * 0.9 }]}>
          <Text style={styles.chatText}>{currentQuestion.question}</Text>
        </View>
        {/* 응답 영역 */}
        <View style={[styles.responseContainer, { width: screenWidth * 0.9 }]}>
          {/* AI 응답 */}
          <View style={styles.aiResponse}>
            <Text style={styles.aiResponseText}>{currentQuestion.aiResponse}</Text>
          </View>
          {/* 사용자 응답 옵션 */}
          {currentQuestion.responses.map((response, index) => (
            <TouchableOpacity
              key={index}
              style={styles.responseButton}
            >
              <Text style={styles.responseText}>{response}</Text>
            </TouchableOpacity>
          ))}
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
        </View>
      </ScrollView>
    </JoinBG>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    alignItems: 'center',
    paddingVertical: '5%',
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