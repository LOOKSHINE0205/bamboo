import { View, Text, TextInput, TouchableOpacity, ScrollView, StyleSheet, Image, Modal, ImageBackground } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import React, { useState } from 'react';

export default function DiaryScreen() {
    const emojiImages = [
        { key: 'neutral', image: require('../../assets/images/diary_neutral.png') },
        { key: 'surprise', image: require('../../assets/images/diary_surprise.png') },
        { key: 'angry', image: require('../../assets/images/diary_angry.png') },
        { key: 'sad', image: require('../../assets/images/diary_sad.png') },
        { key: 'happy', image: require('../../assets/images/diary_happy.png') },
        { key: 'dislike', image: require('../../assets/images/diary_dislike.png') },
        { key: 'fear', image: require('../../assets/images/diary_fear.png') }
    ];

    // Default emoji image
    const defaultEmoji = require("../../assets/images/diary_default.png");

    // State variables
    const [input, setInput] = useState(''); // For user input text
    const [messages, setMessages] = useState([]); // For storing messages
    const [selectedEmoji, setSelectedEmoji] = useState(null); // For selected emoji
    const [emojiModalVisible, setEmojiModalVisible] = useState(false); // For emoji modal visibility

    const getDayOfWeek = (dateString) => {
        const days = ['일요일', '월요일', '화요일', '수요일', '목요일', '금요일', '토요일'];
        const date = new Date(dateString);
        return days[date.getDay()];
    };

    const handleSend = () => {
        if (input.trim()) {
            const selectedEmojiImage = selectedEmoji ? emojiImages.find((emoji) => emoji.key === selectedEmoji)?.image : defaultEmoji;
            const newMessage = {
                text: input,
                date: new Date().toLocaleDateString('ko-KR', { year: 'numeric', month: '2-digit', day: '2-digit' }),
                dayOfWeek: getDayOfWeek(new Date()),
                emoji: selectedEmojiImage // Use selected or default emoji
            };

            setMessages([...messages, newMessage]); // Add message to the array
            setInput(''); // Reset input field
            setSelectedEmoji(null); // Reset selected emoji
        }
    };

    return (
        <ImageBackground source={require('../../assets/images/diary_background.png')} style={styles.backgroundImage}>
            <View style={styles.container}>
                <ScrollView style={styles.chatArea} bounces={false} overScrollMode="never" decelerationRate="fast" scrollEventThrottle={16}>
                    {messages.map((message, index) => (
                        <View key={index} style={styles.messagesContainer}>
                            <View style={styles.dateContainer}>
                                <Image source={message.emoji} style={styles.emojiIcon} />
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

                {/* Modal for selecting emoji */}
                <Modal visible={emojiModalVisible} transparent={true} animationType="slide" onRequestClose={() => setEmojiModalVisible(false)}>
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
                                    <Image source={emoji.image} style={[styles.emojiImages, selectedEmoji === emoji.key && styles.selectedEmojiBorder]} />
                                </TouchableOpacity>
                            ))}
                        </View>
                    </View>
                </Modal>

                <View style={styles.inputArea}>
                    <View style={styles.textInputWithEmoji}>
                        <TextInput style={styles.input} value={input} onChangeText={setInput} placeholder="오늘 하루를 기록해보세요" multiline={true} />
                        <TouchableOpacity style={styles.emojiButton} onPress={() => setEmojiModalVisible(true)}>
                            <Ionicons name="happy-outline" size={24} color="#4a9960" />
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
        resizeMode: 'cover',
    },
    container: {
        flexGrow: 1,
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    chatArea: {
        flex: 1,
        padding: 10,
        width: '100%',
    },
    messagesContainer: {
        backgroundColor: '#fff',
        padding: 20,
        borderRadius: 15,
        marginBottom: 20,
        width: '85%',
        alignSelf: 'center',
    },
    dateContainer: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        marginBottom: 5,
    },
    message: {
        padding: 10,
        borderRadius: 15,
        marginVertical: 5,
    },
    userMessage: {
        alignSelf: 'flex-end',
        backgroundColor: '#4a9960',
    },
    inputArea: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 10,
        borderTopWidth: 1,
        borderColor: '#ddd',
        backgroundColor: '#fff',
        width: '100%',
    },
    textInputWithEmoji: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
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
        padding: 10,
        backgroundColor: 'transparent',
        justifyContent: 'center',
        alignItems: 'center',
        alignSelf: 'flex-end',
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
        textAlign: 'right',
        marginTop: 5,
    },
    dayText: {
        fontSize: 12,
        color: '#999',
        textAlign: 'left',
    },
    emojiIcon: {
        width: 60,
        height: 60,
        marginRight: 10,
        opacity: 0.5,
    },
    modalContainer: {
        position: 'absolute',
        bottom: 0,
        width: '100%',
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
        justifyContent: 'space-between',
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
    selectedEmojiBorder: {
        borderColor: '#4a9960',
        borderWidth: 2,
        borderRadius: 10,
    },
    closeButton: {
        backgroundColor: '#4a9960',
        padding: 10,
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 10,
    },
    closeButtonText: {
        color: '#fff',
        fontSize: 10,
    },
});
