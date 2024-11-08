# memory_manager.py

from langchain.memory import ConversationBufferMemory
from langchain.chains import LLMChain
from openai_service import llm
from collections import defaultdict

# 사용자별 메모리를 저장할 딕셔너리
user_memories = defaultdict(lambda: ConversationBufferMemory())

def get_user_memory(session_id: str) -> LLMChain:
    """
    주어진 세션 ID에 해당하는 사용자 메모리를 반환합니다.
    메모리가 없으면 새로 생성합니다.
    
    Args:
        session_id (str): 사용자 세션을 식별할 고유 ID
    
    Returns:
        LLMChain: 사용자 메모리를 포함한 LLMChain 인스턴스
    """
    memory = user_memories[session_id]
    llm_chain = LLMChain(
        llm=llm,
        prompt=PromptTemplate.from_template(""),
        memory=memory
    )
    return llm_chain

def clear_user_memory(session_id: str):
    """
    주어진 세션 ID에 해당하는 사용자 메모리를 초기화합니다.
    
    Args:
        session_id (str): 사용자 세션을 식별할 고유 ID
    """
    user_memories[session_id] = ConversationBufferMemory()
