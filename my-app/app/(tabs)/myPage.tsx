import { NativeBaseProvider } from 'native-base';
import { StyleSheet, ImageBackground, TouchableOpacity, Image, Dimensions } from 'react-native';
import { useRouter } from 'expo-router';
// @ts-ignore
import BackGround from "../../assets/images/bamboobg.png";
// @ts-ignore
import BambooHead from "../../assets/images/bamboo_head.png"; // 이미지 불러오기
// @ts-ignore
import BambooBody from "../../assets/images/bamboo_body.png"; // 이미지 불러오기
// @ts-ignore
import BambooPanda from "../../assets/images/bamboo_panda.png"; // 판다 이미지 불러오기
import { Ionicons } from '@expo/vector-icons';

// 애니메이션 컴포넌트 불러오기
import CloudAnimation from '../../components/animation/CloudAnimation';
import BambooAnimation from '../../components/animation/BambooAnimation';
import ButterflyAnimation from '../../components/animation/ButterflyAnimation';
import GrassAnimation from '../../components/animation/GrassAnimation';

const { width, height } = Dimensions.get('window'); // 화면 크기 가져오기

export default function HomeScreen() {
    const router = useRouter();

    const level = 4; // 현재 레벨을 4로 설정 (레벨에 따라 나무를 쌓음)
    const imageHeight = 150 * 0.4; // 각 이미지의 높이 (줄임)
    const gapBetweenImages = -8; // 나무 간의 간격을 줄임

    const renderBambooBodies = () => {
        let bodies = [];
        for (let i = 0; i < level - 1; i++) {  // level-1 만큼 나무 몸체 추가
            bodies.push(
                <Image
                    key={i} // React에서 반복문 사용 시 key 필수
                    source={BambooBody}
                    style={[styles.bambooBody, { bottom: (i * (imageHeight + gapBetweenImages)) }]} // 추가할 때마다 이미지가 올라감
                />
            );
        }
        return bodies;
    };

    return (
        <NativeBaseProvider>
            <ImageBackground
                source={BackGround}
                style={styles.background}
                resizeMode="stretch"
            >
                <TouchableOpacity
                    style={styles.settingsButton}
                    onPress={() => router.push('../(setting)')}
                >
                    <Ionicons name="settings-outline" size={30} color="white" />
                </TouchableOpacity>

                {/* 애니메이션 추가 */}
                <CloudAnimation />
                <BambooAnimation />
                <ButterflyAnimation />
                <GrassAnimation />

                {/* 레벨에 따라 나무 몸체를 여러 개 생성 */}
                {renderBambooBodies()}

                {/* 판다 이미지 (나무 머리 뒤에 배치, 레벨에 따라 함께 올라감) */}
                <Image
                    source={BambooPanda}
                    style={[styles.bambooPanda, { bottom: (level - 1) * (imageHeight + gapBetweenImages) }]} // 판다가 나무 머리와 함께 이동
                />

                {/* 맨 위에 나무 머리 */}
                <Image
                    source={BambooHead}
                    style={[styles.bambooHead, { bottom: (level - 1) * (imageHeight + gapBetweenImages) }]} // 머리가 위로 올라감
                />
            </ImageBackground>
        </NativeBaseProvider>
    );
}

const styles = StyleSheet.create({
    background: {
        flex: 1,
        width: '100%',
        height: '100%',
    },
    settingsButton: {
        position: 'absolute',
        top: 10,
        right: 10,
        padding: 10,
    },
    bambooBody: {
        position: 'absolute',
        zIndex: 2, // 나무 몸체가 판다보다 앞에 있게 설정
        left: (width - (200 * 0.4)) / 2, // 화면 너비에서 40%로 줄인 이미지 너비의 절반만큼 빼서 중앙 정렬
        width: 200 * 0.4, // 200px의 40%로 설정
        height: 150 * 0.4, // 150px의 40%로 설정
        resizeMode: 'contain', // 이미지 비율 유지
    },
    bambooPanda: {
        position: 'absolute',
        zIndex: 1, // 판다가 나무 몸체보다 뒤에 있게 설정
        left: (width - (200 * 0.5)+85) / 2, // 판다 이미지 중앙 정렬
        width: 200 * 0.4, // 판다 이미지 크기
        height: 200 * 0.4, // 판다 이미지 크기
        resizeMode: 'contain', // 이미지 비율 유지
    },
    bambooHead: {
        position: 'absolute',
        zIndex: 2, // 나무 머리가 판다보다 앞에 위치
        left: (width - (200 * 0.5)) / 2, // 첫 번째 나무와 동일하게 중앙 정렬
        width: 200 * 0.5, // 크기를 첫 번째 나무와 동일하게 설정
        height: 150 * 0.5, // 높이도 동일하게 유지
        resizeMode: 'contain', // 이미지 비율 유지
    },
});
