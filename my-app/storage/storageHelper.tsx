import AsyncStorage from '@react-native-async-storage/async-storage';

// User 인터페이스 정의
export interface User {
    userEmail: string;
    userPw: string;
    userNick: string;
    userBirthdate: string; // Date는 문자열로 저장
    quietStartTime: string; // Time은 문자열로 저장
    quietEndTime: string; // Time은 문자열로 저장
    chatbotType: string;
    joinedAt: string; // Timestamp도 문자열로 저장
    chatbotName: string;
    chatbotLevel: number;
    profileImage: string;
}

// 사용자 정보 저장
export const saveUserInfo = async (userInfo: User): Promise<void> => {
    try {
        await AsyncStorage.setItem('userInfo', JSON.stringify(userInfo));
    } catch (error) {
        console.error('사용자 정보 저장에 실패했습니다:', error);
    }
};

// 사용자 정보 불러오기
export const getUserInfo = async (): Promise<User | null> => {
    try {
        const userInfo = await AsyncStorage.getItem('userInfo');
        return userInfo ? JSON.parse(userInfo) : null;
    } catch (error) {
        console.error('사용자 정보 불러오기에 실패했습니다:', error);
        return null;
    }
};

// 사용자 데이터 제거 (로그아웃 시)
export const clearUserData = async (): Promise<void> => {
    try {
        await AsyncStorage.removeItem('userInfo');
    } catch (error) {
        console.error('사용자 데이터 삭제에 실패했습니다:', error);
    }
};
