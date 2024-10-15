import React, { useRef, useEffect } from 'react';
import { Animated, Image, StyleSheet, Easing, Dimensions } from 'react-native';

const { width, height } = Dimensions.get('window'); // 현재 디바이스의 화면 크기 가져오기

const BambooAnimation = () => {
  const leafAnim1 = useRef(new Animated.Value(0)).current;
  const leafAnim2 = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // 첫 번째 나뭇잎 애니메이션 설정
    Animated.loop(
      Animated.sequence([
        Animated.timing(leafAnim1, {
          toValue: -20, // 위로 20px 이동
          duration: 6000, // 6초 동안 위로 이동
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(leafAnim1, {
          toValue: 20, // 아래로 20px 이동
          duration: 6000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ])
    ).start();

    // 두 번째 나뭇잎 애니메이션 설정
    Animated.loop(
      Animated.sequence([
        Animated.timing(leafAnim2, {
          toValue: -15, // 위로 15px 이동
          duration: 7000, // 7초 동안 위로 이동
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(leafAnim2, {
          toValue: 15, // 아래로 15px 이동
          duration: 7000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, [leafAnim1, leafAnim2]);

  return (
    <>
      {/* 첫 번째 나뭇잎 */}
      <Animated.Image
        source={require('../../assets/images/bamboo_leaves.png')}
        style={[
          styles.bambooLeaves,
          { transform: [{ translateY: leafAnim1 }] },
        ]}
      />
      {/* 두 번째 나뭇잎 */}
      <Animated.Image
        source={require('../../assets/images/bamboo_leaves2.png')}
        style={[
          styles.bambooLeaves2,
          { transform: [{ translateY: leafAnim2 }] },
        ]}
      />
    </>
  );
};

const styles = StyleSheet.create({
  bambooLeaves: {
    position: 'absolute',
    top: height * 0.20, // 화면 높이의 25%에 위치
    left: width * 0.03, // 화면 너비의 10%에 위치
    width: width * 0.3, // 화면 너비의 30% 크기
    height: height * 0.2, // 화면 높이의 20% 크기
  },
  bambooLeaves2: {
    position: 'absolute',
    top: height * 0.42, // 화면 높이의 50%에 위치
    left: width * 0.20, // 화면 너비의 25%에 위치
    width: width * 0.25, // 화면 너비의 25% 크기
    height: height * 0.18, // 화면 높이의 18% 크기
  },
});

export default BambooAnimation;
