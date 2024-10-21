import React, {useState} from 'react';
import {View, Text, StyleSheet, Dimensions, Pressable, Modal, ScrollView, ImageBackground} from 'react-native';
import {VictoryChart, VictoryBar, VictoryAxis, VictoryTheme} from 'victory-native';

const screenWidth = Dimensions.get("window").width;

export default function EmotionReport() {
    const currentMonth = `${new Date().getMonth() + 1}`;
    const [value, setValue] = useState(currentMonth);
    const [modalVisible, setModalVisible] = useState(false);

    const data = [
        {x: "쏘쏘", y: 12, fill: "#FF9BD2"},
        {x: "기쁨", y: 20, fill: "#FFC436"},
        {x: "슬픔", y: 13, fill: "#0174BE"},
        {x: "화남", y: 14, fill: "#BF3131"},
        {x: "놀람", y: 10, fill: "#5C8374"},
        {x: "두려움", y: 1, fill: "#758694"},
        {x: "싫은", y: 5, fill: "#81689D"},
    ];

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

    const wordBoxColors = {
        "쏘쏘": "#FF9BD2",
        "기쁨": "#FFC436",
        "슬픔": "#0174BE",
        "화남": "#BF3131",
        "놀람": "#5C8374",
        "두려움": "#758694",
        "싫은": "#81689D",
    };

    return (
        <ScrollView style={styles.scrollView}>
            <ImageBackground source={require('../../assets/images/reportbg.png')} style={styles.backgroundImage}>
                <View style={styles.container}>
                    <View style={styles.header}>
                        <Text style={styles.title}>철수님의 감정상태</Text>
                        <Pressable style={styles.dropdownTrigger} onPress={() => setModalVisible(true)}>
                            <Text style={styles.selectedValue}>{value}월 ▼</Text>
                        </Pressable>
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
                                        style={styles.modalItem}
                                    >
                                        <Text>{item.label}</Text>
                                    </Pressable>
                                ))}
                            </View>
                        </View>
                    </Modal>

                    {/* Chart and Subtitle Container */}
                    <View style={styles.chartContainer}>
                        <VictoryChart
                            theme={VictoryTheme.material}
                            width={screenWidth}
                            domainPadding={25}
                            padding={{left: 28, right: 40, top: 5, bottom: 60}}
                        >
                            <VictoryAxis
                                style={{
                                    axis: {stroke: "#322C2B"},
                                    tickLabels: {fontSize: 14, fill: "#000000", fontWeight: 500},
                                    grid: {stroke: "#686D76", strokeWidth: 0.5},
                                }}
                            />
                            <VictoryAxis
                                dependentAxis
                                style={{
                                    axis: {stroke: "#322C2B"},
                                    tickLabels: {fontSize: 12, fill: "#000000"},
                                    grid: {stroke: "#686D76", strokeWidth: 0.5},
                                }}
                            />
                            <VictoryBar
                                data={data}
                                x="x"
                                y="y"
                                cornerRadius={6}
                                style={{
                                    data: {
                                        fill: ({datum}) => datum.fill || '#000000',
                                        width: 25,
                                    },
                                }}
                            />
                        </VictoryChart>

                        <Text style={styles.subtitle}>많이 사용한 단어</Text>
                    </View>

                    <View style={styles.wordContainer}>
                        <View style={[styles.wordBox, {backgroundColor: wordBoxColors["슬픔"]}]}>
                            <Text style={styles.wordText}>슬픔</Text>
                            <Text style={styles.wordCount}>370번</Text>
                        </View>
                        <View style={[styles.wordBox, {backgroundColor: wordBoxColors["화남"]}]}>
                            <Text style={styles.wordText}>화남</Text>
                            <Text style={styles.wordCount}>280번</Text>
                        </View>
                    </View>

                    <View style={styles.letterBox}>
                        <Text style={styles.letterTitle}>
                            <Text style={styles.nameText}>철수</Text>의 편지
                        </Text>
                        <Text style={styles.letterText}>
                            편지를 써보자 나는 밤부야 너는 누구니? 나는 아직 감정이 없어...
                        </Text>
                    </View>
                </View>
            </ImageBackground>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 15,
        backgroundColor: '#FFFFFF',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'flex-start',
        marginBottom: 20,
    },
    title: {
        fontSize: 20,
        fontWeight: '600',
        color: '#000',
    },
    dropdownTrigger: {
        paddingHorizontal: 10,
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
        marginBottom: 5,

        // 빅토리 차트와 텍스트 사이의 간격을 줄이려면 이 값을 더 작게 설정
    },
    subtitle: {
        fontSize: 20,
        fontWeight: '700',
        color: '#000',
        textAlign: 'center',
    },
    wordContainer: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        marginTop: 15,
    },
    wordBox: {
        alignItems: 'center',
        padding: 10,
        borderRadius: 10,
        width: 170,
        height: 70,
        justifyContent: 'center',
        borderWidth: 2,            // 테두리 두께
        borderColor: '#000',

    },
    wordText: {
        fontSize: 18,
        fontWeight: '500',
        color: '#000',
    },
    wordCount: {
        fontSize: 14,
        color: '#000',
        marginTop: 5,
        fontWeight: '500',
    },
    letterBox: {
        backgroundColor: '#E9EFEC',
        paddingVertical: 15,
        paddingHorizontal: 30,
        borderRadius: 15,
        alignSelf: 'center',
        marginTop: 20,
    },
    letterText: {
        fontSize: 16,
        fontWeight: '500',
        color: '#000',
        textAlign: 'left',
    },
    letterTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#000',
        alignSelf: 'flex-start',
        marginBottom: 15,
    },
    nameText: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#347928',
        alignSelf: 'flex-start',
    },
    container: {
        flex: 1,
        padding: 15,
    },
    scrollView: {
        flex: 1,
        backgroundColor: '#FFFFFF',

    },
    backgroundImage: {
        flex: 1,
        resizeMode: 'cover',  // Make sure the image covers the entire area
    },
});
