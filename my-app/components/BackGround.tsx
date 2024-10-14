import React, { useEffect, useState } from 'react';
import { StyleSheet, View, Dimensions, Text } from 'react-native';
import LottieView from 'lottie-react-native';
import axios from 'axios';

const { width, height } = Dimensions.get('window');

export default function BackgroundAnimation() {
  const [data, setData] = useState({ message: '' });

  useEffect(() => {
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

  return (
    <View style={styles.container}>
      <LottieView
        source={require('../assets/lottie/bamboo.json')} // Lottie 파일 경로를 지정하세요
        autoPlay
        loop
        style={styles.backgroundAnimation}
      />
      {data.message ? (
        <Text style={styles.subtitle}>{data.message}</Text>
      ) : (
        <Text style={styles.subtitle}>로딩 중...</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  backgroundAnimation: {
    position: 'absolute',
    width: width,
    height: height,
  },
  subtitle: {
    fontSize: 18,
    textAlign: 'center',
    color: 'white', // 배경에 따라 텍스트 색상 조정이 필요할 수 있습니다
    zIndex: 1, // 텍스트를 애니메이션 위에 표시
  },
});