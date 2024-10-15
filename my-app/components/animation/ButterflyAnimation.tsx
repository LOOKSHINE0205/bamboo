import React, { useRef, useEffect } from 'react';
import { Animated, Image, StyleSheet, Dimensions } from 'react-native';

const { width, height } = Dimensions.get('window');

const ButterflyAnimation = () => {
  const butterflyX = useRef(new Animated.Value(0)).current;
  const butterflyY = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const animateButterfly = () => {
      Animated.sequence([
        // 첫 번째 대각선 이동
        Animated.parallel([
          Animated.timing(butterflyX, {
            toValue: Math.random() * width, // 랜덤한 X 좌표로 이동
            duration: 1500 + Math.random() * 2000, // 1.5초 ~ 3.5초 사이
            useNativeDriver: true,
          }),
          Animated.timing(butterflyY, {
            toValue: Math.random() * height, // 랜덤한 Y 좌표로 이동
            duration: 1500 + Math.random() * 2000,
            useNativeDriver: true,
          }),
        ]),
        // 두 번째 대각선 이동
        Animated.parallel([
          Animated.timing(butterflyX, {
            toValue: Math.random() * width,
            duration: 1500 + Math.random() * 2000,
            useNativeDriver: true,
          }),
          Animated.timing(butterflyY, {
            toValue: Math.random() * height,
            duration: 1500 + Math.random() * 2000,
            useNativeDriver: true,
          }),
        ]),
        // 세 번째 대각선 이동
        Animated.parallel([
          Animated.timing(butterflyX, {
            toValue: Math.random() * width,
            duration: 1500 + Math.random() * 2000,
            useNativeDriver: true,
          }),
          Animated.timing(butterflyY, {
            toValue: Math.random() * height,
            duration: 1500 + Math.random() * 2000,
            useNativeDriver: true,
          }),
        ]),
      ]).start(() => animateButterfly()); // 애니메이션이 끝나면 다시 시작
    };

    animateButterfly();
  }, [butterflyX, butterflyY]);

  return (
    <Animated.Image
      source={require('../../assets/images/butterfly.png')}
      style={[
        styles.butterfly,
        {
          transform: [
            { translateX: butterflyX },
            { translateY: butterflyY },
          ],
        },
      ]}
    />
  );
};

const styles = StyleSheet.create({
  butterfly: {
    position: 'absolute',
    width: 50,
    height: 50,
  },
});

export default ButterflyAnimation;
