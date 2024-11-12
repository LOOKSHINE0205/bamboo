from database_service import get_user_preference, get_diary_info, get_chat_history

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