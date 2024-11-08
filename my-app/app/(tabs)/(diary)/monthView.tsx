import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';

interface DiaryEntry {
  diary_idx: number;
  user_email: string;
  emotion_tag: string;
  diary_content: string;
  diary_weather: string;
  diary_photo: string | null;
  created_at: string;
}

export default function MonthView() {
  const { year, month } = useLocalSearchParams<{
    year: string;
    month: string;
  }>();

  const [diaries, setDiaries] = useState<DiaryEntry[]>([]);
  const [loading, setLoading] = useState(false); // 로딩을 바로 false로 설정

  // 감정 이모지 매핑
  const emotionImages = {
    happy: require("../../../assets/images/diary_happy.png"),
    sad: require("../../../assets/images/diary_sad.png"),
    neutral: require("../../../assets/images/diary_neutral.png"),
    angry: require("../../../assets/images/diary_angry.png"),
    surprise: require("../../../assets/images/diary_surprise.png"),
    fear: require("../../../assets/images/diary_fear.png"),
    dislike: require("../../../assets/images/diary_dislike.png"),
  };

  useEffect(() => {
    fetchMonthDiaries();
  }, [year, month]);

  // 더미 데이터를 사용한 fetch 함수
  const fetchMonthDiaries = async () => {
    try {
      // 더미 데이터 설정
      const dummyData: DiaryEntry[] = [
        {
          diary_idx: 1,
          user_email: "test@example.com",
          emotion_tag: "happy",
          diary_content: "오늘은 날씨가 좋아서 기분이 좋았다!",
          diary_weather: "맑음",
          diary_photo: null,
          created_at: "2023-10-10T10:00:00Z",
        },
        {
          diary_idx: 2,
          user_email: "test@example.com",
          emotion_tag: "sad",
          diary_content: "오늘은 조금 우울한 날이었다.",
          diary_weather: "비",
          diary_photo: "https://example.com/photo.jpg",
          created_at: "2023-10-11T14:00:00Z",
        },
      ];
      setDiaries(dummyData);
    } catch (error) {
      console.error('Error fetching diaries:', error);
    } finally {
      setLoading(false);
    }
  };

  // 날짜 포맷팅 함수
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return `${date.getMonth() + 1}월 ${date.getDate()}일`;
  };

  // 개별 일기 항목 렌더링
  const renderDiaryItem = ({ item }: { item: DiaryEntry }) => (
    <TouchableOpacity
      style={styles.diaryItem}
      onPress={() => router.push({
        pathname: "/(diary)/diaryScreen",
        params: { date: item.created_at.split('T')[0] }
      })}
    >
      <View style={styles.diaryHeader}>
        <Text style={styles.dateText}>{formatDate(item.created_at)}</Text>
        <View style={styles.weatherEmotion}>
          <Text style={styles.weatherText}>{item.diary_weather}</Text>
          <Image
            source={emotionImages[item.emotion_tag]}
            style={styles.emotionImage}
          />
        </View>
      </View>
      <View style={styles.contentContainer}>
        <Text
          style={styles.contentText}
          numberOfLines={2}
        >
          {item.diary_content}
        </Text>
        {item.diary_photo && (
          <Image
            source={{ uri: item.diary_photo }}
            style={styles.photoThumbnail}
          />
        )}
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>{year}년 {month}월의 일기</Text>
      </View>
      {loading ? (
        <View style={styles.centerContainer}>
          <Text>로딩 중...</Text>
        </View>
      ) : diaries.length === 0 ? (
        <View style={styles.centerContainer}>
          <Text>이번 달 작성된 일기가 없습니다.</Text>
        </View>
      ) : (
        <FlatList
          data={diaries}
          renderItem={renderDiaryItem}
          keyExtractor={(item) => item.diary_idx.toString()}
          contentContainerStyle={styles.listContainer}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  listContainer: {
    padding: 16,
  },
  diaryItem: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  diaryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  dateText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  weatherEmotion: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  weatherText: {
    marginRight: 8,
    color: '#666',
  },
  emotionImage: {
    width: 24,
    height: 24,
    borderRadius: 12,
  },
  contentContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  contentText: {
    flex: 1,
    fontSize: 14,
    color: '#666',
    marginRight: 8,
  },
  photoThumbnail: {
    width: 50,
    height: 50,
    borderRadius: 4,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
