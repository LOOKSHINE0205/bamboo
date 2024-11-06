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
import { getUserInfo, clearUserData, getUserProfileImage, setUserProfileImage } from '../../storage/storageHelper';
import * as ImagePicker from 'expo-image-picker';

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

  const serverAddress = 'http://192.168.21.224:8082';
  const profileImageBaseUrl = `${serverAddress}/uploads/profile/images/`;

  useEffect(() => {
    fetchUserData();
  }, []);

  const fetchUserData = async () => {
    try {
      const data = await getUserInfo();
      const profileImage = await getUserProfileImage();
      if (data) {
        setUserInfo({ ...data, profileImage });
        setProfileImageUri(profileImage ? `${profileImage}?${new Date().getTime()}` : null);
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

  const handleImagePicker = () => {
    setModalVisible(true);
  };

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

        // 이전 프로필 이미지와 같은지 확인
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
            headers: {
              'Content-Type': 'multipart/form-data',
            },
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



  const handleResetProfileImage = async () => {
    try {
      await axios.post(`${serverAddress}/api/users/resetProfileImage`, {
        userEmail: userInfo?.userEmail,
      });

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

  const toggleSwitch = () => {
    setNotificationsEnabled((prev) => !prev);
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
          <TouchableOpacity style={styles.actionButton} onPress={handleSave}>
            <Text style={styles.actionButtonText}>설정 저장</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.actionButton, styles.logoutButton]} onPress={handleLogout}>
            <Text style={styles.actionButtonText}>로그아웃</Text>
          </TouchableOpacity>
        </View>

        <Modal visible={modalVisible} transparent={true} animationType="fade">
          <View style={styles.modalContainer}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>프로필 이미지 변경</Text>
              <Text style={styles.modalText}>이미지를 선택하거나 기본 이미지로 재설정할 수 있습니다.</Text>
              <Pressable style={[styles.modalButton, styles.resetButton]} onPress={handleResetProfileImage}>
                <Text style={styles.modalButtonText}>기본 이미지로 재설정</Text>
              </Pressable>
              <Pressable style={styles.modalButton} onPress={handleImageSelect}>
                <Text style={styles.modalButtonText}>갤러리에서 이미지 선택</Text>
              </Pressable>
              <Pressable style={[styles.modalButton, styles.cancelButton]} onPress={() => setModalVisible(false)}>
                <Text style={[styles.modalButtonText, styles.cancelButtonText]}>취소</Text>
              </Pressable>
            </View>
          </View>
        </Modal>
      </KeyboardAvoidingView>
    );
  };

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  contentContainer: { flexGrow: 1, padding: 20 },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  profileImageSection: { alignItems: 'center', marginVertical: 20 },
  profileImageContainer: { width: 100, height: 100, borderRadius: 50, backgroundColor: '#f5f5f5', justifyContent: 'center', alignItems: 'center', position: 'relative' },
  profileImage: { width: '100%', height: '100%', borderRadius: 50 },
  defaultProfileImage: { width: '100%', height: '100%', borderRadius: 50, backgroundColor: '#f5f5f5', justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: '#eee' },
  cameraIconContainer: { position: 'absolute', bottom: 0, right: 0, backgroundColor: '#4a9960', width: 32, height: 32, borderRadius: 16, justifyContent: 'center', alignItems: 'center', borderWidth: 2, borderColor: '#fff' },
  label: { fontSize: 18, fontWeight: 'bold', marginBottom: 10 },
  input: { height: 40, borderColor: 'gray', borderWidth: 1, borderRadius: 8, marginBottom: 20, paddingLeft: 10 },
  toggleContainer: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 15 },
  timeInputContainer: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 20 },
  timeInput: { width: '45%' },
  timeLabel: { fontSize: 16, fontWeight: '500', marginBottom: 8, color: '#555' },
  timeInputField: { height: 40, borderColor: '#ccc', borderWidth: 1, borderRadius: 8, paddingHorizontal: 12, fontSize: 16, textAlign: 'center' },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  actionButton: {
    flex: 1, // 전체 너비를 나눠 가질 수 있게 설정
    paddingVertical: 12, // 버튼 높이 조절
    backgroundColor: '#4a9960', // 메인 버튼 배경색
    borderRadius: 8, // 버튼 모서리 둥글게
    marginHorizontal: 5, // 버튼 간 간격 추가
    alignItems: 'center', // 텍스트 중앙 정렬
    justifyContent: 'center', // 수직 중앙 정렬
  },
  modalContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.5)' },
  modalContent: { width: 300, padding: 20, backgroundColor: 'white', borderRadius: 8, alignItems: 'center' },
  modalTitle: { fontSize: 20, fontWeight: 'bold', marginBottom: 10 },
  modalText: { fontSize: 16, color: '#333', textAlign: 'center', marginBottom: 20 },
  modalButton: {
    width: '100%',
    padding: 10,
    backgroundColor: '#4a9960',
    borderRadius: 5,
    alignItems: 'center',
    marginBottom: 10,
  },
  cancelButton: { backgroundColor: '#ccc' },
  modalButtonText: { color: 'white', fontWeight: 'bold' },
});

export default SettingsScreen;
