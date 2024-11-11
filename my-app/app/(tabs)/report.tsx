import React, { useState, useMemo, useEffect } from 'react';
import { View, Text, StyleSheet, Dimensions, ScrollView, Image, TouchableOpacity } from 'react-native';
import { VictoryChart, VictoryLine, VictoryTheme, VictoryAxis, VictoryStack, VictoryBar, VictoryGroup } from "victory-native";
import {getChatHistory} from "@/app/(tabs)/getChatHistory";
// 화면 크기 측정을 위해 Dimensions 모듈을 사용하여 화면의 너비와 높이를 가져옵니다.
const screenWidth = Dimensions.get("window").width;
const screenHeight = Dimensions.get("window").height;

// 감정별 아이콘을 불러옵니다.
import em_happy from "../../assets/images/기쁨2.png";
import em_angry from "../../assets/images/화남2.png";
import em_surprise from "../../assets/images/놀람2.png";
import em_fear from "../../assets/images/두려움2.png";
import em_sad from "../../assets/images/슬픔2.png";
import em_dislike from "../../assets/images/싫음2.png";
import em_soso from "../../assets/images/쏘쏘2.png";

// EmotionTag 인터페이스는 감정 태그를 정의하는데 사용됩니다.
export interface EmotionTag {
    emotionTag: string;
}

// 최근 7일의 날짜 라벨 생성 함수
const getLast7DaysLabels = () => {
    const labels = [];
    const nowUTC = new Date();
    const today = new Date(nowUTC.getTime() - nowUTC.getTimezoneOffset() * 60000); // 현재 시간을 UTC 기준으로 조정

    for (let i = 6; i >= 0; i--) {
        const day = new Date(today);
        day.setDate(today.getDate() - i-1);
        labels.push(`${String(day.getDate()).padStart(2, '0')}일`);
    }
    return labels;
};

// initialChartData 생성 시 labels을 최근 7일로 설정
const initialChartData  = {
    labels: getLast7DaysLabels(),  // 최근 7일의 날짜를 라벨로 설정
    datasets: [
        { data: [null, null, null, null, null, null, null], color: () => "#758694", label: "공포" },
        { data: [null, null, null, null, null, null, null], color: () => "#5C8374", label: "놀람" },
        { data: [null, null, null, null, null, null, null], color: () => "#BF3131", label: "분노" },
        { data: [null, null, null, null, null, null, null], color: () => "#0174BE", label: "슬픔" },
        { data: [null, null, null, null, null, null, null], color: () => "#FF9BD2", label: "중립" },
        { data: [null, null, null, null, null, null, null], color: () => "#FFC436", label: "행복" },
        { data: [null, null, null, null, null, null, null], color: () => "#81689D", label: "혐오" }
    ]
};


