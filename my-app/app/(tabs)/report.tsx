import React, {useState} from 'react';
import {View, Text, StyleSheet, Dimensions, Pressable, Modal, ScrollView, Image} from 'react-native';
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
// 커스텀 바 레이블 컴포넌트 수정
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
    const currentMonth = `${new Date().getMonth() + 1}`;
    const [value, setValue] = useState(currentMonth);
    const [modalVisible, setModalVisible] = useState(false);

    const data = [...MOCK_DATA.emotions]
        .sort((a, b) => a.count - b.count)
        .map(item => ({
            x: item.emotion_tag,
            y: item.count,
            fill: EMOTIONS[item.emotion_tag].color,
        }));

    const monthItems = [
        {label: '1월', value: '1'},
        {label: '2월', value: '2'},
        {label: '3월', value: '3'},
        {label: '4월', value: '4'},
        {label: '5월', value: '5'},
        {label: '6월', value: '6'},
        {label: '7월', value: '7'},
        {label: '8월', value: '8'},
        {label: '9월', value: '9'},
        {label: '10월', value: '10'},
        {label: '11월', value: '11'},
        {label: '12월', value: '12'},
    ];

    return (
        <ScrollView style={styles.scrollView}>
            <View style={styles.container}>
                <View style={styles.sectionContainer}>
                    <View style={styles.header}>
                        <Text style={styles.title}>{MOCK_DATA.user_nick}님의 감정상태</Text>
                        <Pressable style={styles.dropdownTrigger} onPress={() => setModalVisible(true)}>
                            <Text style={styles.selectedValue}>{value}월 ▼</Text>
                        </Pressable>
                    </View>
                </View>

                <Modal visible={modalVisible} transparent animationType="fade">
                    <View style={styles.modalContainer}>
                        <View style={styles.modalContent}>
                            {monthItems.map((item) => (
                                <Pressable
                                    key={item.value}
                                    onPress={() => {
                                        setValue(item.value);
                                        setModalVisible(false);
                                    }}
                                    style={[
                                        styles.modalItem,
                                        {
                                            backgroundColor: value === item.value ? '#F0F0F0' : '#fff',
                                        }
                                    ]}
                                >
                                    <Text style={[
                                        styles.modalItemText,
                                        {
                                            fontSize: 16,
                                            color: value === item.value ? '#007AFF' : '#333',
                                            fontWeight: value === item.value ? '600' : 'normal',
                                        }
                                    ]}>
                                        {item.label}
                                    </Text>
                                </Pressable>
                            ))}
                        </View>
                    </View>
                </Modal>

                <View style={styles.sectionContainer}>
                    <Text style={styles.subtitle}>월간 감정 분포</Text>
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
                                animate={false}  // 애니메이션 비활성화
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

    modalItem: {
        fontSize: 20,
        paddingVertical: 10,
        paddingHorizontal: 15,
        backgroundColor: '#fff',
        margin: 5,
        borderRadius: 5,
        textAlign: 'center',
        width: 60,
    },
    modalItemText: {
        textAlign: 'center',
    },
    container: {
        flex: 1,
        padding: 15,
        backgroundColor: '#FFFFFF',
        gap: 15,
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
        justifyContent: 'space-between', // 변경
        width: '100%',
    },
    title: {
        fontSize: 20,
        fontWeight: '600',
        color: '#000',
        marginRight: 10,
    },
    subtitle: {
        fontSize: 18,
        fontWeight: '600',
        color: '#000',
        marginBottom: 10,
        marginLeft: 10,
    },
    dropdownTrigger: {
        paddingHorizontal: 10,
        marginLeft: 'auto', // 추가
    },
    selectedValue: {
        fontSize: 18,
        color: '#333',
    },
    modalContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },
    modalContent: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#FFF',
        borderRadius: 10,
        padding: 10,
    },
    modalItem: {
        fontSize: 20,
        paddingVertical: 10,
        paddingHorizontal: 15,
        backgroundColor: '#fff',
        margin: 5,
        borderRadius: 5,
        textAlign: 'center',
        width: 60,
    },
    chartContainer: {
        marginVertical: -10,
    },
    scrollView: {
        flex: 1,
        backgroundColor: '#FFFFFF',
    },
});