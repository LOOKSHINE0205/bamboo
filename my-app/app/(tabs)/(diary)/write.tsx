import React, { useState } from "react";
import { View, Text, Image, TextInput, TouchableOpacity, StyleSheet, Platform, PermissionsAndroid } from "react-native";
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
  // 일기 본문 내용을 저장할 상태
  const [entryText, setEntryText] = useState("");
  const [selectedImages, setSelectedImages] = useState([]); // 선택된 이미지 URI를 배열로 저장

  // 날짜 형식을 지정하는 함수
  // 예: 2024.10.31 목요일 형태로 변환
  const formatDate = (dateString) => {
    const dateObj = new Date(dateString);
    const year = dateObj.getFullYear();
    const month = String(dateObj.getMonth() + 1).padStart(2, "0"); // 월을 2자리로 변환
    const day = String(dateObj.getDate()).padStart(2, "0"); // 일을 2자리로 변환
    const daysOfWeek = ["일", "월", "화", "수", "목", "금", "토"]; // 요일 배열
    const dayOfWeek = daysOfWeek[dateObj.getDay()]; // 요일 계산
    return { formattedDate: `${year}.${month}.${day}`, dayOfWeek };
  };

  // 날짜와 요일을 얻기 위해 formatDate 함수 호출
  const { formattedDate, dayOfWeek } = formatDate(date);

 // 갤러리에서 이미지 선택 함수
 const pickImage = async () => { // async 추가
   //1. 갤러리에 접급 권한 요청
   const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
     if (!permissionResult.granted) {
       Alert.alert("알림", "카메라 롤 접근 권한이 필요합니다.");
       return; // 권한이 없으면 종료
     }
   // 2. 갤러리에서 이미지 선택
   const result = await ImagePicker.launchImageLibraryAsync({
     mediaTypes: ImagePicker.MediaTypeOptions.Images,
     allowsEditing: false, // 편집을 허용하지 않음
     quality: 1,
     allowsMultipleSelection: true, // 여러 이미지 선택 허용
   });

   if (!result.canceled && result.assets && result.assets.length > 0) {
            const imageUris = result.assets.map(asset => asset.uri);
            setSelectedImages(prevImages => [...prevImages, ...imageUris]); // 이전 이미지와 새로운 이미지를 합쳐서 상태 업데이트
       } else {
           console.log("사용자가 이미지를 선택하지 않았습니다."); // 선택 취소 시 메시지 출력
       }
 };

 // 이미지 삭제 함수
   const handleRemoveImage = (uri) => {
     setSelectedImages(prevImages => prevImages.filter(imageUri => imageUri !== uri));
   };

  // 일기 저장 함수
  // 버튼을 클릭하면 axios를 통해 DB에 일기 데이터를 전송
  const handleSaveEntry = async () => {
    try {
      // 서버의 엔드포인트 URL로 POST 요청을 보내어 데이터를 저장
      await axios.post("YOUR_DB_ENDPOINT_URL", {
        date,        // 선택한 날짜
        mood,        // 선택한 감정
        weather,     // 선택한 날씨
        entryText,   // 작성한 일기 내용
        image: image ? image : null, // 선택된 이미지 URI 포함
      });
      alert("일기가 저장되었습니다!"); // 성공 메시지 표시
      router.push("/somewhere"); // 저장 후 이동할 화면 (필요시 수정)
    } catch (error) {
      console.error("일기 저장 오류:", error); // 오류가 발생하면 콘솔에 출력
    }
  };

  return (
    <View style={styles.container}>
      {/* 헤더 영역: 감정 이미지, 날짜, 요일 표시 */}
      <View style={styles.topContainer}>
        <View style={styles.moodImageContainer}>
          {mood && (
            <Image
              source={moodImageMap[mood]} // 매핑된 객체를 통해 이미지 경로를 선택
              style={styles.moodImage}
            />
          )}
        </View>
        {/* 날짜, 요일, 날씨 표시하는 컨테이너 */}
        <View style={styles.dateDisplayContainer}>
          <Text style={styles.dateText}>{formattedDate}</Text>
          {/* 요일과 날씨 아이콘을 표시하는 영역 */}
          <View style={styles.dayAndWeatherContainer}>
            <Text style={styles.dayText}>{dayOfWeek + "요일"}</Text>
            {weatherImageMap[weather] && (
              <Image
                key={weather} // 선택된 날씨 키
                source={weatherImageMap[weather]} // 선택된 날씨의 이미지 경로
                style={styles.weatherImage} // 이미지 스타일
              />
            )}
          </View>
        </View>
      </View>

      {/* 일기 내용을 작성할 수 있는 입력창 */}
      <View style={styles.entryContainer}>
        {/* 선택된 이미지가 있을 경우 보여주기 */}
        <View style={styles.imageContainer}>
            {selectedImages.map((imageUri, index) => (
              <View key={index} style={styles.imageWrapper}>
                <Image key={index} source={{ uri: imageUri }} style={styles.photo} />
              <TouchableOpacity style={styles.deleteButton} onPress={() => handleRemoveImage(imageUri)}>
                <Ionicons name="close-circle" size={20} color="gray" />
              </TouchableOpacity>
            </View>
            ))}
        </View>
        <TextInput
          style={styles.textInput}
          placeholder="오늘 하루를 기록해 보세요." // 입력창에 표시되는 안내 문구
          multiline // 여러 줄 입력 가능
          value={entryText} // 입력된 일기 내용
          onChangeText={setEntryText} // 일기 내용 업데이트
        />
      </View>
      <View style={styles.buttonContainer}>
        {/* 저장 버튼 */}
        <TouchableOpacity style={styles.saveButton} onPress={handleSaveEntry}>
          <Text style={styles.saveButtonText}>저장</Text>
        </TouchableOpacity>

        {/* 이미지 선택 버튼 */}
        <TouchableOpacity style={styles.imageButton} onPress={pickImage}>
          <Ionicons name="camera" size={30} color="#fff" />
        </TouchableOpacity>
      </View>
    </View>
  );
}

