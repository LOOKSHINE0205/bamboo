import React, { useState } from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { VictoryBar, VictoryChart, VictoryTheme, Bar, VictoryAxis } from 'victory-native';

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
    const [selectedMonth, setSelectedMonth] = useState("10월");

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.title}>철수님의</Text>
                <View style={styles.pickerContainer}>
                    <Picker
                        selectedValue={selectedMonth}
                        style={styles.picker}
                        itemStyle={styles.pickerItem}
                        onValueChange={(itemValue) => setSelectedMonth(itemValue)}
                    >
                        <Picker.Item label="1월" value="1월" />
                        <Picker.Item label="2월" value="2월" />
                        <Picker.Item label="3월" value="3월" />
                        <Picker.Item label="4월" value="4월" />
                        <Picker.Item label="5월" value="5월" />
                        <Picker.Item label="6월" value="6월" />
                        <Picker.Item label="7월" value="7월" />
                        <Picker.Item label="8월" value="8월" />
                        <Picker.Item label="9월" value="9월" />
                        <Picker.Item label="10월" value="10월" />
                        <Picker.Item label="11월" value="11월" />
                        <Picker.Item label="12월" value="12월" />
                    </Picker>
                </View>
                <Text style={styles.title}>감정상태</Text>
            </View>

            <VictoryChart
                theme={VictoryTheme.material}
                width={screenWidth}
                padding={{ left: 30, right: 34, top: 20, bottom: 50 }}
                domainPadding={20}
            >
                <VictoryAxis
                    style={{
                        axis: { stroke: "#001F3F", strokeWidth: 2 },
                        ticks: { stroke: "#B7B7B7", size: 5, strokeWidth: 0 },
                        tickLabels: { fontSize: 12, padding: 5 },
                    }}
                />
                <VictoryAxis
                    dependentAxis
                    style={{
                        axis: { stroke: "#001F3F", strokeWidth: 2 },
                        grid: { stroke: "#B7B7B7", strokeWidth: 1 },
                        tickLabels: { fontSize: 12, padding: 5 },
                    }}
                />
                <VictoryBar
                    data={data}
                    x="x"
                    y="y"
                    style={{
                        data: {
                            fill: ({ datum }) => datum.fill,
                            width: 15,
                        },
                    }}
                    dataComponent={<Bar cornerRadius={{ top: 5, bottom: 0 }} />}
                />
            </VictoryChart>

            <Text style={styles.subtitle}>가장 많이 사용한 단어</Text>
            <View style={styles.wordContainer}>
                <View style={styles.wordBox}>
                    <Text style={styles.wordText}>불안</Text>
                    <Text style={styles.wordCount}>370번</Text>
                </View>
                <View style={styles.wordBox}>
                    <Text style={styles.wordText}>긴장</Text>
                    <Text style={styles.wordCount}>280번</Text>
                </View>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 15,
        backgroundColor: '#fff',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 20,
    },
    title: {
        fontSize: 18,
        fontWeight: 'bold',
    },
    pickerContainer: {
        backgroundColor: '#f0f0f0',
        borderRadius: 20,   // 둥근 모서리
        overflow: 'hidden',
        marginHorizontal: 10,
    },
    picker: {
        height: 40,
        width: 80,
        color: '#333',
    },
    pickerItem: {
        fontSize: 16,
        color: '#333',
    },
    chart: {
        marginVertical: 20,
    },
    subtitle: {
        fontSize: 16,
        fontWeight: 'bold',
        marginTop: 20,
    },
    wordContainer: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        marginTop: 10,
    },
    wordBox: {
        alignItems: 'center',
        backgroundColor: '#f0f0f0',
        padding: 30,
        borderRadius: 100,
    },
    wordText: {
        fontSize: 20,
        fontWeight: 'bold',
    },
    wordCount: {
        fontSize: 14,
        color: '#555',
    },
});
