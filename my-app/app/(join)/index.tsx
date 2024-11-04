import React, { useState } from 'react';
import {
    Alert,
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    SafeAreaView,
    ScrollView,
    KeyboardAvoidingView,
    Platform
} from 'react-native';
import { useRouter } from 'expo-router';

// 회원가입 화면 컴포넌트 정의
export default function JoinScreen() {
    const router = useRouter(); // 페이지 이동을 위한 useRouter 훅 사용

    // 사용자 입력 및 상태 관리
    const [userEmail, setEmail] = useState('');               // 사용자 이메일 입력 값
    const [userPw, setPassword] = useState('');               // 사용자 비밀번호 입력 값
    const [userPwConfirm, setPasswordConfirm] = useState(''); // 비밀번호 확인 입력 값
    const [userNick, setNickname] = useState('');             // 사용자 닉네임 입력 값
    const [userBirthdate, setBirthdate] = useState('');       // 사용자 생년월일 입력 값
    const [emailMessage, setEmailMessage] = useState('');     // 이메일 유효성 메시지
    const [passwordMessage, setPasswordMessage] = useState('');// 비밀번호 확인 메시지
    const [isEmailValid, setIsEmailValid] = useState(false);  // 이메일 유효성 상태
    const [debounceTimeout, setDebounceTimeout] = useState<NodeJS.Timeout | null>(null); // 디바운스 타이머 상태

    // 이메일 입력 시 호출되는 함수, 디바운스를 통해 서버 요청을 제한
    const handleEmailChange = (email) => {
        setEmail(email);             // 이메일 상태 업데이트
        setEmailMessage('');         // 이메일 메시지 초기화
        setIsEmailValid(false);      // 이메일 유효성 초기화

        if (debounceTimeout) {
            clearTimeout(debounceTimeout); // 기존 타이머 삭제
        }

        // 500ms 후에 이메일 유효성 검사 함수 호출
        const newTimeout = setTimeout(() => {
            checkEmailAvailability(email);
        }, 500);
        setDebounceTimeout(newTimeout);
    };

    // 이메일 중복 체크 함수, 서버에 요청을 보내어 이메일 사용 가능 여부 확인
    const checkEmailAvailability = async (email) => {
        if (!email) return; // 이메일이 없을 경우 함수 종료

        try {
            const response = await fetch('http://10.0.2.2:8082/api/users/checkEmail', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userEmail: email }), // JSON 형식으로 이메일 전송
            });

            const result = await response.text(); // 서버 응답을 텍스트로 받음
            if (result.includes('중복된 이메일')) {
                setEmailMessage('중복된 이메일입니다.'); // 중복된 이메일 메시지 설정
                setIsEmailValid(false);                 // 이메일 유효하지 않음
            } else if (result.includes('사용 가능')) {
                setEmailMessage('사용 가능한 이메일입니다.'); // 사용 가능 메시지 설정
                setIsEmailValid(true);                  // 이메일 유효함
            } else {
                setEmailMessage('이메일 확인 중 오류가 발생했습니다.'); // 오류 메시지 설정
                setIsEmailValid(false);
            }
        } catch (error) {
            console.error('Error:', error); // 오류 발생 시 콘솔 출력
            setEmailMessage('이메일 확인 중 오류가 발생했습니다.'); // 오류 메시지 설정
            setIsEmailValid(false);
        }
    };

    // 회원가입 처리 함수, 유효성 검사 후 다음 화면으로 이동
    const handleJoin = async () => {
        if (!isEmailValid) return; // 이메일이 유효하지 않으면 함수 종료

        // 생년월일 포맷 설정 (YYYY-MM-DDT00:00:00 형식)
        let birthdateString;
        if (userBirthdate.length === 8) {
            const year = userBirthdate.slice(0, 4);
            const month = userBirthdate.slice(4, 6);
            const day = userBirthdate.slice(6, 8);
            birthdateString = `${year}-${month}-${day}T00:00:00`;
        } else {
            birthdateString = null; // 형식이 맞지 않으면 null 설정
        }

        // 비밀번호 일치 여부 확인
        if (userPw !== userPwConfirm) {
            setPasswordMessage('비밀번호가 다릅니다.'); // 비밀번호 불일치 메시지
            return;
        }

        // 회원 데이터를 객체로 생성
        const userData = { userEmail, userPw, userNick, userBirthdate: birthdateString };

        try {
            // 다음 화면으로 이동하면서 회원 데이터 전달
            router.push({
                pathname: '/index2',
                params: { userData: JSON.stringify(userData) },
            });
        } catch (error) {
            console.error('Error:', error);
            Alert.alert('Error', 'Something went wrong!'); // 오류 알림 표시
        }
    };

    // 생년월일 입력 시 숫자만 허용하고 8자리까지 입력
    const handleBirthdateChange = (text) => {
        const filteredText = text.replace(/[^0-9]/g, '').slice(0, 8); // 숫자 이외 제거
        setBirthdate(filteredText);
    };

    // 비밀번호 확인 입력 시 일치 여부 메시지 설정
    const handlePasswordConfirmChange = (text) => {
        setPasswordConfirm(text);
        setPasswordMessage(text && text !== userPw ? '비밀번호가 다릅니다.' : '비밀번호가 일치합니다.'); // 일치/불일치 메시지 설정
    };

    return (
        <SafeAreaView style={styles.safeArea}>
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={styles.container}
                keyboardVerticalOffset={Platform.select({ ios: 40, android: 0 })} // iOS 키보드 높이 조정
            >
                <ScrollView contentContainerStyle={styles.scrollView} keyboardShouldPersistTaps="handled">
                    <View style={styles.formContainer}>

                        {/* 이메일 입력란 */}
                        <View style={styles.inputContainer}>
                            <View style={styles.emailLabelContainer}>
                                <Text style={styles.label}>이메일</Text>
                                {emailMessage && (
                                    <Text style={[styles.message, emailMessage.includes('중복') ? styles.errorMessage : styles.successMessage]}>
                                        {emailMessage}
                                    </Text>
                                )}
                            </View>
                            <TextInput
                                style={styles.input}
                                value={userEmail}
                                onChangeText={handleEmailChange}
                                placeholder="이메일 주소를 입력하세요"
                                keyboardType="email-address"
                            />

                            {/* 비밀번호 입력란 */}
                            <View style={styles.passwordLabelContainer}>
                                <Text style={styles.label}>비밀번호</Text>
                                {passwordMessage && (
                                    <Text style={[styles.message, passwordMessage.includes('일치') ? styles.successMessage : styles.errorMessage]}>
                                        {passwordMessage}
                                    </Text>
                                )}
                            </View>

                            <TextInput
                                style={styles.input}
                                value={userPw}
                                onChangeText={setPassword}
                                placeholder="비밀번호를 입력하세요"
                                secureTextEntry
                            />

                            {/* 비밀번호 확인 입력란 */}
                            <Text style={styles.label}>비밀번호 확인</Text>
                            <TextInput
                                style={styles.input}
                                value={userPwConfirm}
                                onChangeText={handlePasswordConfirmChange}
                                placeholder="비밀번호를 다시 입력하세요"
                                secureTextEntry
                            />

                            {/* 닉네임 입력란 */}
                            <Text style={styles.label}>닉네임</Text>
                            <TextInput
                                style={styles.input}
                                value={userNick}
                                onChangeText={setNickname}
                                placeholder="닉네임을 입력하세요"
                            />

                            {/* 생년월일 입력란 */}
                            <Text style={styles.label}>생년월일</Text>
                            <TextInput
                                style={styles.input}
                                value={userBirthdate}
                                onChangeText={handleBirthdateChange}
                                placeholder="YYYYMMDD"
                                keyboardType="numeric"
                            />
                        </View>

                        {/* 다음 버튼 */}
                        <TouchableOpacity
                            style={[styles.button, !isEmailValid && styles.buttonDisabled]}
                            onPress={handleJoin}
                            disabled={!isEmailValid} // 이메일이 유효하지 않으면 버튼 비활성화
                        >
                            <Text style={styles.buttonText}>다음</Text>
                        </TouchableOpacity>
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}

