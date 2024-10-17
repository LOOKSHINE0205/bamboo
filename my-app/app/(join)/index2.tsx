import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, useWindowDimensions, TextInput, Image } from 'react-native';
import { useRouter } from 'expo-router';
import JoinBG from '../../components/JoinBG';

const KeywordSelectionScreen = () => {
  const router = useRouter();
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [bambooName, setBambooName] = useState('');
  const { width: screenWidth } = useWindowDimensions();

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

  const handleNext = () => {
    if (isLastQuestion) {
      // 밤부의 이름을 저장하고 메인 화면으로 이동
      console.log('Bamboo 이름:', bambooName);
      router.push('../../(init)');
    } else {
      setCurrentQuestionIndex(prevIndex => prevIndex + 1);
    }
  };

  const handlePrevious = () => {
    setCurrentQuestionIndex(prevIndex => prevIndex - 1);
  };

  return (
    <JoinBG>
      <ScrollView contentContainerStyle={styles.container}>
        {/* 질문 표시 영역 */}
        <View style={[styles.chatBubble, { width: screenWidth * 0.9 }]}>
          <Text style={styles.chatText}>{currentQuestion.question}</Text>
        </View>

        {/* 밤부 이미지 및 이름 입력 영역 (마지막 질문일 때만 표시) */}
        {isLastQuestion && (
          <View style={styles.bambooContainer}>
            <Image
              source={require('../../assets/images/bamboo_head.png')}
              style={styles.bambooImage}
              resizeMode="contain"
            />
            <TextInput
              style={styles.nameInput}
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
            <View style={styles.aiResponse}>
              <Text style={styles.aiResponseText}>{currentQuestion.aiResponse}</Text>
            </View>
            {currentQuestion.responses.map((response, index) => (
              <TouchableOpacity
                key={index}
                style={styles.responseButton}
              >
                <Text style={styles.responseText}>{response}</Text>
              </TouchableOpacity>
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
  bambooContainer: {
    alignItems: 'center',
    marginVertical: '5%',
  },
  bambooImage: {
    width: 150,
    height: 150,
    marginBottom: 20,
  },
  nameInput: {
    borderWidth: 1,
    borderColor: '#999',
    borderRadius: 10,
    padding: 10,
    width: '80%',
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
