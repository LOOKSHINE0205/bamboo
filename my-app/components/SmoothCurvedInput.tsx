import React from 'react';
import Svg, { Path } from 'react-native-svg';
import { View, TextInput, StyleSheet, Dimensions } from 'react-native';

const { height } = Dimensions.get('window');

const SmoothCurvedInput = ({ value, onChangeText, placeholder, style }) => {
  const inputHeight = height * 0.06; // 높이만 조정

  return (
    <View style={[styles.inputContainer, { height: inputHeight }, style]}>
      <Svg height={inputHeight} width="100%" viewBox="0 0 100 20" style={styles.svg}>
        <Path
          d="M5,0 C3,0 0,3 0,5 L0,15 C0,17 3,20 5,20 L95,20 C97,20 100,17 100,15 L100,5 C100,3 97,0 95,0 Z"
          fill="#e0e0e0"
          scaleY={inputHeight / 20} // 세로 스케일링 적용
        />
      </Svg>
      <TextInput
        style={[styles.textInput, { height: inputHeight * 0.7 }]}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor="#707070"
      />
    </View>
  );
};

const styles = StyleSheet.create({
  inputContainer: {
    width: '100%', // 부모 컨테이너 너비에 맞추도록 설정
    alignItems: 'center',
    justifyContent: 'center',
  },
  svg: {
    position: 'absolute',
    top: 0,
    left: 0,
  },
  textInput: {
    position: 'absolute',
    color: '#333',
    fontSize: 16,
    fontWeight: 'bold',
    paddingHorizontal: 12,
  },
});

export default SmoothCurvedInput;
