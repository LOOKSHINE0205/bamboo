import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import Ionicons from 'react-native-vector-icons/Ionicons';


// 일기 항목 인터페이스 정의
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
  // URL 매개변수로 받은 year, month 값을 상태로 저장
  const { year: initialYear, month: initialMonth } = useLocalSearchParams<{
    year: string;
    month: string;
  }>();

  // 상태 정의
  const [year, setYear] = useState(parseInt(initialYear));   // 연도 상태
  const [month, setMonth] = useState(parseInt(initialMonth)); // 월 상태
  const [diaries, setDiaries] = useState<DiaryEntry[]>([]);  // 일기 목록 상태
  const [loading, setLoading] = useState(false);             // 로딩 상태

  // 감정 이모지 매핑 (감정 상태에 따른 이미지)
  const emotionImages = {
    happy: require("../../../assets/images/diary_happy.png"),
    sad: require("../../../assets/images/diary_sad.png"),
    neutral: require("../../../assets/images/diary_neutral.png"),
    angry: require("../../../assets/images/diary_angry.png"),
    surprise: require("../../../assets/images/diary_surprise.png"),
    fear: require("../../../assets/images/diary_fear.png"),
    dislike: require("../../../assets/images/diary_dislike.png"),
  };

  // 날씨 이모지 매핑 (날씨 상태에 따른 이미지)
  const weatherImages = {
     sunny: require("../../../assets/images/diary_맑음.png"),
      cloudy: require("../../../assets/images/diary_구름.png"),
      rainy: require("../../../assets/images/diary_비.png"),
      snowy: require("../../../assets/images/diary_눈.png"),
      thunderstorm: require("../../../assets/images/diary_천둥번개.png"),
  };

  // 컴포넌트가 처음 마운트되거나 year, month 상태가 변경될 때 일기 데이터를 로드
  useEffect(() => {
    fetchMonthDiaries();
  }, [year, month]);

  // 더미 데이터를 사용해 fetch 함수 정의
  const fetchMonthDiaries = async () => {
    try {
      setLoading(true);
      // 더미 데이터 설정
      const dummyData: DiaryEntry[] = [
        { diary_idx: 1,
            user_email: "test@example.com",
            emotion_tag: "happy",
            diary_content: "오늘은 날씨가 좋아서 기분이 좋았다!",
            diary_weather: "sunny",
            diary_photo: null,
            created_at: "2024-10-10T10:00:00Z" },
        { diary_idx: 2,
            user_email: "test@example.com",
            emotion_tag: "sad",
            diary_content: "ㅠㅠㅠㅠㅠㅠㅠㅠㅠㅠ 슬프다",
            diary_weather: "rainy",
            diary_photo: "https://example.com/photo.jpg",
            created_at: "2024-10-11T14:00:00Z" },
        { diary_idx: 3,
                    user_email: "test@example.com",
                    emotion_tag: "surprise",
                    diary_content: "오늘 하루는 참 특별한 하루였다. 아침에 일어나서 창문을 열자, 차가운 공기가 얼굴을 스쳤다. 어제 밤 비가 내리더니, 날씨가 선선해졌다. 덕분에 기분도 상쾌했다. 집을 나서기 전에, 따뜻한 차 한 잔을 마시고, 오늘 해야 할 일들을 정리해 보았다. 요즘은 매일 하루 계획을 세우는 걸 습관으로 들여서 그런지, 아침에 정신이 더 맑아지는 것 같다.",
                    diary_weather: "snowy",
                    diary_photo: "https://example.com/photo.jpg",
                    created_at: "2024-11-11T14:00:00Z" },
        { diary_idx: 4,
                    user_email: "test@example.com",
                    emotion_tag: "neutral",
                    diary_content: "출근길에는 교통이 꽤 막혔다. 가끔 이렇게 막힐 때면, 내가 왜 이렇게 서두르는지 의문이 들기도 한다. 하지만 이번에는 교차로에서 신호가 바뀌는 순간에 흘러가는 시간을 조금 더 여유롭게 생각해보려고 했다. 바쁘게 살기만 하다 보면 이런 작은 순간들을 놓치기 쉬운 것 같아서, 오늘은 그 순간들을 조금 더 느껴보려 했다. 어쩌면 그런 사소한 시간들이 더 중요한 것일지도 모른다.",
                    diary_weather: "thunderstorm",
                    diary_photo: "https://example.com/photo.jpg",
                    created_at: "2024-11-13T14:00:00Z" },
      ];

      // 연도와 월에 맞는 데이터만 필터링
      const filteredData = dummyData.filter(item => {
        const itemDate = new Date(item.created_at);
        return itemDate.getFullYear() === year && itemDate.getMonth() + 1 === month;
      });

      setDiaries(filteredData); // 필터된 데이터 상태로 설정
    } catch (error) {
      console.error('Error fetching diaries:', error);
    } finally {
      setLoading(false);
    }
  };

  // 달 변경 함수 (이전 또는 다음 달로 이동)
  const changeMonth = (direction: 'prev' | 'next') => {
    if (direction === 'prev') {
      if (month === 1) {
        setYear(year - 1);  // 1월에서 이전 달로 가면 연도를 줄이고 12월로 설정
        setMonth(12);
      } else {
        setMonth(month - 1); // 그 외의 경우 월을 1 감소
      }
    } else if (direction === 'next') {
      if (month === 12) {
        setYear(year + 1);  // 12월에서 다음 달로 가면 연도를 늘리고 1월로 설정
        setMonth(1);
      } else {
        setMonth(month + 1); // 그 외의 경우 월을 1 증가
      }
    }
  };

  // 날짜 포맷팅 함수 (날짜 문자열을 "월 일" 형식으로 변환)
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return `${date.getMonth() + 1}월 ${date.getDate()}일`;
  };

  // 개별 일기 항목 렌더링 함수
  const renderDiaryItem = ({ item }: { item: DiaryEntry }) => (
    <TouchableOpacity
      style={styles.diaryItem}
      onPress={() => router.push({
        pathname: "/(diary)/diaryView",
        params: { date: item.created_at.split('T')[0] }
      })}
    >
      <View style={styles.diaryContainer}>
        {/* 왼쪽 감정 이미지 */}
        <View style={styles.emotionContainer}>
          <Image
            source={emotionImages[item.emotion_tag]}
            style={styles.emotionImage}
          />
        </View>

        {/* 오른쪽 컨텐츠 영역 */}
        <View style={styles.rightContainer}>
          {/* 날짜와 날씨 */}
          <View style={styles.headerContainer}>
            <Text style={styles.dateText}>{formatDate(item.created_at)}</Text>
            <Image
              source={weatherImages[item.diary_weather]}
              style={styles.weatherImage}
            />
          </View>

          {/* 일기 내용과 사진 */}
          <View style={styles.contentContainer}>
            <Text style={styles.contentText} numberOfLines={2}>
              {item.diary_content}
            </Text>
            {item.diary_photo && (
              <Image
                source={{ uri: item.diary_photo }}
                style={styles.photoThumbnail}
              />
            )}
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      {/* 헤더: 달 변경 버튼 및 현재 달 표시 */}
      <View style={styles.header}>
        <TouchableOpacity
                style={styles.backButton}
                onPress={() => router.back()}
              >
                <Ionicons name="chevron-back" size={24} color="#333" />
        </TouchableOpacity>
        {/* 이전 달 버튼 */}
        <TouchableOpacity onPress={() => changeMonth('prev')} style={styles.iconButton}>
          <Ionicons name="chevron-back-circle-outline" size={23} color="#333" />
        </TouchableOpacity>

        {/* 현재 연도와 월 */}
        <Text style={styles.title}>{year}년 {month}월</Text>

        {/* 다음 달 버튼 */}
        <TouchableOpacity onPress={() => changeMonth('next')} style={styles.iconButton}>
          <Ionicons name="chevron-forward-circle-outline" size={23} color="#333" />
        </TouchableOpacity>
      </View>
      {/* 로딩 중 상태, 일기 목록 또는 비어 있는 메시지 */}
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

// 스타일 정의
const styles = StyleSheet.create({
 container: {
     flex: 1,
     backgroundColor: '#ffffff',
   },
 header: {
    flexDirection: 'row',         // 버튼과 제목을 가로로 배치
    alignItems: 'center',         // 수직 가운데 정렬
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    backgroundColor: '#fff',
    justifyContent: 'center',     // 제목과 버튼을 가운데 정렬
  },
  backButton: {
     padding: 8,
     marginRight: 8,
     position: 'absolute',              // 위치를 절대적으로 지정
     left: 16,
   },
  title: {
    fontSize: 17,
    fontWeight: 'bold',
    color: '#333',
    marginHorizontal: 3,         // 버튼과 제목 사이 간격
    lineHeight: 30,                // 텍스트 높이를 아이콘과 맞춤
  },
  iconButton: {
    width: 30,
    height: 30,
    alignItems: 'center',
    justifyContent: 'center',
  },
  listContainer: {
    padding: 1,
  },
  diaryItem: {
      backgroundColor: 'white',
      borderRadius: 20,
      padding: 10,
      marginVertical: 8,
      marginHorizontal: 16,
      elevation: 2,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.2,
      shadowRadius: 1,
      borderWidth: 1,           // 테두리 추가
      borderColor: '#eee',      // 테두리 색상
    },
    diaryContainer: {
      flexDirection: 'row',
      alignItems: 'flex-start',
    },
    emotionContainer: {
      marginRight: 15,
      borderRightWidth: 1,     // 오른쪽 세로선 추가
      borderRightColor: '#eee', // 선 색상
      paddingRight: 15,        // 오른쪽 여백 추가
      width: 90,
    },
    emotionImage: {
      width: 80,
      height: 80,
      borderRadius: 40,
    },
    rightContainer: {
      flex: 1,
      width: '100%',
    },
    headerContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 10,
    },
    dateText: {
      fontSize: 16,
      fontWeight: 'bold',
      marginRight: 8,
    },
    weatherImage: {
      width: 24,
      height: 24,
    },
    contentContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      flex: 1,
      width: '100%',
      paddingRight: 0,
    },
    contentText: {
      flex: 1,
      fontSize: 14,
      marginRight: 0,
    },
    photoThumbnail: {
      width: 60,
      height: 60,
      borderRadius: 5,
    },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
