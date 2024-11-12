# main.py

from fastapi import FastAPI, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel
from threading import Thread
import uvicorn
from pyngrok import ngrok
from emotion_model import predict_with_probabilities
from openai_service import generate_gpt_response
from data_fetcher import fetch_user_data
from prompt_builder import get_combined_prompt
from keyword_extractor import extract_emotion_keyword
from memory_manager import get_user_memory
from langchain.chains import LLMChain
from langchain.prompts import PromptTemplate
from data_fetcher import fetch_user_data, fetch_chat_data_and_generate_wordcloud
import os


# FastAPI 앱 생성
app = FastAPI()

# CORS 설정 워드클라우드 
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # 특정 도메인으로 제한 가능
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 정적 파일 제공 설정
app.mount("/static", StaticFiles(directory="static"), name="static")


# 입력 데이터 모델 정의
class EmotionRequest(BaseModel):
    user_email: str
    croom_idx: int
    session_idx: int
    first_user_message: str
    previous_message: str
    current_user_message: str

#워드클라우드
class WordCloudRequest(BaseModel):
    croom_idx: int
    session_idx: int

def load_prompt(user_preference):
    prompt_file_path = f"prompts/chat_style_{user_preference}.txt"
    if not os.path.exists(prompt_file_path):
        raise FileNotFoundError(f"Prompt file for intent '{user_preference}' not found.")
    with open(prompt_file_path, "r", encoding="utf-8") as file:
        return file.read()

### 워드클라우드 추가
# 워드클라우드 생성 엔드포인트
@app.post("/generate_wordcloud")
async def generate_wordcloud(request: Request, request_data: WordCloudRequest):
    try:
        croom_idx = request_data.croom_idx
        session_idx = request_data.session_idx
        image_path = fetch_chat_data_and_generate_wordcloud(croom_idx, session_idx)
        image_filename = os.path.basename(image_path)
        base_url = str(request.base_url).rstrip("/")
        image_url = f"{base_url}/static/wordclouds/{image_filename}"

        return {"wordcloud_url": image_url}

    except ValueError as ve:
        raise HTTPException(status_code=404, detail=str(ve))
    except Exception as e:
        print(f"Error generating word cloud: {e}")
        raise HTTPException(status_code=500, detail="Internal Server Error")


# API 엔드포인트 정의
@app.post("/predict")
async def predict(request: EmotionRequest):
    try:
        # 데이터 페칭
        user_data = fetch_user_data(request.user_email, request.croom_idx, request.session_idx)
        
        # `user_preference`는 이미 "E_F", "E_T" 등으로 제공됨
        user_preference = user_data["user_preference"]
        
        # `base_prompt`를 `user_preference` 값에 따라 불러옴
        base_prompt = load_prompt(user_preference)
        
        if not user_data["user_preference"]:
            raise HTTPException(status_code=400, detail="사용자 선호 정보가 없습니다")
        
        # 감정 분류
        emotion_ratios = predict_with_probabilities(request.current_user_message)
        
        # 특수 감정 키워드 추출
        emotion_keyword = extract_emotion_keyword(emotion_ratios)
        
        # 시스템 프롬프트 및 메시지 생성
        combined_messages = get_combined_prompt(
            user_preference=user_data["user_preference"],
            diary_info=user_data["diary_info"],
            emotion_ratios=emotion_ratios,
            chat_history=user_data["chat_history"],
            current_user_message=request.current_user_message,
            emotion_keyword=emotion_keyword
        )
        
        # LangChain 메모리 관리 (사용자 세션별)
        session_id = f"{request.croom_idx}_{request.session_idx}"
        memory = get_user_memory(session_id)
        
        # LangChain을 사용한 응답 생성
        llm_chain = LLMChain(
            prompt=PromptTemplate.from_template(
                f"{base_prompt}\nYour name is Bamboo, a 27-year-old assistant.\n"
                "User preference: {user_preference}. Diary info: {diary_info}. "
                "Emotion ratios: {emotion_ratios}. Emotion keyword: {emotion_keyword}. "
                "Current message: {current_user_message}. Please respond appropriately."
            ),
            llm=memory  # 메모리를 사용하는 LLMChain 설정
        )
        # LangChain 체인을 통해 응답 생성
        bot_response = llm_chain.run({
            "user_preference": user_data["user_preference"],
            "diary_info": user_data["diary_info"],
            "emotion_ratios": emotion_ratios,
            "emotion_keyword": emotion_keyword,
            "current_user_message": request.current_user_message
        })
        
        # 감정 분류 수행
        # 이미 감정 분류를 수행했으므로, 필요 없다면 생략 가능
        
        # 응답 데이터 생성
        response_data = {
            "current_emotion_probabilities": emotion_ratios,
            "emotion_keyword": emotion_keyword,
            "bot_response": bot_response
        }
        return response_data

    except HTTPException as he:
        raise he
    except Exception as e:
        # 로깅 또는 에러 핸들링 추가 가능
        raise HTTPException(status_code=500, detail=str(e))

# 테스트 엔드포인트 추가
@app.get("/test")
async def test():
    try:
        from database_service import engine
        connection = engine.connect()
        connection.close()
        return {"message": "FastAPI 서버 및 데이터베이스 연결이 정상입니다."}
    except Exception as e:
        return {"error": "데이터베이스 연결 실패", "details": str(e)}

# FastAPI 서버 실행 함수 정의
def start_fastapi():
    uvicorn.run(app, host="0.0.0.0", port=8001)

# FastAPI 서버를 백그라운드에서 실행
server_thread = Thread(target=start_fastapi)
server_thread.start()

# ngrok을 사용해 8001번 포트를 외부에서 접근 가능하도록 설정
public_url = ngrok.connect(8001)
print("FastAPI 서버가 실행 중입니다. 다음 주소로 접근하세요:", public_url)

# 워드클라우드용/ FastAPI 서버 URL을 반환하는 API  React Native가 초기화될 때 이 URL을 요청하여 서버 주소를 동적으로 가져오게 할 수 있습니다.
@app.get("/server_url")
async def get_server_url():
    return {"server_url": public_url}