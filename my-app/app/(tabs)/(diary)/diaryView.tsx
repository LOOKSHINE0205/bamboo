import React, { useState, useEffect } from "react";
import { View, Text, Image, StyleSheet, Platform, Alert, KeyboardAvoidingView, ScrollView, TouchableWithoutFeedback, Keyboard } from "react-native";
import { useLocalSearchParams } from "expo-router";
import axios from "axios"; // 데이터베이스에서 일기 데이터를 가져오기 위한 axios 라이브러리 사용
import Ionicons from 'react-native-vector-icons/Ionicons';

// 감정 이미지 경로를 매핑한 객체
const moodImageMap = {
  happy: require("../../../assets/images/diary_happy.png"),
  neutral: require("../../../assets/images/diary_neutral.png"),
  sad: require("../../../assets/images/diary_sad.png"),
  angry: require("../../../assets/images/diary_angry.png"),
  surprise: require("../../../assets/images/diary_surprise.png"),
  fear: require("../../../assets/images/diary_fear.png"),
  dislike: require("../../../assets/images/diary_dislike.png"),
};

// 날씨 이미지 경로를 매핑한 객체
const weatherImageMap = {
  sunny: require("../../../assets/images/diary_맑음.png"),
  cloudy: require("../../../assets/images/diary_구름.png"),
  rainy: require("../../../assets/images/diary_비.png"),
  snowy: require("../../../assets/images/diary_눈.png"),
  thunderstorm: require("../../../assets/images/diary_천둥번개.png"),
};

export default function DiaryScreen() {
  const { date } = useLocalSearchParams(); // URL 파라미터에서 날짜 정보 가져오기
  const [entryText, setEntryText] = useState(""); // 일기 내용
  const [selectedImages, setSelectedImages] = useState([]); // 선택된 이미지 URIs
  const [mood, setMood] = useState(""); // 감정 상태
  const [weather, setWeather] = useState(""); // 날씨 상태
  const [day, setDay] = useState("");

  useEffect(() => {
    // 날짜 포맷팅 및 요일 설정
    const formattedDate = new Date(date);
    const dayOfWeek = formattedDate.toLocaleDateString("ko-KR", { weekday: "long" });
    setDay(dayOfWeek);

// 더미 데이터 설정
  const dummyData = {
    entryText: "오늘은 날씨가 정말 좋았다. 기분도 좋고, 여러 가지 새로운 경험을 했다!",
    mood: "sad",
    weather: "sunny",
    image: ["https://via.placeholder.com/150"]
  };

  // 더미 데이터를 상태에 설정
  setEntryText(dummyData.entryText);
  setMood(dummyData.mood);
  setWeather(dummyData.weather);
  setSelectedImages(dummyData.image);

  // 실제 백엔드 연결 시 주석 해제
  /*
  const fetchDiaryData = async () => {
    try {
      const formattedDate = new Date(date).toISOString().split('T')[0];
      const response = await axios.get("https://your-backend-url.com/api/diary", {
        params: { date: formattedDate.toISOString().split("T")[0] }, // YYYY-MM-DD 형식
                });
      const data = response.data;

      if (data) {
        setEntryText(data.entryText);
        setMood(data.mood);
        setWeather(data.weather);
        setSelectedImages(data.image || []);
      }
    } catch (error) {
      console.error("일기 데이터를 가져오는 데 오류가 발생했습니다:", error);
    }
  };

  fetchDiaryData();
  */
  }, [date]);

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <ScrollView contentContainerStyle={styles.scrollContainer}>
          <View style={styles.topContainer}>
            <View style={styles.moodImageContainer}>
              {mood && (
                <Image
                  source={moodImageMap[mood]}
                  style={styles.moodImage}
                />
              )}
            </View>
            <View style={styles.dateDisplayContainer}>
              <Text style={styles.dateText}>{date}</Text>
              <View style={styles.dayAndWeatherContainer}>
                <Text style={styles.dayText}>{day}</Text>
                {weatherImageMap[weather] && (
                  <Image
                    key={weather}
                    source={weatherImageMap[weather]}
                    style={styles.weatherImage}
                  />
                )}
              </View>
            </View>
          </View>

          <View style={styles.entryContainer}>
            <View style={styles.imageContainer}>
              {selectedImages.map((imageUri, index) => (
                <View key={index} style={styles.imageWrapper}>
                  <Image source={{ uri: imageUri }} style={styles.photo} />
                </View>
              ))}
            </View>

            <Text style={styles.entryText}>{entryText}</Text>
          </View>
        </ScrollView>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#ffffff",
  },
  topContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
  },
  moodImageContainer: {
    padding: 5,
    marginRight: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  moodImage: {
    width: 80,
    height: 80,
    resizeMode: "contain",
  },
  dateDisplayContainer: {
    alignItems: "center",
    marginVertical: 20,
  },
  dateText: {
    fontSize: 20,
    fontWeight: "bold",
  },
  dayAndWeatherContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-start",
    marginTop: 10,
  },
  dayText: {
    fontSize: 15,
    color: "#888888",
  },
  weatherImage: {
    width: 30,
    height: 30,
    resizeMode: "contain",
    marginLeft: 10,
  },
  entryContainer: {
    padding: 15,
    backgroundColor: "#f9f9f9",
    borderRadius: 10,
    marginTop: 10,
    minHeight: 400,
  },
  entryText: {
    fontSize: 16,
    lineHeight: 24,
    textAlignVertical: "top",
  },
  imageContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  imageWrapper: {
    position: 'relative',
    margin: 5,
  },
  photo: {
    width: 150,
    height: 150,
    margin: 5,
    borderRadius: 20,
  },
});
