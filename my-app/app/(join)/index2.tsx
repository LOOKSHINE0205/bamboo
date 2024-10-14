import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import JoinBG from '../../components/JoinBG'; // 경로는 실제 파일 위치에 맞게 조정하세요

const keywords = [
  '행실', '성장', '해결', '이성', '용기',
  '열정', '논리', '현실', '성찰', '분석',
  '희망', '위로', '변화', '믿음', '이해'
];

export default function KeywordSelectionScreen() {
  const router = useRouter();
  const [selectedKeywords, setSelectedKeywords] = useState<string[]>([]);

  const toggleKeyword = (keyword: string) => {
    if (selectedKeywords.includes(keyword)) {
      setSelectedKeywords(selectedKeywords.filter(k => k !== keyword));
    } else {
      setSelectedKeywords([...selectedKeywords, keyword]);
    }
  };

  return (
    <JoinBG>
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.title}>마음에 드는 단어를 편하게 골라보세요.</Text>
        <View style={styles.keywordContainer}>
          {keywords.map((keyword, index) => (
            <TouchableOpacity
              key={index}
              style={styles.keywordButton}
              onPress={() => toggleKeyword(keyword)}
            >
              <Text style={styles.keywordText}>{keyword}</Text>
            </TouchableOpacity>
          ))}
        </View>
        <TouchableOpacity style={styles.completeButton}>
          <Text style={styles.completeButtonText}>저는 이게 편해요.</Text>
        </TouchableOpacity>
      </ScrollView>
    </JoinBG>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: 20,
    alignItems: 'center',
  },
  title: {
    fontSize: 18,
    fontWeight: '500',
    marginVertical: 20,
    color: '#333',
    textAlign: 'center',
    backgroundColor: 'white',
    padding: 15,
    borderRadius: 25,
    overflow: 'hidden',
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  keywordContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    marginBottom: 20,
  },
  keywordButton: {
    backgroundColor: 'white',
    paddingHorizontal: 20,
    paddingVertical: 10,
    margin: 5,
    borderRadius: 20,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  keywordText: {
    fontSize: 16,
    color: '#333',
  },
  completeButton: {
    backgroundColor: 'white',
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 25,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  completeButtonText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
  },
});