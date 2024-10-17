import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import JoinBG from '../../components/JoinBG';

interface Message {
    text: string;
    date: string;
}

export default function DiaryScreen() {
    const [input, setInput] = useState('');
    const [messages, setMessages] = useState<Message[]>([]);

    const handleSend = () => {
        if (input.trim()) {
            const newMessage: Message = {
                text: input,
                date: new Date().toLocaleDateString('ko-KR', {
                    year: 'numeric',
                    month: '2-digit',
                    day: '2-digit',
                }),
            };
            setMessages([...messages, newMessage]);
            setInput('');
        }
    };

    return (
        <JoinBG>
            <View style={styles.container}>
                <ScrollView style={styles.chatArea} bounces={false} overScrollMode="never">
                    {messages.map((message, index) => (
                        <View key={index} style={styles.messagesContainer}>
                            <Text style={styles.messageText}>{message.text}</Text>
                            <Text style={styles.dateText}>{message.date}</Text>
                        </View>
                    ))}
                </ScrollView>

                <View style={styles.inputArea}>
                    <TextInput
                        style={styles.input}
                        value={input}
                        onChangeText={setInput}
                        placeholder="이야기 입력하기.."
                        multiline={true}
                    />
                    <TouchableOpacity style={styles.iconButton} onPress={handleSend}>
                        <Ionicons name="paper-plane-outline" size={24} color="#fff" />
                    </TouchableOpacity>
                </View>
            </View>
        </JoinBG>
    );
}


     const styles = StyleSheet.create({
         container: {
             flexGrow: 1,
             flex: 1,
             backgroundColor: '#FFFFFF', // 단색 배경 설정
             justifyContent: 'center',
             alignItems: 'center',
         },
         chatArea: {
             flex: 1,
             padding: 10,
             width: '100%',
         },
         messagesContainer : {
             backgroundColor: '#fff',
             padding: 20,
             borderRadius: 35,
             marginBottom: 20,
             width: '85%',
             alignSelf: 'center'
         },
         message: {
             padding: 10,
             borderRadius: 15,
             marginVertical: 5,
         },
         userMessage: {
             alignSelf: 'flex-end',
             backgroundColor: '#4a9960', // 아이콘 버튼 색상과 동일하게 설정
         },

         inputArea: {
             flexDirection: 'row',
             alignItems : 'center',
             padding: 10,
             borderTopWidth: 1,
             paddingVertical: 15,
             paddingHorizontal: 20,
             borderColor: '#ddd',
             backgroundColor: '#fff',

         },
         input: {
             flex: 1,
             marginRight: 10,
             borderWidth: 1,
             borderColor: '#eee',
             borderRadius: 20,
             paddingHorizontal: 10,
             paddingVertical : 10
         },
         iconButton: {
             backgroundColor: '#4a9960',
             borderRadius: 25,
             padding: 10,
             justifyContent: 'center',
             alignItems: 'center',
         },

          messageText: {
             fontSize: 16,
             color: '#333',
           },
          dateText: {
              fontSize: 12,
              color: '#999',
              textAlign: 'right',  // 날짜를 오른쪽으로 정렬
              marginTop: 5,  // 메시지와 날짜 사이의 간격
            }

     });
