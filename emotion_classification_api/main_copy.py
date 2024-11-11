from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from threading import Thread
import uvicorn
from pyngrok import ngrok
from emotion_model import predict_with_probabilities
from data_fetcher import fetch_user_data, load_chat_history_from_db
from prompt_builder import get_combined_prompt
from keyword_extractor import extract_emotion_keyword
from memory_manager import get_user_memory
from langchain.schema.runnable import RunnableSequence
from langchain.prompts import PromptTemplate
from openai_service import llm
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
    prompt_file_path = "C:/Users/qsoqs/Desktop/model_API/bamboo/emotion_classification_api/promts/chat_style_Default preference.txt"
    if not os.path.exists(prompt_file_path):
        raise FileNotFoundError(f"Prompt file for intent '{user_preference}' not found.")
    with open(prompt_file_path, "r", encoding="utf-8") as file:
        return file.read()

@app.post("/predict")
async def predict(request: EmotionRequest):
    try:
        # Step 1: 데이터 페칭
        user_data = fetch_user_data(request.user_email, request.croom_idx, request.session_idx)
        print("Fetched User Data:", user_data)
        user_preference = user_data.get("user_preference", "Default preference")
        diary_info = user_data.get("diary_info", "No diary information available.")
        chat_history = user_data.get("chat_history", [])

        # 데이터베이스에서 이전 채팅 기록 불러오기
        db_chat_history = load_chat_history_from_db(request.croom_idx, request.session_idx)
        if not chat_history and db_chat_history:
            chat_history = db_chat_history

        # Step 2: 사용자 선호도 기반 프롬프트 로드
        base_prompt = load_prompt(user_preference)
        print("Loaded Base Prompt:", base_prompt[:100])

        # Step 3: 감정 분류
        emotion_ratios = predict_with_probabilities(
            request.first_user_message, request.previous_message, request.current_user_message
        )
        print("Emotion Ratios:", emotion_ratios)

        # Step 4: 특수 감정 키워드 추출
        emotion_keyword = extract_emotion_keyword(emotion_ratios)
        if not emotion_keyword:
            emotion_keyword = "neutral"
        print("Emotion Keyword:", emotion_keyword)

        # Step 5: 시스템 프롬프트 및 메시지 생성
        combined_messages = get_combined_prompt(
            user_preference=user_data["user_preference"],
            diary_info=user_data["diary_info"],
            emotion_ratios=emotion_ratios,
            chat_history=chat_history,
            current_user_message=request.current_user_message,
            emotion_keyword=emotion_keyword
        )
        print("Combined Messages:", combined_messages)

        # Step 6: LangChain 메모리 관리
        session_id = f"{request.croom_idx}_{request.session_idx}"
        memory = get_user_memory(session_id, chat_history)
        print("Session ID:", session_id)

        # Step 7: RunnableSequence를 사용한 LLM 호출
        prompt_template = PromptTemplate.from_template(
            f"{base_prompt}\nYour name is Bamboo, a 27-year-old assistant.\n"
            "User preference: {user_preference}. Diary info: {diary_info}. "
            "Emotion ratios: {emotion_ratios}. Emotion keyword: {emotion_keyword}. "
            "Current message: {current_user_message}. Please respond appropriately."
        )

        chain = RunnableSequence(prompt_template | llm)

        bot_response = chain.invoke({
            "user_preference": user_data["user_preference"],
            "diary_info": user_data["diary_info"],
            "emotion_ratios": emotion_ratios,
            "emotion_keyword": emotion_keyword,
            "current_user_message": request.current_user_message
        })
        print("Bot Response:", bot_response)

        # 응답 데이터 생성
        response_data = {
            "current_emotion_probabilities": emotion_ratios,
            "emotion_keyword": emotion_keyword,
            "bot_response": bot_response
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
