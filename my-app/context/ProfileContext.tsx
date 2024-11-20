import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { serverAddress } from '../components/Config';

interface ProfileContextData {
    profileImageUri: string | null;
    setProfileImageUri: (uri: string | null) => void;
    chatbotLevel: number;
    setChatbotLevel: (level: number) => void;
}

const ProfileContext = createContext<ProfileContextData>({
    profileImageUri: null,
    setProfileImageUri: () => {},
    chatbotLevel: 1,
    setChatbotLevel: () => {},
});

export const ProfileProvider: React.FC = ({ children }) => {
    const [profileImageUri, setProfileImageUri] = useState<string | null>(null);
    const [chatbotLevel, setChatbotLevelState] = useState<number>(1);
    const [userData, setUserData] = useState(null);


    useEffect(() => {
        const loadProfileData = async () => {
            console.log("[ProfileContext] Starting to load profile data...");
            try {
                // 프로필 이미지 로드
                const savedUri = await AsyncStorage.getItem('profileImageUri');
                console.log("[ProfileContext] Saved profileImageUri from AsyncStorage:", savedUri);

                if (savedUri) {
                    const normalizedUri = savedUri.split('?')[0]; // 쿼리 파라미터 제거
                    setProfileImageUri(normalizedUri);
                    console.log("[ProfileContext] Updated profileImageUri state:", normalizedUri);
                } else {
                    console.log("[ProfileContext] No profileImageUri found in AsyncStorage.");
                }

                // 사용자 정보 로드
                const userInfo = await AsyncStorage.getItem('userInfo');
                console.log("[ProfileContext] User info from AsyncStorage:", userInfo);
                const userData = userInfo ? JSON.parse(userInfo) : null;

                if (userData) {
                    const url = `${serverAddress}/api/user/chatbot-level`;
                    console.log("[ProfileContext] Fetching chatbot level for userEmail:", userData.userEmail);
                    console.log("Request URL:", url);

                    try {
                        const response = await axios.get(url, {
                            params: { email: userData.userEmail },
                        });
                        console.log("[ProfileContext] API Response:", response.data);

                        const level = response.data.chatbotLevel;
                        console.log("[ProfileContext] Server response chatbotLevel:", level);

                        await AsyncStorage.setItem('chatbotLevel', level.toString());
                        setChatbotLevelState(level);
                        console.log("[ProfileContext] Updated chatbotLevel state:", level);
                    } catch (error) {
                        console.error("[ProfileContext] Error fetching chatbot level:", error);
                    }
                }

            } catch (error) {
                console.error("[ProfileContext] Error loading profile data:", error);
            }
        };

        loadProfileData();
    }, []);


    const updateProfileImageUri = async (uri: string | null) => {
        console.log("[ProfileContext] Updating profileImageUri to:", uri);
        try {
            if (uri) {
                await AsyncStorage.setItem('profileImageUri', uri);
                console.log("[ProfileContext] profileImageUri saved to AsyncStorage:", uri);
            } else {
                await AsyncStorage.removeItem('profileImageUri');
                console.log("[ProfileContext] profileImageUri removed from AsyncStorage");
            }
            setProfileImageUri(uri);
            console.log("[ProfileContext] profileImageUri state updated to:", uri);
        } catch (error) {
            console.error("[ProfileContext] Error updating profileImageUri:", error);
        }
    };
    // 초기 로드 시 AsyncStorage에서 userInfo 불러오기
    useEffect(() => {
        const loadUserData = async () => {
            try {
                const userInfo = await AsyncStorage.getItem('userInfo');
                if (userInfo) {
                    setUserData(JSON.parse(userInfo));
                }
            } catch (error) {
                console.error("[ProfileContext] Error loading userInfo:", error);
            }
        };

        loadUserData();
    }, []);

    const setChatbotLevel = async (level: number) => {
        console.log("[ProfileContext] Setting chatbotLevel to:", level);
        try {
            // AsyncStorage에 챗봇 레벨 저장
            await AsyncStorage.setItem('chatbotLevel', level.toString());

            // userData 업데이트
            const updatedUserData = {
                ...userData,
                chatbotLevel: level, // 새로운 챗봇 레벨 반영
            };
            setUserData(updatedUserData);

            // 업데이트된 userData를 AsyncStorage에 저장
            await AsyncStorage.setItem('userInfo', JSON.stringify(updatedUserData));
            console.log("[ProfileContext] Updated userData:", updatedUserData);

            // 상태 업데이트
            setChatbotLevelState(level);
            console.log("[ProfileContext] chatbotLevel state updated to:", level);
        } catch (error) {
            console.error("[ProfileContext] Error setting chatbotLevel:", error);
        }
    };


    return (
        <ProfileContext.Provider
            value={{
                profileImageUri,
                setProfileImageUri: updateProfileImageUri,
                chatbotLevel,
                setChatbotLevel,
            }}
        >
            {children}
        </ProfileContext.Provider>
    );
};

export const useProfile = () => useContext(ProfileContext);
