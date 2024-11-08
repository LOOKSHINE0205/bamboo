import React, {useEffect, useState} from 'react';
import { View, Text, StyleSheet, Dimensions, ScrollView, Image, TouchableOpacity, Pressable } from 'react-native';
import { LineChart } from 'react-native-chart-kit';
import {VictoryChart, VictoryStack, VictoryBar, VictoryTheme, VictoryAxis, VictoryLabel} from "victory-native";

const screenWidth = Dimensions.get("window").width;

import em_happy from "../../assets/images/기쁨2.png";
import em_angry from "../../assets/images/화남2.png";
import em_surprise from "../../assets/images/놀람2.png";
import em_fear from "../../assets/images/두려움2.png";
import em_sad from "../../assets/images/슬픔2.png";
import em_dislike from "../../assets/images/싫음2.png";
import em_soso from "../../assets/images/쏘쏘2.png";
import {getChatHistory} from "@/app/(tabs)/getChatHistory";


export interface EmotionTag {
    emotionTag: string;
}
// LineChart의 chartConfig
const lineChartConfig = {
    backgroundColor: '#FFFFFF',
    backgroundGradientFrom: '#FFFFFF',
    backgroundGradientTo: '#FFFFFF',
    decimalPlaces: 1,
    color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
    labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
    propsForBackgroundLines: { strokeWidth: 0 },
    propsForDots: {
        r: "3",
        strokeWidth: "0",
        stroke: "rgba(255, 255, 255, 0)"
    },
    fillShadowGradient: 'transparent',
    fillShadowGradientTo: 'transparent',
    fillShadowGradientOpacity: 0,
    useShadowColorFromDataset: false,
    propsForVerticalLabels: { fontSize: 12, color: 'rgba(0, 0, 0, 0.6)', translateX: 1 },
    propsForHorizontalLabels: { translateX: -20 }
};
const initialChartData  = {
    labels: ["월", "화", "수", "목", "금", "토", "일"],
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


export default function EmotionReport() {
    const [emotions, setEmotions] = useState<EmotionTag[]>([]);
    const [selectedEmotions, setSelectedEmotions] = useState<string[]>([]);
    const [chartData, setChartData] = useState(initialChartData );

    useEffect(() => {
        const loadChatHistory = async () => {
            try {
                const chatHistory = await getChatHistory(); // 서버에서 채팅 기록을 가져오는 함수

                // 현재 날짜와 시간을 기준으로 이번 주의 월요일과 일요일 계산
                const today = new Date();
                const dayOfWeek = today.getDay();
                const monday = new Date(today);
                monday.setDate(today.getDate() - ((dayOfWeek + 6) % 7));
                const sunday = new Date(monday);
                sunday.setDate(monday.getDate() + 6);

                const daysOfWeek = ["일", "월", "화", "수", "목", "금", "토"];

                // 초기화된 감정 데이터
                const emotionDataByDay: { [key: string]: (number | null)[] } = {
                    공포: [null, null, null, null, null, null, null],
                    놀람: [null, null, null, null, null, null, null],
                    분노: [null, null, null, null, null, null, null],
                    슬픔: [null, null, null, null, null, null, null],
                    중립: [null, null, null, null, null, null, null],
                    행복: [null, null, null, null, null, null, null],
                    혐오: [null, null, null, null, null, null, null]
                };

                // 'chatter'가 'bot'이면서 'createdAt'이 이번 주 월요일과 일요일 사이에 있는 메시지만 필터링
                chatHistory.forEach(chat => {
                    const chatDate = new Date(chat.createdAt);
                    if (chat.emotionTag) {
                        try {
                            const parsedEmotionTag = JSON.parse(chat.emotionTag);
                            const dayIndex = chatDate.getDay();

                            if (dayIndex !== -1) { // 유효한 인덱스인지 확인
                                for (const [emotion, value] of Object.entries(parsedEmotionTag)) {
                                    if (emotionDataByDay[emotion] && dayIndex !== -1) {
                                        emotionDataByDay[emotion][dayIndex] = value as number | null;
                                    }
                                }
                            }
                        } catch (error) {
                            console.error("Failed to parse emotionTag:", error);
                        }
                    }
                });

                // chartData에 emotionDataByDay 추가
                const updatedData = chartData.datasets.map(dataset => {
                    return {
                        ...dataset,
                        data: emotionDataByDay[dataset.label]
                    };
                });

                setChartData({ ...chartData, datasets: updatedData });

            } catch (error) {
                console.error("Failed to load chat history:", error);
            }
        };

        loadChatHistory();
    }, []);

    const emotionIcon = [
        { key: "공포", label: "공포", icon: em_fear },
        { key: "놀람", label: "놀람", icon: em_surprise },
        { key: "분노", label: "분노", icon: em_angry },
        { key: "슬픔", label: "슬픔", icon: em_sad },
        { key: "중립", label: "중립", icon: em_soso },
        { key: "행복", label: "행복", icon: em_happy },
        { key: "혐오", label: "혐오", icon: em_dislike },
    ];

    const toggleEmotion = (emotion: string) => {
        setSelectedEmotions(prevSelected =>
            prevSelected.includes(emotion)
                ? prevSelected.filter(e => e !== emotion)
                : [...prevSelected, emotion]
        );
    };



    const filteredData = {
        labels: chartData.labels,
        datasets: chartData.datasets.filter(d => selectedEmotions.includes(d.label)),
    };


    const chartDataStack = {
        labels: ["월", "화", "수", "목", "금", "토", "일"],
        data: [
            [0.05, 0.10, 0.20, 0.15, 0.04, 0.35, 0.11], // 월요일
            [0.25, 0.15, 0.05, 0.10, 0.05, 0.20, 0.20], // 화요일
            [0.12, 0.18, 0.25, 0.10, 0.10, 0.12, 0.13], // 수요일
            [0.20, 0.10, 0.05, 0.25, 0.10, 0.15, 0.15], // 목요일
            [0.30, 0.20, 0.10, 0.15, 0.05, 0.10, 0.10], // 금요일
            [0.15, 0.25, 0.10, 0.10, 0.20, 0.05, 0.15], // 토요일
            [0.20, 0.10, 0.15, 0.10, 0.05, 0.25, 0.15]  // 일요일
        ],
        barColors: ["#758694", "#5C8374", "#BF3131", "#0174BE", "#FF9BD2", "#FFC436", "#81689D"]
    };

    // selectedEmotions에 해당하는 데이터만 필터링하여 Victory에 적용
    const transformedData = chartDataStack.data[0].map((_, i) =>
        chartDataStack.data.map((dataset, j) => ({
            x: chartDataStack.labels[j],
            y: dataset[i],
            fill: chartDataStack.barColors[i]
        }))
    ).filter((_, i) => selectedEmotions.includes(emotionIcon[i].label));

    return (
        <ScrollView style={styles.scrollView}>
            <View style={styles.container}>
                <View style={styles.sectionContainer}>
                    <Text style={styles.title}>사용자의 감정 상태</Text>
                </View>

                <View style={styles.sectionContainer}>
                    <Text style={styles.subtitle}>감정 그래프</Text>
                    <View style={styles.iconContainer}>
                        {emotionIcon.map((emotion) => (
                            <TouchableOpacity
                                key={emotion.key}
                                onPress={() => toggleEmotion(emotion.label)}
                                style={[
                                    styles.iconLabelContainer,
                                    { opacity: selectedEmotions.includes(emotion.label) ? 1 : 0.4 }
                                ]}
                            >
                                <Image source={emotion.icon} style={styles.icon} />
                                <Text style={styles.iconLabel}>{emotion.label}</Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                    <LineChart
                        data={filteredData}
                        width={screenWidth - 60}
                        height={250}
                        chartConfig={lineChartConfig}
                        withShadow={false}
                        fromZero={true}
                        withInnerLines={false}
                        style={styles.chartStyle}
                        yAxisLabel=""
                        yAxisSuffix=""
                        yAxisInterval={1}
                    />
                    <View style={styles.stackcontainer}>
                    <VictoryChart
                        theme={VictoryTheme.material}
                        domainPadding={{ x: 80, y: 1 }}
                        padding={{ top:20, bottom: 40, left: 20, right: 20 }}
                        height={screenWidth * 0.7}
                    >
                        <VictoryAxis
                            tickFormat={chartDataStack.labels}
                            tickLabelComponent={<VictoryLabel dx={5} />} // dx 속성을 VictoryLabel에서 설정
                            style={{
                                axis: { stroke: "transparent" },
                                grid: { stroke: "transparent" },
                                ticks: { stroke: "transparent" },
                                tickLabels: { padding: 5 }
                            }}
                        />
                        <VictoryAxis
                            dependentAxis
                            domain={[0, 1]} // y축 범위를 고정
                            tickValues={[0, 0.2, 0.4, 0.6, 0.8, 1]} // 0을 포함한 tickValues 설정
                            tickLabelComponent={<VictoryLabel dx={25} />} // VictoryLabel을 사용하여 dx 속성 설정
                            style={{
                                axis: { stroke: "transparent" },
                                grid: { stroke: "transparent" },
                                ticks: { stroke: "transparent" }
                            }}
                        />
                        <VictoryStack>
                            {transformedData.map((data, index) => (
                                <VictoryBar
                                    key={index}
                                    data={data}
                                    style={{ data: { fill: ({ datum }) => datum.fill } }}
                                    barWidth={15}
                                />
                            ))}
                        </VictoryStack>
                    </VictoryChart>



                    </View>
                </View>
            </View>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    scrollView: { flex: 1, backgroundColor: '#FFFFFF' },
    container: { flex: 1, padding: 15, backgroundColor: '#FFFFFF' },
    sectionContainer: { backgroundColor: '#F5F5F5', borderRadius: 20, padding: 15, marginBottom: 10 },
    title: { fontSize: 18, fontWeight: '600', color: '#000', marginBottom: 10 },
    subtitle: { fontSize: 18, fontWeight: '600', color: '#000' },
    iconContainer: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', marginVertical: 10 },
    iconLabelContainer: { alignItems: 'center', marginHorizontal: 12 },
    icon: { width: 24, height: 24, marginTop: 15 },
    iconLabel: { fontSize: 12, color: '#666', marginTop: 5 },
    chartStyle: { borderRadius: 20, marginTop: 20 },
    stackcontainer: { backgroundColor: '#FFFFFF', marginTop: 20, borderRadius: 20 },
});
