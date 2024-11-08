# keyword_extractor.py

def extract_emotion_keyword(emotion_ratios: dict) -> str:
    """
    감정 비율 정보를 바탕으로 특수 감정 키워드를 추출합니다.
    
    Args:
        emotion_ratios (dict): 감정 비율 정보
    
    Returns:
        str: 추출된 특수 감정 키워드
    """
    # 예시 로직: 슬픔과 공포가 높은 경우 "비참"
    high_emotions = [emotion for emotion, ratio in emotion_ratios.items() if ratio > 0.5]  # 임계값 0.5 예시
    if "슬픔" in high_emotions and "공포" in high_emotions:
        return "비참"
    elif "기쁨" in high_emotions:
        return "행복"
    # 추가적인 로직을 여기에 구현
    else:
        return "일반적"
