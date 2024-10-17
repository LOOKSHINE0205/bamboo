import React, { useState } from 'react';
import { View, Text, StyleSheet, Dimensions, Pressable, Modal, ScrollView } from 'react-native';
import { VictoryChart, VictoryBar, VictoryAxis, VictoryTheme } from 'victory-native';
const screenWidth = Dimensions.get("window").width;



const data = [
    { x: "쏘쏘", y: 10, fill: "#FF9BD2" },
    { x: "기쁨", y: 20, fill: "#FFC436" },
    { x: "슬픔", y: 10, fill: "#0174BE" },
    { x: "화남", y: 16, fill: "#BF3131" },
    { x: "놀람", y: 10, fill: "#5C8374" },
    { x: "두려움", y: 10, fill: "#758694" },
    { x: "싫은", y: 10, fill: "#81689D" },
];

export default function EmotionReport() {
    const currentMonth = `${new Date().getMonth() + 1}`;
    const [value, setValue] = useState(currentMonth);
    const [modalVisible, setModalVisible] = useState(false);

    const monthItems = [
        { label: '1월', value: '1' },
        { label: '2월', value: '2' },
        { label: '3월', value: '3' },
        { label: '4월', value: '4' },
        { label: '5월', value: '5' },
        { label: '6월', value: '6' },
        { label: '7월', value: '7' },
        { label: '8월', value: '8' },
        { label: '9월', value: '9' },
        { label: '10월', value: '10' },
        { label: '11월', value: '11' },
        { label: '12월', value: '12' },
    ];

    // 차트 데이터와 매칭되는 색상
    const wordBoxColors = {
        "불안": "#EDEDED",
        "기쁨": "#FFC436",
        "슬픔": "#0174BE", // 슬픔의 바 색상
    };

    return (
        <ScrollView style={styles.scrollView}>
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
                                    onPress={() => { setValue(item.value); setModalVisible(false); }}
                                    style={styles.modalItem}
                                >
                                    <Text>{item.label}</Text>
                                </Pressable>
                            ))}
                        </View>
                    </View>
                </Modal>

                <VictoryChart
                    theme={VictoryTheme.material}
                    width={screenWidth}
                    domainPadding={20}
                    padding={{ left: 30, right: 35, top: 10, bottom: 70 }}
                >
                    <VictoryAxis style={{ axis: { stroke: "#cccccc" }, tickLabels: { fontSize: 12 } }} />
                    <VictoryAxis dependentAxis style={{ axis: { stroke: "#cccccc" }, tickLabels: { fontSize: 12 } }} />
                    <VictoryBar
                        data={data}
                        x="x"
                        y="y"
                        cornerRadius={6}
                        style={{
                            data: {
                                fill: ({ datum }) => datum.fill,
                                width: 25
                            }
                        }}
                    />
                </VictoryChart>

                <Text style={styles.subtitle}>많이 사용한 단어</Text>
                <View style={styles.wordContainer}>
                    {/* 슬픔의 wordBox 색상을 차트 막대 색상과 일치시키기 */}
                    <View style={[styles.wordBox, { backgroundColor: wordBoxColors["슬픔"] }]}>
                        <Text style={styles.wordText}>슬픔</Text>
                        <Text style={styles.wordCount}>370번</Text>
                    </View>
                    <View style={[styles.wordBox, { backgroundColor: wordBoxColors["기쁨"] }]}>
                        <Text style={styles.wordText}>기쁨</Text>
                        <Text style={styles.wordCount}>280번</Text>
                    </View>
                </View>

                {/* 편지 칸 */}
                <View style={styles.letterBox}>
                    <Text style={styles.letterTitle}>
                        <Text style={styles.nameText}>철수</Text>
                        <Text>님의 편지</Text>
                    </Text>
                    <Text style={styles.letterText}>
                        편지를 써보자 나는 밤부야 너는 누구니? 나는 아직 감저잉 없어...
                    </Text>
                </View>
            </View>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 10,
        backgroundColor: '#FAFAFA',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'flex-start',
        marginBottom: 20,
        padding:10
    },
    title: {
        fontSize: 20,
        fontWeight: '600',
        color: '#333',
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
    subtitle: {
        fontSize: 18,
        fontWeight: '600',
        color: '#444',
        marginBottom: 5,
        textAlign: 'center',
    },
    wordContainer: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        marginTop: 20,
    },
    wordBox: {
        alignItems: 'center',
        padding: 20,
        borderRadius: 10,
        width: 180,
        height: 70,
        justifyContent: 'center',
    },
    wordText: {
        fontSize: 18,
        fontWeight: '600',
        color: '#333',
    },
    wordCount: {
        fontSize: 14,
        color: '#666',
        marginTop: 5,
    },
    letterBox:{
        backgroundColor: '#72BF78',
        paddingVertical: 15,
        paddingHorizontal: 30,
        borderRadius: 15,
        alignSelf: 'center',
        marginTop: 20,
    },
    letterText: {
        fontSize: 14,
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
    scrollView: {
        flex: 1,
        backgroundColor: '#FAFAFA',
    },
});
