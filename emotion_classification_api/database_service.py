import os
from sqlalchemy import create_engine
from dotenv import load_dotenv

load_dotenv()

DB_HOST = os.getenv("DB_HOST")
DB_PORT = os.getenv("DB_PORT")
DB_USER = os.getenv("DB_USER")
DB_PASSWORD = os.getenv("DB_PASSWORD")
DB_NAME = os.getenv("DB_NAME")

db_url = f"mysql+pymysql://{DB_USER}:{DB_PASSWORD}@{DB_HOST}:{DB_PORT}/{DB_NAME}"
engine = create_engine(db_url)

def get_user_preference(user_email):
    try:
        with engine.connect() as connection:
            result = connection.execute(
                "SELECT chatbot_type FROM user_tb WHERE user_email = %s", (user_email,)
            ).fetchone()
            return result[0] if result else None
    except Exception as e:
        print(f"Error in get_user_preference: {e}")
        return None

def get_diary_info(user_email):
    try:
        with engine.connect() as connection:
            result = connection.execute(
                "SELECT created_at, diary_content, emotion_tag FROM diary_tb WHERE user_email = %s", (user_email,)
            ).fetchall()
            diary_entries = [
                f"작성일: {entry[0]}, 내용: {entry[1]}, 감정 태그: {entry[2]}" for entry in result
            ]
            return "\n".join(diary_entries)
    except Exception as e:
        print(f"Error in get_diary_info: {e}")
        return "No diary entries available."

def get_chat_history(croom_idx, session_idx):
    try:
        with engine.connect() as connection:
            result = connection.execute(
                "SELECT chatter, chat_content FROM chatting_tb WHERE croom_idx = %s AND session_idx = %s",
                (croom_idx, session_idx)
            ).fetchall()
            return [(row['chatter'], row['chat_content']) for row in result]
    except Exception as e:
        print(f"Error in get_chat_history: {e}")
        return []
