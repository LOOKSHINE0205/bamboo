# openai_service.py

import openai

# OpenAI API 키 설정
openai.api_key = os.getenv("OPENAI_API_KEY")

# GPT 응답 생성 함수
def generate_gpt_response(system_prompt, messages):
    response = openai.ChatCompletion.create(
        model="ft:gpt-4o-mini-2024-07-18:personal::AQloTE1f",
        messages=[{"role": "system", "content": system_prompt}] + messages
    )
    return response["choices"][0]["message"]["content"]