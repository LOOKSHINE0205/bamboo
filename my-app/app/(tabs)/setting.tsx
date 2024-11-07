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
  Platform,
  Modal,
  Pressable
} from 'react-native';
import axios from 'axios';
import { useRouter } from 'expo-router';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { getUserInfo, clearUserData, getUserProfileImage, setUserProfileImage, saveUserInfo } from '../../storage/storageHelper';
import * as ImagePicker from 'expo-image-picker';
import SmoothCurvedButton from '../../components/SmoothCurvedButton';
import {serverAddress} from '../../components/Config';
import AsyncStorage from '@react-native-async-storage/async-storage';

const profileImageBaseUrl = `${serverAddress}/uploads/profile/images/`;

const SettingsScreen = () => {
  const router = useRouter();
  const [userInfo, setUserInfo] = useState(null);
  const [password, setPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);
  const [startTime, setStartTime] = useState('09:00');
  const [endTime, setEndTime] = useState('18:00');
  const [isLoading, setIsLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [profileImageUri, setProfileImageUri] = useState(null);

  useEffect(() => {
    // AsyncStorage에서 프로필 이미지를 불러오는 부분
    const fetchUserData = async () => {
        setIsLoading(true);
        try {
            const data = await getUserInfo(); // DB에서 정보 불러오기
            if (data) {
                const profileImageUrl = data.profileImage?.startsWith(serverAddress)
                    ? data.profileImage
                    : `${serverAddress}/uploads/profile/images/${data.profileImage}`;

                setUserInfo({ ...data, profileImage: profileImageUrl });
                setProfileImageUri(profileImageUrl); // 이미지 상태 업데이트
                await AsyncStorage.setItem('userInfo', JSON.stringify({ ...data, profileImage: profileImageUrl }));
            } else {
                setUserInfo(null);
                setProfileImageUri(null);
                Alert.alert("오류", "사용자 정보를 불러올 수 없습니다.");
            }
        } catch (error) {
            console.error('사용자 정보 불러오기 중 오류:', error);
            Alert.alert("오류", "사용자 정보를 불러오는 중 문제가 발생했습니다.");
        } finally {
            setIsLoading(false);
        }
    };

    fetchUserData();
  }, []);

  const toggleSwitch = () => {
    setNotificationsEnabled((prev) => !prev);
  };

  const handleImagePicker = () => {
    setModalVisible(true);
  };

  const handleImageSelect = async () => {
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permissionResult.granted) {
      Alert.alert("알림", "갤러리에 접근하기 위해 권한이 필요합니다.");
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
      console.log("Selected Image URI:", selectedImageUri);

      if (profileImageUri === selectedImageUri) {
        console.log("동일한 이미지를 업로드하려고 합니다. 중단합니다.");
        return;
      }

      try {
        const formData = new FormData();
        formData.append('photo', {
          uri: selectedImageUri,
          type: 'image/jpeg',
          name: 'profile.jpg',
        });
        formData.append('email', userInfo?.userEmail);
        console.log("FormData:", formData);

        const response = await axios.post(`${serverAddress}/api/users/uploadProfile`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });

        if (response.status === 200) {
          const serverImagePath = `${profileImageBaseUrl}${response.data.filePath}`;
          const fullProfileImageUri = `${serverImagePath}?${new Date().getTime()}`;
          setUserInfo((prev) => ({ ...prev, profileImage: fullProfileImageUri }));
          setProfileImageUri(fullProfileImageUri);
          await setUserProfileImage(fullProfileImageUri);
          Alert.alert("알림", "프로필 이미지가 성공적으로 업로드되었습니다.");
        } else {
          console.warn("이미지 업로드 실패:", response.data);
        }
      } catch (error) {
        console.error("프로필 이미지 업로드 중 오류:", error?.response?.data || error?.message || error);
        Alert.alert("오류", "이미지 업로드 중 문제가 발생했습니다.");
      }
    }
    setModalVisible(false);
  };

 const handleResetProfileImage = async () => {
     try {
         await axios.post(`${serverAddress}/api/users/resetProfileImage`, {
             userEmail: userInfo?.userEmail,
         });

         const defaultImageUrl = `${serverAddress}/path/to/default/profile/image.jpg`; // 기본 이미지 URL 지정
         await setUserProfileImage(defaultImageUrl); // 기본 이미지로 초기화
         setUserInfo((prev) => ({ ...prev, profileImage: defaultImageUrl }));
         setProfileImageUri(defaultImageUrl);
         Alert.alert("알림", "프로필 이미지가 기본 이미지로 재설정되었습니다.");
     } catch (error) {
         console.error("프로필 이미지 재설정 중 오류:", error);
         Alert.alert("오류", "프로필 이미지를 재설정하는 중 문제가 발생했습니다.");
     }
     setModalVisible(false);
 };

  const handleSave = async () => {
    if (notificationsEnabled && startTime >= endTime) {
      Alert.alert('알림', '종료 시간은 시작 시간보다 이후여야 합니다.');
      return;
    }
    try {
      const settings = {
        nickname: userInfo?.userNick,
        notificationsEnabled,
        notificationTimeRange: notificationsEnabled ? { start: startTime, end: endTime } : null,
      };
      if (newPassword) {
        const userData = { userEmail: userInfo?.userEmail, userPw: newPassword };
        await axios.post(`${serverAddress}/api/users/updatePassword`, userData);
      }
      Alert.alert('알림', '설정이 저장되었습니다.');
    } catch (error) {
      console.error('설정 저장 중 오류:', error);
      Alert.alert("오류", "설정 저장 중 문제가 발생했습니다.");
    }
  };

  const handleLogout = async () => {
    try {
      await clearUserData(); // 사용자 데이터 제거
      console.log("로그아웃 성공: 사용자 데이터가 삭제되었습니다.");
      Alert.alert('알림', '로그아웃 되었습니다.');
      router.replace('../(init)'); // 초기 화면으로 이동
    } catch (error) {
      console.error("로그아웃 중 오류 발생:", error);
      Alert.alert("오류", "로그아웃 중 문제가 발생했습니다.");
    }
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
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === "ios" ? "padding" : "height"}>
      <ScrollView contentContainerStyle={styles.contentContainer} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
        <View style={styles.profileImageSection}>
          <TouchableOpacity style={styles.profileImageContainer} onPress={handleImagePicker}>
            {userInfo?.profileImage ? (
              <Image source={{ uri: profileImageUri }} style={styles.profileImage} />
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
        <TextInput style={styles.input} value={password} onChangeText={setPassword} secureTextEntry placeholder="기존 비밀번호 입력" placeholderTextColor="#707070" />
        <Text style={styles.label}>비밀번호 변경</Text>
        <TextInput style={styles.input} value={newPassword} onChangeText={setNewPassword} secureTextEntry placeholder="새 비밀번호 입력" placeholderTextColor="#707070"/>
        <View style={styles.toggleContainer}>
          <Text style={styles.label}>알림 받기</Text>
          <Switch onValueChange={toggleSwitch} value={notificationsEnabled} trackColor={{ false: '#767577', true: '#c6fdbf' }} thumbColor={notificationsEnabled ? '#4a9960' : '#f4f3f4'} />
        </View>
        {notificationsEnabled && (
          <View style={styles.timeInputContainer}>
            <View style={styles.timeInput}>
              <Text style={styles.timeLabel}>시작 시간</Text>
              <TextInput style={styles.timeInputField} value={startTime} onChangeText={setStartTime} placeholder="00:00" keyboardType="numeric" maxLength={5} />
            </View>
            <View style={styles.timeInput}>
              <Text style={styles.timeLabel}>종료 시간</Text>
              <TextInput style={styles.timeInputField} value={endTime} onChangeText={setEndTime} placeholder="00:00" keyboardType="numeric" maxLength={5} />
            </View>
          </View>
        )}
      </ScrollView>
      <View style={styles.buttonContainer}>
        <SmoothCurvedButton
          title="설정 저장"
          onPress={handleSave}
          svgWidth={120}
          svgPath="M20,0 C5,0 0,5 0,20 L0,30 C0,45 5,50 20,50 L100,50 C115,50 120,45 120,30 L120,20 C120,5 115,0 100,0 Z"
        />
        <SmoothCurvedButton
          title="로그아웃"
          onPress={handleLogout}
          svgWidth={120}
          svgPath="M20,0 C5,0 0,5 0,20 L0,30 C0,45 5,50 20,50 L100,50 C115,50 120,45 120,30 L120,20 C120,5 115,0 100,0 Z"
        />
      </View>
      <Modal visible={modalVisible} transparent={true} animationType="fade">
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>프로필 이미지 변경</Text>
            <SmoothCurvedButton
              title="기본 이미지로 재설정"
              onPress={handleResetProfileImage}
              svgWidth={220}  // 버튼 전체 크기 확대
              svgPath="M20,0 C5,0 0,5 0,25 L0,25 C0,40 5,45 20,45 L200,45 C215,45 220,40 220,25 L220,25 C220,5 215,0 200,0 Z"  // 높이를 더 늘린 svgPath
              style={styles.modalButton}
            />
            <SmoothCurvedButton
              title="갤러리에서 이미지 선택"
              onPress={handleImageSelect}
              svgWidth={220}  // 버튼 전체 크기 확대
              svgPath="M20,0 C5,0 0,5 0,25 L0,25 C0,40 5,45 20,45 L200,45 C215,45 220,40 220,25 L220,25 C220,5 215,0 200,0 Z"  // 높이를 더 늘린 svgPath
              style={styles.modalButton}
            />
            <SmoothCurvedButton
              title="취소"
              onPress={() => setModalVisible(false)}
              svgWidth={220}  // 버튼 전체 크기 확대
              svgPath="M20,0 C5,0 0,5 0,25 L0,25 C0,40 5,45 20,45 L200,45 C215,45 220,40 220,25 L220,25 C220,5 215,0 200,0 Z"  // 높이를 더 늘린 svgPath
              style={[styles.modalButton, styles.cancelButton]}
              color="#cccccc"
            />




          </View>
        </View>
      </Modal>

    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff'
  },
  contentContainer: {
    flexGrow: 1,
    padding: 20
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center'
  },
  profileImageSection: {
    alignItems: 'center',
    marginVertical: 20
  },
  profileImageContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#f5f5f5',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative'
  },
  profileImage: {
    width: '100%',
    height: '100%',
    borderRadius: 50
  },
  defaultProfileImage: {
    width: '100%',
    height: '100%',
    borderRadius: 50,
    backgroundColor: '#f5f5f5',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#eee'
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
    borderColor: '#fff'
  },
  label: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10
  },
  input: {
    height: 40,
    borderColor: 'gray',
    borderWidth: 1,
    borderRadius: 16, // 곡률을 더 부드럽게 변경
    marginBottom: 20,
    paddingLeft: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    backgroundColor: '#fff',
    elevation: 2
  },
  toggleContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15
  },
  timeInputContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20
  },
  timeInput: {
    width: '45%'
  },
  timeLabel: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 8,
    color: '#555'
  },
  timeInputField: {
    height: 40,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 16,
    paddingHorizontal: 12,
    fontSize: 16,
    textAlign: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 16,
    backgroundColor: '#fff',
    elevation: 1
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    padding: 10,
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },

  actionButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)'
  },
  modalContent: {
    width: 300,
    padding: 20,
    backgroundColor: 'white',
    borderRadius: 20,
    alignItems: 'center'
  },
  modalButton: {
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: 5,      // 버튼 간 간격을 줄입니다
    paddingVertical: 4,     // 버튼의 세로 여백을 키웁니다
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default SettingsScreen;
