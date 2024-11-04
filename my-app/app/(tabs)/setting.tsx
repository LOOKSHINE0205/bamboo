import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  Switch,
  Button,
  StyleSheet,
  Alert,
  Image,
  TouchableOpacity,
  ActivityIndicator,
  KeyboardAvoidingView,
  ScrollView,
  Platform
} from 'react-native';
import axios from 'axios';
import { useRouter } from 'expo-router';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { getUserInfo, clearUserData, getUserProfileImage } from '../../storage/storageHelper';
import * as ImagePicker from 'expo-image-picker';
import { setUserProfileImage } from '../../storage/storageHelper';

const SettingsScreen = () => {
  const router = useRouter();
  const [userInfo, setUserInfo] = useState(null);
  const [password, setPassword] = useState(''); // 현재 비밀번호 입력
  const [newPassword, setNewPassword] = useState(''); // 새로운 비밀번호 입력
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);
  const [startTime, setStartTime] = useState('09:00');
  const [endTime, setEndTime] = useState('18:00');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchUserData();
  }, []);

  const fetchUserData = async () => {
    try {
      const data = await getUserInfo();
      const profileImage = await getUserProfileImage();

      if (data) {
        setUserInfo({
          ...data,
          profileImage,
        });
      } else {
        Alert.alert("오류", "사용자 정보를 불러올 수 없습니다.");
      }
    } catch (error) {
      console.error('Error fetching user data:', error);
      Alert.alert("오류", "사용자 정보를 불러오는 중 문제가 발생했습니다.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleImagePicker = async () => {
    Alert.alert(
      "프로필 이미지 변경",
      "이미지를 선택하거나 기본 이미지로 재설정할 수 있습니다.",
      [
        {
          text: "기본 이미지로 재설정",
          onPress: handleResetProfileImage,  // 기본 이미지로 재설정 함수 호출
        },
        {
          text: "갤러리에서 이미지 선택",
          onPress: async () => {
            const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
            if (!permissionResult.granted) {
              Alert.alert("알림", "카메라 롤 접근 권한이 필요합니다.");
              return;
            }

            const result = await ImagePicker.launchImageLibraryAsync({
              mediaTypes: ImagePicker.MediaTypeOptions.Images,
              allowsEditing: true,
              aspect: [1, 1],
              quality: 1,
            });

            if (!result.canceled && result.assets?.length > 0) {
              const selectedImageUri = result.assets[0].uri;
              setUserInfo((prev) => ({
                ...prev,
                profileImage: selectedImageUri,
              }));

              await setUserProfileImage(selectedImageUri);
              console.log("선택한 이미지 저장 완료:", selectedImageUri);

              // 프로필 업데이트 후 데이터 다시 가져오기
              fetchUserData();
            }
          },
        },
        { text: "취소", style: "cancel" },
      ]
    );
  };

  const handleResetProfileImage = async () => {
    try {
      // 프로필 이미지를 기본 이미지로 변경
      await setUserProfileImage(null);
      setUserInfo((prev) => ({
        ...prev,
        profileImage: null,
      }));
      Alert.alert("알림", "프로필 이미지가 기본 이미지로 재설정되었습니다.");
    } catch (error) {
      console.error("Error resetting profile image:", error);
      Alert.alert("오류", "프로필 이미지를 재설정하는 중 문제가 발생했습니다.");
    }
  };


  const toggleSwitch = () => {
    setNotificationsEnabled(previousState => !previousState);
  };

  const isValidTimeFormat = (time) => {
    const timeRegex = /^([0-1][0-9]|2[0-3]):[0-5][0-9]$/;
    return timeRegex.test(time);
  };

  const handleStartTimeChange = (text) => {
    const filteredText = text.replace(/[^\d:]/g, '');
    setStartTime(filteredText);

    if (filteredText.length === 5 && !isValidTimeFormat(filteredText)) {
      Alert.alert('알림', '올바른 시간 형식이 아닙니다.\n00:00 ~ 23:59 형식으로 입력해주세요.');
      setStartTime('');
    }
  };

  const handleEndTimeChange = (text) => {
    const filteredText = text.replace(/[^\d:]/g, '');
    setEndTime(filteredText);

    if (filteredText.length === 5 && !isValidTimeFormat(filteredText)) {
      Alert.alert('알림', '올바른 시간 형식이 아닙니다.\n00:00 ~ 23:59 형식으로 입력해주세요.');
      setEndTime('');
    }
  };

  const handleSave = async () => {
    if (notificationsEnabled && (!isValidTimeFormat(startTime) || !isValidTimeFormat(endTime))) {
      Alert.alert('알림', '올바른 시간 형식으로 입력해주세요.');
      return;
    }

    if (notificationsEnabled && startTime >= endTime) {
      Alert.alert('알림', '종료 시간은 시작 시간보다 이후여야 합니다.');
      return;
    }

    try {
      const settings = {
        nickname: userInfo?.userNick,
        notificationsEnabled,
        notificationTimeRange: notificationsEnabled ? {
          start: startTime,
          end: endTime
        } : null
      };

      if (newPassword) {
        const userData = { userEmail: userInfo?.userEmail, userPw: newPassword };
        await axios.post('http://10.0.2.2:8082/api/users/updatePassword', userData);
      }

      console.log('저장된 설정:', settings);
      Alert.alert('알림', '설정이 저장되었습니다.');
    } catch (error) {
      console.error('Error updating settings:', error);
      Alert.alert("오류", "설정 저장 중 문제가 발생했습니다.");
    }
  };

  const handleLogout = async () => {
    await clearUserData();
    Alert.alert('알림', '로그아웃 되었습니다.');
    router.push('../(init)');
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#4a9960" />
        <Text>사용자 정보를 불러오는 중...</Text>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <ScrollView contentContainerStyle={styles.contentContainer} keyboardShouldPersistTaps="handled">
        <View style={styles.profileImageSection}>
          <TouchableOpacity
            style={styles.profileImageContainer}
            onPress={handleImagePicker}
          >
            {userInfo?.profileImage ? (
              <Image source={{ uri: `${userInfo.profileImage}?${new Date().getTime()}` }} style={styles.profileImage} />

            ) : (
              <View style={styles.defaultProfileImage}>
                <Ionicons name="person" size={50} color="#cccccc" />
              </View>
            )}
            <View style={styles.cameraIconContainer}>
              <Ionicons name="camera" size={20} color="#fff" />
            </View>
          </TouchableOpacity>
        </View>

        <Text style={styles.label}>닉네임</Text>
        <TextInput style={styles.input} value={userInfo?.userNick || ''} editable={false} />

        <Text style={styles.label}>이메일</Text>
        <TextInput style={styles.input} value={userInfo?.userEmail || ''} editable={false} />

        <Text style={styles.label}>생일</Text>
        <TextInput style={styles.input} value={userInfo?.userBirthdate || ''} editable={false} />

        <Text style={styles.label}>챗봇 이름</Text>
        <TextInput style={styles.input} value={userInfo?.chatbotName || ''} editable={false} />

        <Text style={styles.label}>비밀번호 확인</Text>
        <TextInput
          style={styles.input}
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          placeholder="기존 비밀번호 입력"
        />

        <Text style={styles.label}>비밀번호 변경</Text>
        <TextInput
          style={styles.input}
          value={newPassword}
          onChangeText={setNewPassword}
          secureTextEntry
          placeholder="새 비밀번호 입력"
        />

        <View style={styles.toggleContainer}>
          <Text style={styles.label}>알림 받기</Text>
          <Switch
            onValueChange={toggleSwitch}
            value={notificationsEnabled}
            trackColor={{ false: '#767577', true: '#c6fdbf' }}
            thumbColor={notificationsEnabled ? '#4a9960' : '#f4f3f4'}
          />
        </View>

        {notificationsEnabled && (
          <View style={styles.timeInputContainer}>
            <View style={styles.timeInput}>
              <Text style={styles.timeLabel}>시작 시간</Text>
              <TextInput
                style={styles.timeInputField}
                value={startTime}
                onChangeText={handleStartTimeChange}
                placeholder="00:00"
                keyboardType="numeric"
                maxLength={5}
              />
            </View>

            <View style={styles.timeInput}>
              <Text style={styles.timeLabel}>종료 시간</Text>
              <TextInput
                style={styles.timeInputField}
                value={endTime}
                onChangeText={handleEndTimeChange}
                placeholder="00:00"
                keyboardType="numeric"
                maxLength={5}
              />
            </View>
          </View>
        )}
      </ScrollView>

      <View style={styles.buttonContainer}>
        <View style={styles.button}>
          <Button title="설정 저장" onPress={handleSave} color="#4a9960" />
        </View>
        <View style={styles.button}>
          <Button title="로그아웃" onPress={handleLogout} color="#4a9960" />
        </View>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  contentContainer: {
    flex: 1,
    padding: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileImageSection: {
    alignItems: 'center',
    marginVertical: 20,
  },
  profileImageContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#f5f5f5',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  profileImage: {
    width: '100%',
    height: '100%',
    borderRadius: 50,
  },
  defaultProfileImage: {
    width: '100%',
    height: '100%',
    borderRadius: 50,
    backgroundColor: '#f5f5f5',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#eee',
  },
  cameraIconContainer: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: '#4a9960',
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#fff',
  },
  label: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  input: {
    height: 40,
    borderColor: 'gray',
    borderWidth: 1,
    borderRadius: 8,
    marginBottom: 20,
    paddingLeft: 10,
  },
  toggleContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  timeInputContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  timeInput: {
    width: '45%',
  },
  timeLabel: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 8,
    color: '#555',
  },
  timeInputField: {
    height: 40,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    fontSize: 16,
    textAlign: 'center',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  button: {
    width: '45%',
  },
});

export default SettingsScreen;
