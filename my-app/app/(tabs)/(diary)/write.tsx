import React, { useState } from "react";
import { View, Text, Image, TextInput, TouchableOpacity, StyleSheet, Platform, Alert,
  KeyboardAvoidingView, ScrollView, TouchableWithoutFeedback, Keyboard } from "react-native";
import { useLocalSearchParams, router } from "expo-router";
import axios from "axios"; // 데이터베이스 전송을 위한 axios 라이브러리 사용
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

export default function DiaryEntryScreen() {
  // 이전 화면에서 전달받은 날짜(date), 감정(mood), 날씨(weather) 정보를 가져옴
  const { date, mood, weather } = useLocalSearchParams();
  const [entryText, setEntryText] = useState(""); // 일기 내용 상태
  const [selectedImages, setSelectedImages] = useState([]); // 선택된 이미지 URIs 상태

  // 날짜 형식을 지정하는 함수 (예: 2024.10.31 목요일 형태로 변환)
  const formatDate = (dateString) => {
    const dateObj = new Date(dateString);
    const year = dateObj.getFullYear();
    const month = String(dateObj.getMonth() + 1).padStart(2, "0");
    const day = String(dateObj.getDate()).padStart(2, "0");
    const daysOfWeek = ["일", "월", "화", "수", "목", "금", "토"];
    const dayOfWeek = daysOfWeek[dateObj.getDay()];
    return { formattedDate: `${year}.${month}.${day}`, dayOfWeek };
  };

  // 날짜와 요일을 얻기 위해 formatDate 함수 호출
  const { formattedDate, dayOfWeek } = formatDate(date);

  // 갤러리에서 이미지 선택 함수
  const pickImage = async () => {
    // 1. 갤러리 접근 권한 요청
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permissionResult.granted) {
      Alert.alert("알림", "카메라 롤 접근 권한이 필요합니다.");
      return; // 권한이 없으면 종료
    }

    // 2. 갤러리에서 이미지 선택
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: false,
      quality: 1,
      allowsMultipleSelection: true, // 여러 이미지 선택 허용
    });

    // 선택된 이미지 URI를 상태에 추가
    if (!result.canceled && result.assets && result.assets.length > 0) {
      const imageUris = result.assets.map(asset => asset.uri);
      setSelectedImages(prevImages => [...prevImages, ...imageUris]); // 기존 이미지와 새 이미지를 합쳐 상태 업데이트
    }
  };

  // 이미지 삭제 함수
  const handleRemoveImage = (uri) => {
    setSelectedImages(prevImages => prevImages.filter(imageUri => imageUri !== uri));
  };

  // 일기 저장 함수
  const handleSaveEntry = async () => {
    try {
      // 서버에 일기 데이터 저장 (API 엔드포인트로 POST 요청)
      await axios.post("YOUR_DB_ENDPOINT_URL", {
        date,        // 선택한 날짜
        mood,        // 선택한 감정
        weather,     // 선택한 날씨
        entryText,   // 작성한 일기 내용
        image: selectedImages.length > 0 ? selectedImages : null, // 선택된 이미지 URIs
      });
      alert("일기가 저장되었습니다!"); // 저장 완료 메시지
      router.push("/somewhere"); // 저장 후 이동할 화면
    } catch (error) {
      console.error("일기 저장 오류:", error); // 오류가 발생하면 콘솔에 출력
    }
  };

  return (

    // iOS에서 키보드가 올라올 때 화면을 밀어내기 위한 KeyboardAvoidingView 사용
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"} // iOS에서 키보드가 나타날 때 여백 처리
    >
      {/* 터치 시 키보드가 닫히도록 처리하는 TouchableWithoutFeedback */}
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <ScrollView contentContainerStyle={styles.scrollContainer}>

          {/* 헤더 영역: 감정 이미지, 날짜, 요일, 날씨 표시 */}
          <View style={styles.topContainer}>
            <View style={styles.moodImageContainer}>
              {mood && (
                <Image
                  source={moodImageMap[mood]} // 선택된 감정에 맞는 이미지 표시
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
                    source={weatherImageMap[weather]} // 선택된 날씨에 맞는 이미지 표시
                    style={styles.weatherImage}
                  />
                )}
              </View>
            </View>
          </View>

          {/* 일기 내용을 작성할 수 있는 입력창 */}
          <View style={styles.entryContainer}>
            {/* 선택된 이미지가 있을 경우 해당 이미지와 삭제 버튼 표시 */}
            <View style={styles.imageContainer}>
              {selectedImages.map((imageUri, index) => (
                <View key={index} style={styles.imageWrapper}>
                  <Image source={{ uri: imageUri }} style={styles.photo} />
                  <TouchableOpacity style={styles.deleteButton} onPress={() => handleRemoveImage(imageUri)}>
                    <Ionicons name="close-circle" size={20} color="gray" />
                  </TouchableOpacity>
                </View>
              ))}
            </View>

            {/* 일기 내용 입력 TextInput */}
            <TextInput
              style={styles.textInput}
              placeholder="오늘 하루를 기록해 보세요."
              multiline // 여러 줄 입력 가능
              value={entryText} // 입력된 텍스트
              onChangeText={setEntryText} // 텍스트 변경 시 상태 업데이트
            />
          </View>

          {/* 저장 버튼과 이미지 선택 버튼 */}
          <View style={styles.buttonContainer}>
            <TouchableOpacity style={styles.saveButton} onPress={handleSaveEntry}>
              <Text style={styles.saveButtonText}>저장</Text>
            </TouchableOpacity>

            {/* 이미지 선택 버튼 */}
            <TouchableOpacity style={styles.imageButton} onPress={pickImage}>
              <Ionicons name="camera" size={30} color="#fff" />
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
    backgroundColor: "#ffffff", // 화면 배경색
  },
  topContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20, // 상단 여백
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
    flexWrap: 'wrap', // 이미지가 여러 줄로 배치
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
  },
  imageButton: {
    backgroundColor: '#4a9960',
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 5,
    alignItems: 'center',
  },
});
