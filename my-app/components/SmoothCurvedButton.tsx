import React, { useState } from 'react';
import Svg, { Path } from 'react-native-svg';
import { TouchableOpacity, Text, StyleSheet, useWindowDimensions, View } from 'react-native';

const SmoothCurvedButton = ({ onPress, title, style, disabled, svgWidth = 130, svgPath, color = '#4a9960' }) => {
  const { width, height } = useWindowDimensions();
  const buttonWidth = style?.width || width * 0.6 || svgWidth;
  const buttonHeight = style?.height || height * 0.06 || 50;
  const [isPressed, setIsPressed] = useState(false);

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

      <View style={styles.textWrapper}>
        <Text style={[styles.buttonText, isPressed && styles.buttonTextPressed]}>{title}</Text>
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
  textWrapper: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    top: 0,
    left: 0,
  },
  buttonText: {
    color: 'black',
    fontSize: 16,
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
