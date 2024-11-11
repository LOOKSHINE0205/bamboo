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
/*

// 최근 7일의 날짜 라벨을 생성하는 함수
const getLast7DaysLabels = () => {
    const labels = [];
    const today = new Date();

    for (let i = 6; i >= 0; i--) {
        const day = new Date(today);
        day.setDate(today.getDate() - i);
        const dayLabel = `${String(day.getDate()).padStart(2, '0')}일`; // '05일', '06일' 형식으로 포맷팅
        labels.push(dayLabel);
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
 */

// 초기 차트 데이터 정의: 요일별 데이터와 감정별 색상을 설정합니다.
const initialChartData = {
    labels: ["월", "화", "수", "목", "금", "토", "일"], // 요일 라벨
    datasets: [ // 각 감정 데이터와 색상 설정
        { data: [0.1, 0.2, 0.15, 0.3, 0.05, 0.25, 0.1], color: "#758694", label: "공포" },
        { data: [0.2, 0.3, 0.25, 0.1, 0.15, 0.05, 0.2], color: "#5C8374", label: "놀람" },
        { data: [0.3, 0.1, 0.25, 0.2, 0.05, 0.1, 0.2], color: "#BF3131", label: "분노" },
        { data: [0.15, 0.1, 0.05, 0.3, 0.25, 0.2, 0.15], color: "#0174BE", label: "슬픔" },
        { data: [0.2, 0.7, 0.15, 0.05, 0.2, 0.1, 0.25], color: "#FF9BD2", label: "중립" },
        { data: [0.25, 0.15, 0.3, 0.2, 0.1, 0.05, 0.2], color: "#FFC436", label: "행복" },
        { data: [0.1, 0.05, 0.2, 0.15, 0.3, 0.25, 0.1], color: "#81689D", label: "혐오" }
    ]
};


