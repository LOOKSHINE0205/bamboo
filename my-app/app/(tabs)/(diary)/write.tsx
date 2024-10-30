import React, { useState } from "react";
import { View, Text, TextInput, Button } from "react-native";

const DiaryEntryScreen = ({ route, navigation }: any) => {
  const { date, mood } = route.params;
  const [diaryEntry, setDiaryEntry] = useState("");

  const handleSave = () => {
    // 저장 로직 구현
    console.log(`Date: ${date}, Mood: ${mood}, Entry: ${diaryEntry}`);
    navigation.goBack();
  };

  return (
    <View style={{ flex: 1, padding: 20 }}>
      <Text>Date: {date}</Text>
      <Text>Mood: {mood}</Text>
      <TextInput
        placeholder="Write your diary..."
        value={diaryEntry}
        onChangeText={setDiaryEntry}
        multiline
        style={{
          height: 200,
          borderColor: "gray",
          borderWidth: 1,
          marginTop: 10,
          padding: 10,
        }}
      />
      <Button title="Save" onPress={handleSave} />
    </View>
  );
};

export default DiaryEntryScreen;
