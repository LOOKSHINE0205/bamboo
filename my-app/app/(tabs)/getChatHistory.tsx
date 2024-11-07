import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {serverAddress} from '../../components/Config';

export interface ChatMessage {
    chatIdx: number;
    croomIdx: number;
    chatter: string;
    chatContent: string;
    chatEmoticon?: string;
    chatFile?: string;
    createdAt: string;
    emotionTag?: string;
    sessionIdx: number;
    evaluation: string;
}

/**
 * 서버로부터 채팅 내역을 가져오는 함수
 * @returns 채팅 내역 데이터 배열
 */
export const getChatHistory = async (): Promise<ChatMessage[]> => {
    try {
        // AsyncStorage에m서 crooIdx를 가져오기
        const storedCroomIdx = await AsyncStorage.getItem("croomIdx");
        if (!storedCroomIdx) {
            throw new Error("croomIdx not found in AsyncStorage");
        }

        const croomIdx = parseInt(storedCroomIdx, 10); // 가져온 값을 숫자로 변환

        // 서버에 요청
        const response = await axios.get(`${serverAddress}/api/chat/getChatHistory`, {
            params: { croomIdx },
        });
        return response.data; // 서버로부터 받은 데이터 반환
    } catch (error) {
        console.error('Error fetching chat history:', error);
        throw error;
    }
};
