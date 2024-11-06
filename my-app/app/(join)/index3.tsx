import React, { useState } from 'react';
import { View, Text, StyleSheet, Button, Animated } from 'react-native';
import { useRouter } from 'expo-router';
import JoinBG from '../../components/JoinBG';
import { TabBarIcon } from '@/components/navigation/TabBarIcon';
import SmoothCurvedButton from '../../components/SmoothCurvedButton';

const UserGuide = () => {
  const router = useRouter();

  // 상태 관리
  const [pageIndex, setPageIndex] = useState(0);
  const [fadeAnim] = useState(new Animated.Value(1));

  // 페이지 데이터
  const pages = [
    {
      icon: 'chatbubbles-outline',
      title: '대화하기',
      description: '지난 대화를 기억해 밤부와 얘기할 수 있습니다.',
    },
    {
      icon: 'calendar-outline',
      title: '일기장',
      description: '일기를 작성할 수 있고, 작성된 일기를 밤부가 학습합니다.',
    },
    {
      icon: 'analytics-outline',
      title: '보고서',
      description: '감정상태 보고서입니다, 자주 느끼는 감정을 확인합니다.',
    },
    {
      icon: 'person-outline',
      title: '마이페이지',
      description: '어플을 이용하면 밤부가 자라납니다.',
    },
  ];

  const handleNext = () => {
    if (pageIndex < pages.length - 1) {
      animateContent(() => setPageIndex(pageIndex + 1));
    }
  };

  const handlePrevious = () => {
    if (pageIndex > 0) {
      animateContent(() => setPageIndex(pageIndex - 1));
    }
  };

  const animateContent = (callback: () => void) => {
    // 아이콘, 타이틀, 설명이 점점 사라졌다가 나타나는 애니메이션
    Animated.timing(fadeAnim, {
      toValue: 0,
      duration: 300,
      useNativeDriver: true,
    }).start(() => {
      // 페이지를 변경하고 나서 다시 나타나는 애니메이션 시작
      callback();
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }).start();
    });
  };

  return (
    <JoinBG>
      <View style={styles.container}>
        <Animated.View style={[styles.iconContainer, { opacity: fadeAnim }]}>
          <TabBarIcon name={pages[pageIndex].icon} color="#4a9960" size={150} />
        </Animated.View>
        <Animated.Text style={[styles.title, { opacity: fadeAnim }]}>
          {pages[pageIndex].title}
        </Animated.Text>
        <Animated.Text style={[styles.description, { opacity: fadeAnim }]}>
          {pages[pageIndex].description}
        </Animated.Text>
        <View style={styles.pagination}>
          {pages.map((_, index) => (
            <View
              key={index}
              style={[
                styles.dot,
                pageIndex === index && styles.activeDot,
              ]}
            />
          ))}
        </View>
        <View
          style={[
            styles.buttonGroup,
            {
              flexDirection: 'row',
              justifyContent: pageIndex > 0 && pageIndex < pages.length - 1 ? 'space-between' : 'center',
              width: '80%',
            },
          ]}
        >
          {pageIndex > 0 && (
            <SmoothCurvedButton
              title="이전"
              onPress={handlePrevious}
              style={{
                width: '45%',       // 버튼의 너비를 화면의 절반으로 설정
                marginHorizontal: 5, // 좌우 버튼 간 간격을 조절하기 위해 설정
              }}
            />
          )}
          {pageIndex < pages.length - 1 ? (
            <SmoothCurvedButton
              title="다음"
              onPress={handleNext}
              style={{
                width: '45%',       // 버튼의 너비를 화면의 절반으로 설정
                marginHorizontal: 5, // 좌우 버튼 간 간격을 조절하기 위해 설정
              }}
            />
          ) : (
            <SmoothCurvedButton
              title="완료"
              onPress={() => router.push('../../(init)')}
              style={{
                width: '45%',       // 버튼의 너비를 화면의 절반으로 설정
                marginHorizontal: 5, // 좌우 버튼 간 간격을 조절하기 위해 설정
              }}
            />
          )}
        </View>



      </View>
    </JoinBG>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  description: {
    fontSize: 16,
    color: '#555',
    textAlign: 'center',
    marginBottom: 20,
  },
  iconContainer: {
    marginBottom: 20,
  },
  pagination: {
    flexDirection: 'row',
    marginVertical: 16,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#ccc',
    marginHorizontal: 4,
  },
  activeDot: {
    backgroundColor: '#555',
  },
  buttonGroup: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 20,
  },
});

export default UserGuide;
