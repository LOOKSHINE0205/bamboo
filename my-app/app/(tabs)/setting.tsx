import React, { useState } from 'react';
import { View, Text, TextInput, Switch, Button, StyleSheet, Alert, Image, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import Ionicons from 'react-native-vector-icons/Ionicons';

const SettingsScreen = () => {
  const router = useRouter();
  const [nickname, setNickname] = useState('천동이부');
  const [email, setEmail] = useState('sun1003@gmail.com');
  const [password, setPassword] = useState('');
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);
  const [startTime, setStartTime] = useState('09:00');
  const [endTime, setEndTime] = useState('18:00');
  const [profileImage, setProfileImage] = useState(null);

  const handleImagePicker = () => {
    // 이미지 선택 기능은 실제 구현 시 추가
    Alert.alert('알림', '이미지 선택 기능은 추후 구현될 예정입니다.');
  };

  const toggleSwitch = () => {
    setNotificationsEnabled(previousState => !previousState);
  };

  // 시간 형식 검증 함수 (HH:mm)
  const isValidTimeFormat = (time: string) => {
    const timeRegex = /^([0-1][0-9]|2[0-3]):[0-5][0-9]$/;
    return timeRegex.test(time);
  };

  // 시작 시간 변경 처리
  const handleStartTimeChange = (text: string) => {
    // 숫자와 콜론만 입력 가능하도록
    const filteredText = text.replace(/[^\d:]/g, '');
    setStartTime(filteredText);

    // 입력이 완료되었을 때 (5자리) 형식 검증
    if (filteredText.length === 5) {
      if (!isValidTimeFormat(filteredText)) {
        Alert.alert('알림', '올바른 시간 형식이 아닙니다.\n00:00 ~ 23:59 형식으로 입력해주세요.');
        setStartTime('');
      }
    }
  };

  // 종료 시간 변경 처리
  const handleEndTimeChange = (text: string) => {
    const filteredText = text.replace(/[^\d:]/g, '');
    setEndTime(filteredText);

    if (filteredText.length === 5) {
      if (!isValidTimeFormat(filteredText)) {
        Alert.alert('알림', '올바른 시간 형식이 아닙니다.\n00:00 ~ 23:59 형식으로 입력해주세요.');
        setEndTime('');
      }
    }
  };

  // 시간 포맷 자동 변환 (2자리 입력 후 콜론 추가)
  const formatTimeInput = (text: string, setter: (text: string) => void) => {
    if (text.length === 2 && !text.includes(':')) {
      setter(text + ':');
    }
  };

  const handleSave = () => {
    // 시간 형식 검증
    if (notificationsEnabled && (!isValidTimeFormat(startTime) || !isValidTimeFormat(endTime))) {
      Alert.alert('알림', '올바른 시간 형식으로 입력해주세요.');
      return;
    }

    // 시간 범위 검증
    if (notificationsEnabled && startTime >= endTime) {
      Alert.alert('알림', '종료 시간은 시작 시간보다 이후여야 합니다.');
      return;
    }

    const settings = {
      nickname,
      notificationsEnabled,
      notificationTimeRange: notificationsEnabled ? {
        start: startTime,
        end: endTime
      } : null
    };
    console.log('저장된 설정:', settings);
    Alert.alert('알림', '설정이 저장되었습니다.');
  };

  const handleLogout = () => {
    Alert.alert('알림', '로그아웃 되었습니다.');
    router.push('../(init)');
  };

  return (
    <View style={styles.container}>
      <View style={styles.contentContainer}>
        {/* 프로필 이미지 섹션 */}
        <View style={styles.profileImageSection}>
          <TouchableOpacity
            style={styles.profileImageContainer}
            onPress={handleImagePicker}
          >
            {profileImage ? (
              <Image
                source={{ uri: profileImage }}
                style={styles.profileImage}
              />
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
        <TextInput
          style={styles.input}
          value={nickname}
          onChangeText={setNickname}
        />

        <Text style={styles.label}>이메일</Text>
        <TextInput
          style={styles.input}
          value={email}
          editable={false}
        />

        <Text style={styles.label}>비밀번호 수정</Text>
        <TextInput
          style={styles.input}
          value={password}
          onChangeText={setPassword}
          secureTextEntry={true}
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
                onChangeText={(text) => {
                  handleStartTimeChange(text);
                  formatTimeInput(text, setStartTime);
                }}
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
                onChangeText={(text) => {
                  handleEndTimeChange(text);
                  formatTimeInput(text, setEndTime);
                }}
                placeholder="00:00"
                keyboardType="numeric"
                maxLength={5}
              />
            </View>
          </View>
        )}
      </View>

      <View style={styles.buttonContainer}>
        <View style={styles.button}>
          <Button title="저장" onPress={handleSave} color="#4a9960" />
        </View>
        <View style={styles.button}>
          <Button title="로그아웃" onPress={handleLogout} color="#4a9960" />
        </View>
      </View>
    </View>
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
  // 프로필 이미지 관련 스타일
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
  // 기존 스타일 유지
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