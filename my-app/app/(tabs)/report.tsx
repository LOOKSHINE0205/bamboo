import React, { useState, useMemo, useEffect } from 'react';
import { View, Text, StyleSheet, Dimensions, ScrollView, Image, TouchableOpacity } from 'react-native';
import { VictoryChart, VictoryLine, VictoryTheme, VictoryAxis, VictoryStack, VictoryBar, VictoryGroup } from "victory-native";
import {getChatHistory} from "@/app/(tabs)/getChatHistory";
import useServerImage from './getWordCloud'
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
    const today = new Date(); // 시스템의 현지 시간 기준으로 오늘 날짜 설정

    for (let i = 0; i < 7; i++) { // i를 0에서 시작하여 6까지 증가 (총 7일)
        const day = new Date(today);
        day.setDate(today.getDate() - i);
        labels.unshift(`${String(day.getDate()).padStart(2, '0')}일`); // 최신 날짜가 오른쪽에 오도록
        console.log("라벨 날짜:", day.toISOString().split('T')[0]);
    }
    return labels;
};

// initialChartData 생성 시 labels을 최근 7일로 설정
const initialChartData = {
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
            today.setDate(today.getDate());
            today.setUTCHours(23, 59, 59, 999);

            // 6일 전 날짜를 자정으로 설정하여 오늘을 포함한 7일간의 데이터가 포함되도록 설정
            const sevenDaysAgo = new Date(today);

            sevenDaysAgo.setDate(today.getDate() - 6); // 오늘 포함 7일간의 범위를 설정
            sevenDaysAgo.setUTCHours(0, 0, 0, 0);

            console.log("오늘 날짜:", today);
            console.log("7일 전 날짜:", sevenDaysAgo);

            const emotionDataByDayTemp = {
                공포: Array(7).fill(0),
                놀람: Array(7).fill(0),
                분노: Array(7).fill(0),
                슬픔: Array(7).fill(0),
                중립: Array(7).fill(0),
                행복: Array(7).fill(0),
                혐오: Array(7).fill(0)
            };
            const originalEmotionDataByDayTemp = JSON.parse(JSON.stringify(emotionDataByDayTemp));
            const emotionCountsByDay = Array(7).fill(0);
            const emotionSumsByDay = Array(7).fill(0);

            const processedChatIds = new Set();

            chatHistory.forEach(chat => {
                if (chat.chatter === "bot" && !processedChatIds.has(chat.chatIdx)) {
                    const chatDate = new Date(chat.createdAt);

                    // UTC 시간을 로컬 시간으로 변환
                    const localChatDate = new Date(chatDate.getTime() - (chatDate.getTimezoneOffset() * 60000));
                    // 날짜가 7일 전부터 오늘 사이에 있는지 확인
                    if (localChatDate >= sevenDaysAgo && localChatDate <= today) {
                        console.log("localChatDate",localChatDate)
                        // dayIndex를 과거부터 최신 순으로 0부터 시작하여 설정
                        const dayIndex = Math.floor((localChatDate.getTime() - sevenDaysAgo.getTime()) / (1000 * 60 * 60 * 24));


                        console.log("chatId:", chat.chatIdx, "createdAt:", chatDate, "dayIndex:", dayIndex, "emotionTag:", chat.emotionTag);

                        if (chat.emotionTag) {
                            try {
                                const parsedEmotionTag = JSON.parse(chat.emotionTag);
                                for (const [emotion, value] of Object.entries(parsedEmotionTag)) {
                                    if (emotionDataByDayTemp[emotion]) {
                                        originalEmotionDataByDayTemp[emotion][dayIndex] += value;
                                        emotionCountsByDay[dayIndex] += 1;
                                        emotionDataByDayTemp[emotion][dayIndex] += value;
                                        emotionSumsByDay[dayIndex] += value;
                                    }
                                }
                                processedChatIds.add(chat.chatIdx);
                            } catch (error) {
                                console.error("Failed to parse emotionTag:", error);
                            }
                        }
                    } else {
                        console.log("챗 날짜가 범위 밖에 있습니다:", chatDate.toISOString().split('T')[0]);
                    }
                }
            });

            // 라인 그래프 데이터 누적과 평균 계산
            for (const emotion in originalEmotionDataByDayTemp) {
                for (let i = 0; i < 7; i++) {
                    if (emotionCountsByDay[i] > 0) {
                        originalEmotionDataByDayTemp[emotion][i] = parseFloat(
                            (originalEmotionDataByDayTemp[emotion][i] / emotionCountsByDay[i]).toFixed(4)
                        );
                        console.log(`라인 그래프 데이터 계산 - emotion: ${emotion}, index: ${i}, chatIdx 사용: ${[...processedChatIds]}`);
                    } else {
                        originalEmotionDataByDayTemp[emotion][i] = 0;
                    }
                }
            }

// 스택 그래프 데이터 누적과 정규화 계산
            for (const emotion in emotionDataByDayTemp) {
                for (let i = 0; i < 7; i++) {
                    if (emotionSumsByDay[i] > 0) {
                        emotionDataByDayTemp[emotion][i] = parseFloat(
                            (emotionDataByDayTemp[emotion][i] / emotionSumsByDay[i]).toFixed(4)
                        );
                        console.log(`스택 그래프 데이터 계산aas - emotion: ${emotion}, index: ${i}, chatIdx 사용: ${[...processedChatIds]}`);
                    } else {
                        emotionDataByDayTemp[emotion][i] = 0;
                    }
                }
            }


            setOriginalEmotionDataByDay(originalEmotionDataByDayTemp);
            setEmotionDataByDay(emotionDataByDayTemp);
            console.log("최종 라인 그래프용 평균 데이터:", originalEmotionDataByDayTemp);
            console.log("최종 스택 그래프용 정규화 데이터:", emotionDataByDayTemp);
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

// Y축 최대값 설정을 위한 정규화된 데이터 생성
    const normalizedEmotionDataByDay = useMemo(() => {
        const allEmotionValues = Object.values(originalEmotionDataByDay).flat();
        const maxEmotionValue = Math.max(...allEmotionValues) || 1; // 최대값이 0일 경우를 방지

        // 감정 데이터를 0에서 1 사이로 정규화
        const normalizedData = {};
        for (const [emotion, values] of Object.entries(originalEmotionDataByDay)) {
            normalizedData[emotion] = values.map(value => Math.min(value / maxEmotionValue, 1)); // 1을 넘지 않도록 보장
        }

        return normalizedData;
    }, [originalEmotionDataByDay]);

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
    const imageData = useServerImage();
    console.log(imageData)

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
                                        data={normalizedEmotionDataByDay[dataset.label].map((y, x) => ({ x: chartData.labels[x], y }))}
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
                        {imageData ? (
                            <Image source={{ uri: imageData }} style={styles.image} />
                        ) : (
                            <Text >Loading image...</Text>
                        )}
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
    image: {
        width: 800, // 원하는 이미지 크기로 설정
        height: 400,
        resizeMode: 'center',
        marginVertical: 8,
    },
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
