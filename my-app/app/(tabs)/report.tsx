import React, { useState, useRef, useMemo } from 'react';
import { View, Text, StyleSheet, Dimensions, Pressable, ScrollView, Image } from 'react-native';
import { VictoryChart, VictoryLine, VictoryAxis, VictoryTheme, VictoryLabel, VictoryScatter, VictoryBar } from 'victory-native';

// 이모티콘 이미지 import
import em_happy from "../../assets/images/기쁨2.png";
import em_angly from "../../assets/images/화남2.png";
import em_surprise from "../../assets/images/놀람2.png";
import em_fear from "../../assets/images/두려움2.png";
import em_sad from "../../assets/images/슬픔2.png";
import em_dislike from "../../assets/images/싫음2.png";
import em_soso from "../../assets/images/쏘쏘2.png";

// 화면의 너비를 가져옴
const screenWidth = Dimensions.get("window").width;

// 감정별 색상 및 데이터 정의
// EMOTIONS 상수 수정 - y축 순서 정의 추가
const EMOTIONS = {
    "기쁨": { color: "#FFC436", icon: em_happy, order: 1 },
    "화남": { color: "#BF3131", icon: em_angly, order: 2 },
    "슬픔": { color: "#0174BE", icon: em_sad, order: 3 },
    "쏘쏘": { color: "#FF9BD2", icon: em_soso, order: 4 },
    "놀람": { color: "#5C8374", icon: em_surprise, order: 5 },
    "싫은": { color: "#81689D", icon: em_dislike, order: 6 },
    "두려움": { color: "#758694", icon: em_fear, order: 7 },
};

// 월간 데이터 Mock (데이터가 없는 경우를 대비한 가짜 데이터)
const MOCK_DATA = {
    user_nick: "김철수",
    emotions: [
        { emotion_tag: "기쁨", count: 145, fill: "#FFC436" },
        { emotion_tag: "화남", count: 89, fill: "#BF3131" },
        { emotion_tag: "슬픔", count: 76, fill: "#0174BE" },
        { emotion_tag: "쏘쏘", count: 65, fill: "#FF9BD2" },
        { emotion_tag: "놀람", count: 43, fill: "#5C8374" },
        { emotion_tag: "싫은", count: 28, fill: "#81689D" },
        { emotion_tag: "두려움", count: 12, fill: "#758694" },
    ]
};

// 주간 데이터 Mock (가짜 주간 데이터)
const MOCK_WEEKLY_DATA = {
    emotions: [
        { day: "월", emotion: "기쁨", value: 35 },
        { day: "화", emotion: "슬픔", value: 42 },
        { day: "수", emotion: "화남", value: 38 },
        { day: "목", emotion: "쏘쏘", value: 45 },
        { day: "금", emotion: "놀람", value: 50 },
        { day: "토", emotion: "싫은", value: 30 },
        { day: "일", emotion: "두려움", value: 25 }
    ]
};

// 커스텀 데이터 포인트 컴포넌트 (VictoryScatter에서 사용)
const CustomDataPoint = ({ x, y, datum }) => {
    const emotion = EMOTIONS[datum.y];
    if (!emotion) return null;

    return (
        <View style={{
            position: 'absolute',
            left: x - 12,
            top: y - 12,
            width: 24,
            height: 24,
        }}>
            <Image
                source={emotion.icon}
                style={{
                    width: '100%',
                    height: '100%',
                }}
                resizeMode="contain"
            />
        </View>
    );
};

// 커스텀 바 레이블 컴포넌트 (VictoryBar에서 사용)
const CustomBarLabel = ({ x, y, datum }) => {
    const emotion = EMOTIONS[datum.x];
    if (!emotion) return null;
    return (
        <View style={{
            position: 'absolute',
            left: x,
            top: y - 12,
            flexDirection: 'row',
            alignItems: 'center',
            backgroundColor: 'transparent',
        }}>
            <Image
                source={emotion.icon}
                style={{
                    width: 24,
                    height: 24,
                    marginRight: 8,
                }}
                resizeMode="contain"
            />
            <Text style={{
                fontSize: 14,
                fontWeight: 'bold',
                color: '#000000',
            }}>
                {datum.y}<Text style={{ fontSize: 12 }}>번</Text>
            </Text>
        </View>
    );
};

