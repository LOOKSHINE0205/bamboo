import React, { useState } from 'react';
import Svg, { Path } from 'react-native-svg';
import { TouchableOpacity, Text, StyleSheet, useWindowDimensions, View } from 'react-native';

const SmoothCurvedButton = ({ onPress, title, icon, style, disabled, svgWidth = 130, svgPath, color = '#4a9960' }) => {
  const { width, height } = useWindowDimensions();
  const buttonWidth = style?.width || width * 0.6 || svgWidth;
  const buttonHeight = style?.height || height * 0.06 || 50;
  const [isPressed, setIsPressed] = useState(false);
  const aspectRatio = width / height; // 화면 비율 계산
  const fontSize = Math.min(buttonWidth, buttonHeight) * 0.3; // 버튼 크기에 비례하는 폰트 크기 설정


  return (

      <TouchableOpacity
          onPress={onPress}
          onPressIn={() => setIsPressed(true)}
          onPressOut={() => setIsPressed(false)}
          style={[
            styles.buttonContainer,
            { width: buttonWidth, height: buttonHeight },
            isPressed && styles.pressedEffect,
            style,
          ]}
          disabled={disabled}
          pointerEvents="box-none" // 추가
      >

      <Svg height="100%" width="100%" viewBox={`0 0 ${svgWidth} 50`}>
        <Path
          d={
            svgPath ||
            `M20,0 C5,0 0,5 0,20 L0,30 C0,45 5,50 20,50 L${svgWidth - 20},50 C${svgWidth - 5},50 ${svgWidth},45 ${svgWidth},30 L${svgWidth},20 C${svgWidth},5 ${svgWidth - 5},0 ${svgWidth - 20},0 Z`
          }
          fill={disabled ? '#cccccc' : isPressed ? '#3a7c54' : color}
        />
      </Svg>

      <View style={styles.contentWrapper}>
        {icon && <View style={styles.iconWrapper}>{icon}</View>}
        {title && <Text style={[styles.buttonText, { fontSize }, isPressed && styles.buttonTextPressed]}>{title}</Text>}
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  buttonContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  contentWrapper: {
    position: 'absolute',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconWrapper: {
    marginRight: 5, // icon과 title 사이 간격
  },
  buttonText: {
    color: 'black',
    fontWeight: 'bold',
    textAlign: 'center',
  },
  buttonTextPressed: {
    color: '#ffffff',
  },
  pressedEffect: {
    transform: [{ scale: 0.98 }],
  },
});

export default SmoothCurvedButton;