// EmotionReport 컴포넌트: 사용자가 감정을 선택하여 그래프에 표시하도록 하는 메인 컴포넌트
export default function EmotionReport() {
    const [selectedEmotions, setSelectedEmotions] = useState<string[]>([]); // 선택된 감정 목록을 저장
    const [chartData, setChartData] = useState(initialChartData); // 차트 데이터를 상태로 관리
    const [originalEmotionDataByDay, setOriginalEmotionDataByDay] = useState({});
    const [emotionDataByDay, setEmotionDataByDay] = useState({});
    // 컴포넌트가 처음 렌더링될 때 채팅 기록을 불러옵니다.
    useEffect(() => {
        loadChatHistory();
    }, []);
    const loadChatHistory = async () => {
        try {
            const chatHistory = await getChatHistory();
            const today = new Date();
            const sevenDaysAgo = new Date(today);
            sevenDaysAgo.setDate(today.getDate() - 7);

            const emotionDataByDayTemp = {
                공포: Array(7).fill(null),
                놀람: Array(7).fill(null),
                분노: Array(7).fill(null),
                슬픔: Array(7).fill(null),
                중립: Array(7).fill(null),
                행복: Array(7).fill(null),
                혐오: Array(7).fill(null)
            };
            const originalEmotionDataByDayTemp = JSON.parse(JSON.stringify(emotionDataByDayTemp));
            const emotionSumsByDay = Array(7).fill(0);

            chatHistory.forEach(chat => {
                if (chat.chatter === "bot") {
                    const chatDate = new Date(chat.createdAt);
                    if (chatDate >= sevenDaysAgo && chatDate <= today) {
                        const dayIndex = Math.floor((today - chatDate) / (1000 * 60 * 60 * 24));
                        if (chat.emotionTag) {
                            try {
                                const parsedEmotionTag = JSON.parse(chat.emotionTag);
                                for (const [emotion, value] of Object.entries(parsedEmotionTag)) {
                                    if (emotionDataByDayTemp[emotion] && dayIndex >= 0 && dayIndex < 7) {
                                        originalEmotionDataByDayTemp[emotion][6 - dayIndex] =
                                            (originalEmotionDataByDayTemp[emotion][6 - dayIndex] || 0) + value;
                                        emotionSumsByDay[6 - dayIndex] += value;
                                        emotionDataByDayTemp[emotion][6 - dayIndex] =
                                            (emotionDataByDayTemp[emotion][6 - dayIndex] || 0) + value;
                                    }
                                }
                            } catch (error) {
                                console.error("Failed to parse emotionTag:", error);
                            }
                        }
                    }
                }
            });

            for (const emotion in originalEmotionDataByDayTemp) {
                for (let i = 0; i < 7; i++) {
                    if (emotionSumsByDay[i] > 0) {
                        emotionDataByDayTemp[emotion][i] = parseFloat(
                            (emotionDataByDayTemp[emotion][i] / emotionSumsByDay[i]).toFixed(2)
                        );
                    }
                }
            }

            setOriginalEmotionDataByDay(originalEmotionDataByDayTemp);
            setEmotionDataByDay(emotionDataByDayTemp);

            console.log("라인 그래프용 평균 데이터:", originalEmotionDataByDayTemp);
            console.log("스택 그래프용 정규화 데이터:", emotionDataByDayTemp);
        } catch (error) {
            console.error("Failed to load chat history:", error);
        }
    };




    // 감정 선택 및 해제 함수: 감정을 선택하면 배열에 추가하고, 선택 해제 시 배열에서 제거합니다.
    const toggleEmotion = (emotion: string) => {
        setSelectedEmotions((prevSelected) =>
            prevSelected.includes(emotion)
                ? prevSelected.filter((e) => e !== emotion)
                : [...prevSelected, emotion]
        );
    };

    // Y축 최대값 계산 함수: 선택된 감정의 요일별 합계를 계산하고, 최대값을 반환하여 Y축 범위를 설정합니다.
    const yAxisMaxValue = useMemo(() => {
        if (selectedEmotions.length === 0) return 1;
        const dataToUse = chartData.datasets.filter(dataset => selectedEmotions.includes(dataset.label));
        const maxSum = chartData.labels.reduce((max, _, i) => {
            const daySum = dataToUse.reduce((sum, dataset) => sum + (dataset.data[i] || 0), 0);
            return Math.max(max, daySum);
        }, 1);
        return Math.ceil(maxSum * 10) / 10;
    }, [selectedEmotions, chartData]);

    // 선택된 감정 데이터만 필터링하여 차트에 사용할 데이터를 반환합니다.
    const filteredData = useMemo(() => {
        return initialChartData.datasets.filter((dataset) =>
            selectedEmotions.includes(dataset.label)
        );
    }, [selectedEmotions]);

    // 감정 아이콘 배열: 감정 아이콘과 라벨을 정의합니다.
    const emotionIcon = [
        { key: "공포", label: "공포", icon: em_fear },
        { key: "놀람", label: "놀람", icon: em_surprise },
        { key: "분노", label: "분노", icon: em_angry },
        { key: "슬픔", label: "슬픔", icon: em_sad },
        { key: "중립", label: "중립", icon: em_soso },
        { key: "행복", label: "행복", icon: em_happy },
        { key: "혐오", label: "혐오", icon: em_dislike },
    ];

    return (
        <ScrollView style={styles.scrollView}>
            <View style={styles.container}>
                {/* 감정 상태 타이틀 */}
                <View style={styles.sectionContainer}>
                    <Text style={styles.title}>사용자의 감정 상태</Text>
                </View>

                {/* 감정 선택 버튼 */}
                <View style={[styles.sectionContainer, { height: screenHeight * 0.125 }]}>
                    <View style={[styles.innerContainer]}>
                        <Text style={styles.subtitle}>감정 선택</Text>
                        <View style={[styles.iconContainer, { bottom: 5 }]}>
                            {emotionIcon.map((emotion) => (
                                <TouchableOpacity
                                    key={emotion.key}
                                    onPress={() => toggleEmotion(emotion.label)}
                                    style={[
                                        styles.iconLabelContainer,
                                        { opacity: selectedEmotions.includes(emotion.label) ? 1 : 0.4 },
                                    ]}
                                >
                                    <Image source={emotion.icon} style={styles.icon} />
                                    <Text style={styles.iconLabel}>{emotion.label}</Text>
                                </TouchableOpacity>
                            ))}
                        </View>
                    </View>
                </View>

                {/* 감정 라인 그래프 */}
                <View style={[styles.sectionContainer, { height: screenHeight * 0.25 }]}>
                    <View style={[styles.innerContainer]}>
                        <Text style={[styles.subtitle, styles.graphSubtitle]}>감정 라인 그래프</Text>
                        <VictoryChart
                            theme={VictoryTheme.material}
                            domainPadding={{ x: 30, y: 0 }}
                            padding={{ top: 25, bottom: 30, left: 40, right: 30 }}
                            width={screenWidth - 40}
                            height={screenHeight * 0.2}
                        >
                            <VictoryAxis
                                style={{
                                    axis: { stroke: 'transparent' },
                                    ticks: { stroke: 'transparent' },
                                    tickLabels: { fill: '#000', fontSize: 12 },
                                    grid: { stroke: 'transparent' }
                                }}
                                tickFormat={chartData.labels}  // 최근 7일의 날짜 라벨
                            />
                            <VictoryAxis
                                dependentAxis
                                domain={[0, 1]} // Y축 최대값 고정
                                tickFormat={(t) => (t === 0 ? "0" : t.toFixed(1))}
                                style={{
                                    axis: { stroke: 'transparent' },
                                    ticks: { stroke: 'transparent' },
                                    tickLabels: { fill: '#000', fontSize: 12 },
                                    grid: { stroke: 'transparent' },
                                }}
                            />
                            {chartData.datasets.map((dataset, index) => (
                                selectedEmotions.includes(dataset.label) && (
                                    <VictoryLine
                                        key={index}
                                        data={originalEmotionDataByDay[dataset.label].map((y, x) => ({ x: chartData.labels[x], y }))}
                                        style={{
                                            data: { stroke: dataset.color }
                                        }}
                                        interpolation="natural"
                                        animate={{
                                            duration: 2000,
                                            onExit: { duration: 2000 }
                                        }}
                                    />
                                )
                            ))}
                        </VictoryChart>
                    </View>
                </View>

                {/* 감정 스택 그래프 */}
                <View style={[styles.sectionContainer, { height: screenHeight * 0.25 }]}>
                    <View style={[styles.innerContainer]}>
                        <Text style={[styles.subtitle, styles.graphSubtitle]}>감정 스택 그래프</Text>

                        <VictoryChart
                            theme={VictoryTheme.material}
                            domainPadding={{ x: 30, y: 10 }}
                            padding={{ top: 15, bottom: 30, left: 40, right: 30 }}
                            width={screenWidth - 40}
                            height={screenHeight * 0.20}
                        >
                            <VictoryAxis
                                tickValues={chartData.labels}
                                tickFormat={chartData.labels}
                                style={{
                                    axis: { stroke: 'transparent' },
                                    ticks: { stroke: 'transparent' },
                                    tickLabels: { fill: '#000', fontSize: 12 },
                                    grid: { stroke: 'transparent' }
                                }}
                            />
                            <VictoryAxis
                                dependentAxis
                                domain={[0, 1]}
                                tickFormat={(t) => (t === 0 ? "0" : t.toFixed(1))}
                                style={{
                                    axis: { stroke: 'transparent' },
                                    ticks: { stroke: 'transparent' },
                                    tickLabels: { fill: '#000', fontSize: 12 },
                                    grid: { stroke: 'transparent' }
                                }}
                            />

                            {/* 선택된 감정 순서대로 VictoryStack에서 그래프 그리기 */}
                            <VictoryStack>
                                {selectedEmotions.map((emotion, index) => {
                                    const dataset = chartData.datasets.find(d => d.label === emotion);
                                    return dataset ? (
                                        <VictoryBar
                                            key={`selected-${index}`}
                                            data={emotionDataByDay[dataset.label].map((y, x) => ({
                                                x: chartData.labels[x],
                                                y: y || 0  // null일 경우 y값을 0으로 설정
                                            }))}
                                            style={{
                                                data: {
                                                    fill: dataset.color,
                                                    opacity: 1,
                                                }
                                            }}
                                            barWidth={10}
                                            animate={{
                                                duration: 1000,
                                                onEnter: {
                                                    duration: 1000,
                                                    before: () => ({ y: 0 }),
                                                    after: (datum) => ({ y: datum.y }),
                                                },
                                                onLoad: { duration: 1000 },
                                            }}
                                        />
                                    ) : null; // 데이터가 없는 경우 VictoryBar를 렌더링하지 않음
                                })}
                            </VictoryStack>
                        </VictoryChart>
                    </View>
                </View>
                {/* 워드클라우드 컨테이너 */}
                <View style={styles.sectionContainer}>
                    {/* 흰색 내부 컨테이너 */}
                    <View style={styles.innerContainer}>
                    <Text style={styles.subtitle}>워드클라우드</Text>
                        {/* 워드클라우드 내용이 들어갈 자리 */}
                        {/* 워드클라우드 컴포넌트 또는 이미지 추가 가능 */}
                    </View>
                </View>


            </View>
        </ScrollView>
    );
}

// 스타일 정의
const styles = StyleSheet.create({
    scrollView: { flex: 1, backgroundColor: '#FFFFFF' },
    container: { flex: 1, padding: 15, backgroundColor: '#FFFFFF' },
    sectionContainer: {
        backgroundColor: '#F5F5F5',
        borderRadius: 20,
        padding: 10,
        marginBottom: 10,
        justifyContent: 'center'
    },
    innerContainer: {
        backgroundColor: '#FFFFFF',
        borderRadius: 20,
        padding: 10,
        justifyContent: 'center',
    },
    title: { fontSize: 18, fontWeight: '600', color: '#000', marginBottom: 10 },
    subtitle: { fontSize: 18, fontWeight: '600', color: '#000' },
    graphSubtitle: { marginBottom: -10 },
    iconContainer: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center' },
    iconLabelContainer: { alignItems: 'center', marginHorizontal: 10 },
    icon: { width: 24, height: 24, marginTop: 15 },
    iconLabel: { fontSize: 12, color: '#666', marginTop: 5 },


});
