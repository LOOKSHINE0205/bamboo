import React, { useState } from "react";
import { View, Text, Image, TextInput, StyleSheet, Platform, Alert,
  KeyboardAvoidingView, ScrollView, TouchableWithoutFeedback, Keyboard } from "react-native";
import { useLocalSearchParams, router } from "expo-router";
import axios from "axios";
import * as ImagePicker from "expo-image-picker";
import Ionicons from 'react-native-vector-icons/Ionicons';
import SmoothCurvedButton from '../../../components/SmoothCurvedButton';

const moodImageMap = {
  happy: require("../../../assets/images/diary_happy.png"),
  neutral: require("../../../assets/images/diary_neutral.png"),
  sad: require("../../../assets/images/diary_sad.png"),
  angry: require("../../../assets/images/diary_angry.png"),
  surprise: require("../../../assets/images/diary_surprise.png"),
  fear: require("../../../assets/images/diary_fear.png"),
  dislike: require("../../../assets/images/diary_dislike.png"),
};

const weatherImageMap = {
  sunny: require("../../../assets/images/diary_맑음.png"),
  cloudy: require("../../../assets/images/diary_구름.png"),
  rainy: require("../../../assets/images/diary_비.png"),
  snowy: require("../../../assets/images/diary_눈.png"),
  thunderstorm: require("../../../assets/images/diary_천둥번개.png"),
};

export default function DiaryEntryScreen() {
  const { date, mood, weather } = useLocalSearchParams();
  const [entryText, setEntryText] = useState("");
  const [selectedImages, setSelectedImages] = useState([]);

  const formatDate = (dateString) => {
    const dateObj = new Date(dateString);
    const year = dateObj.getFullYear();
    const month = String(dateObj.getMonth() + 1).padStart(2, "0");
    const day = String(dateObj.getDate()).padStart(2, "0");
    const daysOfWeek = ["일", "월", "화", "수", "목", "금", "토"];
    const dayOfWeek = daysOfWeek[dateObj.getDay()];
    return { formattedDate: `${year}.${month}.${day}`, dayOfWeek };
  };

  const { formattedDate, dayOfWeek } = formatDate(date);

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
      const imageUris = result.assets.map(asset => asset.uri);
      setSelectedImages(prevImages => [...prevImages, ...imageUris]);
    }
  };

  const handleSaveEntry = async () => {
    try {
      await axios.post("YOUR_DB_ENDPOINT_URL", {
        date,
        mood,
        weather,
        entryText,
        image: selectedImages.length > 0 ? selectedImages : null,
      });
      alert("일기가 저장되었습니다!");
      router.push("/somewhere");
    } catch (error) {
      console.error("일기 저장 오류:", error);
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
              <Text style={styles.dateText}>{formattedDate}</Text>
              <View style={styles.dayAndWeatherContainer}>
                <Text style={styles.dayText}>{dayOfWeek + "요일"}</Text>
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

            <TextInput
              style={styles.textInput}
              placeholder="오늘 하루를 기록해 보세요."
              multiline
              value={entryText}
              onChangeText={setEntryText}
              placeholderTextColor="#707070"
            />
          </View>

          <View style={styles.buttonContainer}>
            <SmoothCurvedButton
              title="저장"
              onPress={handleSaveEntry}
              svgWidth={120}  // 설정 저장 및 로그아웃 버튼과 동일한 너비
              svgPath="M20,0 C5,0 0,5 0,20 L0,30 C0,45 5,50 20,50 L100,50 C115,50 120,45 120,30 L120,20 C120,5 115,0 100,0 Z" // 동일한 경로
              style={styles.commonButton}
            />
            <SmoothCurvedButton
              onPress={pickImage}
              icon={<Ionicons name="image" size={16} color="#000" />}
              svgWidth={120}  // 설정 저장 및 로그아웃 버튼과 동일한 너비
              svgPath="M20,0 C5,0 0,5 0,20 L0,30 C0,45 5,50 20,50 L100,50 C115,50 120,45 120,30 L120,20 C120,5 115,0 100,0 Z" // 동일한 경로
              style={styles.commonButton}
            />
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
  photo: {
    width: 150,
    height: 150,
    margin: 5,
    borderRadius: 20,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    padding: 10,
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
});
