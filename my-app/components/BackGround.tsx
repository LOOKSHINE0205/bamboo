import React, { useEffect, useState } from 'react';
import { StyleSheet, View, Image, Dimensions, Text } from 'react-native';
import Animated, { useSharedValue, useAnimatedStyle, withRepeat, withTiming } from 'react-native-reanimated';
import axios from 'axios';

const { width } = Dimensions.get('window');

export default function BackgroundAnimation() {
  // X 좌표를 나타내는 shared value 생성
  const translateX = useSharedValue(0);

  // 한문장시
  const [data, setData] = useState({ message: '' });

  useEffect(() => {
    // 애니메이션 설정: 부드럽게 반복 이동
    translateX.value = withRepeat(
      withTiming(-width, { duration: 8000 }),
      -1,
      true
    );

    const fetchMessage = async () => {
      try {
        const response = await axios.get('http://10.0.2.2:8082/api');
        setData({ message: response.data });
      } catch (error) {
        console.error('Error fetching message:', error);
      }
    };
    fetchMessage();
  }, []);

  // 스타일에 애니메이션 값 적용
  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ translateX: translateX.value }],
    };
  });

  return (
    <View style={styles.container}>
      {data.message ? (
        <Text style={styles.subtitle}>{data.message}</Text>
      ) : (
        <Text>로딩 중...</Text>
      )}
      <Animated.View style={[styles.background, animatedStyle]}>
        <Image
          source={require('../assets/images/react-logo2x.png')}
          style={styles.image}
          resizeMode="repeat"
        />
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    overflow: 'hidden',
  },
  background: {
    flexDirection: 'row',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  image: {
    width: width * 2, // 이미지가 화면을 반복해서 덮도록 두 배로 설정
    height: '100%',
  },
  text: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginTop: 20,
  },
  subtitle: {
    fontSize: 18,
    textAlign: 'center',
    marginTop: 10,
  },
});