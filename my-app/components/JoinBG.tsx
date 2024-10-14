import React from 'react';
import { StyleSheet, View } from 'react-native';

type JoinBGProps = React.PropsWithChildren<{}>;

export default function JoinBG({ children }: JoinBGProps) {
  return (
      <View style={styles.container}>
        {/* 반투명 초록 원 */}
        <View style={[styles.circle, { top: 50, left: 20, backgroundColor: '#e0f7df' }]} />
        <View style={[styles.circle, { top: 200, right: 20, backgroundColor: '#d2f0d1' }]} />
        <View style={[styles.circle, { bottom: 100, left: 100, backgroundColor: '#cce5cc' }]} />
        <View style={[styles.circle, { bottom: 50, right: 150, backgroundColor: '#b8ddb8' }]} />

        {/* 자식 컴포넌트 */}
        <View style={styles.contentContainer}>
          {children}
        </View>
      </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f0fff4', // 전체적으로 옅은 초록빛 배경
    position: 'relative', // 자식 요소가 부모 기준으로 배치되도록 설정
  },
  circle: {
    position: 'absolute',
    width: 200,
    height: 200,
    borderRadius: 100, // 원형
    opacity: 0.5, // 투명도 조절
  },
  contentContainer: {
    flex: 1,
    zIndex: 1, // 원들 위에 자식 컴포넌트를 표시
  },
});
