import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';  // axios를 통해 서버와 통신

export interface User {
    userEmail: string;
    userPw: string;
    userNick: string;
    userBirthdate: string;
    quietStartTime: string;
    quietEndTime: string;
    chatbotType: string;
    joinedAt: string;
    chatbotName: string;
    chatbotLevel: number;
    profileImage: string;
}

// 서버에 이미지 업로드 함수
const uploadProfileImageToServer = async (imageUri: string, userEmail: string): Promise<string | null> => {
    try {
        if (!imageUri) {
            console.warn("유효하지 않은 이미지 URI");
            return null;
        }

        const formData = new FormData();
        formData.append('photo', {
            uri: imageUri,
            type: 'image/jpeg', // 이미지 타입 설정
            name: 'profile.jpg'
        });
        formData.append('email', userEmail);

        // 디버깅용 콘솔 출력
        console.log("FormData contents:", formData);

        const response = await axios.post('http://192.168.21.224:8082/api/users/uploadProfile', formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });

        if (response.status === 200) {
            return response.data.filePath;  // 서버에서 반환된 파일 경로
        } else {
            console.warn("이미지 업로드 실패:", response.data);
            return null;
        }
    } catch (error) {
        console.error("이미지 업로드 중 오류:", error);
        return null;
    }
};

// 프로필 이미지 저장 함수
export const setUserProfileImage = async (imageUri: string): Promise<void> => {
    try {
        const userDataString = await AsyncStorage.getItem('userInfo');
        if (userDataString) {
            const userData: User = JSON.parse(userDataString);

            // 서버에 이미지를 업로드하고 반환된 경로를 DB에 저장
            const uploadedImagePath = await uploadProfileImageToServer(imageUri, userData.userEmail);
            if (uploadedImagePath) {
                userData.profileImage = uploadedImagePath;  // 서버에서 반환된 이미지 경로를 저장
                await AsyncStorage.setItem('userInfo', JSON.stringify(userData));
                console.log("서버와 동기화된 프로필 이미지 저장 성공:", uploadedImagePath);
            }
        }
    } catch (error) {
        console.error('프로필 이미지 저장에 실패했습니다:', error);
    }
};

// 저장된 프로필 이미지 URI 가져오기
export const getUserProfileImage = async (): Promise<string | null> => {
    try {
        const userDataString = await AsyncStorage.getItem('userInfo');
        if (userDataString) {
            const userData: User = JSON.parse(userDataString);
            return userData.profileImage || null;
        }
        return null;
    } catch (error) {
        console.error('프로필 이미지 불러오기에 실패했습니다:', error);
        return null;
    }
};

// 사용자 정보 저장 (기본)
export const saveUserInfo = async (userInfo: User): Promise<void> => {
    try {
        await AsyncStorage.setItem('userInfo', JSON.stringify(userInfo));
        console.log('사용자 정보 저장에 성공', userInfo);
    } catch (error) {
        console.error('사용자 정보 저장에 실패했습니다:', error);
    }
};

// 사용자 정보 불러오기 (기본)
export const getUserInfo = async (): Promise<User | null> => {
    try {
        const userInfo = await AsyncStorage.getItem('userInfo');
        if (userInfo) {
            const parsedData: User = JSON.parse(userInfo);
            return parsedData;
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
