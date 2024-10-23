import React, {useState, useRef} from 'react';
import {View, Text, StyleSheet, Dimensions, Pressable, ScrollView, Image} from 'react-native';
import {VictoryChart, VictoryBar, VictoryAxis, VictoryTheme, VictoryLabel} from 'victory-native';

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
const EMOTIONS = {
    "기쁨": { color: "#FFC436", icon: em_happy },
    "화남": { color: "#BF3131", icon: em_angly },
    "슬픔": { color: "#0174BE", icon: em_sad },
    "쏘쏘": { color: "#FF9BD2", icon: em_soso },
    "놀람": { color: "#5C8374", icon: em_surprise },
    "싫은": { color: "#81689D", icon: em_dislike },
    "두려움": { color: "#758694", icon: em_fear },
};

// 커스텀 바 레이블 컴포넌트
const CustomBarLabel = ({x, y, datum}) => {
    return (
        <View style={[{
            position: 'absolute',
            left: x,
            top: y - 12,
            flexDirection: 'row',
            alignItems: 'center',
            zIndex: 1,
            opacity: 1,
            backgroundColor: 'transparent'
        }]}>
            <Image
                source={EMOTIONS[datum.x].icon}
                style={{
                    width: 24,
                    height: 24,
                    marginRight: 8,
                    opacity: 1
                }}
                resizeMode="contain"
            />
            <Text style={{
                fontSize: 14,
                fontWeight: 'bold',
                color: '#000000',
                opacity: 1
            }}>
                {datum.y}<Text style={{fontSize: 12}}>번</Text>
            </Text>
        </View>
    );
};

const MOCK_DATA = {
    user_nick: "김철수",
    emotions: [
        {emotion_tag: "기쁨", count: 145, fill: "#FFC436"},
        {emotion_tag: "화남", count: 89, fill: "#BF3131"},
        {emotion_tag: "슬픔", count: 76, fill: "#0174BE"},
        {emotion_tag: "쏘쏘", count: 65, fill: "#FF9BD2"},
        {emotion_tag: "놀람", count: 43, fill: "#5C8374"},
        {emotion_tag: "싫은", count: 28, fill: "#81689D"},
        {emotion_tag: "두려움", count: 12, fill: "#758694"},
    ]
};

export default function EmotionReport() {
    const currentYear = new Date().getFullYear();
    const currentMonth = new Date().getMonth() + 1;

    const [selectedYear, setSelectedYear] = useState(currentYear);
    const [selectedMonth, setSelectedMonth] = useState(currentMonth);

    const scrollViewRef = useRef(null);
    const emotionChartRef = useRef(null);

    const data = [...MOCK_DATA.emotions]
        .sort((a, b) => a.count - b.count)
        .map(item => ({
            x: item.emotion_tag,
            y: item.count,
            fill: EMOTIONS[item.emotion_tag].color,
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
                            domainPadding={{x: 20}}
                            padding={{left: 70, right: 90, top: 20, bottom: 30}}
                            style={{
                                parent: {
                                    marginLeft: -15
                                }
                            }}
                        >
                            <VictoryAxis
                                style={{
                                    axis: {stroke: "transparent"},
                                    tickLabels: {
                                        fontSize: 14,
                                        fill: "#000000",
                                        fontWeight: "500",
                                    },
                                    grid: {stroke: "transparent"},
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
                                labels={({datum}) => datum.y}
                                labelComponent={<CustomBarLabel />}
                                style={{
                                    data: {
                                        fill: ({datum}) => datum.fill,
                                        zIndex: 0
                                    }
                                }}
                                animate={false}
                                alignment="middle"
                            />
                        </VictoryChart>
                    </View>
                </View>
            </View>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
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
        left:-8,
        color: '#000',
    },
    yearSelector: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FFFFFF',
        borderRadius: 8,
        paddingVertical: 4,
        height: 36,
        width: 140,  // 고정 너비 추가
        justifyContent: 'center', // 중앙 정렬 추가
    },
    monthSelector: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FFFFFF',
        borderRadius: 8,
        paddingVertical: 4,
        height: 36,
        right:-10,
        width: 140,  // yearSelector와 동일한 너비
        justifyContent: 'center', // 중앙 정렬 추가
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