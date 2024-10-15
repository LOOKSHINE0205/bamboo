import React, { useRef, useEffect } from 'react';
import { Animated, Dimensions, StyleSheet } from 'react-native';

const { width, height } = Dimensions.get('window'); // 현재 화면의 너비와 높이 가져오기

const CloudAnimation = () => {
  const cloudAnim1 = useRef(new Animated.Value(0)).current;
  const cloudAnim2 = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // 첫 번째 구름 애니메이션 (느리게 이동)
    Animated.loop(
      Animated.sequence([
        Animated.timing(cloudAnim1, {
          toValue: width,
          duration: 12000, // 느린 속도
          useNativeDriver: true,
        }),
        Animated.timing(cloudAnim1, {
          toValue: -width,
          duration: 0,
          useNativeDriver: true,
        }),
      ])
    ).start();

    // 두 번째 구름 애니메이션 (빠르게 이동)
    Animated.loop(
      Animated.sequence([
        Animated.timing(cloudAnim2, {
          toValue: width,
          duration: 8000, // 빠른 속도
          useNativeDriver: true,
        }),
        Animated.timing(cloudAnim2, {
          toValue: -width,
          duration: 0,
          useNativeDriver: true,
        }),
      ])
    ).start();
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
          { top: height * 0.2, transform: [{ translateX: cloudAnim2 }] }, // 화면 높이의 30% 위치
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
  },
});

export default CloudAnimation;
