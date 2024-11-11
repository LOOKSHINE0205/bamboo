# openai_service.py
import os
from dotenv import load_dotenv
from langchain.chat_models import ChatOpenAI

load_dotenv()

OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")

llm = ChatOpenAI(model_name="gpt-4", temperature=0.7, openai_api_key=OPENAI_API_KEY)


def generate_gpt_response(messages: list) -> str:
    """
    OpenAI API를 사용하여 GPT 모델의 응답을 생성합니다.
    
    Args:
        messages (list): OpenAI API에 전달할 메시지 리스트
    
    Returns:
        str: 생성된 챗봇의 응답
    """
    response = llm(messages)
    return response["choices"][0]["message"]["content"]
