import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface ProfileContextData {
    profileImageUri: string | null;
    setProfileImageUri: (uri: string | null) => void;
}

const ProfileContext = createContext<ProfileContextData>({
    profileImageUri: null,
    setProfileImageUri: () => {},
});

export const ProfileProvider: React.FC = ({ children }) => {
    const [profileImageUri, setProfileImageUri] = useState<string | null>(null);

    useEffect(() => {
        const loadProfileImage = async () => {
            const savedUri = await AsyncStorage.getItem('profileImageUri');
            if (savedUri) {
                setProfileImageUri(savedUri);
            } else {
                setProfileImageUri(null);
            }
        };
        loadProfileImage();
    }, []);

    const updateProfileImageUri = async (uri: string | null) => {
        if (uri) {
            await AsyncStorage.setItem('profileImageUri', uri);
        } else {
            await AsyncStorage.removeItem('profileImageUri');
        }
        setProfileImageUri(uri);
    };

    return (
        <ProfileContext.Provider value={{ profileImageUri, setProfileImageUri: updateProfileImageUri }}>
            {children}
        </ProfileContext.Provider>
    );
};

export const useProfile = () => useContext(ProfileContext);
