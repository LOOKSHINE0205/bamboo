# data_fetcher.py
from database_service import get_user_preference, get_diary_info, get_chat_history
from wordcloud import WordCloud
import os

def fetch_user_data(user_email: str, croom_idx: int, session_idx: int) -> dict:
    try:
        user_preference = get_user_preference(user_email)
        diary_info = get_diary_info(user_email)
        chat_history = get_chat_history(croom_idx, session_idx)

        return {
            "user_preference": user_preference or "Default preference",
            "diary_info": diary_info or "No diary information available.",
            "chat_history": chat_history or []
        }
    except Exception as e:
        print(f"Error in fetch_user_data: {e}")
        return {
            "user_preference": "Default preference",
            "diary_info": "No diary information available.",
            "chat_history": []
        }

def load_chat_history_from_db(croom_idx: int, session_idx: int):
    """
    데이터베이스에서 채팅 기록을 불러옵니다.
    
    Args:
        croom_idx (int): 채팅 방 인덱스
        session_idx (int): 세션 인덱스
    
    Returns:
        list: 이전 채팅 기록 [(chatter, msg), ...]
    """
    chat_history = get_chat_history(croom_idx, session_idx)
    if not chat_history:
        return []
    
    # 반환된 형식이 올바른지 확인 ([(chatter, msg), ...] 형태)
    return chat_history

# 워드 클라우드를 생성하고 이미지 파일로 저장하는 함수
def fetch_chat_data_and_generate_wordcloud(croom_idx: int, session_idx: int) -> str:
    """
    주어진 채팅 방 인덱스와 세션 인덱스에 해당하는 채팅 데이터를 사용해 워드클라우드를 생성하고 이미지 파일 경로를 반환합니다.
    
    Args:
        croom_idx (int): 채팅 방 인덱스
        session_idx (int): 세션 인덱스
    
    Returns:
        str: 워드클라우드 이미지 파일 경로
    """
    try:
        # 채팅 기록 가져오기
        chat_history = get_chat_history(croom_idx, session_idx)
        if not chat_history:
            raise ValueError("No chat history available for the given croom_idx and session_idx.")
        chat_texts = " ".join([entry['chat_content'] for entry in chat_history])
        # 워드 클라우드 생성
        wordcloud = WordCloud(width=800, height=400, background_color='white').generate(chat_texts)
        
        # 디렉토리 생성
        os.makedirs("static/wordclouds", exist_ok=True)
        image_path = f"static/wordclouds/wordcloud_{croom_idx}_{session_idx}.png"
        wordcloud.to_file(image_path)
        return image_path
    except Exception as e:
        print(f"Error generating wordcloud: {e}")
        raise ValueError("Failed to generate wordcloud")