// 스타일 정의
const styles = StyleSheet.create({
    safeArea: {
        flex: 1, // 화면 전체를 차지하도록 설정하여 SafeAreaView가 전체 영역을 사용
        backgroundColor: '#ffffff', // 배경색을 흰색으로 설정
    },

    container: {
        flex: 1, // 화면 전체 크기 설정
    },

    scrollView: {
        flexGrow: 1, // ScrollView가 필요한 만큼 확장되도록 설정
        paddingBottom: 100, // 스크롤 뷰 아래쪽 여백을 40으로 설정하여 키보드 활성화 시 여유 공간 확보
    },

    formContainer: {
        padding: 20, // 화면 양옆과 위아래에 20px 여백 추가하여 폼 콘텐츠가 화면 가장자리와 떨어지게 설정
    },

    inputContainer: {
        marginBottom: 20, // 입력 필드 간 간격을 20px로 설정하여 가독성 향상
    },

    emailLabelContainer: {
        flexDirection: 'row', // 이메일 라벨과 메시지를 가로 방향으로 정렬
        alignItems: 'center', // 이메일 라벨과 메시지가 수직으로 중앙 정렬되도록 설정
        marginBottom: 5, // 라벨과 입력 필드 사이의 간격을 5px로 설정
    },

    passwordLabelContainer: {
        flexDirection: 'row', // 비밀번호 라벨과 메시지를 가로 방향으로 정렬
        alignItems: 'center', // 비밀번호 라벨과 메시지가 수직으로 중앙 정렬되도록 설정
        marginBottom: 5, // 라벨과 입력 필드 사이의 간격을 5px로 설정
    },

    label: {
        fontSize: 16, // 라벨 텍스트의 크기를 16px로 설정하여 가독성을 높임
    },

    input: {
        backgroundColor: '#e8f5e9', // 입력 필드의 배경색을 연한 녹색(#e8f5e9)으로 설정하여 시각적으로 구분
        borderRadius: 8, // 입력 필드의 모서리를 8px 둥글게 설정
        padding: 15, // 입력 필드 내부에 15px의 여백을 추가하여 입력 공간을 넓게 설정
        marginBottom: 15, // 입력 필드 간 간격을 15px로 설정하여 요소 간 간격 유지
    },

    button: {
        backgroundColor: '#ffffff', // 버튼의 배경색을 흰색으로 설정
        borderColor: '#000000', // 버튼 테두리 색상을 검은색으로 설정
        borderWidth: 1, // 버튼 테두리 두께를 1px로 설정하여 경계 구분
        borderRadius: 8, // 버튼의 모서리를 8px 둥글게 설정
        padding: 15, // 버튼 내부에 15px 여백을 추가하여 버튼 텍스트가 중앙에 위치하도록 설정
        alignItems: 'center', // 텍스트가 버튼 중앙에 오도록 정렬
    },

    buttonDisabled: {
        backgroundColor: '#e0e0e0', // 비활성화된 버튼의 배경색을 연한 회색으로 설정하여 상태 표시
        borderColor: '#999', // 비활성화된 버튼의 테두리 색상을 어두운 회색으로 설정하여 구분
    },

    buttonText: {
        color: '#000000', // 버튼 텍스트 색상을 검은색으로 설정하여 대비 효과
        fontSize: 16, // 버튼 텍스트 크기를 16px로 설정하여 가독성 향상
        fontWeight: 'bold', // 버튼 텍스트를 굵게 설정하여 강조 효과
    },

    message: {
        fontSize: 12, // 유효성 검사 메시지 텍스트 크기를 12px로 설정하여 본문과 구분
        marginLeft: 10, // 메시지와 라벨 사이의 간격을 10px로 설정하여 여유 공간 확보
    },

    errorMessage: {
        color: 'red', // 오류 메시지 색상을 빨간색으로 설정하여 사용자에게 오류를 명확히 전달
    },

    successMessage: {
        color: 'green', // 성공 메시지 색상을 녹색으로 설정하여 긍정적 상태 전달
    },
});
