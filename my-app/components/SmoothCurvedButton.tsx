import React, { useState } from 'react';
import Svg, { Path } from 'react-native-svg';
import { TouchableOpacity, Text, StyleSheet, useWindowDimensions, View } from 'react-native';

const SmoothCurvedButton = ({ onPress, title, icon, disabled, color = '#4a9960', customWidth }) => {
  const { width } = useWindowDimensions();
  const buttonWidth = customWidth || width*0.95;
  const buttonHeight = 60;
  const [isPressed, setIsPressed] = useState(false);
  const fontSize = Math.min(buttonWidth, buttonHeight) * 0.3;

  return (
    <TouchableOpacity
      onPress={onPress}
      onPressIn={() => setIsPressed(true)}
      onPressOut={() => setIsPressed(false)}
      style={[
        styles.buttonContainer,
        { width: buttonWidth, height: buttonHeight },
        isPressed && styles.pressedEffect,
      ]}
      disabled={disabled}
      activeOpacity={0.7}
    >
      <Svg height={buttonHeight} width={buttonWidth} viewBox={`0 0 ${buttonWidth} ${buttonHeight}`}>
        <Path
          d={`
            M25,0
            C5,0 0,10 0,25
            L0,${buttonHeight - 25}
            C0,${buttonHeight - 15} 5,${buttonHeight} 25,${buttonHeight}
            L${buttonWidth - 25},${buttonHeight}
            C${buttonWidth - 5},${buttonHeight} ${buttonWidth},${buttonHeight - 15} ${buttonWidth},${buttonHeight - 25}
            L${buttonWidth},25
            C${buttonWidth},10 ${buttonWidth - 5},0 ${buttonWidth - 25},0
            Z`}
          fill={disabled ? '#cccccc' : isPressed ? '#3a7c54' : color}
        />
      </Svg>
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
    transform: [{ scale: 0.98 }],
  },
});

export default SmoothCurvedButton;
