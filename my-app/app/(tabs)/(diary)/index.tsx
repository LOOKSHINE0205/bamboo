import React, { useState,useEffect  } from "react";
import { View, Text, TouchableOpacity, StyleSheet, Image, Dimensions } from "react-native";
import { Ionicons, Foundation } from "@expo/vector-icons";
import { router } from "expo-router";
import DateModal from "../(diary)/dateModal";
// @ts-ignore
import DiaryScreen, { Diary } from "@/app/(tabs)/(diary)/diariesInfo";


interface DiaryEntry{
  diaryIdx:number;
  createdAt:string;
  emotionTag:string;
}

const { width: SCREEN_WIDTH } = Dimensions.get("window");

// 개별 날짜를 렌더링하는 컴포넌트
const Day = React.memo(
  ({ date, today, currentMonth, currentYear, handleDayPress, emotion }) => {
    const isToday =
      date.day === today.getDate() &&
      currentMonth === today.getMonth() &&
      currentYear === today.getFullYear();

    return (
      <TouchableOpacity
        style={[
          styles.dateContainer,
          date.outsideMonth && styles.outsideMonth, // 이번 달이 아닌 날짜에 스타일 적용
          emotion && styles[emotion], // 감정에 따라 색상 적용
        ]}
        onPress={() => handleDayPress(date.day)}
      >
        <View style={[styles.circle, isToday && styles.todayCircle]}>
          {emotion && <Ionicons name="happy-outline" size={16} color="white" />}
        </View>
        <Text style={[styles.dateText, isToday && styles.todayText]}>
          {date.day}
        </Text>
      </TouchableOpacity>
    );
  }
);

export default function CustomDiaryScreen() {
  const [diaryEntries, setDiaryEntries] = useState<Diary[]>([]);
  // DiaryScreen의 onEntriesLoaded에서 호출될 함수
  const handleEntriesLoaded = (entries: Diary[]) => {
    setDiaryEntries(entries); // 상태 업데이트
    console.log("Entries loaded:", entries); // 콘솔에 출력
  };
  const today = new Date();
  const [currentMonth, setCurrentMonth] = useState(today.getMonth());
  const [currentYear, setCurrentYear] = useState(today.getFullYear());
  const [selectedDates, setSelectedDates] = useState({});
  const [modalVisible, setModalVisible] = useState(false);
  const [alertMessage, setAlertMessage] = useState("");
  let alertTimeout;

  const daysOfWeek = ["일", "월", "화", "수", "목", "금", "토"];


  // 월의 날짜 배열 생성 함수
  const getDaysInMonth = (year, month) => {
    const firstDayOfMonth = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0).getDate();
    const firstDayOfWeek = firstDayOfMonth.getDay();
    const prevMonthLastDay = new Date(year, month, 0).getDate();

    const days = [];

    // 이전 달의 남은 날짜 추가
    for (let i = firstDayOfWeek - 1; i >= 0; i--) {
      days.push({ day: prevMonthLastDay - i, outsideMonth: true });
    }

    // 이번 달 날짜 추가
    for (let day = 1; day <= lastDay; day++) {
      days.push({ day, outsideMonth: false });
    }

    return days;
  };

  // 날짜 클릭 핸들러 함수
  const handleDayPress = (day) => {
    const selectedDate = new Date(currentYear, currentMonth, day);

    if (selectedDate > today) {
      setAlertMessage("앗, 미래 날짜는 아직 기록할 수 없어요!");
      alertTimeout = setTimeout(() => setAlertMessage(""), 3000);
      return;
    }

    clearTimeout(alertTimeout);
    setAlertMessage("");

    router.push({
      pathname: "/(diary)/mood",
      params: { date: selectedDate.toISOString().split("T")[0] },
    });
  };

  const daysInMonth = getDaysInMonth(currentYear, currentMonth);

  return (

    <View style={styles.container}>
      <DiaryScreen onEntriesLoaded={handleEntriesLoaded} />
      {/* 상단 아이콘 (검색, 목록) */}
      <View style={styles.headerIcons}>
        <TouchableOpacity onPress={() => console.log("Search clicked",diaryEntries)} style={styles.icon}>
          <Ionicons name="search-outline" size={24} color="#4a9960" />
        </TouchableOpacity>
        <TouchableOpacity onPress={() => console.log("List clicked")} style={styles.icon}>
          <Foundation name="list" size={24} color="#4a9960" />
        </TouchableOpacity>
      </View>

      {/* 연/월 표시 */}
      <View style={styles.yearMonthContainer}>
        <Text style={styles.headerText}>
          {`${currentYear}. ${currentMonth + 1}`}
        </Text>
        <TouchableOpacity onPress={() => setModalVisible(true)}>
          <Ionicons name="chevron-down-outline" size={20} color="#4a9960" />
        </TouchableOpacity>
      </View>

      {/* 요일 헤더 */}
      <View style={styles.daysOfWeekContainer}>
        {daysOfWeek.map((day, index) => (
          <Text key={index} style={styles.dayOfWeekText}>
            {day}
          </Text>
        ))}
      </View>

      {/* 달력 날짜들 */}
      <View style={styles.calendar}>
        {daysInMonth.map((date, index) => {
          const dateKey = `${currentYear}-${(currentMonth + 1)
            .toString()
            .padStart(2, "0")}-${date.day.toString().padStart(2, "0")}`;
          const emotion = selectedDates[dateKey];

          return (
            <Day
              key={index}
              date={date}
              today={today}
              currentMonth={currentMonth}
              currentYear={currentYear}
              handleDayPress={handleDayPress}
              emotion={emotion}
            />
          );
        })}
      </View>

      {/* 경고 메시지 */}
      {alertMessage && (
        <View style={styles.alertContainer}>
          <Image
            source={require("../../../assets/images/놀람2.png")}
            style={styles.alertIcon}
          />
          <Text style={styles.alertText}>{alertMessage}</Text>
        </View>
      )}

      {/* 날짜 선택 모달 */}
      <DateModal
        modalVisible={modalVisible}
        setModalVisible={setModalVisible}
        onDateChange={(year, month) => {
          setCurrentYear(year);
          setCurrentMonth(month - 1);
        }}
      />
    </View>
  );
}

