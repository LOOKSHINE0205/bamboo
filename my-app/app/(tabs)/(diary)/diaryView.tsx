import React, { useState, useEffect } from "react";
import { View, Text, Image, StyleSheet, Platform, Alert, KeyboardAvoidingView, ScrollView, TouchableWithoutFeedback, Keyboard } from "react-native";
import { useLocalSearchParams } from "expo-router";
import axios from "axios";
import Ionicons from 'react-native-vector-icons/Ionicons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getUserInfo } from '../../../storage/storageHelper';
import { serverAddress } from '../../../components/Config';

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
  const { date } = useLocalSearchParams();
  const [entryText, setEntryText] = useState("");
  const [selectedImages, setSelectedImages] = useState([]);
  const [mood, setMood] = useState("");
  const [weather, setWeather] = useState("");
  const [day, setDay] = useState("");

  useEffect(() => {
      const formattedDate = new Date(date).toISOString().split('T')[0];
      const dayOfWeek = new Date(date).toLocaleDateString("ko-KR", { weekday: "long" });
      setDay(dayOfWeek);

      const fetchDiaryData = async () => {
        try {
          const userInfo = await getUserInfo();
          if (!userInfo || !userInfo.userEmail) {
            throw new Error("사용자 이메일이 존재하지 않습니다.");
          }

          const response = await axios.get(`${serverAddress}/api/diaries/user_diaries`, {
            params: { userEmail: userInfo.userEmail },
          });

          const data = response.data;
          console.log("Fetched data:", data); // 전체 데이터 확인

          // 선택한 날짜와 일치하는 항목 필터링
          const selectedDateData = data.find(entry => entry.diaryDate === formattedDate);

          if (selectedDateData) {
            setEntryText(selectedDateData.diaryContent);
            setMood(selectedDateData.emotionTag);
            setWeather(selectedDateData.diaryWeather);
            setSelectedImages(selectedDateData.diaryPhoto ? [selectedDateData.diaryPhoto] : []);
          } else {
            // 선택한 날짜에 해당하는 데이터가 없는 경우
            setEntryText("");
            setMood("");
            setWeather("");
            setSelectedImages([]);
            Alert.alert("알림", `${formattedDate}에 해당하는 일기 데이터가 없습니다.`);
          }
        } catch (error) {
          console.error("일기 데이터를 가져오는 데 오류가 발생했습니다:", error);
          Alert.alert("오류", "일기 데이터를 불러오는 중 문제가 발생했습니다.");
        }
      };

      fetchDiaryData(); // 함수를 호출합니다.
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
