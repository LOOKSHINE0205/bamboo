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
    // 이메일 입력 시 호출되는 함수, 디바운스(debounce)를 통해 서버 요청 빈도를 제한
    const handleEmailChange = (email) => {
        setEmail(email);             // 이메일 상태를 입력된 값으로 업데이트
        setEmailMessage('');         // 이메일 메시지를 초기화하여 이전 메시지를 제거
        setIsEmailValid(false);      // 이메일 유효성을 초기화하여 기본값인 유효하지 않음으로 설정

        // 기존에 설정된 디바운스 타이머가 있을 경우 삭제하여 중복 요청 방지
        if (debounceTimeout) {
            clearTimeout(debounceTimeout); // 기존 타이머 삭제
        }

        // 500ms 후에 이메일 유효성 검사 함수를 호출하여 이메일 가용성 확인
        const newTimeout = setTimeout(() => {
            checkEmailAvailability(email); // checkEmailAvailability 함수로 서버에 이메일 확인 요청
        }, 500);

        // 새로운 디바운스 타이머를 설정하여 상태에 저장, 다음 입력 시 이를 다시 참조
        setDebounceTimeout(newTimeout);
    };
    // 이메일 중복 체크 함수, 서버에 요청을 보내어 입력된 이메일이 사용 가능한지 확인
    const checkEmailAvailability = async (email) => {
        // 이메일이 입력되지 않은 경우 함수 종료
        if (!email) return;

        try {
            // 서버에 이메일 중복 확인 요청을 보내기 위한 fetch 함수 호출
            const response = await fetch('http://10.0.2.2:8082/api/users/checkEmail', {
                method: 'POST',                        // POST 메서드를 사용하여 요청 전송
                headers: { 'Content-Type': 'application/json' }, // 요청 헤더를 JSON 형식으로 설정
                body: JSON.stringify({ userEmail: email }) // 요청 본문에 이메일 정보를 JSON 형식으로 포함
            });

            // 서버 응답을 텍스트 형식으로 받아서 result 변수에 저장
            const result = await response.text();

            // 응답 내용에 '중복된 이메일'이라는 텍스트가 포함되어 있는지 확인
            if (result.includes('중복된 이메일')) {
                setEmailMessage('중복된 이메일입니다.'); // 이메일 중복 메시지를 설정하여 사용자에게 알림
                setIsEmailValid(false);                 // 이메일 유효성을 false로 설정 (유효하지 않음)

            // 응답 내용에 '사용 가능'이라는 텍스트가 포함되어 있는지 확인
            } else if (result.includes('사용 가능')) {
                setEmailMessage('사용 가능한 이메일입니다.'); // 이메일 사용 가능 메시지를 설정하여 사용자에게 알림
                setIsEmailValid(true);                  // 이메일 유효성을 true로 설정 (유효함)

            // 위의 조건에 해당하지 않는 경우, 서버 응답 처리에 문제가 발생했음을 알림
            } else {
                setEmailMessage('이메일 확인 중 오류가 발생했습니다.'); // 일반 오류 메시지 설정
                setIsEmailValid(false);               // 이메일 유효성을 false로 설정
            }

        } catch (error) {
            // 서버 요청 중 오류가 발생한 경우 콘솔에 에러 메시지 출력
            console.error('Error:', error);
            // 사용자에게 오류 메시지 표시
            setEmailMessage('이메일 확인 중 오류가 발생했습니다.');
            setIsEmailValid(false); // 이메일 유효성을 false로 설정
        }
    };
    // 회원가입 처리 함수, 유효성 검사를 수행한 후 가입 성공 시 다음 화면으로 이동
    const handleJoin = async () => {
        // 이메일 유효성이 false인 경우 함수 종료하여 더 이상 진행하지 않음
        if (!isEmailValid) return;

        // 사용자가 입력한 생년월일을 서버에서 요구하는 포맷(YYYY-MM-DDT00:00:00)으로 설정
        let birthdateString;
        if (userBirthdate.length === 8) { // 생년월일이 8자리(YYYYMMDD)인지 확인
            const year = userBirthdate.slice(0, 4); // 첫 4자리는 연도
            const month = userBirthdate.slice(4, 6); // 다음 2자리는 월
            const day = userBirthdate.slice(6, 8); // 마지막 2자리는 일
            birthdateString = `${year}-${month}-${day}T00:00:00`; // 포맷에 맞게 문자열 생성
        } else {
            birthdateString = null; // 생년월일 형식이 맞지 않으면 null로 설정하여 무효 처리
        }

        // 비밀번호와 비밀번호 확인이 일치하는지 확인
        if (userPw !== userPwConfirm) {
            setPasswordMessage('비밀번호가 다릅니다.'); // 일치하지 않는 경우 경고 메시지 설정
            return; // 함수 종료하여 가입 절차 중단
        }

        // 회원 데이터를 객체로 생성하여 서버에 전송할 준비
        const userData = {
            userEmail,                   // 사용자가 입력한 이메일
            userPw,                      // 사용자가 입력한 비밀번호
            userNick,                    // 사용자가 입력한 닉네임
            userBirthdate: birthdateString // 변환된 생년월일 문자열 (또는 null)
        };

        try {
            // router.push를 사용하여 다음 화면(/index2)으로 이동하면서 회원 데이터를 전달
            router.push({
                pathname: '/index2',      // 이동할 페이지 경로
                params: {
                    userData: JSON.stringify(userData) // userData 객체를 JSON 문자열로 변환하여 전달
                },
            });
        } catch (error) {
            // 오류 발생 시 콘솔에 에러 메시지 출력
            console.error('Error:', error);
            // 오류 발생 시 사용자에게 알림 창 표시
            Alert.alert('Error', 'Something went wrong!');
        }
    };
    // 생년월일 입력 시 호출되는 함수, 숫자만 입력 가능하며 최대 8자리까지만 허용
    const handleBirthdateChange = (text) => {
        // 입력된 텍스트에서 숫자 외의 문자를 모두 제거하고 8자리까지만 슬라이스하여 저장
        const filteredText = text.replace(/[^0-9]/g, '').slice(0, 8);
        // 상태에 필터링된 텍스트를 저장하여 화면에 반영
        setBirthdate(filteredText);
    };

    // 비밀번호 확인 입력 시 호출되는 함수, 비밀번호와 일치 여부에 따라 메시지를 설정
    const handlePasswordConfirmChange = (text) => {
        // 비밀번호 확인 입력란의 텍스트를 상태에 저장
        setPasswordConfirm(text);
        // 비밀번호와 일치 여부에 따라 메시지를 설정:
        // - 입력된 텍스트가 존재하고(userPw가 비어있지 않음) 입력한 비밀번호와 다르면 '비밀번호가 다릅니다.' 메시지
        // - 입력된 텍스트가 비밀번호와 일치하면 '비밀번호가 일치합니다.' 메시지
        setPasswordMessage(
            text && text !== userPw ? '비밀번호가 다릅니다.' : '비밀번호가 일치합니다.'
        );
    };
    return (
        // SafeAreaView를 사용하여 iOS와 Android에서 안전 영역을 확보
        <SafeAreaView style={styles.safeArea}>

            {/* 키보드가 화면을 가리지 않도록 하는 KeyboardAvoidingView */}
            <KeyboardAvoidingView
                // iOS의 경우 키보드가 올라오면 패딩 적용, Android는 높이 조정
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={styles.container} // 컨테이너 스타일 적용
                // 키보드가 올라올 때 뷰의 위치를 조정하는 오프셋 설정
                keyboardVerticalOffset={Platform.select({ ios: 40, android: 0 })}
            >

                {/* ScrollView로 콘텐츠를 스크롤 가능하게 함 */}
                <ScrollView
                    contentContainerStyle={styles.scrollView} // ScrollView 스타일 적용
                    keyboardShouldPersistTaps="handled" // 키보드가 열려 있어도 다른 요소를 클릭할 수 있도록 설정
                >

                    {/* 폼 요소들을 포함하는 컨테이너 */}
                    <View style={styles.formContainer}>

                        {/* 이메일 입력란 */}
                        <View style={styles.inputContainer}>

                            {/* 이메일 입력 레이블과 유효성 메시지를 감싸는 컨테이너 */}
                            <View style={styles.emailLabelContainer}>

                                {/* 이메일 입력 필드의 레이블 */}
                                <Text style={styles.label}>이메일</Text>

                                {/* 이메일 유효성 검사 결과 메시지 표시 */}
                                {emailMessage && (
                                    // 이메일 중복 여부에 따라 메시지 스타일 변경 (중복 시 오류 스타일, 사용 가능 시 성공 스타일)
                                    <Text style={[
                                        styles.message,
                                        emailMessage.includes('중복') ? styles.errorMessage : styles.successMessage
                                    ]}>
                                        {/* // 이메일 유효성 검사 결과 메시지 */}
                                        {emailMessage}
                                    </Text>
                                )}
                            </View>

                            {/* 이메일 입력 텍스트 필드 */}
                            <TextInput
                                style={styles.input}              // 이메일 입력란 스타일 적용
                                value={userEmail}                 // 입력된 이메일 값 설정
                                onChangeText={handleEmailChange}  // 입력 값이 변경될 때 호출되는 함수
                                placeholder="이메일 주소를 입력하세요" // 사용자가 입력하지 않았을 때 보이는 안내 텍스트
                                keyboardType="email-address"      // 이메일 입력에 적합한 키보드 타입 설정
                            />
                            {/* 비밀번호 입력란 */}
                            <View style={styles.passwordLabelContainer}>

                                {/* 비밀번호 입력 필드의 레이블 */}
                                <Text style={styles.label}>비밀번호</Text>

                                {/* 비밀번호 일치 여부에 따른 유효성 검사 메시지 표시 */}
                                {passwordMessage && (
                                    // 메시지 내용에 따라 스타일을 성공 또는 오류로 설정 (일치 시 성공, 불일치 시 오류)
                                    <Text style={[
                                        styles.message,
                                        passwordMessage.includes('일치') ? styles.successMessage : styles.errorMessage
                                    ]}>
                                        {/* // 비밀번호 일치 또는 불일치에 대한 메시지 */}
                                        {passwordMessage}
                                    </Text>
                                )}
                            </View>

                            {/* 비밀번호 입력 텍스트 필드 */}
                            <TextInput
                                style={styles.input}              // 비밀번호 입력란 스타일 적용
                                value={userPw}                   // 입력된 비밀번호 값을 상태로 설정
                                onChangeText={setPassword}       // 입력 값이 변경될 때 비밀번호 상태 업데이트 함수 호출
                                placeholder="비밀번호를 입력하세요" // 사용자 안내용 플레이스홀더 텍스트
                                secureTextEntry                  // 입력한 텍스트가 보이지 않도록 비밀번호 입력 모드 활성화
                            />
                            {/* 비밀번호 확인 입력란 */}

                            {/* 비밀번호 확인 필드의 레이블 */}
                            <Text style={styles.label}>비밀번호 확인</Text>

                            {/* 비밀번호 확인 입력 텍스트 필드 */}
                            <TextInput
                                style={styles.input}                  // 비밀번호 확인 입력란 스타일 적용
                                value={userPwConfirm}                // 입력된 비밀번호 확인 값을 상태로 설정
                                onChangeText={handlePasswordConfirmChange} // 입력 값이 변경될 때 호출되는 함수
                                placeholder="비밀번호를 다시 입력하세요" // 사용자 안내용 플레이스홀더 텍스트
                                secureTextEntry                      // 입력한 텍스트가 보이지 않도록 비밀번호 입력 모드 활성화
                            />

                            {/* 닉네임 입력란 */}

                            {/* 닉네임 필드의 레이블 */}
                            <Text style={styles.label}>닉네임</Text>

                            {/* 닉네임 입력 텍스트 필드 */}
                            <TextInput
                                style={styles.input}              // 닉네임 입력란 스타일 적용
                                value={userNick}                 // 입력된 닉네임 값을 상태로 설정
                                onChangeText={setNickname}       // 입력 값이 변경될 때 닉네임 상태 업데이트 함수 호출
                                placeholder="닉네임을 입력하세요"  // 사용자 안내용 플레이스홀더 텍스트
                            />
                            {/* 생년월일 입력란 */}

                            {/* 생년월일 필드의 레이블 */}
                            <Text style={styles.label}>생년월일</Text>

                            {/* 생년월일 입력 텍스트 필드 */}
                            <TextInput
                                style={styles.input}                  // 생년월일 입력란 스타일 적용
                                value={userBirthdate}                // 입력된 생년월일 값을 상태로 설정
                                onChangeText={handleBirthdateChange} // 입력 값이 변경될 때 호출되는 생년월일 처리 함수
                                placeholder="YYYYMMDD"               // 사용자 안내용으로 생년월일 형식을 표시하는 플레이스홀더 텍스트
                                keyboardType="numeric"               // 숫자 전용 키보드 표시하여 생년월일 입력을 용이하게 함
                            />
                        </View>

                        {/* 다음 버튼 */}
                        <TouchableOpacity
                            // 버튼 스타일을 적용하고, 이메일이 유효하지 않으면 비활성화 스타일 추가
                            style={[styles.button, !isEmailValid && styles.buttonDisabled]}
                            // 버튼 클릭 시 회원가입 절차를 진행하는 함수 호출
                            onPress={handleJoin}
                            // 이메일이 유효하지 않으면 버튼 비활성화 처리
                            disabled={!isEmailValid}
                        >
                            {/* 버튼 텍스트: '다음' */}
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
        paddingBottom: 100, // 스크롤 뷰 아래쪽 여백을 100으로 설정하여 키보드 활성화 시 여유 공간 확보
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
