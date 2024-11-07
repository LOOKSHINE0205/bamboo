import React, { useState, useEffect } from "react";
import { View, Text, Image, TextInput, TouchableOpacity, StyleSheet, Platform, Alert,
  KeyboardAvoidingView, ScrollView, TouchableWithoutFeedback, Keyboard } from "react-native";
import { useLocalSearchParams, router } from "expo-router";
import axios from "axios"; // 데이터베이스에서 일기 데이터를 가져오기 위한 axios 라이브러리 사용
import * as ImagePicker from "expo-image-picker";
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

  useEffect(() => {
    // 일기 데이터를 서버에서 가져오기 (예시 API)
    const fetchDiaryData = async () => {
      try {
        const response = await axios.get("YOUR_DB_ENDPOINT_URL", {
          params: { date }, // 해당 날짜의 일기 데이터 가져오기
        });

        const data = response.data;

        if (data) {
          setEntryText(data.entryText);
          setMood(data.mood);
          setWeather(data.weather);
          setSelectedImages(data.image || []); // 이미지가 있을 경우 설정
        }
      } catch (error) {
        console.error("일기 데이터를 가져오는 데 오류가 발생했습니다:", error);
      }
    };

    fetchDiaryData();
  }, [date]);

  // 갤러리에서 이미지 선택 함수
  const pickImage = async () => {
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permissionResult.granted) {
      Alert.alert("알림", "카메라 롤 접근 권한이 필요합니다.");
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: false,
      quality: 1,
      allowsMultipleSelection: true,
    });

    if (!result.canceled && result.assets && result.assets.length > 0) {
      const imageUris = result.assets.map((asset) => asset.uri);
      setSelectedImages([...selectedImages, ...imageUris]);
    }
  };

  // 이미지 삭제 함수
  const handleRemoveImage = (uri) => {
    setSelectedImages(selectedImages.filter((imageUri) => imageUri !== uri));
  };

  // 일기 수정 저장 함수
  const handleSaveEntry = async () => {
    try {
      await axios.put("YOUR_DB_ENDPOINT_URL", {
        date,
        mood,
        weather,
        entryText,
        image: selectedImages.length > 0 ? selectedImages : null,
      });
      alert("일기가 수정되었습니다!");
      router.push("/somewhere"); // 수정 후 이동할 화면
    } catch (error) {
      console.error("일기 수정 오류:", error);
    }
  };

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
                <Text style={styles.dayText}>{`${date}요일`}</Text>
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
                  <TouchableOpacity
                    style={styles.deleteButton}
                    onPress={() => handleRemoveImage(imageUri)}
                  >
                    <Ionicons name="close-circle" size={20} color="gray" />
                  </TouchableOpacity>
                </View>
              ))}
            </View>

            <TextInput
              style={styles.textInput}
              value={entryText}
              onChangeText={setEntryText}
              multiline
              placeholder="오늘 하루를 수정해 보세요."
            />
          </View>

          <View style={styles.buttonContainer}>
            <TouchableOpacity style={styles.saveButton} onPress={handleSaveEntry}>
              <Text style={styles.saveButtonText}>저장</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.imageButton} onPress={pickImage}>
              <Ionicons name="image" size={30} color="#fff" />
            </TouchableOpacity>
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
  textInput: {
    fontSize: 16,
    lineHeight: 24,
    flexGrow: 1,
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
  deleteButton: {
    position: 'absolute',
    top: 5,
    right: 5,
    backgroundColor: 'white',
    borderRadius: 15,
    padding: 1,
  },
  photo: {
    width: 150,
    height: 150,
    margin: 5,
    borderRadius: 20,
  },
  buttonContainer: {
    flexDirection: 'row',
    padding: 10,
    borderTopWidth: 1,
    borderColor: '#ddd',
    backgroundColor: '#fff',
  },
  saveButton: {
    backgroundColor: '#4a9960',
    padding: 10,
    borderRadius: 5,
    marginRight: 10,
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  imageButton: {
    backgroundColor: '#4a9960',
    padding: 10,
    borderRadius: 5,
  },
});
