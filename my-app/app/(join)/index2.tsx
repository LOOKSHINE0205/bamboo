import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  useWindowDimensions,
  TextInput,
  Image,
  Animated,
  StyleSheet
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import JoinBG from '../../components/JoinBG'; // 배경 컴포넌트 JoinBG 가져오기 (화면 배경 역할)

// KeywordSelectionScreen 컴포넌트 정의
const KeywordSelectionScreen = () => {
  const router = useRouter(); // 화면 이동을 위한 useRouter 훅 사용
  const { userData: initialUserData } = useLocalSearchParams(); // 이전 화면에서 전달된 userData 가져오기

  // 화면에 표시할 상태 변수 설정
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0); // 현재 질문의 인덱스를 저장하는 상태
  const [testResults, setTestResults] = useState<string>(''); // 사용자가 선택한 답변 결과를 저장하는 문자열
  const [chatbotName, setChatbotName] = useState(''); // 사용자 입력으로 설정된 챗봇의 이름
  const [isProcessing, setIsProcessing] = useState(false); // 응답이 처리 중인지 여부를 나타내는 상태

  // 화면 너비와 높이를 가져오는 훅, 반응형 UI를 위해 사용
  const { width: screenWidth, height: screenHeight } = useWindowDimensions();

  // 애니메이션 변수 초기화
  const fadeAnim = useRef(new Animated.Value(1)).current; // 현재 질문의 페이드 애니메이션(투명도)
  const cloudAnim = useRef(new Animated.Value(1)).current; // 구름의 투명도 애니메이션
  const cloudScale = useRef(new Animated.Value(0.1)).current; // 구름 크기 조절 애니메이션
  const chatbotScale = useRef(new Animated.Value(0)).current; // 챗봇 이미지의 크기 애니메이션

  // 질문 데이터 배열 정의
  const questions = [
    {
      question: '밤부의 성격을 형성하는 단계 입니다.\n답변을 선택해주세요.',
      aiResponse: "나는 '무인도에 떨어지면 어떡하지?' 같은 생각을",
      responses: ['종종 있다', '없거나 드물다'],
    },
    {
      question: '다음 질문입니다.\n어떻게 생각하시나요?',
      aiResponse: '당신이 만약 \n무인도에 떨어진다면',
      responses: ['혼자라서 너무 외로울 것 같다', '무섭지만 혼자라 편할 것 같기도 하다'],
    },
    {
      question: '다음 질문입니다.\n어떻게 생각하시나요?',
      aiResponse: '같이 무인도에 떨어진 사람이 계속 울고 있다. 이때 나는?',
      responses: ['무섭긴 하겠지만.. 빨리 일을 시작해야 하는데.. 약간 답답하다', '나도 무서워.. 옆에 앉아서 같이 운다'],
    },
    {
      question: '마지막 질문입니다.\n어떻게 생각하시나요?',
      aiResponse: '무인도에서 계속 살아가야 한다면 나는',
      responses: ['이렇게 된 김에 자유로운 삶을 산다', '안정적으로 살기 위해 집도 짓고 시설을 설치한다'],
    },
    {
      question: '밤부의 이름을 지어주세요',
      aiResponse: '좋은 이름을 기대할게요!',
      responses: [],
    },
  ];

  // 유효한 질문 인덱스를 계산하여 현재 질문 가져오기
  const validIndex = Math.min(Math.max(currentQuestionIndex, 0), questions.length - 1);
  const currentQuestion = questions[validIndex]; // 현재 질문 객체
  const isLastQuestion = validIndex === questions.length - 1; // 마지막 질문 여부 확인
  const isFirstQuestion = validIndex === 0; // 첫 번째 질문 여부 확인

  // 응답 선택 시 결과 문자열 업데이트
  const handleSelectResult = (value: '0' | '1') => {
    setTestResults((prevResults) => prevResults + value); // 이전 결과에 선택된 값 추가
  };

  // 챗봇 애니메이션을 시작하는 함수 (크기를 0에서 1로 확대)
  const startChatbotAnimation = () => {
    chatbotScale.setValue(0); // 초기 크기를 0으로 설정
    Animated.timing(chatbotScale, {
      toValue: 1, // 최종 크기 설정 (1로 확대)
      duration: 500, // 애니메이션 지속 시간 (500ms)
      useNativeDriver: true, // 네이티브 드라이버 사용
    }).start();
  };

  // 챗봇 애니메이션을 종료하는 함수 (크기를 1에서 0으로 축소)
  const hideChatbotAnimation = (callback: () => void) => {
    Animated.timing(chatbotScale, {
      toValue: 0, // 크기를 0으로 설정하여 숨김
      duration: 300, // 애니메이션 지속 시간 (300ms)
      useNativeDriver: true,
    }).start(callback); // 애니메이션 완료 후 콜백 함수 실행
  };

  // 사용자가 응답을 선택했을 때 호출되는 함수
  const handleResponsePress = (index: number) => {
    if (isProcessing) return; // 이미 처리 중이면 중복 실행 방지
    setIsProcessing(true); // 처리 중 상태로 설정

    handleSelectResult(index === 0 ? '0' : '1'); // 선택된 답변을 결과 문자열에 추가

    // 마지막 질문 전이라면 구름 애니메이션 시작
    if (currentQuestionIndex === questions.length - 2) {
      startCloudAnimation();
    }

    // 현재 질문을 페이드 아웃시키는 애니메이션 시작
    Animated.timing(fadeAnim, {
      toValue: 0, // 투명도를 0으로 설정하여 페이드 아웃 효과를 줌
      duration: 300, // 애니메이션의 지속 시간 (300ms), 애니메이션이 너무 빠르거나 느려지지 않도록 조정
      useNativeDriver: true, // 성능 향상을 위한 네이티브 드라이버 사용
    }).start(() => {
      // 페이드 아웃이 완료되면 다음 질문으로 이동
      setCurrentQuestionIndex((prevIndex) => prevIndex + 1); // 현재 질문 인덱스를 증가시켜 다음 질문으로 설정
      fadeAnim.setValue(0); // 다음 질문을 위해 투명도를 0으로 초기화

      // 다음 질문 페이드 인 애니메이션
      Animated.timing(fadeAnim, {
        toValue: 1, // 투명도를 1로 설정하여 페이드 인 효과를 줌
        duration: 300, // 애니메이션 지속 시간 (300ms)
        useNativeDriver: true,
      }).start(() => {
        setIsProcessing(false); // 모든 애니메이션이 완료된 후 처리 완료 상태로 설정
      });

      updateCloudScale(currentQuestionIndex + 1); // 다음 질문에 맞춰 구름의 크기를 조정
    });
  };

  // 이전 질문으로 이동하는 함수
  const handlePrevious = () => {
    if (isProcessing) return; // 다른 작업이 진행 중이라면 중복 실행 방지
    setIsProcessing(true); // 처리 중 상태로 설정

    if (!isFirstQuestion) { // 현재 질문이 첫 번째 질문이 아닌 경우에만 실행
      // 마지막 질문에서 이전으로 돌아갈 때 구름과 챗봇 애니메이션을 처리
      if (currentQuestionIndex === questions.length - 1) {
        cloudAnim.setValue(1); // 구름을 다시 보이도록 설정 (투명도 1)

        // 챗봇 애니메이션을 숨김 처리
        hideChatbotAnimation(() => {
          // 페이드 아웃 애니메이션을 사용해 현재 질문을 사라지게 함
          Animated.timing(fadeAnim, {
            toValue: 0, // 투명도를 0으로 설정하여 페이드 아웃 효과를 줌
            duration: 300, // 애니메이션의 지속 시간 (300ms)
            useNativeDriver: true,
          }).start(() => {
            const newIndex = currentQuestionIndex - 1; // 인덱스를 감소시켜 이전 질문으로 이동
            setCurrentQuestionIndex(newIndex); // 상태를 업데이트하여 이전 질문을 현재 질문으로 설정
            fadeAnim.setValue(0); // 이전 질문을 준비하기 위해 투명도 초기화

            // 이전 질문 페이드 인 애니메이션
            Animated.timing(fadeAnim, {
              toValue: 1, // 투명도를 1로 설정하여 페이드 인 효과를 줌
              duration: 300, // 애니메이션의 지속 시간 (300ms)
              useNativeDriver: true,
            }).start(() => {
              setIsProcessing(false); // 모든 애니메이션이 완료된 후 처리 완료 상태로 설정
            });

            updateCloudScale(newIndex); // 이전 질문에 맞춰 구름의 크기 조정
          });
        });
      } else {
        // 마지막 질문이 아닌 경우에 일반적인 이전 질문 이동 처리
        Animated.timing(fadeAnim, {
          toValue: 0, // 투명도를 0으로 설정하여 현재 질문을 페이드 아웃
          duration: 300, // 애니메이션의 지속 시간 (300ms)
          useNativeDriver: true,
        }).start(() => {
          const newIndex = currentQuestionIndex - 1; // 인덱스를 감소시켜 이전 질문으로 이동
          setCurrentQuestionIndex(newIndex);
          fadeAnim.setValue(0); // 이전 질문을 준비하기 위해 투명도 초기화

          Animated.timing(fadeAnim, {
            toValue: 1, // 투명도를 1로 설정하여 페이드 인 효과를 줌
            duration: 300, // 애니메이션의 지속 시간 (300ms)
            useNativeDriver: true,
          }).start(() => {
            setIsProcessing(false); // 모든 애니메이션이 완료된 후 처리 완료 상태로 설정
          });

          updateCloudScale(newIndex); // 이전 질문에 맞춰 구름의 크기 조정
        });
      }
    }
  };

  // 구름 애니메이션 시작 함수 - 구름을 페이드 아웃하여 사라지게 함
  const startCloudAnimation = () => {
    Animated.timing(cloudAnim, {
      toValue: 0, // 투명도를 0으로 설정하여 구름을 화면에서 보이지 않게 함
      duration: 300, // 애니메이션의 지속 시간 (300ms)
      useNativeDriver: true, // 네이티브 드라이버 사용으로 성능 최적화
    }).start(); // 애니메이션 실행
  };

  // 구름 크기를 질문 인덱스에 맞춰 조정하는 함수
  const updateCloudScale = (index: number) => {
    let targetScale = 1; // 기본값은 1로 설정 (가장 큰 크기)
    if (index === 0) targetScale = 0.1;
    else if (index === 1) targetScale = 0.3;
    else if (index === 2) targetScale = 0.6;
    else if (index > 2) targetScale = 1;

    Animated.timing(cloudScale, {
      toValue: targetScale, // 목표 크기를 설정
      duration: 300, // 애니메이션의 지속 시간 (300ms)
      useNativeDriver: true,
    }).start();
  };

 // 현재 질문이 마지막 질문인지 확인하고, 마지막 질문인 경우 챗봇 애니메이션을 시작
 useEffect(() => {
   if (isLastQuestion) {
     startChatbotAnimation();
   } else {
     // 첫 번째 질문부터 다시 시작할 경우 챗봇을 숨김
     chatbotScale.setValue(0);
   }
 }, [currentQuestionIndex]);

 // 확인 버튼이 눌렸을 때 실행되는 함수
 const handleConfirm = () => {
   if (chatbotName.trim()) {
     // userData와 testResults를 포함하여 sendUserInfo 페이지로 이동
     router.push({
       pathname: './sendUserInfo',
       params: {
         userData: initialUserData,
         testResults: testResults,
         chatbotName,
       },
     });
   } else {
     // 입력이 비어 있을 경우 사용자에게 챗봇 이름을 입력하라는 알림 표시
     alert('챗봇 이름을 입력해주세요.');
   }
 };

  // JoinBG 컴포넌트를 반환하여 화면의 배경을 설정
  return (
    <JoinBG>
      {/* ScrollView로 스크롤 가능한 콘텐츠 영역을 생성 */}
      <ScrollView
        contentContainerStyle={[
          // 기본 컨테이너 스타일 적용
          styles.container,
          // 화면 높이에 따라 상하 패딩을 설정하고, 하단에 여유 공간 추가
          { paddingVertical: screenHeight * 0.05, paddingBottom: 200 }
        ]}
      >
        {/* 현재 질문을 담는 채팅 버블 스타일의 View */}
        <View style={[
          // 기본 채팅 버블 스타일 적용
          styles.chatBubble,
          // 화면 너비에 따라 버블 너비를 90%로 설정하고, 화면의 상단에 위치시킴
          { width: screenWidth * 0.9, top: '0%' }
        ]}>
          {/* 현재 질문 텍스트를 화면에 표시 */}
          <Text style={styles.chatText}>{currentQuestion.question}</Text>
        </View>
        {/* 마지막 질문이 아닌 경우 진행 상황을 나타내는 도트 표시 */}
        {!isLastQuestion && (
          <View style={styles.progressContainer}>
            {/* 현재 질문을 제외한 질문 수만큼 도트를 생성 */}
            {questions.slice(0, -1).map((_, index) => (
              <View
                // 고유한 키로 인덱스를 사용
                key={index}
                style={[
                  // 기본 도트 스타일 적용
                  styles.dot,
                  // 현재 질문 인덱스와 일치하는 도트는 활성화 스타일 적용
                  currentQuestionIndex === index && styles.activeDot,
                ]}
              />
            ))}
          </View>
        )}

        {/* AI의 응답을 애니메이션 효과로 표시하는 뷰 */}
        <Animated.View
          style={[
            // 기본 AI 응답 스타일 적용
            styles.aiResponse,
            // 페이드 인 애니메이션 적용 및 너비와 위치 설정
            { opacity: fadeAnim, width: screenWidth * 0.85, top: 150 }
          ]}
        >
          {/* 마지막 질문이 아닌 경우 AI 응답을 버튼으로 표시하여 사용자 상호작용 가능 */}
          {!isLastQuestion ? (
            <TouchableOpacity
              // AI 응답 버튼 스타일 적용
              style={styles.aiResponseButton}
              // AI 응답을 클릭하면 handleResponsePress(0) 함수 실행, 처리 중일 경우 비활성화
              onPress={() => !isProcessing && handleResponsePress(0)}
              disabled={isProcessing}
            >
              {/* 현재 질문의 AI 응답 텍스트 표시 */}
              <Text style={styles.aiResponseText}>{currentQuestion.aiResponse}</Text>
            </TouchableOpacity>
          ) : (
            // 마지막 질문인 경우 AI 응답을 단순 텍스트로 표시
            <Text style={styles.aiResponseText}>{currentQuestion.aiResponse}</Text>
          )}
        </Animated.View>
        {/* 마지막 질문이 아닌 경우 구름 애니메이션 뷰 표시 */}
        {!isLastQuestion && (
          <Animated.View
            style={[
              // 구름 컨테이너 기본 스타일 적용
              styles.cloudContainer,
              {
                // 구름 크기를 애니메이션 효과에 따라 조절
                transform: [{ scale: cloudScale }],
                // 구름 투명도에 애니메이션 적용
                opacity: cloudAnim,
                // 화면 너비의 60% 크기로 설정
                width: screenWidth * 0.6,
                // 화면 너비의 30% 높이로 설정
                height: screenWidth * 0.3,
                // 구름을 화면 가운데 정렬
                alignSelf: 'center',
              },
            ]}
          >
            {/* 구름 이미지 삽입 */}
            <Image
              // 구름 이미지 경로 설정
              source={require('../../assets/images/구름.png')}
              // 구름 이미지 스타일 적용
              style={styles.cloudImage}
              // 이미지의 종횡비를 유지하며 화면에 맞추어 표시
              resizeMode="contain"
            />
          </Animated.View>
        )}
        {/* 마지막 질문인 경우 챗봇 컨테이너 뷰 표시 */}
        {isLastQuestion ? (
          <View style={styles.chatbotContainer}>
            {/* 챗봇 이미지를 애니메이션 효과와 함께 표시 */}
            <Animated.Image
              // 대나무 머리 이미지를 경로에서 불러오기
              source={require('../../assets/images/bamboo_head.png')}
              style={[
                // 기본 챗봇 이미지 스타일 적용
                styles.chatbotImage,
                {
                  // 이미지의 너비를 화면 너비의 40%로 설정
                  width: screenWidth * 0.4,
                  // 이미지의 높이를 화면 너비의 40%로 설정
                  height: screenWidth * 0.4,
                  // 화면 상단에서 110px 아래에 위치
                  top: 110,
                  // 챗봇 크기를 애니메이션 효과(chatbotScale)에 따라 조절
                  transform: [{ scale: chatbotScale }],
                },
              ]}
              // 이미지의 종횡비를 유지하며 화면에 맞추어 표시
              resizeMode="contain"
            />
            {/* 챗봇 이름을 입력할 수 있는 텍스트 입력 필드 */}
            <TextInput
              // 이름 입력 스타일을 적용하고 화면 너비의 80%로 설정
              style={[styles.nameInput, { width: screenWidth * 0.8, top: 140 }]}
              // 현재 입력된 챗봇 이름을 값으로 설정
              value={chatbotName}
              // 입력된 텍스트가 변경될 때 setChatbotName 함수를 호출하여 상태 업데이트
              onChangeText={setChatbotName}
              // 이름 입력 안내 문구 설정
              placeholder="밤부의 이름을 입력하세요"
              // 안내 문구 색상 설정
              placeholderTextColor="#999"
            />

            {/* 이름 변경 불가에 대한 경고 메시지 */}
            <Text style={styles.warningText}>밤부의 이름은 변경할 수 없습니다.‼️</Text>

            {/* 내비게이션 버튼을 감싸는 컨테이너 */}
            <View style={[styles.navigationButtons, { top: 120 }]}>
              {/* 첫 번째 질문이 아닌 경우 '이전' 버튼 표시 */}
              {currentQuestionIndex > 0 && (
                <TouchableOpacity
                  // 내비게이션 버튼 스타일 적용 및 화면 높이에 맞춰 패딩 설정
                  style={[styles.navButton, { paddingVertical: screenHeight * 0.02 }]}
                  // '이전' 버튼을 클릭 시 handlePrevious 함수 호출
                  onPress={handlePrevious}
                  // 처리 중일 경우 버튼 비활성화
                  disabled={isProcessing}
                >
                  {/* '이전' 버튼 텍스트 */}
                  <Text style={styles.navButtonText}>이전</Text>
                </TouchableOpacity>
              )}
              {/* '확인' 버튼, 이름 입력란에 값이 있을 때만 활성화 */}
              <TouchableOpacity
                style={[
                  // 내비게이션 버튼 스타일 적용 및 화면 높이에 맞춰 패딩 설정
                  styles.navButton,
                  {
                    paddingVertical: screenHeight * 0.02,
                    // 이름이 입력된 경우 버튼 배경을 초록색으로, 그렇지 않으면 회색으로 설정
                    backgroundColor: chatbotName.trim() ? '#4a9960' : '#ccc'
                  }
                ]}
                // '확인' 버튼 클릭 시 handleConfirm 함수 호출
                onPress={handleConfirm}
                // 이름이 비어있거나 처리 중일 경우 버튼 비활성화
                disabled={!chatbotName.trim() || isProcessing}
              >
                {/* '확인' 버튼 텍스트, 버튼 활성화 시 흰색 텍스트 표시 */}
                <Text style={[styles.navButtonText, { color: '#fff' }]}>확인</Text>
              </TouchableOpacity>
            </View>
          </View>
        ) : (
          // 마지막 질문이 아닌 경우 응답 옵션 및 내비게이션 버튼 표시
          <View
            style={[
              styles.responseContainer,
              {
                // 응답 컨테이너의 너비를 화면 너비의 90%로 설정
                width: screenWidth * 0.9,
                // 첫 번째 질문인 경우 추가 마진 설정, 그렇지 않으면 마진 제거
                marginBottom: isFirstQuestion ? '11%' : '0%',
                // 화면 상단에서 80% 아래로 위치 설정
                top: '80%'
              }
            ]}
          >
            {/* 각 응답 옵션을 맵 함수로 생성하여 리스트로 표시 */}
            {currentQuestion.responses.map((response, index) => (
              <Animated.View
                // 고유한 키로 인덱스를 사용
                key={index}
                style={[
                  styles.responseButton,
                  {
                    // 페이드 인 애니메이션 적용
                    opacity: fadeAnim,
                    // 응답 버튼의 너비를 화면 너비의 85%로 설정
                    width: screenWidth * 0.85
                  }
                ]}
              >
                <TouchableOpacity
                  // 응답 버튼 터치 가능한 영역 스타일 적용
                  style={styles.responseButtonTouchable}
                  // 응답 버튼을 클릭 시 handleResponsePress 함수 실행, 처리 중일 경우 비활성화
                  onPress={() => !isProcessing && handleResponsePress(index)}
                  disabled={isProcessing}
                >
                  {/* 응답 텍스트 표시 */}
                  <Text style={styles.responseText}>{response}</Text>
                </TouchableOpacity>
              </Animated.View>
            ))}

            {/* 첫 번째 질문이 아닌 경우 '이전' 버튼을 표시 */}
            {currentQuestionIndex > 0 && (
              <View style={styles.navigationButtons}>
                <TouchableOpacity
                  // 내비게이션 버튼 스타일 적용
                  style={styles.navButton}
                  // '이전' 버튼 클릭 시 handlePrevious 함수 호출
                  onPress={handlePrevious}
                  // 처리 중일 경우 버튼 비활성화
                  disabled={isProcessing}
                >
                  {/* '이전' 버튼 텍스트 */}
                  <Text style={styles.navButtonText}>이전</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        )}
      {/* ScrollView 컴포넌트를 종료하여 화면 전체를 스크롤 가능하게 설정 종료 */}
      </ScrollView>
    {/* JoinBG 컴포넌트를 종료하여 화면 배경 설정 종료 */}
    </JoinBG>
  );
};
// 스타일 정의
const styles = StyleSheet.create({
  // 경고 텍스트 스타일: 경고 메시지를 빨간색으로 중앙 정렬하고, 상단에 약간의 여백을 추가하여 다른 요소와 분리
  warningText: {
    color: 'red',               // 텍스트 색상을 빨간색으로 설정
    textAlign: 'center',        // 텍스트를 중앙에 정렬
    marginTop: 10,              // 상단에 10px 여백을 추가하여 다른 요소와 간격을 줌
    fontSize: 14,               // 텍스트 크기를 14px로 설정
    top: '15%'                  // 화면 상단에서 15% 아래에 위치
  },

  // 화면 전체 컨테이너 스타일: 스크롤 시 화면에 꽉 차도록 설정하고, 자식 요소를 중앙에 정렬
  container: {
    flexGrow: 1,                // 스크롤 뷰가 화면 전체를 채우도록 설정
    alignItems: 'center'        // 자식 요소를 수평 중앙으로 정렬
  },

  // 채팅 버블 스타일: 질문 또는 응답 텍스트를 감싸는 영역으로, 모서리를 둥글게 처리하여 버블 모양으로 설정
  chatBubble: {
    borderRadius: 20,           // 모서리를 둥글게 처리하여 버블 모양을 만듦
    padding: '4%',              // 버블 내부 여백을 설정하여 텍스트가 가장자리와 떨어져 있도록 함
    marginBottom: '5%'          // 다른 요소와의 간격을 위해 하단에 5% 여백 추가
  },

  // 채팅 텍스트 스타일: 채팅 버블 안의 텍스트 스타일 설정
  chatText: {
    fontSize: 16,               // 텍스트 크기를 16px로 설정
    color: '#000',              // 텍스트 색상을 검은색으로 설정
    textAlign: 'center'         // 텍스트를 중앙 정렬하여 깔끔하게 표시
  },

  // 챗봇 컨테이너 스타일: 챗봇 이미지와 관련 요소들을 수직으로 중앙 정렬하고 여백 추가
  chatbotContainer: {
    alignItems: 'center',       // 자식 요소를 수평 중앙으로 정렬
    marginVertical: '5%'        // 상하 여백을 5% 추가하여 다른 요소와의 간격 확보
  },

  // 챗봇 이미지 스타일: 챗봇 이미지를 화면에 표시하기 위한 스타일
  chatbotImage: {
    marginBottom: 20            // 이미지 하단에 20px 여백 추가하여 텍스트와의 간격 확보
  },

  // 이름 입력 필드 스타일: 사용자가 챗봇 이름을 입력할 수 있는 텍스트 입력 필드
  nameInput: {
    borderWidth: 1,             // 입력 필드 테두리 두께를 1px로 설정
    borderColor: '#999',        // 테두리 색상을 회색으로 설정
    borderRadius: 10,           // 모서리를 둥글게 처리하여 깔끔한 외형 제공
    padding: 10,                // 입력 필드 내부 여백 설정
    fontSize: 16,               // 입력 텍스트 크기를 16px로 설정
    textAlign: 'center',        // 텍스트를 중앙 정렬하여 보기 좋게 표시
    backgroundColor: '#FFF'     // 배경색을 흰색으로 설정하여 깔끔한 외형 제공
  },

  // 응답 컨테이너 스타일: 사용자 응답 버튼들을 포함하는 영역
  responseContainer: {
    alignItems: 'center',       // 자식 요소들을 수평 중앙 정렬
    position: 'absolute',       // 화면의 고정된 위치에 배치
    bottom: 20,                 // 화면 하단에서 20px 위에 배치하여 충분한 여백 확보
    width: '100%',              // 컨테이너 너비를 화면 너비로 설정
    paddingHorizontal: '5%'     // 좌우 패딩을 5% 추가하여 화면 가장자리와 떨어뜨림
  },

  // AI 응답 스타일: AI가 생성한 응답을 표시할 때 사용하는 스타일
  aiResponse: {
    backgroundColor: '#E8E8E8', // 배경색을 연회색으로 설정하여 채팅 버블과 구분
    borderRadius: 20,           // 모서리를 둥글게 처리하여 부드러운 외형 제공
    padding: '4%',              // 내부 여백을 설정하여 텍스트와 가장자리 간격 확보
    position: 'absolute',       // 고정된 위치에 배치
    top: 180,                   // 화면 상단에서 180px 아래에 배치
    zIndex: 2,                  // 다른 요소 위에 표시되도록 z-index 설정
    shadowColor: '#000',        // 그림자 색상을 검은색으로 설정
    shadowOffset: { width: 0, height: 2 }, // 그림자 위치 조정
    shadowOpacity: 0.2,         // 그림자 투명도 설정
    shadowRadius: 3.84,         // 그림자 반경 설정
    elevation: 5                // 안드로이드 그림자 효과 적용
  },

  // AI 응답 버튼 스타일: AI 응답을 버튼 형태로 표시
  aiResponseButton: {
    width: '100%',              // 버튼 너비를 컨테이너 너비에 맞춤
    padding: 10                 // 버튼 내부 여백 추가
  },

  // 응답 버튼 터치 가능한 영역 스타일: 사용자 응답 버튼의 터치 가능한 영역
  responseButtonTouchable: {
    width: '100%',              // 터치 영역을 컨테이너 너비에 맞춤
    padding: 10                 // 터치 영역 내부 여백 추가
  },

  // 구름 컨테이너 스타일: 애니메이션 효과가 적용된 구름 이미지 컨테이너
  cloudContainer: {
    position: 'absolute',       // 고정된 위치에 배치
    top: 300,                   // 화면 상단에서 300px 아래에 배치
    alignSelf: 'center',        // 구름을 화면 중앙에 배치
    zIndex: 1                   // 다른 요소 아래에 배치되도록 z-index 설정
  },

  // 구름 이미지 스타일: 구름 이미지 크기를 컨테이너에 맞춤
  cloudImage: {
    width: '100%',              // 이미지 너비를 컨테이너 너비에 맞춤
    height: '100%'              // 이미지 높이를 컨테이너 높이에 맞춤
  },

  // AI 응답 텍스트 스타일: AI 응답 텍스트의 폰트 크기 설정
  aiResponseText: {
    fontSize: 16                // 텍스트 크기를 16px로 설정하여 읽기 쉽게 표시
  },

  // 응답 버튼 스타일: 사용자 응답 옵션 버튼의 스타일
  responseButton: {
    backgroundColor: '#FFF',    // 버튼 배경색을 흰색으로 설정
    borderRadius: 20,           // 모서리를 둥글게 처리하여 버튼 외형 부드럽게 만듦
    padding: '4%',              // 내부 여백을 설정하여 텍스트와 가장자리 간격 확보
    marginBottom: '3%',         // 버튼 간격을 위해 하단에 3% 마진 추가
    shadowColor: '#000',        // 그림자 색상 설정
    shadowOffset: { width: 0, height: 2 }, // 그림자 위치 조정
    shadowOpacity: 0.2,         // 그림자 투명도 설정
    shadowRadius: 3.84,         // 그림자 반경 설정
    elevation: 5                // 안드로이드 그림자 효과 적용
  },

  // 응답 텍스트 스타일: 응답 텍스트의 폰트 크기와 정렬 설정
  responseText: {
    fontSize: 16,               // 텍스트 크기를 16px로 설정
    textAlign: 'center'         // 텍스트를 중앙 정렬하여 버튼 내에서 보기 좋게 표시
  },

  // 내비게이션 버튼 컨테이너 스타일: '이전' 및 '확인' 버튼들을 담고 있는 컨테이너
  navigationButtons: {
    flexDirection: 'row',       // 버튼을 가로로 나란히 배치
    justifyContent: 'center',   // 버튼을 중앙에 정렬
    marginTop: '5%',            // 상단에 5% 마진 추가
    marginBottom: 20            // 하단에 20px 마진 추가하여 다른 요소와 간격 확보
  },

  // 내비게이션 버튼 스타일: '이전' 및 '확인' 버튼의 외형 스타일
  navButton: {
    backgroundColor: '#FFF',    // 버튼 배경색을 흰색으로 설정
    borderRadius: 15,           // 모서리를 둥글게 처리하여 외형을 부드럽게 만듦
    paddingHorizontal: '4%',    // 버튼 좌우에 4% 패딩을 추가
    marginHorizontal: '2%'      // 버튼 간격을 위해 좌우에 2% 마진 추가
  },

  // 내비게이션 버튼 텍스트 스타일: '이전' 및 '확인' 버튼 텍스트 스타일
  navButtonText: {
    fontSize: 14,               // 텍스트 크기를 14px로 설정
    color: '#000'               // 텍스트 색상을 검은색으로 설정
  },

  // 진행 상황 도트 컨테이너 스타일: 현재 진행 상황을 나타내는 도트들을 포함
  progressContainer: {
    flexDirection: 'row',       // 도트를 가로로 나란히 배치
    justifyContent: 'center',   // 도트를 중앙에 정렬
    alignItems: 'center',       // 도트를 수직 중앙에 정렬
    marginBottom: '5%',         // 하단에 5% 마진 추가
    marginTop: '-2%',            // 상단에 -2% 마진 추가하여 다른 요소와 간격 조정
    top:330,
  },

  // 비활성 도트 스타일: 기본 도트의 크기와 색상
  dot: {
    width: 8,                   // 도트의 너비를 8px로 설정
    height: 8,                  // 도트의 높이를 8px로 설정
    borderRadius: 4,            // 도트를 원형으로 만들기 위해 반지름 설정
    backgroundColor: '#E8E8E8', // 비활성 도트 배경색을 연회색으로 설정
    marginHorizontal: 4         // 도트 간의 간격을 위해 좌우에 4px 마진 추가
  },

  // 활성 도트 스타일: 현재 질문을 나타내는 활성 도트의 크기와 색상
  activeDot: {
    backgroundColor: '#4a9960', // 활성 도트 색상을 초록색으로 설정
    width: 10,                  // 활성 도트 너비를 10px로 설정하여 강조
    height: 10,                 // 활성 도트 높이를 10px로 설정
    borderRadius: 5             // 도트를 원형으로 만들기 위해 반지름 설정
  },
});

export default KeywordSelectionScreen;
