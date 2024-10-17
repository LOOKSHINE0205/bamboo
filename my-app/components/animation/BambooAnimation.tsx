import React, { useRef, useEffect } from 'react';
import { Animated, Image, StyleSheet, Easing, Dimensions } from 'react-native';

const { width, height } = Dimensions.get('window'); // 현재 디바이스의 화면 크기 가져오기

const BambooAnimation = () => {
  const leafRotation1 = useRef(new Animated.Value(0)).current; // 첫 번째 나뭇잎 회전 애니메이션 값
  const leafRotation2 = useRef(new Animated.Value(0)).current; // 두 번째 나뭇잎 회전 애니메이션 값
  const leafRotation3 = useRef(new Animated.Value(0)).current; // 세 번째 나뭇잎 회전 애니메이션 값
  const leafRotation4 = useRef(new Animated.Value(0)).current; // 네 번째 나뭇잎 회전 애니메이션 값

  useEffect(() => {
    // 첫 번째 나뭇잎 애니메이션 설정
    Animated.loop(
      Animated.sequence([
        Animated.timing(leafRotation1, {
          toValue: 1,
          duration: 2000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(leafRotation1, {
          toValue: 0,
          duration: 2000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ])
    ).start();

    // 두 번째 나뭇잎 애니메이션 설정
    Animated.loop(
      Animated.sequence([
        Animated.timing(leafRotation2, {
          toValue: 1,
          duration: 2200, // 살짝 다른 애니메이션 속도로 설정
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(leafRotation2, {
          toValue: 0,
          duration: 2200,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ])
    ).start();

    // 세 번째 나뭇잎 애니메이션 설정
    Animated.loop(
      Animated.sequence([
        Animated.timing(leafRotation3, {
          toValue: 1,
          duration: 1500, // 살짝 다른 애니메이션 속도로 설정
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(leafRotation3, {
          toValue: 0,
          duration: 1500,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ])
    ).start();

    // 네 번째 나뭇잎 애니메이션 설정 (좌우 반전)
    Animated.loop(
      Animated.sequence([
        Animated.timing(leafRotation4, {
          toValue: 1,
          duration: 1500, // 살짝 다른 애니메이션 속도로 설정
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(leafRotation4, {
          toValue: 0,
          duration: 1500,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, [leafRotation1, leafRotation2, leafRotation3, leafRotation4]);

  // 첫 번째 나뭇잎 회전 보간
  const rotateInterpolation1 = leafRotation1.interpolate({
    inputRange: [-1, 1],
    outputRange: ['-5deg', '3deg'],
  });

  // 두 번째 나뭇잎 회전 보간
  const rotateInterpolation2 = leafRotation2.interpolate({
    inputRange: [-1, 1],
    outputRange: ['-5deg', '3deg'], // 회전 각도를 살짝 다르게 설정
  });

  // 세 번째 나뭇잎 회전 보간
  const rotateInterpolation3 = leafRotation3.interpolate({
    inputRange: [-1, 1],
    outputRange: ['-5deg', '3deg'], // 회전 각도를 살짝 다르게 설정
  });

  // 네 번째 나뭇잎 회전 보간 (반대 방향으로 회전)
  const rotateInterpolation4 = leafRotation4.interpolate({
    inputRange: [-1, 1],
    outputRange: ['3deg', '-6deg'], // 좌우 반전을 위한 반대 방향 회전
  });

  return (
    <>
      {/* 첫 번째 나뭇잎 */}
      <Animated.Image
        source={require('../../assets/images/bamboo_leaves1.png')} // 나뭇잎 이미지 경로
        style={[styles.bambooLeaves, { transform: [{ rotate: rotateInterpolation1 }] }]}
      />

      {/* 두 번째 나뭇잎 */}
      <Animated.Image
        source={require('../../assets/images/bamboo_leaves1.png')} // 나뭇잎 이미지 경로
        style={[styles.bambooLeaves2, { transform: [{ rotate: rotateInterpolation2 }] }]}
      />

      {/* 세 번째 나뭇잎 */}
      <Animated.Image
        source={require('../../assets/images/bamboo_leaves1.png')} // 나뭇잎 이미지 경로
        style={[styles.bambooLeaves3, { transform: [{ rotate: rotateInterpolation3 }] }]}
      />

      {/* 네 번째 나뭇잎 (좌우 반전) */}
      <Animated.Image
        source={require('../../assets/images/bamboo_leaves1.png')} // 나뭇잎 이미지 경로
        style={[
          styles.bambooLeaves4,
          {
            transform: [
              { rotate: rotateInterpolation4 }, // 반대 방향 회전
              { scaleX: -1 } // 좌우 반전
            ]
          }
        ]}
      />
    </>
  );
};

const styles = StyleSheet.create({
  bambooLeaves: {
    position: 'absolute',
    top: height * 0.17,
    left: width * 0.2,
    width: width * 0.12,
    height: height * 0.1,
    resizeMode: 'contain',
    zIndex: 0,
  },
  bambooLeaves2: {
    position: 'absolute',
    top: height * 0.23, // 첫 번째 나뭇잎보다 아래로 위치
    left: width * 0.2, // 첫 번째 나뭇잎과 같은 위치
    width: width * 0.12,
    height: height * 0.1,
    resizeMode: 'contain',
    zIndex: 0,
  },
  bambooLeaves3: {
    position: 'absolute',
    top: height * 0.4, // 세 번째 나뭇잎은 더 아래로 위치
    left: width * 0.282, // 세 번째 나뭇잎은 오른쪽에 위치
    width: width * 0.12,
    height: height * 0.1,
    resizeMode: 'contain',
    zIndex: 0,
  },
  bambooLeaves4: {
    position: 'absolute',
    top: height * 0.3, // 네 번째 나뭇잎은 세 번째 보다 높이 위치
    left: width * 0.038, // 네 번째 나뭇잎은 왼쪽에 위치
    width: width * 0.12,
    height: height * 0.1,
    resizeMode: 'contain',
    zIndex: 0,
  },
});

export default BambooAnimation;
