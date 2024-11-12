# main_copy.py
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from threading import Thread
import uvicorn
from pyngrok import ngrok
from emotion_model import predict_with_probabilities
from data_fetcher import fetch_user_data
from prompt_builder import get_combined_prompt
from keyword_extractor import extract_emotion_keyword
from memory_manager import get_session_memory, update_session_memory
from langchain.prompts import PromptTemplate
from openai_service import llm
from langchain.schema import HumanMessage
import os

app = FastAPI()

class EmotionRequest(BaseModel):
    user_email: str
    croom_idx: int
    session_idx: int
    first_user_message: str
    previous_message: str
    current_user_message: str

def load_prompt(user_preference):
    prompt_file_path = f"C:/Users/qsoqs/Desktop/model_API/bamboo/emotion_classification_api/promts/chat_style_{user_preference}.txt"
    if not os.path.exists(prompt_file_path):
        prompt_file_path = "C:/Users/qsoqs/Desktop/model_API/bamboo/emotion_classification_api/promts/chat_style_Default preference.txt"
    with open(prompt_file_path, "r", encoding="utf-8") as file:
        return file.read()

@app.post("/predict")
async def predict(request: EmotionRequest):
    try:
        # Step 1: 사용자 데이터 페칭
        user_data = fetch_user_data(request.user_email, request.croom_idx, request.session_idx)
        print("Fetched User Data:", user_data)
        user_preference = user_data.get("user_preference", "Default preference")
        diary_info = user_data.get("diary_info", "No diary information available.")

        # Step 2: 메모리에서 세션 메모리 가져오기 또는 초기화
        chat_history = user_data.get("chat_history", [])
        memory = get_session_memory(request.croom_idx, request.session_idx, chat_history)
        print("Memory state for session:", f"{request.croom_idx}_{request.session_idx}")
        for msg in memory.chat_memory.messages:
            print(f"Role: {msg.type}, Content: {msg.content}")

        # Step 3: 사용자 선호도 기반 프롬프트 로드
        base_prompt = load_prompt(user_preference)
        print("Loaded Base Prompt:", base_prompt[:100])

        # Step 4: 감정 분류
        emotion_ratios = predict_with_probabilities(
            request.first_user_message, request.previous_message, request.current_user_message
        )
        print("Emotion Ratios:", emotion_ratios)

        # Step 5: 특수 감정 키워드 추출
        emotion_keyword = extract_emotion_keyword(emotion_ratios)
        if not emotion_keyword:
            emotion_keyword = "neutral"
        print("Emotion Keyword:", emotion_keyword)

        # Step 6: 시스템 프롬프트 및 메시지 생성
        # 메모리에서 대화 기록 가져오기
        memory_messages = memory.chat_memory.messages.copy()
        # 현재 사용자 메시지 추가
        memory_messages.append(HumanMessage(content=request.current_user_message))

        # 최종 프롬프트 생성
        prompt_template = PromptTemplate.from_template(
            f"{base_prompt}\nYour name is Bamboo, a 27-year-old assistant.\n"
            "User preference: {user_preference}. Diary info: {diary_info}. "
            "Emotion ratios: {emotion_ratios}. Emotion keyword: {emotion_keyword}.\n"
            "{conversation_history}\n"
            "Please respond appropriately."
        )

        # 대화 기록을 문자열로 변환
        conversation_history = ""
        for msg in memory_messages:
            role = "User" if msg.type == "human" else "Assistant"
            conversation_history += f"{role}: {msg.content}\n"

        chain = prompt_template | llm

        bot_response = chain.invoke({
            "user_preference": user_preference,
            "diary_info": diary_info,
            "emotion_ratios": emotion_ratios,
            "emotion_keyword": emotion_keyword,
            "conversation_history": conversation_history
        })
        print("Bot Response:", bot_response)

        # Step 7: 메모리에 봇 응답 추가
        update_session_memory(request.croom_idx, request.session_idx, "assistant", bot_response.content)

        # 응답 데이터 생성
        response_data = {
            "current_emotion_probabilities": emotion_ratios,
            "emotion_keyword": emotion_keyword,
            "bot_response": bot_response.content
        }
        return response_data

    except Exception as e:
        print("Unhandled Error:", e)
        raise HTTPException(status_code=500, detail=f"Error generating bot response: {e}")

def start_fastapi():
    uvicorn.run(app, host="0.0.0.0", port=8001)

server_thread = Thread(target=start_fastapi)
server_thread.start()

public_url = ngrok.connect(8001)
print("FastAPI 서버가 실행 중입니다. 다음 주소로 접근하세요:", public_url)
