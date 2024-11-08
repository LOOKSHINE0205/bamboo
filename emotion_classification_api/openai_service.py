# openai_service.py

import os
import openai
from dotenv import load_dotenv

# .env 파일 로드
load_dotenv()

# 환경 변수에서 OpenAI API 키 가져오기
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")

# GPT 응답 생성 함수
def generate_gpt_response(system_prompt, messages):
    response = openai.ChatCompletion.create(
        model="ft:gpt-4o-mini-2024-07-18:personal::AQloTE1f",
        messages=[{"role": "system", "content": system_prompt}] + messages
    )
    return response["choices"][0]["message"]["content"]