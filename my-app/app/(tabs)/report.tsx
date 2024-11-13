import React, { useState, useMemo, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Image, TouchableOpacity, useWindowDimensions } from 'react-native';
import { VictoryChart, VictoryLine, VictoryTheme, VictoryAxis, VictoryStack, VictoryBar } from "victory-native";
import { getChatHistory } from "../../components/getChatHistory";
import useServerImage from '../../components/getWordCloud';
import {getUserInfo} from '../../storage/storageHelper';
// 감정별 아이콘을 불러옵니다.
import em_happy from "../../assets/images/기쁨.png";
import em_angry from "../../assets/images/화남.png";
import em_surprise from "../../assets/images/놀람.png";
import em_fear from "../../assets/images/두려움.png";
import em_sad from "../../assets/images/슬픔.png";
import em_dislike from "../../assets/images/혐오.png";
import em_soso from "../../assets/images/쏘쏘.png";

// EmotionTag 인터페이스는 감정 태그를 정의하는데 사용됩니다.
export interface EmotionTag {
    emotionTag: string;
}

// 최근 7일의 날짜 라벨 생성 함수
const getLast7DaysLabels = () => {
    const labels = [];
    const today = new Date();

    for (let i = 0; i < 7; i++) {
        const day = new Date(today);
        day.setDate(today.getDate() - i);
        labels.unshift(`${String(day.getDate()).padStart(2, '0')}일`);
    }
    return labels;
};

// initialChartData 생성 시 labels을 최근 7일로 설정
const initialChartData = {
    labels: getLast7DaysLabels(),
    datasets: [
        { data: [null, null, null, null, null, null, null], color: () => "#758694", label: "공포" },
        { data: [null, null, null, null, null, null, null], color: () => "#8800FF", label: "놀람" },
        { data: [null, null, null, null, null, null, null], color: () => "#BF3131", label: "분노" },
        { data: [null, null, null, null, null, null, null], color: () => "#0174BE", label: "슬픔" },
        { data: [null, null, null, null, null, null, null], color: () => "#4C4C4C", label: "중립" },
        { data: [null, null, null, null, null, null, null], color: () => "#FFC436", label: "행복" },
        { data: [null, null, null, null, null, null, null], color: () => "#FC90ED", label: "혐오" }
    ]
};

