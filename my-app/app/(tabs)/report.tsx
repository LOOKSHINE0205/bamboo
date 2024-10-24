import React, { useState, useRef, useMemo  } from 'react';
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

// 월간 데이터 Mock
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

// 주간 데이터 Mock
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


// 커스텀 데이터 포인트 컴포넌트
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
// 커스텀 바 레이블 컴포넌트
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

    const [selectedYear, setSelectedYear] = useState(currentYear);
    const [selectedMonth, setSelectedMonth] = useState(currentMonth);
    const [selectedWeek, setSelectedWeek] = useState(1);
    const [activeTooltip, setActiveTooltip] = useState(null);

    const scrollViewRef = useRef(null);
    const emotionChartRef = useRef(null);
    // 툴팁 컴포넌트
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
    const data = [...MOCK_DATA.emotions]
        .sort((a, b) => a.count - b.count)
        .map(item => ({
            x: item.emotion_tag,
            y: item.count,
            fill: EMOTIONS[item.emotion_tag].color,
        }));

    const weeklyData = MOCK_WEEKLY_DATA.emotions.map(item => ({
        x: item.day,
        y: item.emotion,
        value: item.value,
        color: EMOTIONS[item.emotion].color
    }));
    const handlePrevYear = () => {
        setSelectedYear(prev => prev - 1);
    };

    const handleNextYear = () => {
        setSelectedYear(prev => prev + 1);
    };

    const handlePrevMonth = () => {
        setSelectedMonth(prev => prev === 1 ? 12 : prev - 1);
        if (selectedMonth === 1) {
            setSelectedYear(prev => prev - 1);
        }
    };

    const handleNextMonth = () => {
        setSelectedMonth(prev => prev === 12 ? 1 : prev + 1);
        if (selectedMonth === 12) {
            setSelectedYear(prev => prev + 1);
        }
    };
    const NoDataView = () => (
        <View style={styles.noDataContainer}>
            <Text style={styles.noDataText}>해당 주차의 데이터가 없습니다.</Text>
        </View>
    );
    // 메모이제이션 추가
    const memoizedWeeklyData = useMemo(() => {
        return MOCK_WEEKLY_DATA.emotions.map(item => ({
            x: item.day,
            y: item.emotion,
            value: item.value,
            color: EMOTIONS[item.emotion].color
        }));
    }, [selectedWeek]); // selectedWeek가 변경될 때만 재계산

    // 컴포넌트 메모이제이션
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
                            padding={{ left: 100, right: 50, top: 30, bottom: 50 }}
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
            </View>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    // styles 객체에 추가
    weekSelector: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FFFFFF',
        borderRadius: 8,
        paddingVertical: 4,
        height: 36,
        width: 120,
        justifyContent: 'center',
    },
    weekText: {
        fontSize: 16,
        fontWeight: '500',
        marginHorizontal: 12,
        color: '#333',
        minWidth: 50,
        textAlign: 'center',
    },
    noDataContainer: {
        height: 200,
        justifyContent: 'center',
        alignItems: 'center',
    },
    noDataText: {
        fontSize: 14,
        color: '#666',
        textAlign: 'center',
    },
    tooltipContainer: {
        position: 'absolute',
        backgroundColor: 'rgba(0,0,0,0.8)',
        padding: 10,
        borderRadius: 5,
        zIndex: 1000,
    },
    tooltipText: {
        color: 'white',
        fontSize: 12,
        textAlign: 'center',
    },
    // styles 객체에 추가
    legendContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'center',
        marginTop: 20,
        gap: 10,
    },
    legendItem: {
        flexDirection: 'row',
        alignItems: 'center',
        marginHorizontal: 5,
    },
    legendColor: {
        width: 12,
        height: 12,
        borderRadius: 6,
        marginRight: 5,
    },
    legendText: {
        fontSize: 12,
        color: '#333',
    },
    scrollView: {
        flex: 1,
        backgroundColor: '#FFFFFF',
    },
    container: {
        flex: 1,
        padding: 15,
        backgroundColor: '#FFFFFF',
        gap: 0,
    },
    sectionContainer: {
        backgroundColor: '#F5F5F5',
        borderRadius: 15,
        padding: 15,
        marginBottom: 10,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        width: '100%',
    },
    chartHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 10,
        paddingHorizontal: 10,
    },
    title: {
        fontSize: 18,
        fontWeight: '600',
        color: '#000',
    },
    subtitle: {
        fontSize: 18,
        fontWeight: '600',
        left: -8,
        color: '#000',
    },
    yearSelector: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FFFFFF',
        borderRadius: 8,
        paddingVertical: 4,
        height: 36,
        width: 140,
        justifyContent: 'center',
    },
    monthSelector: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FFFFFF',
        borderRadius: 8,
        paddingVertical: 4,
        height: 36,
        right: -10,
        width: 140,
        justifyContent: 'center',
    },
    arrowButton: {
        padding: 4,
        width: 28,
        height: 28,
        alignItems: 'center',
        justifyContent: 'center',
    },
    arrowButtonText: {
        fontSize: 16,
        color: '#000',
    },
    yearText: {
        fontSize: 16,
        fontWeight: '500',
        marginHorizontal: 12,
        color: '#333',
        minWidth: 60,
        textAlign: 'center',
    },
    monthText: {
        fontSize: 16,
        fontWeight: '500',
        marginHorizontal: 12,
        color: '#333',
        minWidth: 60,
        textAlign: 'center',
    },
    chartContainer: {
        marginVertical: -10,
    }
});
