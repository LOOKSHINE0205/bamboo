from fastapi import FastAPI
from pydantic import BaseModel
from threading import Thread
import uvicorn
from pyngrok import ngrok
from emotion_model import predict_with_probabilities
from openai_service import generate_gpt_response
from database_service import get_user_preference, get_diary_info, get_chat_history

# FastAPI 앱 생성
app = FastAPI()

# 입력 데이터 모델 정의
class EmotionRequest(BaseModel):
    user_email: str
    croom_idx: int
    session_idx: int
    first_user_message: str
    previous_message: str
    current_user_message: str

# API 엔드포인트 정의
@app.post("/predict")
async def predict(request: EmotionRequest):
    try:
        # 데이터베이스에서 사용자 정보 및 일기 정보 가져오기
        user_preference = get_user_preference(request.user_email)
        diary_info = get_diary_info(request.user_email)
        chat_history = get_chat_history(request.croom_idx, request.session_idx)

        if not user_preference:
            return {"error": "사용자 선호 정보가 없습니다"}

        # 채팅 내역 메시지 구성
        messages = [{"role": "user", "content": msg} if chatter == "user" else {"role": "assistant", "content": msg}
                    for chatter, msg in chat_history]

        # 현재 사용자 메시지를 추가
        messages.append({"role": "user", "content": request.current_user_message})

        # 시스템 프롬프트 구성
        system_prompt = (
            f"당신은 {user_preference} 스타일의 공감적인 챗봇입니다.\n"
            f"사용자의 일기 정보:\n{diary_info}\n"
        )

        # OpenAI API를 사용해 모델 응답 생성
        bot_response = generate_gpt_response(system_prompt, messages)

        # 감정 분류 수행
        current_emotion_probabilities = predict_with_probabilities(request.current_user_message)

        # 응답 데이터 생성
        response_data = {
            "current_emotion_probabilities": current_emotion_probabilities,
            "bot_response": bot_response
        }
        return response_data

    except Exception as e:
        print("오류 발생:", e)
        return {"error": "서버 오류 발생", "details": str(e)}

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