// EmotionReport 컴포넌트
export default function EmotionReport() {
    const { width: screenWidth, height: screenHeight } = useWindowDimensions(); // 화면 크기 동적 감지
    const [selectedEmotions, setSelectedEmotions] = useState<string[]>([]);
    const [chartData, setChartData] = useState(initialChartData);
    const [originalEmotionDataByDay, setOriginalEmotionDataByDay] = useState({});
    const [emotionDataByDay, setEmotionDataByDay] = useState({});
    const [userNick, setUserNick] = useState<string | null>(null);

    const aspectRatio = screenWidth / screenHeight;
    console.log(aspectRatio);
    useEffect(() => {
        // 닉네임 가져오는 비동기 함수 정의
        const fetchUserInfo = async () => {
            try {
                const userInfo = await getUserInfo();
                setUserNick(userInfo?.userNick || '사용자'); // 닉네임 설정, 없으면 기본값으로 '사용자'
            } catch (error) {
                console.error("Failed to fetch user info:", error);
            }
        };

        fetchUserInfo(); // 비동기 함수 호출
        loadChatHistory(); // 기존에 있는 채팅 기록 불러오기
    }, []);
    useEffect(() => {
        loadChatHistory();
    }, []);

    const loadChatHistory = async () => {
        try {
            const chatHistory = await getChatHistory();

            const today = new Date();
            today.setDate(today.getDate());
            today.setUTCHours(23, 59, 59, 999);

            const sevenDaysAgo = new Date(today);
            sevenDaysAgo.setDate(today.getDate() - 6);
            sevenDaysAgo.setUTCHours(0, 0, 0, 0);

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
                    const localChatDate = new Date(chatDate.getTime() - (chatDate.getTimezoneOffset() * 60000));

                    if (localChatDate >= sevenDaysAgo && localChatDate <= today) {
                        const dayIndex = Math.floor((localChatDate.getTime() - sevenDaysAgo.getTime()) / (1000 * 60 * 60 * 24));

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
                    } else {
                        emotionDataByDayTemp[emotion][i] = 0;
                    }
                }
            }

            setOriginalEmotionDataByDay(originalEmotionDataByDayTemp);
            setEmotionDataByDay(emotionDataByDayTemp);
        } catch (error) {
            console.error("Failed to load chat history:", error);
        }
    };

    const toggleEmotion = (emotion: string) => {
        setSelectedEmotions((prevSelected) =>
            prevSelected.includes(emotion)
                ? prevSelected.filter((e) => e !== emotion)
                : [...prevSelected, emotion]
        );
    };

    const normalizedEmotionDataByDay = useMemo(() => {
        const allEmotionValues = Object.values(originalEmotionDataByDay).flat();
        const maxEmotionValue = Math.max(...allEmotionValues) || 1;

        const normalizedData = {};
        for (const [emotion, values] of Object.entries(originalEmotionDataByDay)) {
            normalizedData[emotion] = values.map(value => Math.min(value / maxEmotionValue, 1));
        }

        return normalizedData;
    }, [originalEmotionDataByDay]);

    const filteredData = useMemo(() => {
        return initialChartData.datasets.filter((dataset) =>
            selectedEmotions.includes(dataset.label)
        );
    }, [selectedEmotions]);

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
    // aspectRatio가 0.6 이상일 때 스타일 동적 적용
    // 동적 스타일
        const graphStyle = {
            alignSelf: aspectRatio >= 0.6 ? 'center' : 'flex-start',
        };

        const wordCloudStyle = {
            width: aspectRatio >= 0.6 ? screenWidth - 20 : screenWidth - 40,
            alignSelf: 'center',
        };

        const iconContainerStyle = {
            flexDirection: 'row',
            flexWrap: 'wrap',
            justifyContent: 'center',
            gap: aspectRatio >= 0.6 ? 65 : 0.5, // 아이콘 간격 증가 (gap 사용)
        };

    return (
        <ScrollView style={styles.scrollView}>
            <View style={styles.container}>
                <View style={styles.sectionContainer}>
                    <Text style={styles.title}>{userNick}의 감정 상태</Text>
                </View>

                <View style={[styles.innerContainer]}>
                    <Text style={styles.subtitle}>감정 선택</Text>
                    <View style={[styles.iconContainer, iconContainerStyle]}>
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
                                grid: { stroke: 'transparent' },
                                graphStyle

                            }}
                            tickFormat={chartData.labels}
                        />
                        <VictoryAxis
                            dependentAxis
                            domain={[0, 1]}
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

                <View style={[styles.innerContainer]}>
                    <Text style={[styles.subtitle, styles.graphSubtitle]}>감정 스택 그래프</Text>

                    <VictoryChart
                        theme={VictoryTheme.material}
                        domainPadding={{ x: 30, y: 10 }}
                        padding={{ top: 15, bottom: 30, left: 40, right: 30 }}
                        width={screenWidth - 40}
                        height={screenHeight * 0.2}
                    >
                        <VictoryAxis
                            tickValues={chartData.labels}
                            tickFormat={chartData.labels}
                            style={{
                                axis: { stroke: 'transparent' },
                                ticks: { stroke: 'transparent' },
                                tickLabels: { fill: '#000', fontSize: 12 },
                                grid: { stroke: 'transparent' },
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

                        <VictoryStack>
                            {selectedEmotions.map((emotion, index) => {
                                const dataset = chartData.datasets.find(d => d.label === emotion);
                                return dataset ? (
                                    <VictoryBar
                                        key={`selected-${index}`}
                                        data={emotionDataByDay[dataset.label].map((y, x) => ({
                                            x: chartData.labels[x],
                                            y: y || 0
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
                                ) : null;
                            })}
                        </VictoryStack>
                    </VictoryChart>
                </View>

                <View style={[styles.innerContainer]}>
                  <Text style={styles.subtitle}>워드클라우드</Text>
                  {imageData ? (
                    <Image source={{ uri: imageData }} style={[styles.image, wordCloudStyle]} />
                  ) : (
                    <Text>Loading image...</Text>
                  )}
                </View>

            </View>
        </ScrollView>
    );
}

// 스타일 정의
const styles = StyleSheet.create({
    image: {
        height: 200,
        resizeMode: 'contain',
        marginVertical: 8,
        alignSelf: 'center',
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
        backgroundColor: 'white',
        borderRadius: 20,
        padding: 10,
        marginVertical: 8,
        marginHorizontal: 5,
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.2,
        shadowRadius: 1,
        borderWidth: 1,
        borderColor: '#eee',
    },
    title: { fontSize: 18, fontWeight: '600', color: '#000', marginBottom: 10 },
    subtitle: { fontSize: 18, fontWeight: '600', color: '#000' },
    graphSubtitle: { marginBottom: -10 },
    iconContainer: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center' },
    iconLabelContainer: { alignItems: 'center', marginHorizontal: 10 },
    icon: { width: 24, height: 24, marginTop: 15 },
    iconLabel: { fontSize: 12, color: '#666', marginTop: 5 },
});
