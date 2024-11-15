# memory_manager.py

from langchain.memory import ConversationSummaryMemory
from collections import defaultdict
from langchain_openai.llms import OpenAI  # 최신 임포트 경로
import os

# 환경 변수에서 API 키 가져오기
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")

# 요약용 LLM 설정
summary_llm = OpenAI(openai_api_key=OPENAI_API_KEY, temperature=0)

# 세션별 메모리를 저장할 딕셔너리
session_memories = defaultdict(lambda: ConversationSummaryMemory(
    llm=summary_llm,
    return_messages=True,
    input_key="input",   # 추가
    output_key="output"  # 추가
))

def get_session_memory(croom_idx: int, session_idx: int, chat_history: list = None, chatbot_name: str = None):
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
            # 업데이트된 메소드 사용
            memory.save_context({"input": ""}, {"output": ""})

    return memory

def update_session_memory(croom_idx: int, session_idx: int, role: str, message: str):
    session_id = f"{croom_idx}_{session_idx}"
    memory = session_memories[session_id]

    if role == "user":
        human_input = message
        ai_output = ""
    elif role == "assistant":
        human_input = ""
        ai_output = message

    # 새로운 메시지를 기반으로 요약 업데이트
    memory.save_context({"input": human_input}, {"output": ai_output})

def clear_session_memory(croom_idx: int, session_idx: int):
    session_id = f"{croom_idx}_{session_idx}"
    if session_id in session_memories:
        del session_memories[session_id]
