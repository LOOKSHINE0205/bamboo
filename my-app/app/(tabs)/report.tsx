import React, { useState, useRef } from 'react';
import { View, Text, StyleSheet, Dimensions, Pressable, ScrollView } from 'react-native';

// 화면의 너비를 가져옴
const screenWidth = Dimensions.get("window").width;

// 월간 데이터 Mock (데이터가 없는 경우를 대비한 가짜 데이터)
const MOCK_DATA = {
    userNick: "김철수",
    emotions: [
        { emotionTag: "기쁨", count: 145, fill: "#FFC436" },
        { emotionTag: "화남", count: 89, fill: "#BF3131" },
        { emotionTag: "슬픔", count: 76, fill: "#0174BE" },
        { emotionTag: "쏘쏘", count: 65, fill: "#FF9BD2" },
        { emotionTag: "놀람", count: 43, fill: "#5C8374" },
        { emotionTag: "싫은", count: 28, fill: "#81689D" },
        { emotionTag: "두려움", count: 12, fill: "#758694" },
    ]
};

// 메인 컴포넌트 정의
export default function EmotionReport() {
    // 현재 연도와 월을 상태로 관리
    const currentYear = new Date().getFullYear();
    const currentMonth = new Date().getMonth() + 1;

    // 연도와 월 상태를 관리하는 useState 훅 사용
    const [selectedYear, setSelectedYear] = useState(currentYear);
    const [selectedMonth, setSelectedMonth] = useState(currentMonth);

    // 스크롤뷰 참조 생성
    const scrollViewRef = useRef(null);

    // 이전 연도로 이동
    const handlePrevYear = () => {
        setSelectedYear(prev => prev - 1);
    };

    // 다음 연도로 이동
    const handleNextYear = () => {
        setSelectedYear(prev => prev + 1);
    };

    // 이전 월로 이동
    const handlePrevMonth = () => {
        setSelectedMonth(prev => prev === 1 ? 12 : prev - 1);
        if (selectedMonth === 1) {
            setSelectedYear(prev => prev - 1);
        }
    };

    // 다음 월로 이동
    const handleNextMonth = () => {
        setSelectedMonth(prev => prev === 12 ? 1 : prev + 1);
        if (selectedMonth === 12) {
            setSelectedYear(prev => prev + 1);
        }
    };

    // UI 렌더링
    return (
        <ScrollView style={styles.scrollView} ref={scrollViewRef}>
            <View style={styles.container}>
                {/* 사용자 감정 상태 섹션 */}
                <View style={styles.sectionContainer}>
                    <View style={styles.header}>
                        <Text style={styles.title}>{MOCK_DATA.userNick}님의 감정 상태</Text>
                        <View style={styles.yearSelector}>
                            {/* 이전 연도로 이동 버튼 */}
                            <Pressable onPress={handlePrevYear} style={styles.arrowButton}>
                                <Text style={styles.arrowButtonText}>◀</Text>
                            </Pressable>
                            {/* 현재 선택된 연도 표시 */}
                            <Text style={styles.yearText}>{selectedYear}년</Text>
                            {/* 다음 연도로 이동 버튼 */}
                            <Pressable onPress={handleNextYear} style={styles.arrowButton}>
                                <Text style={styles.arrowButtonText}>▶</Text>
                            </Pressable>
                        </View>
                    </View>
                </View>

                {/* 감정 분포 섹션 */}
                <View style={styles.sectionContainer}>
                    <View style={styles.chartHeader}>
                        <Text style={styles.subtitle}>감정 분포</Text>
                        {/* 이전 및 다음 월 선택기 */}
                        <View style={styles.monthSelector}>
                            <Pressable onPress={handlePrevMonth} style={styles.arrowButton}>
                                <Text style={styles.arrowButtonText}>◀</Text>
                            </Pressable>
                            <Text style={styles.monthText}>{selectedMonth}월</Text>
                            <Pressable onPress={handleNextMonth} style={styles.arrowButton}>
                                <Text style={styles.arrowButtonText}>▶</Text>
                            </Pressable>
                        </View>
                    </View>
                    {/* 감정 분포 데이터를 표시할 자리 */}
                    <View style={styles.chartPlaceholderContainer}>
                        <Text style={styles.placeholderText}>감정 분포가 들어갈 예정입니다.</Text>
                    </View>
                </View>

                {/* 감정 그래프 섹션 */}
                <View style={styles.sectionContainer}>
                    <View style={styles.chartHeader}>
                        <Text style={styles.subtitle}>감정 그래프</Text>
                        {/* 그래프 관련 컨트롤 추가 가능 */}
                    </View>
                    {/* 감정 그래프 데이터를 표시할 자리 */}
                    <View style={styles.chartPlaceholderContainer}>
                        <Text style={styles.placeholderText}>감정 그래프가 들어갈 예정입니다.</Text>
                    </View>
                </View>

                {/* 감정 키워드 섹션 */}
                <View style={styles.sectionContainer}>
                    <View style={styles.chartHeader}>
                        <Text style={styles.subtitle}>감정 키워드</Text>
                        {/* 키워드 관련 컨트롤 추가 가능 */}
                    </View>
                    {/* 워드클라우드 데이터를 표시할 자리 */}
                    <View style={styles.chartPlaceholderContainer}>
                        <Text style={styles.placeholderText}>워드 클라우드가 들어갈 예정입니다.</Text>
                    </View>
                </View>
            </View>
        </ScrollView>
    );
}