// 스타일 정의
const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#ffffff", // 화면 배경색
  },
  topContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
  },
  moodImageContainer: {
    padding: 5, // 내부 여백
    marginRight: 10,
    alignItems: "center", // 내용 중앙 정렬
    justifyContent: "center", // 내용 중앙 정렬
  },
  moodImage: {
    width: 80, // 감정 이미지 너비
    height: 80, // 감정 이미지 높이
    marginRight: 10,
    resizeMode: "contain", // 이미지가 영역에 맞게 조정
  },
  dateDisplayContainer: {
    alignItems: "center", // 가운데 정렬
    marginVertical: 20, // 위아래 여백
  },
  dateText: {
    fontSize: 20, // 날짜 텍스트 크기
    fontWeight: "bold",
  },
  dayAndWeatherContainer: {
    flexDirection: "row", // 세로로 배치
    alignItems: "center", // 가운데 정렬
    justifyContent: "flex-start", // 왼쪽 정렬
    marginTop: 10, // 날짜와 간격
    width: '100%',
  },
  dayText: {
    fontSize: 15, // 요일 텍스트 크기
    color: "#888888",
  },
  weatherImage: {
    width: 30, // 날씨 아이콘 너비
    height: 30, // 날씨 아이콘 높이
    resizeMode: "contain", // 이미지가 영역에 맞게 조정
    marginLeft: 10,
  },
  entryContainer: {
    flex: 1,
    marginBottom: 20,
    padding: 15,
    backgroundColor: "#f9f9f9", // 입력창 배경색
    borderRadius: 10, // 입력창 모서리 둥글게
    position: "relative",
  },
  textInput: {
    fontSize: 16, // 입력 텍스트 크기
    lineHeight: 24, // 입력 텍스트 줄 간격
  },
  imageContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap', // 이미지가 여러 줄로 배치되게 설정
  },
  imageWrapper: { // 이미지와 삭제 버튼을 감싸는 wrapper 스타일 추가
    position: 'relative',
    margin: 5,
  },
  deleteButton: { // 삭제 버튼 스타일 추가
    position: 'absolute', // 이미지 위에 배치
    top: 5,
    right: 5,
    backgroundColor: 'white', // 배경색 추가
    borderRadius: 15,
    padding: 1,
  },
  photo: {
    width: 150,
    height: 150,
    margin: 5,
    borderRadius: 20
  },
  buttonContainer: {
    flexDirection: 'row', // 버튼을 가로 방향으로 배치
    justifyContent: 'flex-start', // 왼쪽 정렬
    alignItems: 'center', // 세로 방향 중앙 정렬
  },
  saveButton: {
    // 저장 버튼 스타일 (예시)
    backgroundColor: '#4a9960',
    padding: 10,
    borderRadius: 5,
    marginRight: 10, // 버튼 사이에 여백 추가
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 16,
  },
  imageButton: {
    // 이미지 버튼 스타일 (예시)
    backgroundColor: '#4a9960',
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 5,
    alignItems: 'center',
  },
});
