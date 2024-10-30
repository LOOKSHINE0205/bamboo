import React, { useState } from "react";
import { View, Text, TouchableOpacity, StyleSheet, FlatList, Image } from "react-native";
import { useLocalSearchParams, router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";

export default function MoodSelectionScreen() {
  const { date } = useLocalSearchParams();

  const [selectedImage, setSelectedImage] = useState(null);

  // 사진 선택 함수
  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.canceled) {
      setSelectedImage(result.assets[0].uri);
    }
  };

  // 이모지 데이터
  const moodOptions = [
    { id: "happy", image: require("../../../assets/images/diary_happy.png") },
    { id: "neutral", image: require("../../../assets/images/diary_neutral.png") },
    { id: "sad", image: require("../../../assets/images/diary_sad.png") },
    { id: "angry", image: require("../../../assets/images/diary_angry.png") },
    { id: "surprise", image: require("../../../assets/images/diary_surprise.png") },
    { id: "fear", image: require("../../../assets/images/diary_fear.png") },
    { id: "dislike", image: require("../../../assets/images/diary_dislike.png") },
  ];

  const weatherOptions = [
    { id: "sunny", image: require("../../../assets/images/diary_맑음.png") },
    { id: "cloudy", image: require("../../../assets/images/diary_구름.png") },
    { id: "rainy", image: require("../../../assets/images/diary_비.png") },
    { id: "snowy", image: require("../../../assets/images/diary_눈.png") },
    { id: "thunderstorm", image: require("../../../assets/images/diary_천둥번개.png") },
  ];

  // 날짜 포맷 함수
  const formatDate = (dateString) => {
    const dateObj = new Date(dateString);
    const year = dateObj.getFullYear();
    const month = String(dateObj.getMonth() + 1).padStart(2, '0');
    const day = String(dateObj.getDate()).padStart(2, '0');
    const daysOfWeek = ["일요일", "월요일", "화요일", "수요일", "목요일", "금요일", "토요일"];
    const dayOfWeek = daysOfWeek[dateObj.getDay()];
    return `${year}.${month}.${day} ${dayOfWeek}`;
  };

  const [selectedWeather, setSelectedWeather] = useState(null);
  const [selectedMood, setSelectedMood] = useState(null);

  const handleSelectionComplete = () => {
    router.push({
      pathname: "/(diary)/DiaryEntry",
      params: {
        date,
        weather: selectedWeather,
        mood: selectedMood,
      },
    });
  };

  return (
    <View style={styles.container}>
      <View style={styles.headerContainer}>
        <Text style={styles.title}>{formatDate(date)}</Text>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="black" />
        </TouchableOpacity>
      </View>

      {/* 오늘의 기분 섹션 */}
      <View style={styles.sectionContainer}>
        <Text style={[styles.subtitle, styles.moodText]}>오늘 하루, 어떤 기분으로 채워졌나요?</Text>
        <FlatList
          data={moodOptions}
          horizontal
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.optionButton}
              onPress={() => setSelectedMood(item.id)}
            >
              <Image
                source={item.image}
                style={[
                  styles.moodImage,
                  { opacity: selectedMood === item.id ? 1 : 0.3 },
                ]}
              />
            </TouchableOpacity>
          )}
        />
      </View>

      {/* 오늘의 날씨 섹션 */}
      <View style={styles.sectionContainer}>
        <Text style={styles.subtitle}>오늘의 날씨</Text>
        <FlatList
          data={weatherOptions}
          horizontal
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.optionButton}
              onPress={() => setSelectedWeather(item.id)}
            >
              <Image
                source={item.image}
                style={[
                  styles.optionImage,
                  { opacity: selectedWeather === item.id ? 1 : 0.3 },
                ]}
              />
            </TouchableOpacity>
          )}
        />
      </View>

      {/* 사진 추가 섹션 */}
      <View style={styles.sectionContainer}>
        <Text style={styles.subtitle}>오늘의 사진</Text>
        <TouchableOpacity style={styles.photoButton} onPress={pickImage}>
          {selectedImage ? (
            <Image source={{ uri: selectedImage }} style={styles.photo} />
          ) : (
            <Ionicons name="camera" size={30} color="#888" />
          )}
          <Text style={styles.photoText}>
            {selectedImage ? "사진 변경" : "사진 추가"}
          </Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity style={styles.completeButton} onPress={handleSelectionComplete}>
        <Text style={styles.completeButtonText}>완료</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#ffffff",
  },
  headerContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
    marginBottom: 25,
  },
  title: {
    fontSize: 17,
    fontWeight: "bold",
    textAlign: "center",
  },
  backButton: {
    position: "absolute",
    left: 0,
    marginBottom: 20,
  },
  subtitle: {
    fontSize: 15,
    marginBottom: 17,
    fontWeight: "600",
  },
  moodText: {
    textAlign: "center",
  },
  moodImage: {
    width: 40,
    height: 40,
    marginRight: 1,
    resizeMode: "contain",
  },
  photoButton: {
    alignItems: "center",
    justifyContent: "center",
    width: 300,
    height: 250,
    backgroundColor: "#f0f0f0",
    borderRadius: 10,
    overflow: "hidden",
    alignSelf: "center"
  },
  photo: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
  },
  photoText: {
    marginTop: 5,
    color: "#888",
    fontSize: 12,
  },
  sectionContainer: {
    marginBottom: 15,
    padding: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#dcdcdc",
    backgroundColor: "#f9f9f9",
  },
  optionButton: {
    padding: 5,
    borderRadius: 50,
    alignItems: "center",
    justifyContent: "center",
  },
  optionImage: {
    width: 50,
    height: 50,
    marginRight: 8,
    resizeMode: "contain",
  },
  completeButton: {
    marginTop: 5,
    backgroundColor: "#4a9960",
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: "center",
  },
  completeButtonText: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "bold",
  },
});
