import React, { useState } from 'react';
import { View, Text, StyleSheet, Dimensions, ScrollView, Image, TouchableOpacity, Pressable } from 'react-native';
import { LineChart } from 'react-native-chart-kit';
import { VictoryChart, VictoryStack, VictoryBar, VictoryTheme, VictoryAxis } from "victory-native";

const screenWidth = Dimensions.get("window").width;

import em_happy from "../../assets/images/기쁨2.png";
import em_angry from "../../assets/images/화남2.png";
import em_surprise from "../../assets/images/놀람2.png";
import em_fear from "../../assets/images/두려움2.png";
import em_sad from "../../assets/images/슬픔2.png";
import em_dislike from "../../assets/images/싫음2.png";
import em_soso from "../../assets/images/쏘쏘2.png";

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

export default function EmotionReport() {
    const [selectedEmotions, setSelectedEmotions] = useState([]);

    const emotions = [
        { key: "공포", label: "공포", icon: em_fear },
        { key: "놀람", label: "놀람", icon: em_surprise },
        { key: "분노", label: "분노", icon: em_angry },
        { key: "슬픔", label: "슬픔", icon: em_sad },
        { key: "중립", label: "중립", icon: em_soso },
        { key: "행복", label: "행복", icon: em_happy },
        { key: "혐오", label: "혐오", icon: em_dislike },
    ];

    const chartData = {
        labels: ["월", "화", "수", "목", "금", "토", "일"],
        datasets: [
            { data: [0.05, 0.25, 0.12, 0.20, 0.30, 0.15, 0.20], color: () => "#758694", label: "공포" }, // 월요일
            { data: [0.10, 0.15, 0.18, 0.10, 0.20, 0.25, 0.10], color: () => "#5C8374", label: "놀람" }, // 화요일
            { data: [0.20, 0.05, 0.25, 0.05, 0.10, 0.10, 0.15], color: () => "#BF3131", label: "분노" }, // 수요일
            { data: [0.15, 0.10, 0.10, 0.25, 0.15, 0.10, 0.10], color: () => "#0174BE", label: "슬픔" }, // 목요일
            { data: [0.04, 0.05, 0.10, 0.15, 0.05, 0.20, 0.05], color: () => "#FF9BD2", label: "중립" }, // 금요일
            { data: [0.35, 0.20, 0.12, 0.10, 0.10, 0.05, 0.15], color: () => "#FFC436", label: "행복" }, // 토요일
            { data: [0.11, 0.17, 0.18, 0.10, 0.16, 0.25, 0.15], color: () => "#81689D", label: "혐오" }, // 일요일
        ]
    };


    const filteredData = {
        labels: chartData.labels,
        datasets: chartData.datasets.filter(d => selectedEmotions.includes(d.label)),
    };

    const toggleEmotion = (emotion) => {
        setSelectedEmotions(prevSelected =>
            prevSelected.includes(emotion)
                ? prevSelected.filter(e => e !== emotion)
                : [...prevSelected, emotion]
        );
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
    ).filter((_, i) => selectedEmotions.includes(emotions[i].label));

    return (
        <ScrollView style={styles.scrollView}>
            <View style={styles.container}>
                <View style={styles.sectionContainer}>
                    <Text style={styles.title}>사용자의 감정 상태</Text>
                </View>

                <View style={styles.sectionContainer}>
                    <Text style={styles.subtitle}>감정 그래프</Text>
                    <View style={styles.iconContainer}>
                        {emotions.map((emotion) => (
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
                            style={{
                                axis: { stroke: "transparent" },
                                grid: { stroke: "transparent" },
                                ticks: { stroke: "transparent" },
                                tickLabels: { dx: 0, dy: 5, padding: 5 }
                            }}
                        />
                        <VictoryAxis
                            dependentAxis
                            domain={[0, 1]} // y축 범위를 고정
                            tickValues={[0, 0.2, 0.4, 0.6, 0.8, 1]} // 0을 포함한 tickValues 설정
                            style={{
                                axis: { stroke: "transparent" },
                                grid: { stroke: "transparent" },
                                ticks: { stroke: "transparent" },
                                tickLabels: { dx: 25 }
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
