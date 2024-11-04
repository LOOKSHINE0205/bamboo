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
        // User 인터페이스와 일치하는지 확인
        if (!userInfo.userNick || !userInfo.chatbotLevel) {
            console.warn("필수 필드가 누락되었습니다: ", userInfo);
        }
        await AsyncStorage.setItem('userInfo', JSON.stringify(userInfo));
        console.log('사용자 정보 저장에 성공', userInfo);  // 전체 데이터를 출력하여 디버깅
    } catch (error) {
        console.error('사용자 정보 저장에 실패했습니다:', error);
    }
};

// 사용자 정보 불러오기
export const getUserInfo = async (): Promise<User | null> => {
    try {
        const userInfo = await AsyncStorage.getItem('userInfo');
        if (userInfo) {
            const parsedData: User = JSON.parse(userInfo);

            // 파싱된 데이터가 User 인터페이스와 일치하는지 확인
            if (parsedData.userNick && parsedData.chatbotLevel !== undefined) {
                console.log('사용자 정보 불러오기 성공:', parsedData);
                return parsedData;
            } else {
                console.warn("불러온 데이터가 User 인터페이스와 일치하지 않습니다:", parsedData);
                return null;
            }
        } else {
            console.warn("사용자 정보가 저장되어 있지 않습니다.");
            return null;
        }
    } catch (error) {
        console.error('사용자 정보 불러오기에 실패했습니다:', error);
        return null;
    }
};

// 사용자 데이터 제거 (로그아웃 시)
export const clearUserData = async (): Promise<void> => {
    try {
        await AsyncStorage.removeItem('userInfo');
        console.log("사용자 데이터 삭제 성공");
    } catch (error) {
        console.error('사용자 데이터 삭제에 실패했습니다:', error);
    }
};
