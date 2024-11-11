import os
import numpy as np
import pandas as pd
from typing import Dict, List

# 현재 스크립트의 디렉토리
script_dir = os.path.dirname(os.path.abspath(__file__))
excel_path = os.path.join(script_dir, 'emotion_classification_api', 'emotion_words.csv')

# 엑셀 파일 로드
try:
    emotion_df = pd.read_excel(excel_path)
except FileNotFoundError:
    print(f"엑셀 파일을 찾을 수 없습니다: {excel_path}")
    exit(1)

# 감정별 V, A, D 값 설정
emotion_vectors = {
    "공포": [0.073, 0.84, 0.293],
    "슬픔": [0.052, 0.288, 0.164],
    "놀람": [0.875, 0.875, 0.562],
    "혐오": [0.052, 0.775, 0.317],
    "행복": [1.0, 0.735, 0.772],
    "분노": [0.082, 0.888, 0.658],
    "중립": [0.5, 0.5, 0.5]
}

def extract_emotion_keyword(emotion_ratios: Dict[str, float], emotion_df: pd.DataFrame) -> str:
    """
    감정 비율 정보를 바탕으로 가장 유사한 감정 단어를 추출합니다.

    Args:
        emotion_ratios (dict): 감정 확률 정보
        emotion_df (pd.DataFrame): 감정 단어와 VAD 값 데이터프레임

    Returns:
        str: 가장 유사한 감정 단어
    """

    # 가중치 합 벡터 계산 함수
    def calculate_weighted_emotion_vector(emotion_ratios: Dict[str, float]) -> np.ndarray:
        weighted_vector = np.zeros(3)
        for emotion, prob in emotion_ratios.items():
            if emotion in emotion_vectors:
                weighted_vector += np.array(emotion_vectors[emotion]) * prob
        return weighted_vector

    # V, A, D 값을 기반으로 가장 유사한 감정 단어 찾기 함수
    def find_closest_emotion_words(target_vector, emotion_df, k=5):
        distances = []
        for _, row in emotion_df.iterrows():
            vad_vector = np.array([row["V"], row["A"], row["D"]])
            distance = np.linalg.norm(target_vector - vad_vector)  # 유클리드 거리 계산
            distances.append((row["감정단어"], distance))
        closest_words = sorted(distances, key=lambda x: x[1])[:k]
        return closest_words

    # DB에서 가장 유사한 감정 단어 찾기
    def find_most_similar_emotion_word(target_vector: np.ndarray, emotion_df) -> str:
        closest_emotions = find_closest_emotion_words(target_vector, emotion_df, k=1)
        if closest_emotions:
            return closest_emotions[0][0]  # 가장 유사한 감정 단어 반환
        else:
            return "감정 단어를 찾을 수 없습니다."

    # emotion_ratios 정규화
    total_prob = sum(emotion_ratios.values())
    if total_prob != 1.0:
        emotion_ratios = {emotion: prob / total_prob for emotion, prob in emotion_ratios.items()}

    # 가중합 벡터 계산
    target_vector = calculate_weighted_emotion_vector(emotion_ratios)

    # 가장 유사한 감정 단어 찾기
    most_similar_emotion = find_most_similar_emotion_word(target_vector, emotion_df)

    return most_similar_emotion

# 예시로 감정 비율을 테스트
emotion_ratios = {"공포": 0.3, "슬픔": 0.2, "행복": 0.5}  # 예시 감정 비율

# 감정 단어 추출
most_similar_emotion = extract_emotion_keyword(emotion_ratios, emotion_df)

print(f"가장 유사한 감정 단어: {most_similar_emotion}")
