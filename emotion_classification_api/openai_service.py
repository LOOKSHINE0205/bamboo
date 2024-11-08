# openai_service.py

import os
import openai
from dotenv import load_dotenv
from langchain import OpenAI

# .env 파일 로드
load_dotenv()

# 환경 변수에서 OpenAI API 키 가져오기
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")

# OpenAI API 키 설정
openai.api_key = OPENAI_API_KEY

# LangChain의 OpenAI 언어 모델 초기화
llm = OpenAI(model="gpt-4", temperature=0.7)

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
