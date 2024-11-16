import React, { forwardRef, useState } from 'react';
import Svg, { Path } from 'react-native-svg';
import { View, StyleSheet, Dimensions } from 'react-native';

const { width,height } = Dimensions.get('window');  // 화면의 가로 길이

const SmoothCurvedView = forwardRef(({
  style,
  customWidth,
  disabled,
  children,
  backgroundColor,
  fill = '#FFFFFF',
  height: customHeight // height를 prop으로 받기
}, ref) => {
  // customHeight가 주어지면 그 값을, 아니면 화면의 6%로 설정
  const inputHeight = customHeight || height * 0.06; // 기본값 6% 높이

  // customWidth가 주어지면 그 값을, 아니면 화면의 95%로 설정
  const inputWidth = customWidth || width * 0.95;

  const [isPressed, setIsPressed] = useState(false);

  return (
    <View style={[styles.inputContainer, { height: inputHeight, width: inputWidth }, style]}>
      <Svg height={inputHeight} width={inputWidth} viewBox={`0 0 ${inputWidth} ${inputHeight}`}>
        <Path
          d={`M30,0 C5,0 0,10 0,30
            L0,${inputHeight - 30} C0.5,${inputHeight - 6} 6,${inputHeight - 0.5} 30,${inputHeight}
            L${inputWidth - 30},${inputHeight} C${inputWidth - 6},${inputHeight - 0.5} ${inputWidth - 0.5},${inputHeight - 10} ${inputWidth},${inputHeight - 30}
            L${inputWidth},30 C${inputWidth - 0.5},10 ${inputWidth - 6},0.5 ${inputWidth - 30},0 Z`}
          fill={disabled ? '#cccccc' : isPressed ? '#3a7c54' : fill}  // fill 값이 없으면 기본값을 흰색으로 설정
        />
      </Svg>
      <View
        ref={ref}  // ref를 전달하여 포커스를 사용할 수 있게 함
        style={[styles.viewContent, { height: inputHeight * 0.7, width: inputWidth }]}>
        {children}  {/* 자식 요소들을 전달 */}
      </View>
    </View>
  );
});

const styles = StyleSheet.create({
  inputContainer: {
    alignItems: 'center',  // 가운데 정렬
    justifyContent: 'center', // 수직 가운데 정렬
    position: 'relative',  // 자식 요소들을 상대적으로 배치
  },
  svg: {
    position: 'absolute',
    top: 0,
    left: 0,
  },
  viewContent: {
    position: 'absolute', // 기존 absolute 위치는 그대로 두어야 경계선에 맞게 배치됩니다.
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default SmoothCurvedView;
