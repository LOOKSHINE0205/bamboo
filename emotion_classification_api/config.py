# config.py
import os

# 스크립트의 위치를 기준으로 static 디렉토리 경로 설정
script_dir = os.path.dirname(os.path.abspath(__file__))
static_dir = os.path.join(script_dir, "static")