// 스타일 정의
const styles = StyleSheet.create({
  container: {
    flex: 1, // 전체 화면을 차지
    paddingHorizontal: 16, // 수평 패딩 추가
    paddingVertical: 7, // 수직 패딩 추가
    backgroundColor: "#ffffff", // 배경색 흰색 설정
  },
  headerIcons: {
    flexDirection: "row", // 아이콘들을 가로로 정렬
    justifyContent: "flex-end", // 오른쪽 정렬
    marginRight: 15, // 오른쪽 마진 추가
    marginBottom: 10, // 아래쪽 마진 추가
    top: 12,
  },
  icon: {
    marginLeft: 10, // 아이콘 간격 설정
  },
  yearMonthContainer: {
    alignItems: "center", // 수직 정렬
    flexDirection: "row", // 가로 정렬
    justifyContent: "center", // 가운데 정렬
    top: -20,
  },
  headerText: {
    fontSize: 17, // 글자 크기 설정
    fontWeight: "bold", // 굵은 글씨
    color: "#000000", // 글자색 검정
    marginRight: 10, // 오른쪽 마진
  },
  daysOfWeekContainer: {
    flexDirection: "row", // 가로로 정렬
    justifyContent: "space-around", // 공간을 균등하게 배치
    marginBottom: 8, // 아래쪽 마진 추가
  },
  dayOfWeekText: {
    color: "#666666", // 글자색 회색
    textAlign: "center", // 가운데 정렬
  },
  calendar: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'flex-start', // 왼쪽부터 시작하되
  },

  dateContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 12,
    width: `${100/7}%`, // 전체 너비를 7등분하여 각 날짜가 동일한 공간을 차지하도록 설정
  },
  circle: {
    width: 43, // 원형 배경의 너비
    height: 44, // 원형 배경의 높이
    borderRadius: 20, // 원형 설정
    backgroundColor: "#d3d3d3", // 회색 배경
    justifyContent: "center", // 가운데 정렬
    alignItems: "center", // 가운데 정렬
    marginBottom: 1, // 아래쪽 마진
  },
  dateText: {
    color: "#555555", // 글자색 어두운 회색
    fontSize: 10, // 글자 크기
    textAlign: "center", // 가운데 정렬
  },
  outsideMonth: {
    opacity: 0, // 외부 월 날짜를 투명하게 설정
  },
  todayCircle: {
    backgroundColor: "#4a9960", // 오늘 날짜 배경색 녹색
  },
  todayText: {
    color: "#4a9960", // 오늘 날짜 글자색 녹색
    fontWeight: "bold", // 굵은 글씨
  },
  alertContainer: {
    flexDirection: "row", // 가로로 정렬
    alignItems: "center", // 수직 가운데 정렬
    alignSelf: "center", // 부모에서 가운데 정렬
    position: "absolute", // 절대 위치 설정
    bottom: 30, // 화면 하단에서 30px 위에 위치
  },
  alertText: {
    color: "#666666", // 경고 메시지 글자색 회색
    fontWeight: "bold", // 굵은 글씨
  },
  alertIcon: {
    width: 50,           // 이미지 크기 조정
    height: 50,
    resizeMode: "contain",
    marginRight: 8,
    }
});
