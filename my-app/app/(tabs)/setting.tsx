import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  Switch,
  Alert,
  Image,
  TouchableOpacity,
  ActivityIndicator,
  KeyboardAvoidingView,
  ScrollView,
  Platform,
  Modal,
  Pressable,
  StyleSheet
} from 'react-native';
import axios from 'axios';
import { useRouter } from 'expo-router';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { getUserInfo, clearUserData, getUserProfileImage, setUserProfileImage } from '../../storage/storageHelper';
import * as ImagePicker from 'expo-image-picker';
import SmoothCurvedButton from '../../components/SmoothCurvedButton';

// 서버 주소 및 이미지 경로 설정
const serverAddress = 'http://172.31.98.238:8082';
const profileImageBaseUrl = `${serverAddress}/uploads/profile/images/`;

const SettingsScreen = () => {
  const router = useRouter();
  const [userInfo, setUserInfo] = useState(null); // 사용자 정보
  const [password, setPassword] = useState(''); // 현재 비밀번호
  const [newPassword, setNewPassword] = useState(''); // 새 비밀번호
  const [notificationsEnabled, setNotificationsEnabled] = useState(false); // 알림 활성화 여부
  const [startTime, setStartTime] = useState('09:00'); // 알림 시작 시간
  const [endTime, setEndTime] = useState('18:00'); // 알림 종료 시간
  const [isLoading, setIsLoading] = useState(true); // 로딩 상태
  const [modalVisible, setModalVisible] = useState(false); // 이미지 선택 모달 표시 여부
  const [profileImageUri, setProfileImageUri] = useState(null); // 프로필 이미지 URI

  // 컴포넌트가 마운트될 때 사용자 데이터를 불러옴
  useEffect(() => {
    fetchUserData();
  }, []);

  // 사용자 데이터를 불러오는 함수
  const fetchUserData = async () => {
    try {
      const data = await getUserInfo();
      const profileImage = await getUserProfileImage();
      if (data) {
        setUserInfo({ ...data, profileImage });
        setProfileImageUri(profileImage ? `${profileImage}?${new Date().getTime()}` : null); // 캐시 방지를 위해 시간 추가
      } else {
        Alert.alert("오류", "사용자 정보를 불러올 수 없습니다.");
      }
    } catch (error) {
      console.error('사용자 정보 불러오기 중 오류:', error);
      Alert.alert("오류", "사용자 정보를 불러오는 중 문제가 발생했습니다.");
    } finally {
      setIsLoading(false);
    }
  };

  // 이미지 선택 모달 표시
  const handleImagePicker = () => setModalVisible(true);

  // 이미지 선택 후 서버에 업로드
  const handleImageSelect = async () => {
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

      // 선택된 이미지가 현재 이미지와 동일한지 확인
      if (profileImageUri === selectedImageUri) {
          console.log("동일한 이미지를 업로드하려고 합니다. 동작을 중지합니다.");
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

        const response = await axios.post(`${serverAddress}/api/users/uploadProfile`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });

        if (response.status === 200) {
          const serverImagePath = `${profileImageBaseUrl}${response.data.filePath}`;
          setUserInfo((prev) => ({ ...prev, profileImage: serverImagePath }));
          setProfileImageUri(`${serverImagePath}?${new Date().getTime()}`);
          await setUserProfileImage(serverImagePath);
          Alert.alert("알림", "프로필 이미지가 성공적으로 업로드되었습니다.");
        }
      } catch (error) {
        console.error("프로필 이미지 업로드 중 오류:", error.response ? error.response.data : error);
        Alert.alert("오류", "이미지 업로드 중 문제가 발생했습니다.");
      }
    }
    setModalVisible(false);
  };

  // 기본 이미지로 프로필 이미지 재설정
  const handleResetProfileImage = async () => {
    try {
      await axios.post(`${serverAddress}/api/users/resetProfileImage`, { userEmail: userInfo?.userEmail });
      await setUserProfileImage(null);
      setUserInfo((prev) => ({ ...prev, profileImage: null }));
      setProfileImageUri(null);
      Alert.alert("알림", "프로필 이미지가 기본 이미지로 재설정되었습니다.");
    } catch (error) {
      console.error("프로필 이미지 재설정 중 오류:", error);
      Alert.alert("오류", "프로필 이미지를 재설정하는 중 문제가 발생했습니다.");
    }
    setModalVisible(false);
  };

  // 알림 스위치 토글
  const toggleSwitch = () => setNotificationsEnabled((prev) => !prev);

  // 설정 저장
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

  // 로그아웃 처리
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
                svgWidth={160}
                svgPath="M20,0 C5,0 0,5 0,20 L0,20 C0,35 5,40 20,40 L140,40 C155,40 160,35 160,20 L160,20 C160,5 155,0 140,0 Z"
                style={styles.modalButton}
              />

              <SmoothCurvedButton
                title="갤러리에서 이미지 선택"
                onPress={handleImageSelect}
                svgWidth={160}
                svgPath="M20,0 C5,0 0,5 0,20 L0,20 C0,35 5,40 20,40 L140,40 C155,40 160,35 160,20 L160,20 C160,5 155,0 140,0 Z"
                style={styles.modalButton}
              />

              <SmoothCurvedButton
                title="취소"
                onPress={() => setModalVisible(false)}
                svgWidth={160}
                svgPath="M20,0 C5,0 0,5 0,20 L0,20 C0,35 5,40 20,40 L140,40 C155,40 160,35 160,20 L160,20 C160,5 155,0 140,0 Z"
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
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 30
  },
  modalText: {
    fontSize: 16,
    color: '#333',
    textAlign: 'center',
    marginBottom: 20
  },
  modalButtonText: {
    color: 'white',
    fontWeight: 'bold'
  },
});

export default SettingsScreen;
