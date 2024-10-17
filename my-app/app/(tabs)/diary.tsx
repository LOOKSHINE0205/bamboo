import { View, Text, TextInput, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import React, { useState } from 'react';

interface Message {
    text: string;
    date: string;
}

export default function DiaryScreen() {
    const [input, setInput] = useState('');

    const [messages, setMessages] = useState<Message[]>([]);
const emojiImages = [
         { key: 'neutral', image: require('../../assets/images/diary_neutral.png') },
         { key: 'surprise', image: require('../../assets/images/diary_surprise.png') },
         { key: 'angry', image: require('../../assets/images/diary_angry.png') },
         { key: 'sad', image: require('../../assets/images/diary_sad.png') },
         { key: 'happy', image: require('../../assets/images/diary_happy.png') },
         { key: 'dislike', image: require('../../assets/images/diary_dislike.png') },
         { key: 'fear', image: require('../../assets/images/diary_fear.png') }
     ];
export default function DiaryScreen(){



    // 기본 이미지
    const defaultEmoji = require("../../assets/images/diary_default.png")

    const [input, setInput] = useState(''); // 입력된 텍스트의 상태
    const [messages, setMessages] = useState([]); // 전송된 메세지의 목록
    const [selectedEmoji, setSelectedEmoji] = useState(null); // 선택한 이모지 상태 관리
    const  [emojiModalVisible, setEmojiModalVisible] = useState(false); // 이모지 선택창 표시 상태

    const getDayOfWeek = (dateString) => {
        const days = ['일요일', '월요일', '화요일', '수요일', '목요일', '금요일', '토요일'];
                const date = new Date(dateString);
                return days[date.getDay()];
        };

    // 전송 버튼을 눌렀을 때
    const handleSend = () => {
        if(input.trim()){
            const selectedEmojiImage = selectedEmoji ? emojiImages.find((emoji) => emoji.key === selectedEmoji)?.image : defaultEmoji;

            const newMessage = {
                text : input,
                date : new Date().toLocaleDateString('ko-KR',{
                     year: 'numeric',
                     month: '2-digit',
                     day: '2-digit',
                    }),
                dayOfWeek: getDayOfWeek(new Date()),
                emoji: selectedEmojiImage, // 이모지가 선택되지 않았을 경우 기본 이모지 사용
                };
            setMessages([...messages, newMessage]); //입력된 텍스트를 message 배열에 추가
            setInput(''); //입력창을 초기화
            setSelectedEmoji(null); // 이모지 선택 초기화

            }
    };

return(
     <ImageBackground
                source={require('../../assets/images/diary_background.png')} // 원하는 이미지 경로
                style={styles.backgroundImage}
            >
    <View style = {styles.container}>
        <ScrollView style={styles.chatArea}
          bounces={false}
          overScrollMode="never"
          decelerationRate="fast"
          scrollEventThrottle={16}
          >
           {messages.map((message, index) =>(
               <View key={index} style={styles.messagesContainer}>
                   <View style = {styles.dateContainer}>
                      <Image
                           source={message.emoji}
                           style={styles.emojiIcon}
                      />
                      <View style={styles.dateAndDayContainer}>
                          <Text style={styles.dateText}>{message.date}</Text>
                          <Text style={styles.dayText}>{message.dayOfWeek}</Text>
                      </View>
                   </View>
                   <View style={styles.messageContent}>
                       <Text style={styles.messageText}>{message.text}</Text>
                   </View>
               </View>
               ))}
        </ScrollView>

        {/* 이모티콘 창을 위한 Modal */}
        <Modal
            visible={emojiModalVisible}
            transparent={true}
            animationType="slide"
            onRequestClose={() => setEmojiModalVisible(false)}
        >
            <View style={styles.modalContainer}>
                <View style={styles.modalHeader}>
                    <Text style={styles.headerText}>오늘은 어떤 하루였나요?</Text>
                    <TouchableOpacity style={styles.closeButton} onPress={() => setEmojiModalVisible(false)}>
                        <Text style={styles.closeButtonText}>닫기</Text>
                    </TouchableOpacity>
                </View>

                <View style={styles.emojiContainer}>
                    {emojiImages.map((emoji, index) => (
                        <TouchableOpacity key={index} onPress={() => setSelectedEmoji(emoji.key)}>
                            <Image source={emoji.image} style={styles.emojiImages}/>
                        </TouchableOpacity>
                        ))}
                </View>

            </View>
        </Modal>
        <View style={styles.inputArea}>
            <View style={styles.textInputWithEmoji}>
                <TextInput
                    style={styles.input}
                    value={input}
                    onChangeText={setInput}
                    placeholder="오늘 하루를 기록해보세요"
                    multiline={true}
                />
                {/* 이모티콘 버튼 */}
                 <TouchableOpacity style={styles.emojiButton} onPress={() => setEmojiModalVisible(true)}>
                     <Ionicons name="happy-outline" size={24} color="#4a9960"/>
                 </TouchableOpacity>
            </View>
             <TouchableOpacity style={styles.iconButton} onPress={handleSend}>
                 <Ionicons name="paper-plane-outline" size={24} color="#fff" />
             </TouchableOpacity>
         </View>
    </View>
    </ImageBackground>

     );
     }
     const styles = StyleSheet.create({
         backgroundImage: {
                 flex: 1,
                 resizeMode: 'cover', // 이미지를 전체 배경에 맞추기 위한 옵션
             },
         container: {
             flexGrow: 1,
             flex: 1,
             backgroundColor: '#f0f0f0', // 단색 배경 설정
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
             borderRadius: 15,
             marginBottom: 20,
             width: '85%',
             alignSelf: 'center'
         },
         dateContainer: {
             flexDirection: 'row',
             alignItems : 'flex-start',
             marginBottom: 5,
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
             width : '100%',
         },
         textInputWithEmoji: {
             flexDirection: 'row',
             alignItems: 'center',
             flex: 1,  // 이 View는 TextInput과 이모티콘 버튼을 감싸는 View
             borderWidth: 1,
             borderColor: '#ccc',
             borderRadius: 20,
             paddingHorizontal: 10,
         },
         input: {
             flex: 1,
             marginRight: 10,
         },
         emojiButton: {
             padding: 10,// 버튼 크기
             backgroundColor: 'transparent', // 투명한 배경
             justifyContent: 'center',
             alignItems: 'center',
             alignSelf: 'flex-end'
         },
         iconButton: {
             backgroundColor: '#4a9960',
             borderRadius: 25,
             padding: 10,
             justifyContent: 'center',
             alignItems: 'center',
             marginLeft: 10,
         },
         messageText: {
             fontSize: 16,
             color: '#333',
         },
         dateAndDayContainer: {
             flexDirection: 'column',
             marginLeft: 10,
         },
         dateText: {
             fontSize: 12,
             color: '#000',
             textAlign: 'right',  // 날짜를 오른쪽으로 정렬
             marginTop: 5,  // 메시지와 날짜 사이의 간격
         },
         dayText: {
             fontSize: 12,
             color: '#999',
             textAlign: 'left', // 요일을 왼쪽 정렬
        },
        emojiIcon: {
            width: 60,
            height: 60,
            marginRight: 10, // 이모지와 날짜 사이 간격
                },
        modalContainer: {
            position: 'absolute',  // 절대 위치로 설정
            bottom: 0,             // 부모 요소 기준으로 하단에 붙음
            width: '100%',         // 부모 요소의 너비만큼 가득 채움
            backgroundColor: '#fff',
            padding: 20,
            borderTopLeftRadius: 20,
            borderTopRightRadius: 20,
            maxHeight: '30%',
        },
        emojiContainer: {
            flexDirection: 'row',
            justifyContent: 'space-around',

        },
        modalHeader: {
            flexDirection: 'row',
            justifyContent: 'space-between', // 닫기 버튼을 오른쪽에 배치
            alignItems: 'center',
            paddingBottom: 10,
        },
        headerText: {
            fontSize: 18,
            fontWeight: 'bold',
            color: '#333',
        },
        emojiImages: {
            width: 40,
            height: 40,
            margin: 10,
            flexShrink: 1,
            resizeMode: 'contain',
        },
        closeButton: {
            backgroundColor: '#4a9960',
            padding: 10,
            justifyContent: 'center',
            alignItems: 'center',
            borderRadius: 10
        },
        closeButtonText: {
            color: '#fff',
            fontSize: 10,
        },
     });

export default DiaryScreen;
