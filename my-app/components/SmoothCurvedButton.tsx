import React, { useState } from 'react';
import Svg, { Path } from 'react-native-svg';
import { TouchableOpacity, Text, StyleSheet, useWindowDimensions } from 'react-native';

const SmoothCurvedButton = ({ onPress, title, style, disabled }) => {
  const { width, height } = useWindowDimensions();
  const buttonWidth = style?.width || width * 0.6;
  const buttonHeight = style?.height || height * 0.06;
  const [isPressed, setIsPressed] = useState(false); // 눌린 상태 관리

  return (
    <TouchableOpacity
      onPress={onPress}
      onPressIn={() => setIsPressed(true)} // 버튼이 눌릴 때 상태 변경
      onPressOut={() => setIsPressed(false)} // 버튼에서 손을 뗄 때 상태 복원
      style={[
        styles.buttonContainer,
        { width: buttonWidth, height: buttonHeight },
        isPressed && styles.pressedEffect, // 눌린 상태에만 스타일 적용
        style,
      ]}
      disabled={disabled}
    >
      <Svg height="100%" width="100%" viewBox="0 0 100 50">
        <Path
          d="M20,0 C5,0 0,5 0,20 L0,30 C0,45 5,50 20,50 L80,50 C95,50 100,45 100,30 L100,20 C100,5 95,0 80,0 Z"
          fill={disabled ? '#cccccc' : isPressed ? '#3a7c54' : '#4a9960'} // 눌린 상태와 기본 상태 색상 구분
        />
      </Svg>
      <Text style={[styles.buttonText, isPressed && styles.buttonTextPressed]}>{title}</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  buttonContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    position: 'absolute',
    color: 'black',
    fontSize: 16,
    fontWeight: 'bold',
  },
  buttonTextPressed: {
    color: '#ffffff', // 눌린 상태에서 텍스트 색상 변경
  },
  pressedEffect: {
    transform: [{ scale: 0.98 }], // 버튼이 눌렸을 때 살짝 작아지는 효과
  },
});

export default SmoothCurvedButton;
