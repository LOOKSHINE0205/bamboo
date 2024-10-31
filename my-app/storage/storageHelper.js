// storage/storageHelper.js

import AsyncStorage from '@react-native-async-storage/async-storage';

// 사용자 이메일 저장
export const saveUserEmail = async (email) => {
    try {
        await AsyncStorage.setItem('userEmail', email);
    } catch (error) {
        console.error('Failed to save user email:', error);
    }
};

// 사용자 이메일 불러오기
export const getUserEmail = async () => {
    try {
        const email = await AsyncStorage.getItem('userEmail');
        return email;
    } catch (error) {
        console.error('Failed to fetch user email:', error);
        return null;
    }
};

// 사용자 데이터 제거 (로그아웃 시)
export const clearUserData = async () => {
    try {
        await AsyncStorage.removeItem('userEmail');
    } catch (error) {
        console.error('Failed to clear user data:', error);
    }
};
