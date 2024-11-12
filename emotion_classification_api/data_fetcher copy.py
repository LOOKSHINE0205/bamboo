# data_fetcher.py

from database_service import get_user_preference, get_diary_info, get_chat_history

def fetch_user_data(user_email: str, croom_idx: int, session_idx: int) -> dict:
    """
    사용자 이메일과 채팅 방, 세션 인덱스를 기반으로 필요한 데이터를 가져옵니다.
    
    Args:
        user_email (str): 사용자의 이메일
        croom_idx (int): 채팅 방 인덱스
        session_idx (int): 세션 인덱스
    
    Returns:
        dict: 사용자 선호도, 일기 정보, 채팅 내역
    """
    user_preference = get_user_preference(user_email)
    diary_info = get_diary_info(user_email)
    chat_history = get_chat_history(croom_idx, session_idx)
    
    return {
        "user_preference": user_preference,
        "diary_info": diary_info,
        "chat_history": chat_history
    }
