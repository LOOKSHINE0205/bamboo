# memory_manager.py

from langchain.memory import ConversationBufferMemory
from collections import defaultdict

# 세션별 메모리를 저장할 딕셔너리
session_memories = defaultdict(lambda: ConversationBufferMemory(return_messages=True))

def get_session_memory(croom_idx: int, session_idx: int, chat_history: list = None):
    """
    주어진 croom_idx와 session_idx 조합에 해당하는 세션 메모리를 반환합니다.
    메모리가 없으면 새로 생성하고, 데이터베이스에서 불러온 대화 기록을 추가합니다.

    Args:
        croom_idx (int): 채팅방 ID
        session_idx (int): 세션 ID
        chat_history (list, optional): 데이터베이스에서 불러온 대화 기록 [(chatter, msg), ...]

    Returns:
        ConversationBufferMemory: 세션 메모리 인스턴스
    """
    session_id = f"{croom_idx}_{session_idx}"
    memory = session_memories[session_id]

    if not memory.chat_memory.messages:
        # 메모리가 비어 있을 때만 초기화
        if chat_history:
            for chatter, msg in chat_history:
                if chatter == "user":
                    memory.chat_memory.add_user_message(msg)
                elif chatter in ["bot", "assistant"]:
                    memory.chat_memory.add_ai_message(msg)

    return memory

def update_session_memory(croom_idx: int, session_idx: int, role: str, message: str):
    """
    세션 메모리에 새로운 메시지를 추가합니다.

    Args:
        croom_idx (int): 채팅방 ID
        session_idx (int): 세션 ID
        role (str): 'user' 또는 'assistant'
        message (str): 메시지 내용
    """
    session_id = f"{croom_idx}_{session_idx}"
    memory = session_memories[session_id]

    if role == "user":
        memory.chat_memory.add_user_message(message)
    elif role == "assistant":
        memory.chat_memory.add_ai_message(message)

def clear_session_memory(croom_idx: int, session_idx: int):
    """
    세션 메모리를 초기화합니다.

    Args:
        croom_idx (int): 채팅방 ID
        session_idx (int): 세션 ID
    """
    session_id = f"{croom_idx}_{session_idx}"
    if session_id in session_memories:
        del session_memories[session_id]
