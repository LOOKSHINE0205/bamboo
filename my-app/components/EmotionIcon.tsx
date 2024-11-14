import React from 'react';
import { View, Image, Text, TouchableOpacity, StyleSheet, useWindowDimensions } from 'react-native';

interface EmotionIconProps {
  emotionIcon: { key: string; label: string; icon: any }[];
  toggleEmotion: (emotion: string) => void;
  selectedEmotions: string[];
}

const EmotionIcon: React.FC<EmotionIconProps> = ({
  emotionIcon,
  toggleEmotion,
  selectedEmotions,
}) => {
  const { width: screenWidth, height: screenHeight } = useWindowDimensions();
  const aspectRatio = screenWidth / screenHeight;

  // 스타일을 동적으로 조정
  const iconContainerStyle = {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: aspectRatio >= 0.6 ? 20 : 0.2, // 화면 비율에 따라 아이콘 간격 조정
  };

  const iconSize = aspectRatio >= 0.6 ? 40 : 20; // 화면 비율에 따라 아이콘 크기 조정

  return (
    <View style={[styles.iconContainer, iconContainerStyle]}>
      {emotionIcon.map((emotion) => (
        <TouchableOpacity
          key={emotion.key}
          onPress={() => toggleEmotion(emotion.label)}
          style={[
            styles.iconLabelContainer,
            { opacity: selectedEmotions.includes(emotion.label) ? 1 : 0.4 },
          ]}
        >
          <Image source={emotion.icon} style={{ width: iconSize+2, height: iconSize }} />
          <Text style={styles.iconLabel}>{emotion.label}</Text>
        </TouchableOpacity>
      ))}
    </View>
  );
};

export default EmotionIcon;

const styles = StyleSheet.create({
  iconContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconLabelContainer: {
    alignItems: 'center',
    marginHorizontal: 10,
    marginTop: 15,
  },
  iconLabel: {
    fontSize: 12,
    color: '#666',
    marginTop: 5,
  },
});