export default function EmotionReport() {
    const currentYear = new Date().getFullYear();
    const currentMonth = new Date().getMonth() + 1;

    // 현재 선택된 연도, 월, 주차를 상태로 관리
    const [selectedYear, setSelectedYear] = useState(currentYear);
    const [selectedMonth, setSelectedMonth] = useState(currentMonth);
    const [selectedWeek, setSelectedWeek] = useState(1);
    const [activeTooltip, setActiveTooltip] = useState(null);

    // 스크롤뷰 및 차트 참조 (차트 영역으로 이동할 때 사용)
    const scrollViewRef = useRef(null);
    const emotionChartRef = useRef(null);

    // 툴팁 컴포넌트 (차트 포인트 클릭 시 표시)
    const Tooltip = ({ x, y, datum }) => {
        if (!activeTooltip || activeTooltip.x !== datum.x) return null;

        return (
            <View style={{
                position: 'absolute',
                left: x - 75,
                top: y - 70,
                backgroundColor: 'rgba(0,0,0,0.8)',
                padding: 10,
                borderRadius: 5,
                width: 150,
            }}>
                <Text style={{ color: 'white', fontSize: 12, textAlign: 'center' }}>
                    {datum.x}요일{'\n'}
                    감정: {datum.y}{'\n'}
                    횟수: {datum.value}회
                </Text>
            </View>
        );
    };

    // 월간 감정 데이터 정렬 및 필터링
    const data = [...MOCK_DATA.emotions]
        .sort((a, b) => a.count - b.count) // 감정의 횟수를 기준으로 정렬
        .map(item => ({
            x: item.emotion_tag,
            y: item.count,
            fill: EMOTIONS[item.emotion_tag].color,
        }));

    // 주간 감정 데이터 변환
    const weeklyData = MOCK_WEEKLY_DATA.emotions.map(item => ({
        x: item.day,
        y: item.emotion,
        value: item.value,
        color: EMOTIONS[item.emotion].color
    }));

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

    // 데이터가 없을 때 표시할 컴포넌트
    const NoDataView = () => (
        <View style={styles.noDataContainer}>
            <Text style={styles.noDataText}>해당 주차의 데이터가 없습니다.</Text>
        </View>
    );

    // 메모이제이션 추가 (데이터 변경 시만 재계산)
    const memoizedWeeklyData = useMemo(() => {
        return MOCK_WEEKLY_DATA.emotions.map(item => ({
            x: item.day,
            y: item.emotion,
            value: item.value,
            color: EMOTIONS[item.emotion].color
        }));
    }, [selectedWeek]);

    // 컴포넌트 메모이제이션 (불필요한 렌더링 방지)
    const MemoizedCustomDataPoint = React.memo(CustomDataPoint);
    const MemoizedTooltip = React.memo(Tooltip);

    return (
        <ScrollView style={styles.scrollView} ref={scrollViewRef}>
            <View style={styles.container}>
                <View style={styles.sectionContainer}>
                    <View style={styles.header}>
                        <Text style={styles.title}>{MOCK_DATA.user_nick}님의 감정상태</Text>
                        <View style={styles.yearSelector}>
                            <Pressable onPress={handlePrevYear} style={styles.arrowButton}>
                                <Text style={styles.arrowButtonText}>◀</Text>
                            </Pressable>
                            <Text style={styles.yearText}>{selectedYear}년</Text>
                            <Pressable onPress={handleNextYear} style={styles.arrowButton}>
                                <Text style={styles.arrowButtonText}>▶</Text>
                            </Pressable>
                        </View>
                    </View>
                </View>

                {/* 월간 감정 분포 섹션 */}
                <View style={styles.sectionContainer} ref={emotionChartRef}>
                    <View style={styles.chartHeader}>
                        <Text style={styles.subtitle}>월간 감정 분포</Text>
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
                    <View style={styles.chartContainer}>
                        <VictoryChart
                            theme={VictoryTheme.material}
                            width={screenWidth - 40}
                            height={300}
                            domainPadding={{ x: 20 }}
                            padding={{ left: 70, right: 90, top: 20, bottom: 30 }}
                            style={{
                                parent: {
                                    marginLeft: -15
                                }
                            }}
                        >
                            <VictoryAxis
                                style={{
                                    axis: { stroke: "transparent" },
                                    tickLabels: {
                                        fontSize: 14,
                                        fill: "#000000",
                                        fontWeight: "500",
                                    },
                                    grid: { stroke: "transparent" },
                                }}
                                tickLabelComponent={
                                    <VictoryLabel
                                        dx={-1}
                                        textAnchor="end"
                                    />
                                }
                            />
                            <VictoryBar
                                horizontal
                                data={data}
                                x="x"
                                y="y"
                                cornerRadius={6}
                                barRatio={0.7}
                                labels={({ datum }) => datum.y}
                                labelComponent={<CustomBarLabel />}
                                style={{
                                    data: {
                                        fill: ({ datum }) => datum.fill,
                                        zIndex: 0
                                    }
                                }}
                                animate={false}
                                alignment="middle"
                            />
                        </VictoryChart>
                    </View>
                </View>

                {/* 주차별 감정 분포 섹션 */}
                <View style={styles.sectionContainer}>
                    {/* 주차 선택기 컴포넌트 */}
                    <View style={styles.chartHeader}>
                        <Text style={styles.subtitle}>주차별 감정 분포</Text>
                        <View style={styles.weekSelector}>
                            <Pressable onPress={() => setSelectedWeek(prev => Math.max(1, prev - 1))} style={styles.arrowButton}>
                                <Text style={styles.arrowButtonText}>◀</Text>
                            </Pressable>
                            <Text style={styles.weekText}>{selectedWeek}주차</Text>
                            <Pressable onPress={() => setSelectedWeek(prev => Math.min(5, prev + 1))} style={styles.arrowButton}>
                                <Text style={styles.arrowButtonText}>▶</Text>
                            </Pressable>
                        </View>
                    </View>
                    <View style={[styles.chartContainer, { marginVertical: 10 }]}>
                    {weeklyData.length > 0 ? (
                        <VictoryChart
                            theme={VictoryTheme.material}
                            width={screenWidth - 40}
                            height={300}
                            domainPadding={{ x: 20, y: 30 }}
                            padding={{ left: 80, right: 80, top: 30, bottom: 50 }} // 좌우 패딩을 동일하게 조정
                            animate={{
                                duration: 500,
                                onLoad: { duration: 300 },
                                onEnter: {
                                    duration: 500,
                                    before: () => ({ opacity: 0.3 }),
                                    after: () => ({ opacity: 1 })
                                }
                            }}
                        >
                            <VictoryAxis
                                dependentAxis
                                style={{
                                    axis: { stroke: "#333" },
                                    tickLabels: {
                                        fontSize: 12,
                                        fill: "#333",
                                        padding: 5
                                    },
                                    grid: { stroke: "#E5E5E5" }
                                }}
                                tickValues={Object.keys(EMOTIONS).sort((a, b) => EMOTIONS[a].order - EMOTIONS[b].order)}
                            />
                            <VictoryAxis
                                style={{
                                    axis: { stroke: "#333" },
                                    tickLabels: {
                                        fontSize: 12,
                                        fill: "#333",
                                        padding: 5
                                    },
                                    grid: { stroke: "transparent" }
                                }}
                            />
                            <VictoryLine
                                data={memoizedWeeklyData}
                                style={{
                                    data: {
                                        stroke: "#4A90E2",
                                        strokeWidth: 2,
                                        strokeLinecap: "round"
                                    }
                                }}
                                animate={{
                                    duration: 500,
                                    onExit: {
                                        duration: 200,
                                        before: () => ({ opacity: 0.5 })
                                    }
                                }}
                            />
                            <VictoryScatter
                                data={memoizedWeeklyData}
                                size={7}
                                style={{
                                    data: {
                                        fill: ({ datum }) => datum.color,
                                        stroke: "#FFFFFF",
                                        strokeWidth: 2
                                    }
                                }}
                                dataComponent={<CustomDataPoint />}
                                labels={({ datum }) => `${datum.value}회`}
                                labelComponent={<Tooltip />}  // 중복된 labelComponent 제거
                                events={[{
                                    target: "data",
                                    eventHandlers: {
                                        onPressIn: () => ({
                                            target: "data",
                                            mutation: (props) => {
                                                setActiveTooltip(props.datum);
                                                return { size: 10 };
                                            }
                                        }),
                                        onPressOut: () => ({
                                            target: "data",
                                            mutation: () => {
                                                setActiveTooltip(null);
                                                return { size: 7 };
                                            }
                                        })
                                    }
                                }]}
                            />
                        </VictoryChart>
                        ) : <NoDataView />}
                    </View>

                    {/* 범례 추가 */}
                    <View style={styles.legendContainer}>
                        {Object.entries(EMOTIONS).map(([emotion, { color }]) => (
                            <View key={emotion} style={styles.legendItem}>
                                <View style={[styles.legendColor, { backgroundColor: color }]} />
                                <Text style={styles.legendText}>{emotion}</Text>
                            </View>
                        ))}
                    </View>
                </View>
                {/* 감정 키워드 섹션 */}
                <View style={styles.sectionContainer}>
                    <View style={styles.chartHeader}>
                        <Text style={styles.subtitle}>감정 키워드</Text>
                        {/* 필요한 경우 여기에 컨트롤러 추가 */}
                    </View>
                    <View style={styles.wordCloudContainer}>
                        <Text style={styles.placeholderText}>워드클라우드가 들어갈 예정입니다.</Text>
                    </View>
                </View>
            </View>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    // 워드 클라우드가 들어갈 컨테이너 스타일
    wordCloudContainer: {
        width: '100%', // 컨테이너의 너비를 전체 너비로 설정
        height: 200, // 고정된 높이 설정
        backgroundColor: '#FFFFFF', // 배경색 흰색
        borderRadius: 10, // 둥근 모서리 적용
        justifyContent: 'center', // 수직 중앙 정렬
        alignItems: 'center', // 가로 중앙 정렬
        padding: 15, // 내부 여백 설정
        marginTop: 10, // 상단 여백
        borderWidth: 1, // 테두리 두께 설정
        borderColor: '#E5E5E5', // 테두리 색상 설정
    },
    // 워드 클라우드의 자리 표시자 텍스트 스타일
    placeholderText: {
        fontSize: 14, // 텍스트 크기 설정
        color: '#666666', // 텍스트 색상 설정 (회색)
        textAlign: 'center', // 텍스트 가운데 정렬
    },
    // 주차 선택 컨트롤러 스타일
    weekSelector: {
        flexDirection: 'row', // 버튼과 텍스트를 가로로 정렬
        alignItems: 'center', // 수직 중앙 정렬
        backgroundColor: '#FFFFFF', // 배경색 흰색
        borderRadius: 8, // 둥근 모서리 적용
        paddingVertical: 4, // 위아래 여백
        height: 36, // 높이 설정
        width: 120, // 너비 설정
        justifyContent: 'center', // 가로 중앙 정렬
    },
    // 주차 선택 텍스트 스타일
    weekText: {
        fontSize: 16, // 텍스트 크기 설정
        fontWeight: '500', // 텍스트 굵기 설정 (중간 굵기)
        marginHorizontal: 12, // 좌우 여백
        color: '#333', // 텍스트 색상 설정 (어두운 회색)
        minWidth: 50, // 최소 너비 설정
        textAlign: 'center', // 텍스트 가운데 정렬
    },
    // 데이터가 없을 때 표시할 컨테이너 스타일
    noDataContainer: {
        height: 200, // 고정된 높이 설정
        justifyContent: 'center', // 수직 중앙 정렬
        alignItems: 'center', // 가로 중앙 정렬
    },
    // 데이터가 없을 때 표시할 텍스트 스타일
    noDataText: {
        fontSize: 14, // 텍스트 크기 설정
        color: '#666', // 텍스트 색상 설정 (회색)
        textAlign: 'center', // 텍스트 가운데 정렬
    },
    // 툴팁 컨테이너 스타일
    tooltipContainer: {
        position: 'absolute', // 부모 요소에 상대적으로 위치 설정
        backgroundColor: 'rgba(0,0,0,0.8)', // 반투명한 검은색 배경
        padding: 10, // 내부 여백
        borderRadius: 5, // 둥근 모서리 적용
        zIndex: 1000, // 툴팁을 다른 요소보다 앞에 표시
    },
    // 툴팁 텍스트 스타일
    tooltipText: {
        color: 'white', // 텍스트 색상 흰색
        fontSize: 12, // 텍스트 크기 설정
        textAlign: 'center', // 텍스트 가운데 정렬
    },
    // 범례 컨테이너 스타일
    legendContainer: {
        flexDirection: 'row', // 가로 정렬
        flexWrap: 'wrap', // 여러 줄로 감싸서 표시
        justifyContent: 'center', // 가로 중앙 정렬
        marginTop: 20, // 상단 여백
        gap: 10, // 각 항목 사이의 간격
    },
    // 범례 항목 스타일
    legendItem: {
        flexDirection: 'row', // 색상과 텍스트를 가로로 정렬
        alignItems: 'center', // 수직 중앙 정렬
        marginHorizontal: 5, // 좌우 여백
    },
    // 범례 색상 표시 스타일
    legendColor: {
        width: 12, // 색상 사각형의 너비
        height: 12, // 색상 사각형의 높이
        borderRadius: 6, // 둥근 모서리 적용
        marginRight: 5, // 텍스트와의 간격
    },
    // 범례 텍스트 스타일
    legendText: {
        fontSize: 12, // 텍스트 크기 설정
        color: '#333', // 텍스트 색상 설정 (어두운 회색)
    },
    // 전체 ScrollView 스타일
    scrollView: {
        flex: 1, // 전체 화면을 채우도록 설정
        backgroundColor: '#FFFFFF', // 배경색 흰색
    },
    // 전체 컨테이너 스타일
    container: {
        flex: 1, // 전체 화면을 채우도록 설정
        padding: 15, // 내부 여백
        backgroundColor: '#FFFFFF', // 배경색 흰색
        gap: 0, // 요소 간 간격 없음
    },
    // 각 섹션을 감싸는 컨테이너 스타일
    sectionContainer: {
        backgroundColor: '#F5F5F5', // 연한 회색 배경
        borderRadius: 15, // 둥근 모서리 적용
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
        fontSize: 18, // 텍스트 크기 설정
        fontWeight: '600', // 텍스트 두껍게 설정
        color: '#000', // 텍스트 색상 검정
    },
    // 부제목 텍스트 스타일
    subtitle: {
        fontSize: 18, // 텍스트 크기 설정
        fontWeight: '600', // 텍스트 두껍게 설정
        left: -8, // 왼쪽으로 약간 위치 조정
        color: '#000', // 텍스트 색상 검정
    },
    // 연도 선택기 스타일
    yearSelector: {
        flexDirection: 'row', // 가로 정렬
        alignItems: 'center', // 수직 중앙 정렬
        backgroundColor: '#FFFFFF', // 배경색 흰색
        borderRadius: 8, // 둥근 모서리 적용
        paddingVertical: 4, // 위아래 여백
        height: 36, // 높이 설정
        width: 140, // 너비 설정
        justifyContent: 'center', // 가로 중앙 정렬
    },
    // 월 선택기 스타일
    monthSelector: {
        flexDirection: 'row', // 가로 정렬
        alignItems: 'center', // 수직 중앙 정렬
        backgroundColor: '#FFFFFF', // 배경색 흰색
        borderRadius: 8, // 둥근 모서리 적용
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
        fontSize: 16, // 텍스트 크기 설정
        color: '#000', // 텍스트 색상 검정
    },
    // 연도 텍스트 스타일
    yearText: {
        fontSize: 16, // 텍스트 크기 설정
        fontWeight: '500', // 텍스트 굵기 설정 (중간 굵기)
        marginHorizontal: 12, // 좌우 여백
        color: '#333', // 텍스트 색상 설정 (어두운 회색)
        minWidth: 60, // 최소 너비 설정
        textAlign: 'center', // 텍스트 가운데 정렬
    },
    // 월 텍스트 스타일
    monthText: {
        fontSize: 16, // 텍스트 크기 설정
        fontWeight: '500', // 텍스트 굵기 설정 (중간 굵기)
        marginHorizontal: 12, // 좌우 여백
        color: '#333', // 텍스트 색상 설정 (어두운 회색)
        minWidth: 60, // 최소 너비 설정
        textAlign: 'center', // 텍스트 가운데 정렬
    },
    // 차트 컨테이너 스타일
    chartContainer: {
        marginVertical: -10,
        alignItems: 'center', // 가운데 정렬 추가
        width: '100%', // 전체 너비 사용
    },
});
