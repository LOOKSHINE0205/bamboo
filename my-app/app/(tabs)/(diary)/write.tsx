import React, { useState, useEffect } from "react";
import { View, Text, Image, TextInput, TouchableOpacity, StyleSheet } from "react-native";
import { useLocalSearchParams, router } from "expo-router";
import axios from "axios"; // 데이터베이스 전송을 위한 axios 라이브러리 사용
import * as FileSystem from "expo-file-system";

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
  // 이전 화면에서 전달받은 날짜(date), 감정(mood), 날씨(weather), 이미지 정보를 가져옴
  const { date, mood, weather, imageUri } = useLocalSearchParams();
  const [localImageUri, setLocalImageUri] = useState(null); // 로컬 이미지 경로를 저장할 상태 추가
  // 일기 본문 내용을 저장할 상태
  const [entryText, setEntryText] = useState("");

  //이미지 로컬 파일 시스템으로 복사
    useEffect(() => {
      const loadImage = async () => {
        if (imageUri) {
          try {
            const newPath = FileSystem.documentDirectory + "selectedImage.jpg"; // 이미지 저장 경로
            await FileSystem.copyAsync({
              from: imageUri,
              to: newPath,
            });
            setLocalImageUri(newPath); // 로컬 경로로 상태 업데이트
          } catch (error) {
            console.error("Error loading image:", error);
          }
        }
      };
      loadImage();
    }, [imageUri]);

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

  // 일기 저장 함수
  // 버튼을 클릭하면 axios를 통해 DB에 일기 데이터를 전송
  const handleSaveEntry = async () => {
    try {
      // 서버의 엔드포인트 URL로 POST 요청을 보내어 데이터를 저장
      await axios.post("YOUR_DB_ENDPOINT_URL", {
        date,          // 선택한 날짜
        mood,          // 선택한 감정
        weather,       // 선택한 날씨
        imageUri,      // 사진
        entryText     // 작성한 일기 내용
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
      <View style={styles.topSection}>
        {/* 선택한 감정 이미지가 있을 경우에만 표시 */}
        <View style={styles.moodImageContainer}>
        {mood && (
          <Image
            source={moodImageMap[mood]} // 매핑된 객체를 통해 이미지 경로를 선택
            style={styles.moodImage}
          />
        )}
        </View>
        {/* 날짜와 요일을 표시하는 텍스트 */}
        <View style={styles.dateContainer}>
          <Text style={styles.dateText}>{formattedDate}</Text>
          <Text style={styles.dayText}>{dayOfWeek}</Text>
        </View>
      </View>

      {/* 날씨 아이콘을 표시하는 영역 */}
      <View style={styles.weatherContainer}>
        {/* 5개의 날씨 아이콘 중 선택된 날씨만 불투명하게 표시 */}
        {Object.keys(weatherImageMap).map((type) => (
          <Image
            key={type}
            source={weatherImageMap[type]} // 매핑된 객체를 통해 이미지 경로를 선택
            style={[
              styles.weatherImage,
              { opacity: weather === type ? 1 : 0.3 }, // 선택된 날씨만 불투명, 나머지는 투명도 적용
            ]}
          />
        ))}
      </View>
        {/* 일기 이미지 */}
       {imageUri && (
              <View style={styles.imageContainer}>
                <Image source={{ uri: imageUri }} style={styles.selectedImage} />
              </View>
            )}

      {/* 일기 내용을 작성할 수 있는 입력창 */}
      <View style={styles.entryContainer}>
        <TextInput
          style={styles.textInput}
          placeholder="오늘 하루를 기록해 보세요." // 입력창에 표시되는 안내 문구
          multiline                                // 여러 줄 입력 가능
          value={entryText}                        // 입력된 일기 내용
          onChangeText={setEntryText}              // 일기 내용 업데이트
        />
      </View>

      {/* 저장 버튼 */}
      <TouchableOpacity style={styles.saveButton} onPress={handleSaveEntry}>
        <Text style={styles.saveButtonText}>저장</Text>
      </TouchableOpacity>
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
   topSection: {
      flexDirection: "row",
      alignItems: "center",
      marginBottom: 20,
    },
  headerContainer: {
    flexDirection: "row",       // 감정 이미지와 날짜를 가로로 정렬
    alignItems: "center",
    marginBottom: 20,
  },
  moodImage: {
    width: 80,                  // 감정 이미지 너비
    height: 80,                 // 감정 이미지 높이
    marginRight: 10,
    resizeMode: "contain",      // 이미지가 영역에 맞게 조정
  },
  dateContainer: {
    flexDirection: "column",    // 날짜와 요일을 세로로 정렬
  },
  dateText: {
    fontSize: 17,               // 날짜 텍스트 크기
    fontWeight: "bold",
  },
  dayText: {
    fontSize: 15,               // 요일 텍스트 크기
    color: "#888888",           // 요일 텍스트 색상 (연한 회색)
  },
  weatherContainer: {
    flexDirection: "row",       // 날씨 아이콘을 가로로 정렬
    justifyContent: "space-around",
    marginBottom: 20,
  },
  weatherImage: {
    width: 30,                  // 날씨 아이콘 너비
    height: 30,                 // 날씨 아이콘 높이
    resizeMode: "contain",      // 이미지가 영역에 맞게 조정
  },
  imageContainer: {
      alignItems: "center",
      marginVertical: 20,
    },
    selectedImage: {
      width: "100%",
      height: 200,
      resizeMode: "cover",
      borderRadius: 10,
    },
  entryContainer: {
    flex: 1,
    marginBottom: 20,
    padding: 15,
    backgroundColor: "#f9f9f9", // 입력창 배경색
    borderRadius: 10,           // 입력창 모서리 둥글게
  },
  textInput: {
    fontSize: 16,               // 입력 텍스트 크기
    lineHeight: 24,             // 입력 텍스트 줄 간격
  },
  saveButton: {
    backgroundColor: "#4a9960", // 버튼 배경색
    paddingVertical: 12,
    borderRadius: 8,            // 버튼 모서리 둥글게
    alignItems: "center",
  },
  saveButtonText: {
    color: "#ffffff",           // 버튼 텍스트 색상 (흰색)
    fontSize: 16,               // 버튼 텍스트 크기
    fontWeight: "bold",
  },
});
