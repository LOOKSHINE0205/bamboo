import React, { forwardRef, useState } from 'react';
import Svg, { Path } from 'react-native-svg';
import { View, TextInput, StyleSheet, Dimensions } from 'react-native';

const { height, width } = Dimensions.get('window');  // 화면의 가로 길이도 가져옵니다.

const SmoothCurvedInput = forwardRef(({
  value,
  onChangeText,
  placeholder,
  style,
  keyboardType,
  customWidth,
  customHeight,
  disabled,
  secureTextEntry,
  fillColor = '#e8f5e9', // fillColor를 기본값으로 추가
    editable = true
}, ref) => {
  // customWidth가 주어지면 그 값을, 아니면 화면의 95%로 설정
  const inputWidth = customWidth || width * 0.95;
  const inputHeight = customHeight || height * 0.06; // 높이만 조정

  const [isPressed, setIsPressed] = useState(false);

  return (
    <View style={[styles.inputContainer, { height: inputHeight }, style]}>
      <Svg height={inputHeight} width={inputWidth} viewBox={`0 0 ${inputWidth} ${inputHeight}`}>
        <Path
                  d={`M30,0 C5,0 0,10 0,30
                    L0,${inputHeight - 30} C0.5,${inputHeight - 6} 6,${inputHeight - 0.5} 30,${inputHeight}
                    L${inputWidth - 30},${inputHeight} C${inputWidth - 6},${inputHeight - 0.5} ${inputWidth - 0.5},${inputHeight - 10} ${inputWidth},${inputHeight - 30}
                    L${inputWidth},30 C${inputWidth - 0.5},10 ${inputWidth - 6},0.5 ${inputWidth - 30},0 Z`}
                    fill={disabled ? '#cccccc' : isPressed ? '#e8f5e9' : fillColor}  // fillColor를 전달받은 값으로 설정

                />
      </Svg>
      <TextInput
        ref={ref}  // ref를 전달하여 포커스를 사용할 수 있게 함
        style={[styles.textInput, { height: inputHeight * 0.7, width: inputWidth }]}  // width 추가
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor="#707070"
        keyboardType={keyboardType}  // keyboardType을 전달
        secureTextEntry={secureTextEntry}  // 비밀번호 필드에서 *로 표시
        editable={editable} // 입력 가능 여부
      />
    </View>
  );
});

const styles = StyleSheet.create({
  inputContainer: {
    width: '100%', // 부모 컨테이너 너비에 맞추도록 설정
    alignItems: 'center',  // 가운데 정렬
    justifyContent: 'center', // 수직 가운데 정렬
    position: 'relative',  // 자식 요소들을 상대적으로 배치
  },
  svg: {
    position: 'absolute',
    top: 0,
    left: 0,
  },
  textInput: {
    position: 'absolute', // 기존 absolute 위치는 그대로 두어야 경계선에 맞게 배치됩니다.
    color: '#333',
    fontSize: 16,
    fontWeight: 'bold',
    paddingHorizontal: 12,
    textAlign: 'center',  // 텍스트 입력을 가운데 정렬
    zIndex: 1, // Svg보다 텍스트가 위로 올라오도록 설정
  },
});

export default SmoothCurvedInput;