// EmotionReport 컴포넌트: 사용자가 감정을 선택하여 그래프에 표시하도록 하는 메인 컴포넌트
export default function EmotionReport() {
    const [selectedEmotions, setSelectedEmotions] = useState<string[]>([]); // 선택된 감정 목록을 저장
    const [chartData, setChartData] = useState(initialChartData); // 차트 데이터를 상태로 관리

    // 데이터베이스에서 채팅 기록을 불러와 차트 데이터로 변환하는 함수
    const loadChatHistory = async () => {
        try {
            const chatHistory = await getChatHistory(); // 서버에서 채팅 기록을 가져오는 함수
            // console.log("adfafadsfasfasdf",chatHistory)
            // 현재 날짜와 7일 전 날짜를 구합니다.
            const today = new Date();
            const sevenDaysAgo = new Date(today);
            sevenDaysAgo.setDate(today.getDate() - 6); // 최근 7일 전부터 오늘까지의 범위 설정

            const emotionDataByDay = {
                공포: [null, null, null, null, null, null, null],
                놀람: [null, null, null, null, null, null, null],
                분노: [null, null, null, null, null, null, null],
                슬픔: [null, null, null, null, null, null, null],
                중립: [null, null, null, null, null, null, null],
                행복: [null, null, null, null, null, null, null],
                혐오: [null, null, null, null, null, null, null]
            };

            // 'chatter'가 'bot'이면서 'createdAt'이 이번 주 월요일과 일요일 사이에 있는 메시지만 필터링
            // 'bot'의 메시지 중 최근 7일 내에 작성된 데이터만 필터링
            chatHistory.forEach(chat => {
                if (chat.chatter === "bot") { // chatter가 'bot'인 경우에만 처리
                    const chatDate = new Date(chat.createdAt);

                    // chatDate가 최근 7일 내에 있을 경우에만 처리
                    if (chatDate >= sevenDaysAgo && chatDate <= today) {
                        console.log("최근 7일 데이터xjj:", chatDate, chat.emotionTag);
                        if (chat.emotionTag) {
                            try {
                                const parsedEmotionTag = JSON.parse(chat.emotionTag);
                                const dayIndex = chatDate.getDay(); // 요일 인덱스(0: 일요일, 6: 토요일)

                                if (dayIndex !== -1) {
                                    for (const [emotion, value] of Object.entries(parsedEmotionTag)) {
                                        if (emotionDataByDay[emotion] && dayIndex !== -1) {
                                            emotionDataByDay[emotion][dayIndex] = value as number | null;
                                        }
                                    }
                                }
                            } catch (error) {
                                console.error("Failedd s to parse emotionTag:", error);
                            }
                        }
                    }
                }
            });

            // chartData에 emotionDataByDay 추가
            const updatedData = chartData.datasets.map(dataset => ({
                ...dataset,
                data: emotionDataByDay[dataset.label]
            }));

            setChartData({ ...chartData, datasets: updatedData });

        } catch (error) {
            console.error("Failed to load chat history:", error);
        }
    };

    // 컴포넌트가 처음 렌더링될 때 채팅 기록을 불러옵니다.
    useEffect(() => {
        loadChatHistory();
    }, []);

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

                {/* 감정 라인 그래프 */}
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
                                tickFormat={initialChartData.labels}
                            />
                            <VictoryAxis
                                dependentAxis
                                domain={[0, 1]} // yAxisMaxValue 사용하여 동적 설정
                                tickValues={[0, 0.2, 0.4, 0.6, 0.8, 1]}
                                tickFormat={(t) => (t === 0 ? "0" : t.toFixed(1))}
                                style={{
                                    axis: { stroke: 'transparent' },
                                    ticks: { stroke: 'transparent' },
                                    tickLabels: { fill: '#000', fontSize: 12 },
                                    grid: { stroke: 'transparent' },
                                }}
                            />
                            {filteredData.map((dataset, index) => (
                                <VictoryLine
                                    key={index}
                                    data={dataset.data.map((y, x) => ({ x: initialChartData.labels[x], y }))}
                                    style={{
                                        data: { stroke: dataset.color }
                                    }}
                                    interpolation="natural"
                                    animate={{
                                        duration: 2000,
                                        onExit: { duration: 2000 }
                                    }}
                                />
                            ))}
                        </VictoryChart>
                    </View>

                {/* 감정 스택 그래프 */}
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
                                tickValues={initialChartData.labels}
                                tickFormat={initialChartData.labels}
                                style={{
                                    axis: { stroke: 'transparent' },
                                    ticks: { stroke: 'transparent' },
                                    tickLabels: { fill: '#000', fontSize: 12 },
                                    grid: { stroke: 'transparent' }
                                }}
                            />
                            <VictoryAxis
                                dependentAxis
                                domain={[0, yAxisMaxValue]}
                                tickValues={[0, 0.2, 0.4, 0.6, 0.8, 1].map(tick => tick * yAxisMaxValue)}
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
                                    // dataset이 존재하고, 데이터가 null이 아닌 경우에만 VictoryBar를 렌더링
                                    return dataset && dataset.data.some(value => value !== null) ? (
                                        <VictoryBar
                                            key={`selected-${index}`}
                                            data={chartData.labels.map((label, i) => ({
                                                x: label,
                                                y: dataset.data[i] ?? 0, // null일 경우 y값을 0으로 설정
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
                {/* 워드클라우드 컨테이너 */}
                    {/* 흰색 내부 컨테이너 */}
                    <View style={styles.innerContainer}>
                    <Text style={styles.subtitle}>워드클라우드</Text>
                        {/* 워드클라우드 내용이 들어갈 자리 */}
                        {/* 워드클라우드 컴포넌트 또는 이미지 추가 가능 */}
                    </View>


            </View>
        </ScrollView>
    );
}

// 스타일 정의
const styles = StyleSheet.create({
    scrollView: { flex: 1, backgroundColor: '#FFFFFF' },
    container: { flex: 1, padding: 15, backgroundColor: '#FFFFFF' },
    innerContainer: {
        backgroundColor: 'white',
        borderRadius: 20,
        padding: 10,
        marginVertical: 8,
        marginHorizontal: 10,
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.2,
        shadowRadius: 1,
        borderWidth: 1,           // 테두리 추가
        borderColor: '#eee',      // 테두리 색상
    },
    title: { fontSize: 18, fontWeight: '600', color: '#000', marginBottom: 10 },
    subtitle: { fontSize: 18, fontWeight: '600', color: '#000' },
    graphSubtitle: { marginBottom: -10 },
    iconContainer: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center' },
    iconLabelContainer: { alignItems: 'center', marginHorizontal: 10 },
    icon: { width: 24, height: 24, marginTop: 15 },
    iconLabel: { fontSize: 12, color: '#666', marginTop: 5 },


});
