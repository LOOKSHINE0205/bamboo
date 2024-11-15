import React, { useState } from "react";
import { View, Text, Image, TextInput, StyleSheet, Platform, Alert,
  KeyboardAvoidingView, ScrollView, TouchableWithoutFeedback, Keyboard,useWindowDimensions } from "react-native";
import { useLocalSearchParams, router } from "expo-router";
import axios from "axios";
import * as ImagePicker from "expo-image-picker";
import Ionicons from 'react-native-vector-icons/Ionicons';
import SmoothCurvedButton from '../../../components/SmoothCurvedButton';
import { serverAddress } from '../../../components/Config';
import AsyncStorage from '@react-native-async-storage/async-storage';


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
  const {width, height} = useWindowDimensions();
  const [entryText, setEntryText] = useState("");
  const [selectedImages, setSelectedImages] = useState([]);
  const aspectRatio = width / height;
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
    if (selectedImages.length >= 4) {
      Alert.alert("알림", "최대 4장까지 사진을 추가할 수 있습니다.");
      return;
    }

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

         // 현재 선택된 이미지 갯수와 새로 선택된 이미지 갯수를 합쳤을 때, 4장 이하일 경우에만 선택 처리
            const totalImages = selectedImages.length + result.assets.length;
            if (totalImages > 4) {
              Alert.alert("알림", "최대 4장까지만 선택할 수 있습니다.");
              return;
            }


      const imageUris = result.assets.map(asset => asset.uri);
      setSelectedImages(prevImages => [...prevImages, ...imageUris]);
    }
  };

  const removeImage = (imageUri) => {
    setSelectedImages(prevImages => prevImages.filter(uri => uri !== imageUri));
  };

  const handleSaveEntry = async () => {
    try {
      const storedUserInfo = await AsyncStorage.getItem('userInfo');
      const userData = storedUserInfo ? JSON.parse(storedUserInfo) : null;

      const formData = new FormData();

      // diary 데이터를 JSON 문자열로 추가
      const diaryData = JSON.stringify({
        userEmail: userData?.userEmail,
        diaryDate: date,
        emotionTag: mood,
        diaryWeather: weather,
        diaryContent: entryText,
      });

      formData.append("diary", diaryData);

      // 이미지가 있을 경우 FormData에 추가
      selectedImages.forEach((imageUri, index) => {
        formData.append("photo", {
          uri: imageUri,
          type: "image/jpeg", // 이미지 타입을 지정
          name: `photo_${index}.jpg`, // 이미지 파일 이름 지정
        });
      });

      await axios.post(`${serverAddress}/api/diaries/create-with-photo`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      alert("일기가 저장되었습니다!");
      router.push("/(diary)"); // 원하는 경로로 변경
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
                  <TouchableWithoutFeedback onPress={() => removeImage(imageUri)}>
                    <View style={styles.removeButton}>
                      <Ionicons name="close-circle" size={24} color="red" />
                    </View>
                  </TouchableWithoutFeedback>
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

          <View style={[styles.buttonContainer,{gap:20}]}>
            <SmoothCurvedButton
              title="저장"
              onPress={handleSaveEntry}
              style={[styles.commonButton]} // 세로 간격 설정
            />
            <SmoothCurvedButton
              onPress={pickImage}
              icon={<Ionicons name="image" size={16} color="#000" />}
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
  removeButton: {
    position: 'absolute',
    top: 5,
    right: 5,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    borderRadius: 50,
    padding: 5,
  },
  buttonContainer: {
    flexDirection: 'column', // 버튼을 세로로 배치
    alignItems: 'center',
    padding: 20,
  },


});
