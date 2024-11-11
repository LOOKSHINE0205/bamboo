import os
from sqlalchemy import create_engine
from dotenv import load_dotenv

# .env 파일 로드
load_dotenv()

# 환경 변수에서 데이터베이스 연결 정보 가져오기
DB_HOST = os.getenv("DB_HOST")
DB_PORT = os.getenv("DB_PORT")
DB_USER = os.getenv("DB_USER")
DB_PASSWORD = os.getenv("DB_PASSWORD")
DB_NAME = os.getenv("DB_NAME")

db_url = f"mysql+pymysql://{DB_USER}:{DB_PASSWORD}@{DB_HOST}:{DB_PORT}/{DB_NAME}"
engine = create_engine(db_url)

# 사용자 선호 답변 스타일 가져오기 함수
def get_user_preference(user_email):
    with engine.connect() as connection:
        result = connection.execute(
            "SELECT chatbot_type FROM user_tb WHERE user_email = %s", (user_email,)
        ).fetchone()
        return result[0] if result else None

# 사용자 일기 정보 가져오기 함수
def get_diary_info(user_email):
    with engine.connect() as connection:
        result = connection.execute(
            "SELECT created_at, diary_content, emotion_tag FROM diary_tb WHERE user_email = %s", (user_email,)
        ).fetchall()
        diary_entries = [
            f"작성일: {entry[0]}, 내용: {entry[1]}, 감정 태그: {entry[2]}" for entry in result
        ]
        return "\n".join(diary_entries)

# 채팅 내역 가져오기 함수
def get_chat_history(croom_idx, session_idx):
    with engine.connect() as connection:
        result = connection.execute(
            "SELECT chatter, chat_content FROM chatting_tb WHERE croom_idx = %s AND session_idx = %s",
            (croom_idx, session_idx)
        ).fetchall()
        return result
