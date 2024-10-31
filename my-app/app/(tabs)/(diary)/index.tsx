import React, { useState } from "react";
import { View, Text, TouchableOpacity, StyleSheet, Image, Dimensions } from "react-native";
import { Ionicons, Foundation } from "@expo/vector-icons";
import { router } from "expo-router";
import DateModal from "../(diary)/dateModal";

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
      {/* 상단 아이콘 (검색, 목록) */}
      <View style={styles.headerIcons}>
        <TouchableOpacity onPress={() => console.log("Search clicked")} style={styles.icon}>
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

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 16,
    paddingVertical: 7,
    backgroundColor: "#ffffff",
  },
  headerIcons: {
    flexDirection: "row",
    justifyContent: "flex-end",
    marginRight: 15,
    marginBottom: 10,
  },
  icon: {
    marginLeft: 10,
  },
  yearMonthContainer: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "center",
  },
  headerText: { // 달력 날짜
    fontSize: 17,
    fontWeight: "bold",
    color: "#000000",
    marginRight: 10,
  },
  daysOfWeekContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 20,
    marginBottom: 10,
  },
  dayOfWeekText: {
    color: "#666666",
    textAlign: "center",
    width: SCREEN_WIDTH / 8.3,
  },
  calendar: {
    flexDirection: "row",
    flexWrap: "wrap",
    rowGap: 8,
  },
  dateContainer: {
    width: SCREEN_WIDTH / 7.6,
    alignItems: "center",
    justifyContent: "center",
    marginVertical: 10,
  },
  circle: {
    width: 43,
    height: 44,
    borderRadius: 20,
    backgroundColor: "#d3d3d3",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 1,
  },
  dateText: {
    color: "#555555",
    fontSize: 10,
    textAlign: "center",
  },
  outsideMonth: {
    opacity: 0,
  },
  todayCircle: {
    backgroundColor: "#4a9960",
  },
  todayText: {
    color: "#4a9960",
    fontWeight: "bold",
  },
  alertContainer: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "center",
    position: "absolute",
    bottom: 30,
  },
  alertIcon: {
    width: 20,
    height: 20,
    marginRight: 8,
  },
  alertText: {
    color: "#666666",
    fontWeight: "bold",
  },
});
