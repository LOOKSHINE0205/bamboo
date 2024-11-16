import React, { useState } from 'react';
import Svg, { Path } from 'react-native-svg';
import { TouchableOpacity, Text, StyleSheet, useWindowDimensions, View, Animated } from 'react-native';

const SmoothCurvedButton = ({ onPress, title, icon, disabled, color = '#4a9960', customWidth, customHeight,style, fadeAnim }) => {
  const { width,height } = useWindowDimensions();
  const buttonWidth = customWidth || width * 0.95;
  const buttonHeight = customHeight || height * 0.06;
  const [isPressed, setIsPressed] = useState(false);
  const [scale] = useState(new Animated.Value(1)); // Animated scale state for button press effect
  const fontSize = Math.min(buttonWidth, buttonHeight) * 0.3;

  // fadeAnim이 존재하면 눌림 애니메이션을 비활성화하도록 처리
  const isFadeAnimPresent = fadeAnim !== undefined;

  // Press in handler
  const onPressIn = () => {
    !isFadeAnimPresent && Animated.spring(scale, { toValue: 0.96, useNativeDriver: true }).start();
    setIsPressed(true);
  };

  // Press out handler
  const onPressOut = () => {
    !isFadeAnimPresent && Animated.spring(scale, { toValue: 1, useNativeDriver: true }).start();
    setIsPressed(false);
  };

  return (
    <TouchableOpacity
      onPress={onPress}
      onPressIn={onPressIn}
      onPressOut={onPressOut}
      style={[
        styles.buttonContainer,
        { width: buttonWidth, height: buttonHeight },
        isFadeAnimPresent && { opacity: fadeAnim }, // fadeAnim이 있을 경우 opacity만 적용
        style, // 부모에서 전달받은 애니메이션 스타일을 여기에 적용
      ]}
      disabled={disabled}
      activeOpacity={0.7}
    >
      <Animated.View
        style={[
          { transform: [{ scale }] }, // 눌렀을 때 애니메이션 효과
          !isFadeAnimPresent && isPressed && styles.pressedEffect, // fadeAnim이 없을 때만 눌림 효과 적용
        ]}
      >
        <Svg height={buttonHeight} width={buttonWidth} viewBox={`0 0 ${buttonWidth} ${buttonHeight}`}>
          <Path
            d={`M30,0 C5,0 0,10 0,30
              L0,${buttonHeight - 30} C0.5,${buttonHeight - 6} 6,${buttonHeight - 0.5} 30,${buttonHeight}
              L${buttonWidth - 30},${buttonHeight} C${buttonWidth - 6},${buttonHeight - 0.5} ${buttonWidth - 0.5},${buttonHeight - 10} ${buttonWidth},${buttonHeight - 30}
              L${buttonWidth},30 C${buttonWidth - 0.5},10 ${buttonWidth - 6},0.5 ${buttonWidth - 30},0 Z`}
            fill={disabled ? '#cccccc' : isPressed ? '#3a7c54' : color}
          />
        </Svg>
      </Animated.View>
      <View style={styles.contentWrapper}>
        {icon && <View style={[styles.iconWrapper, !!title && { marginRight: 8 }]}>{icon}</View>}
        {title && <Text style={[styles.buttonText, { fontSize }, isPressed && styles.buttonTextPressed]}>{title}</Text>}
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  buttonContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.4,
    shadowRadius: 10,
    elevation: 12,
    borderRadius: 20,
  },
  contentWrapper: {
    position: 'absolute',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
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
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
  },
});

export default SmoothCurvedButton;
