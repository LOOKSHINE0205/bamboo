import React, { useRef, useEffect } from 'react';
import { Animated, Dimensions, StyleSheet } from 'react-native';

const { width, height } = Dimensions.get('window'); // 현재 화면의 너비와 높이 가져오기

const CloudAnimation = () => {
  const cloudAnim1 = useRef(new Animated.Value(-width*0.25)).current; // 첫 번째 구름의 초기 위치를 화면 왼쪽 바깥으로 설정
  const cloudAnim2 = useRef(new Animated.Value(-width*0.25)).current; // 두 번째 구름의 초기 위치를 화면 왼쪽 바깥으로 설정

  useEffect(() => {
    // 구름 애니메이션 함수
    const animateCloud = (cloudAnim, duration) => {
      Animated.loop(
        Animated.sequence([
          Animated.timing(cloudAnim, {
            toValue: width, // 화면 오른쪽으로 이동
            duration: duration, // 지정된 속도
            useNativeDriver: true,
          }),
          Animated.timing(cloudAnim, {
            toValue: -width, // 다시 화면 왼쪽 바깥으로 이동
            duration: 0, // 즉시 이동
            useNativeDriver: true,
          }),
        ])
      ).start();
    };

    // 첫 번째 구름 애니메이션 시작 (느리게 이동)
    animateCloud(cloudAnim1, 12000); // 느린 속도로 이동
    // 두 번째 구름 애니메이션 시작 (빠르게 이동)
    animateCloud(cloudAnim2, 10000); // 빠른 속도로 이동
  }, [cloudAnim1, cloudAnim2]);

  return (
    <>
      {/* 첫 번째 구름 */}
      <Animated.Image
        source={require('../../assets/images/cloud.png')}
        style={[
          styles.cloud,
          { top: height * 0.09, transform: [{ translateX: cloudAnim1 }] }, // 화면 높이의 10% 위치
        ]}
      />

      {/* 두 번째 구름, 위치를 더 아래로 설정 */}
      <Animated.Image
        source={require('../../assets/images/cloud.png')}
        style={[
          styles.cloud,
          { top: height * 0.2, transform: [{ translateX: cloudAnim2 }] }, // 화면 높이의 20% 위치
        ]}
      />
    </>
  );
};

const styles = StyleSheet.create({
  cloud: {
    position: 'absolute',
    width: width * 0.25, // 화면 너비의 25% 크기
    height: height * 0.1, // 화면 높이의 10% 크기
    zIndex: 1, // 이미지가 맨 뒤에 배치되도록 설정
  },
});

export default CloudAnimation;
