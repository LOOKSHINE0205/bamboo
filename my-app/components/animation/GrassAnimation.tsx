import React, { useRef, useEffect } from 'react';
import { Animated, Dimensions, Image, StyleSheet, Easing } from 'react-native';

const { width, height } = Dimensions.get('window'); // 화면 크기 가져오기

const GrassAnimation = () => {
  const grassAnim1 = useRef(new Animated.Value(0)).current;
  const grassAnim2 = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // 첫 번째 풀 애니메이션 설정
    Animated.loop(
      Animated.sequence([
        Animated.timing(grassAnim1, {
          toValue: 1,
          duration: 4000, // 4초 동안 천천히 흔들림
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(grassAnim1, {
          toValue: 0,
          duration: 4000, // 4초 동안 원래 위치로 돌아옴
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ])
    ).start();

    // 두 번째 풀 애니메이션 설정
    Animated.loop(
      Animated.sequence([
        Animated.timing(grassAnim2, {
          toValue: 1,
          duration: 3000, // 두 번째 풀은 약간 다른 속도로 흔들림
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(grassAnim2, {
          toValue: 0,
          duration: 5000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, [grassAnim1, grassAnim2]);

  // 첫 번째 풀의 회전 애니메이션
  const rotate1 = grassAnim1.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '10deg'], // 첫 번째 풀은 10도씩 흔들림
  });

  // 두 번째 풀의 회전 애니메이션
  const rotate2 = grassAnim2.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '-8deg'], // 두 번째 풀은 반대 방향으로 8도씩 흔들림
  });

  return (
    <>
      {/* 첫 번째 풀 */}
      <Animated.Image
        source={require('../../assets/images/grass1.png')} // 첫 번째 풀 이미지
        style={[
          styles.grass,
          { left: width * 0.75 }, // 첫 번째 풀의 위치를 화면 너비의 75%로 설정
          { transform: [{ rotate: rotate1 }] }, // 첫 번째 풀의 흔들리는 애니메이션
        ]}
      />

      {/* 두 번째 풀 */}
      <Animated.Image
        source={require('../../assets/images/grass2.png')} // 두 번째 풀 이미지
        style={[
          styles.grass,
          { top: height * 0.61 }, // 두 번째 풀의 위치를 화면 높이의 80%로 설정
          { left: width * 0.05 }, // 두 번째 풀의 위치를 화면 너비의 5%로 설정
          { transform: [{ rotate: rotate2 }] }, // 두 번째 풀의 흔들리는 애니메이션
        ]}
      />
    </>
  );
};

const styles = StyleSheet.create({
  grass: {
    position: 'absolute',
    bottom: 0, // 땅에서 자라는 것처럼 하단에 배치
    width: width * 0.2, // 풀의 너비를 화면 너비의 20%로 설정
    height: height * 0.15, // 풀의 높이를 화면 높이의 15%로 설정
  },
});

export default GrassAnimation;
