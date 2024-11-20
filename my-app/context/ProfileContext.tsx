import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios'; // 서버 요청을 위해 axios 사용
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

    useEffect(() => {
        const loadProfileData = async () => {
            try {
                const savedUri = await AsyncStorage.getItem('profileImageUri');
                if (savedUri) {
                    setProfileImageUri(savedUri);
                }

                // 서버에서 챗봇 레벨 불러오기
                const userInfo = await AsyncStorage.getItem('userInfo');
                const userData = userInfo ? JSON.parse(userInfo) : null;

                if (userData) {
                    const response = await axios.get(`${serverAddress}/api/user/chatbot-level?email=${userData.userEmail}`);
                    const level = response.data.chatbotLevel;

                    // 로드된 챗봇 레벨을 AsyncStorage와 상태에 동기화
                    await AsyncStorage.setItem('chatbotLevel', level.toString());
                    setChatbotLevelState(level);
                    console.log("ProfileContext - 서버에서 로드된 챗봇 레벨:", level);
                }
            } catch (error) {
                console.error("Error loading profile data:", error);
            }
        };

        loadProfileData();
    }, []);

    const updateProfileImageUri = async (uri: string | null) => {
        if (uri) {
            await AsyncStorage.setItem('profileImageUri', uri);
        } else {
            await AsyncStorage.removeItem('profileImageUri');
        }
        setProfileImageUri(uri);
    };

    const setChatbotLevel = async (level: number) => {
        console.log("Setting chatbot level in ProfileContext:", level);
        await AsyncStorage.setItem('chatbotLevel', level.toString());
        setChatbotLevelState(level);
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
