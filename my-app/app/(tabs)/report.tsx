import React, { useState } from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import DropDownPicker from 'react-native-dropdown-picker';
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
    const [open, setOpen] = useState(false);
    const [value, setValue] = useState("10월");
    const [items, setItems] = useState([
        { label: '1월', value: '1월' },
        { label: '2월', value: '2월' },
        { label: '3월', value: '3월' },
        { label: '4월', value: '4월' },
        { label: '5월', value: '5월' },
        { label: '6월', value: '6월' },
        { label: '7월', value: '7월' },
        { label: '8월', value: '8월' },
        { label: '9월', value: '9월' },
        { label: '10월', value: '10월' },
        { label: '11월', value: '11월' },
        { label: '12월', value: '12월' },
    ]);

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.title}>철수님의</Text>
                <View style={styles.pickerContainer}>
                    <DropDownPicker
                        open={open}
                        value={value}
                        items={items}
                        setOpen={setOpen}
                        setValue={setValue}
                        setItems={setItems}
                        placeholder="월 선택"
                        style={styles.dropdown}
                        dropDownContainerStyle={styles.dropdownContainer}
                        containerStyle={{ zIndex: 5000 }} // zIndex를 containerStyle로 적용
                        modalProps={{ animationType: 'fade' }} // 필요한 경우 modalProps 사용 가능
                    />
                </View>
                <Text style={styles.title}>감정상태</Text>
            </View>



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
    dropdown: {
        borderColor: '#ccc',
        borderRadius: 10,
        height: 40,
    },
    dropdownContainer: {
        borderColor: '#ccc',
        borderRadius: 10,
    },
    containerStyle: {
        zIndex: 5000, // 드롭다운이 다른 요소보다 위로 오도록 설정
    },
});