// 스타일 정의
const styles = StyleSheet.create({
    // 차트의 자리 표시자 컨테이너 스타일
    chartPlaceholderContainer: {
        width: '100%', // 너비를 전체로 설정
        height: 200, // 높이 설정
        backgroundColor: '#FFFFFF', // 흰색 배경
        borderRadius: 10, // 둥근 모서리
        justifyContent: 'center', // 수직 중앙 정렬
        alignItems: 'center', // 가로 중앙 정렬
        padding: 15, // 내부 여백
        marginTop: 10, // 상단 여백
        borderWidth: 1, // 테두리 두께
        borderColor: '#E5E5E5', // 테두리 색상
    },
    // 자리 표시자 텍스트 스타일
    placeholderText: {
        fontSize: 14, // 텍스트 크기
        color: '#666666', // 텍스트 색상 (회색)
        textAlign: 'center', // 텍스트 가운데 정렬
    },
    // ScrollView 스타일
    scrollView: {
        flex: 1, // 전체 화면을 채움
        backgroundColor: '#FFFFFF', // 배경색 흰색
    },
    // 전체 컨테이너 스타일
    container: {
        flex: 1, // 전체 화면을 채움
        padding: 15, // 내부 여백
        backgroundColor: '#FFFFFF', // 배경색 흰색
        gap: 0, // 요소 간 간격 없음
    },
    // 각 섹션을 감싸는 컨테이너 스타일
    sectionContainer: {
        backgroundColor: '#F5F5F5', // 연한 회색 배경
        borderRadius: 15, // 둥근 모서리
        padding: 15, // 내부 여백
        marginBottom: 10, // 하단 여백
    },
    // 헤더 스타일
    header: {
        flexDirection: 'row', // 가로 정렬
        alignItems: 'center', // 수직 중앙 정렬
        justifyContent: 'space-between', // 좌우 끝에 배치
        width: '100%', // 전체 너비 사용
    },
    // 차트 헤더 스타일
    chartHeader: {
        flexDirection: 'row', // 가로 정렬
        alignItems: 'center', // 수직 중앙 정렬
        justifyContent: 'space-between', // 좌우 끝에 배치
        marginBottom: 10, // 하단 여백
        paddingHorizontal: 10, // 좌우 여백
    },
    // 제목 텍스트 스타일
    title: {
        fontSize: 18, // 텍스트 크기
        fontWeight: '600', // 텍스트 두껍게
        color: '#000', // 검정색 텍스트
    },
    // 부제목 텍스트 스타일
    subtitle: {
        fontSize: 18, // 텍스트 크기
        fontWeight: '600', // 텍스트 두껍게
        left: -8, // 왼쪽으로 위치 조정
        color: '#000', // 검정색 텍스트
    },
    // 연도 선택기 스타일
    yearSelector: {
        flexDirection: 'row', // 가로 정렬
        alignItems: 'center', // 수직 중앙 정렬
        backgroundColor: '#FFFFFF', // 흰색 배경
        borderRadius: 8, // 둥근 모서리
        paddingVertical: 4, // 위아래 여백
        height: 36, // 높이 설정
        width: 140, // 너비 설정
        justifyContent: 'center', // 가로 중앙 정렬
    },
    // 월 선택기 스타일
    monthSelector: {
        flexDirection: 'row', // 가로 정렬
        alignItems: 'center', // 수직 중앙 정렬
        backgroundColor: '#FFFFFF', // 흰색 배경
        borderRadius: 8, // 둥근 모서리
        paddingVertical: 4, // 위아래 여백
        height: 36, // 높이 설정
        right: -10, // 오른쪽으로 위치 조정
        width: 140, // 너비 설정
        justifyContent: 'center', // 가로 중앙 정렬
    },
    // 화살표 버튼 스타일
    arrowButton: {
        padding: 4, // 내부 여백
        width: 28, // 너비 설정
        height: 28, // 높이 설정
        alignItems: 'center', // 수직 중앙 정렬
        justifyContent: 'center', // 가로 중앙 정렬
    },
    // 화살표 버튼 텍스트 스타일
    arrowButtonText: {
        fontSize: 16, // 텍스트 크기
        color: '#000', // 검정색 텍스트
    },
    // 연도 텍스트 스타일
    yearText: {
        fontSize: 16, // 텍스트 크기
        fontWeight: '500', // 텍스트 중간 굵기
        marginHorizontal: 12, // 좌우 여백
        color: '#333', // 어두운 회색 텍스트
        minWidth: 60, // 최소 너비 설정
        textAlign: 'center', // 텍스트 가운데 정렬
    },
    // 월 텍스트 스타일
    monthText: {
        fontSize: 16, // 텍스트 크기
        fontWeight: '500', // 텍스트 중간 굵기
        marginHorizontal: 12, // 좌우 여백
        color: '#333', // 어두운 회색 텍스트
        minWidth: 60, // 최소 너비 설정
        textAlign: 'center', // 텍스트 가운데 정렬
    },
});
