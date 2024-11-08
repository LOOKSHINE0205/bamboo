# prompt_builder.py

from langchain.prompts import PromptTemplate
from memory_manager import get_user_memory

def build_system_prompt(user_preference: str, diary_info: str, emotion_ratios: dict) -> str:
    """
    사용자 선호 스타일, 일기 정보, 감정 비율을 바탕으로 시스템 프롬프트를 생성합니다.
    
    Args:
        user_preference (str): 사용자의 선호 답변 스타일
        diary_info (str): 사용자의 일기 정보
        emotion_ratios (dict): 감정 비율 정보
    
    Returns:
        str: 생성된 시스템 프롬프트
    """
    # 감정 비율을 텍스트로 변환
    emotion_text = ", ".join([f"{emotion}: {ratio}" for emotion, ratio in emotion_ratios.items()])
    
    system_prompt = (
        f"당신은 {user_preference} 스타일의 공감적인 챗봇입니다.\n"
        f"사용자의 일기 정보:\n{diary_info}\n"
        f"사용자의 현재 감정 비율:\n{emotion_text}\n"
    )
    return system_prompt

def build_system_prompt_with_keyword(user_preference: str, diary_info: str, emotion_ratios: dict, emotion_keyword: str) -> str:
    """
    사용자 선호 스타일, 일기 정보, 감정 비율, 특수 감정 키워드를 바탕으로 시스템 프롬프트를 생성합니다.
    
    Args:
        user_preference (str): 사용자의 선호 답변 스타일
        diary_info (str): 사용자의 일기 정보
        emotion_ratios (dict): 감정 비율 정보
        emotion_keyword (str): 특수 감정 키워드
    
    Returns:
        str: 생성된 시스템 프롬프트
    """
    # 감정 비율을 텍스트로 변환
    emotion_text = ", ".join([f"{emotion}: {ratio}" for emotion, ratio in emotion_ratios.items()])
    
    system_prompt = (
        f"당신은 {user_preference} 스타일의 공감적인 챗봇입니다.\n"
        f"사용자의 일기 정보:\n{diary_info}\n"
        f"사용자의 현재 감정 비율:\n{emotion_text}\n"
        f"특수 감정 키워드: {emotion_keyword}\n"
    )
    return system_prompt

def build_messages(chat_history: list, current_user_message: str) -> list:
    """
    채팅 내역과 현재 사용자의 메시지를 바탕으로 메시지 리스트를 생성합니다.
    
    Args:
        chat_history (list): 과거 채팅 내역 [(chatter, msg), ...]
        current_user_message (str): 현재 사용자의 메시지
    
    Returns:
        list: OpenAI API에 전달할 메시지 리스트
    """
    messages = [
        {"role": "user", "content": msg} if chatter == "user" else {"role": "assistant", "content": msg}
        for chatter, msg in chat_history
    ]
    messages.append({"role": "user", "content": current_user_message})
    return messages

def get_combined_prompt(user_preference: str, diary_info: str, emotion_ratios: dict, chat_history: list, current_user_message: str, emotion_keyword: str = None) -> list:
    """
    시스템 프롬프트와 메시지를 결합하여 OpenAI API에 전달할 전체 프롬프트를 생성합니다.
    
    Args:
        user_preference (str): 사용자의 선호 답변 스타일
        diary_info (str): 사용자의 일기 정보
        emotion_ratios (dict): 감정 비율 정보
        chat_history (list): 과거 채팅 내역 [(chatter, msg), ...]
        current_user_message (str): 현재 사용자의 메시지
        emotion_keyword (str, optional): 특수 감정 키워드. 기본값은 None.
    
    Returns:
        list: OpenAI API에 전달할 전체 메시지 리스트
    """
    if emotion_keyword:
        system_prompt = build_system_prompt_with_keyword(user_preference, diary_info, emotion_ratios, emotion_keyword)
    else:
        system_prompt = build_system_prompt(user_preference, diary_info, emotion_ratios)
    
    messages = build_messages(chat_history, current_user_message)
    combined_messages = [{"role": "system", "content": system_prompt}] + messages
    return combined_messages
