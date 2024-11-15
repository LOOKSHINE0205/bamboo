# memory_manager.py

from langchain.memory import ConversationSummaryMemory
from collections import defaultdict
from langchain.llms import OpenAI  # 요약에 사용할 LLM
import os

# 환경 변수에서 API 키 가져오기
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")

# 요약용 LLM 설정
summary_llm = OpenAI(openai_api_key=OPENAI_API_KEY, temperature=0)

# 세션별 메모리를 저장할 딕셔너리
session_memories = defaultdict(lambda: ConversationSummaryMemory(llm=summary_llm, return_messages=True))


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
            # 초기 대화 내용을 기반으로 요약 생성
            memory.save_context({}, {})  # 빈 딕셔너리를 넣어도 내부적으로 요약이 업데이트

    return memory


def update_session_memory(croom_idx: int, session_idx: int, role: str, message: str):
    session_id = f"{croom_idx}_{session_idx}"
    memory = session_memories[session_id]

    if role == "user":
        human_input = message
        ai_output = ""  # 아직 AI 응답이 없으므로 빈 문자열
    elif role == "assistant":
        human_input = ""  # 이전에 저장된 사용자 입력이 있으므로 빈 문자열
        ai_output = message

    # 새로운 메시지를 기반으로 요약 업데이트
    memory.save_context({"input": human_input}, {"output": ai_output})

def clear_session_memory(croom_idx: int, session_idx: int):
    session_id = f"{croom_idx}_{session_idx}"
    if session_id in session_memories:
        del session_memories[session_id]
