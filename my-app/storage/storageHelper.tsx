import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';  // 서버와 통신을 위한 axios
import { serverAddress } from '../components/Config';
// User 인터페이스 정의
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
    profileImage: string; // 전체 URL 저장
}

// 서버 주소 상수로 정의
const profileImageUploadUrl = `${serverAddress}/api/users/uploadProfile`;
const profileImageBaseUrl = `${serverAddress}/uploads/profile/images/`;

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
            type: 'image/jpeg',
            name: 'profile.jpg'
        });
        formData.append('email', userEmail);

        const response = await axios.post(profileImageUploadUrl, formData, {
            headers: { 'Content-Type': 'multipart/form-data' },
        });

        if (response.status === 200) {
            return `${profileImageBaseUrl}${response.data.filePath}`;
        } else {
            console.warn("이미지 업로드 실패:", response.data);
            return null;
        }
    } catch (error) {
        console.error("이미지 업로드 중 오류:", error);
        return null;
    }
};

// 프로필 이미지 저장 함수 (AsyncStorage에 저장)
export const setUserProfileImage = async (imageUri: string): Promise<void> => {
    try {
        const userDataString = await AsyncStorage.getItem('userInfo');
        if (userDataString) {
            const userData: User = JSON.parse(userDataString);

            const uploadedImagePath = await uploadProfileImageToServer(imageUri, userData.userEmail);
            if (uploadedImagePath) {
                userData.profileImage = uploadedImagePath; // 전체 URL 저장
                await AsyncStorage.setItem('userInfo', JSON.stringify(userData));
                console.log("프로필 이미지 저장 성공:", uploadedImagePath);
            }
        }
    } catch (error) {
        console.error('프로필 이미지 저장에 실패했습니다:', error);
    }
};

// 저장된 프로필 이미지 URL 가져오기 함수
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

// 사용자 정보 저장 함수
export const saveUserInfo = async (userInfo: User): Promise<void> => {
    try {
        await AsyncStorage.setItem('userInfo', JSON.stringify(userInfo));
        console.log('사용자 정보 저장에 성공', userInfo);
    } catch (error) {
        console.error('사용자 정보 저장에 실패했습니다:', error);
    }
};

// 사용자 정보 불러오기 함수
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

// 사용자 데이터 제거 함수 (로그아웃 시 사용)
export const clearUserData = async (): Promise<void> => {
    try {
        await AsyncStorage.removeItem('userInfo');
        await AsyncStorage.removeItem('croomIdx');
        console.log("사용자 데이터 삭제 성공");
    } catch (error) {
        console.error('사용자 데이터 삭제에 실패했습니다:', error);
    }
};

