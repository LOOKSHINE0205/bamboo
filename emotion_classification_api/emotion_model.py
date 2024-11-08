import torch
import torch.nn.functional as F
from transformers import AutoTokenizer, ElectraForSequenceClassification

# 모델과 토크나이저 로드
model_path = "/saved_model_optuna_optimaize"
tokenizer = AutoTokenizer.from_pretrained(model_path)
model = ElectraForSequenceClassification.from_pretrained(model_path)

# 감정 라벨 목록 정의
emotion_labels = ["공포", "놀람", "분노", "슬픔", "중립", "행복", "혐오"]

# 감정 예측 함수 정의
def predict_with_probabilities(text):
    # 입력 텍스트 토큰화
    encoding = tokenizer(
        text,
        max_length=128,
        padding="max_length",
        truncation=True,
        return_tensors="pt"
    )
    # 모델을 평가 모드로 설정
    model.eval()

    # 예측 수행
    with torch.no_grad():
        outputs = model(
            input_ids=encoding["input_ids"],
            attention_mask=encoding["attention_mask"]
        )

    # 로짓(logits) 출력 및 소프트맥스를 사용한 확률 계산
    logits = outputs.logits
    probabilities = F.softmax(logits, dim=-1).squeeze().cpu().numpy()

    # 각 라벨에 대한 확률 매핑
    label_probs = {label: float(prob) for label, prob in zip(emotion_labels, probabilities)}
    return label_probs
