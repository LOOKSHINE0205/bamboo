import React from "react";
import { View, Text, FlatList } from "react-native";

const mockData = [
  { date: "2024-10-01", mood: "😊", entry: "좋은 하루였다." },
  { date: "2024-10-02", mood: "😢", entry: "슬펐다." },
  // 더미 데이터 추가
];

export default function MonthViewScreen() {
  return (
    <View style={{ flex: 1, padding: 20 }}>
      <FlatList
        data={mockData}
        keyExtractor={(item) => item.date}
        renderItem={({ item }) => (
          <View
            style={{
              padding: 10,
              borderBottomWidth: 1,
              borderBottomColor: "#ccc",
            }}
          >
            <Text>
              {item.date} - {item.mood}
            </Text>
            <Text>{item.entry}</Text>
          </View>
        )}
      />
    </View>
  );
}
