import json
import os
import re
import time
import requests
import datetime
import uuid
from bs4 import BeautifulSoup
import torch
from transformers import AutoTokenizer, AutoModelForSequenceClassification, pipeline
from openai import OpenAI  # pip install openai
from dotenv import load_dotenv


from pathlib import Path
from huggingface_hub import login, hf_hub_download

# pip install requests notebook beautifulsoup4 transformers[torch] pandas tqdm openai
from database import PyToMySQL

env_path = Path(__file__).resolve().parent / ".env"
load_dotenv(dotenv_path=env_path)

# --- 설정 및 초기화 ---
hf_token = os.getenv("HUGGINGFACE_TOKEN")
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")
# openai.api_key = OPENAI_API_KEY

print(f"[*] 토큰 로드 상태: {'성공' if hf_token else '실패 (None)'}")


class NewsPipeline:
    def __init__(self):
        # 1. 환경변수 확인
        if not hf_token:
            raise ValueError(".env 파일에 HUGGINGFACE_TOKEN이 없습니다!")

        login(token=hf_token)
        # 2. DB 및 OpenAI 초기화
        self.db = PyToMySQL()
        self.client = OpenAI(api_key=OPENAI_API_KEY)

        # 3. 장치(Device) 설정 (한 번만 수행)
        current_dir = os.path.dirname(os.path.abspath(__file__))
        model_path = os.path.join(current_dir, "saved_model")
        device = 0 if torch.cuda.is_available() else -1

        # 4. 허깅페이스 모델 로드
        try:
            print(f"[*] 로컬 모델 로딩 중: {model_path} (Device: {device})")
            # 토크나이저와 모델 로드
            tokenizer = AutoTokenizer.from_pretrained(
                model_path, trust_remote_code=True, local_files_only=True
            )
            model = AutoModelForSequenceClassification.from_pretrained(
                model_path, trust_remote_code=True, local_files_only=True
            )

            # 파이프라인 구성
            self.bias_pipe = pipeline(
                "text-classification",
                model=model,
                tokenizer=tokenizer,
                device=device,
                top_k=None,
            )
            print("[*] 허깅페이스 모델 로드 완료!")

        except Exception as e:
            print(f"[!] 모델 로드 중 상세 에러 발생: {e}")
            # 에러가 나면 서버 실행이 중단되도록 하려면 raise e를 추가하세요.

    # DB 연동 함수로 대체할 예정
    def save_to_json(self, data, step_name):
        # 1. 현재 날짜와 시간 생성
        timestamp = datetime.datetime.now().strftime("%Y%m%d_%H%M%S")

        # 2. 짧은 고유 ID 생성 (중복 방지)
        unique_id = str(uuid.uuid4())[:8]

        # 3. 파일명 조립
        filename = f"{step_name}_{timestamp}_{unique_id}.json"

        # 저장 경로 설정 (output 폴더가 없다면 생성)
        if not os.path.exists("output"):
            os.makedirs("output")

        filepath = os.path.join("output", filename)

        with open(filepath, "w", encoding="utf-8") as f:
            json.dump(data, f, ensure_ascii=False, indent=4)

        print(f"[*] 데이터가 성공적으로 저장되었습니다: {filepath}")

        # [DB 저장 주석 예시]
        # self.db.insert(table=step_name, content=data,       file_ref=filename)
        return filepath

    # 1단계: 크롤링 (이미지 추출 등 생략, 텍스트 중심)
    # url은 자바 서버에서 받아온다
    def step1_crawl(self, url, login_id):
        headers = {
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/110.0.0.0 Safari/537.36"
        }

        try:
            # 뉴스 페이지 요청
            response = requests.get(url, headers=headers)
            response.raise_for_status()  # 200 OK가 아니면 에러 발생

            soup = BeautifulSoup(response.text, "html.parser")

            # 1. 제목 추출 (클래스명 기반)
            title_element = soup.select_one(".media_end_head_headline")
            title = (
                title_element.get_text(strip=True)
                if title_element
                else "제목을 찾을 수 없음"
            )

            # 2. 본문 추출 (네이버 뉴스 표준 본문 ID)
            # #newsct_article은 인링크 기사의 표준 본문 영역임
            content_element = soup.select_one("#newsct_article")
            if not content_element:
                # 구형 페이지 레이아웃 대응용 보조 선택자
                content_element = soup.select_one("#articleBodyContents")

            raw_content = (
                content_element.get_text(strip=True) if content_element else ""
            )

            # 기사 고유 ID 추출 (URL에서 숫자만 파싱하거나 uuid 사용)
            news_id = url.split("/")[-1] if "/" in url else "unknown"

            raw_data = {
                "id": news_id,
                "url": url,
                "title": title,
                "raw_content": raw_content,
            }
            # 앞서 만든 자동 파일명 생성 저장 함수 호출
            # self.save_to_json(raw_data, "step1_raw")

            # db 저장 임시
            data = json.dumps(raw_data, ensure_ascii=False)
            analysis_uuid = str(uuid.uuid4())[:8]
            self.db.insert_data(
                "scraped_raw_data", analysis_uuid, data, title, login_id
            )

            # 연속 크롤링 시 차단 방지를 위한 짧은 휴식 (1~2초)
            time.sleep(1)

            raw_data["uuid"] = analysis_uuid

            return raw_data

        except Exception as e:
            print(f"[!] 크롤링 중 오류 발생 ({url}): {e}")
            return None

    # 2단계: 전처리
    def step2_preprocess(self, raw_data):
        text = raw_data["raw_content"]
        # 이메일, 특수문자, 불필요 공백 제거
        text = re.sub(r"[a-zA-Z0-9+-_.]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+", "", text)
        text = re.sub(r"[^가-힣0-9a-zA-Z\s.,!?]", "", text)
        cleaned_text = re.sub(r"\s+", " ", text).strip()

        processed_data = raw_data.copy()
        processed_data["cleaned_content"] = cleaned_text
        # self.save_to_json(processed_data, "step2_processed.json")

        # data = json.dumps(precessed_data['cleaned_content'])
        self.db.insert_data("refind_content", raw_data["uuid"], cleaned_text)

        return processed_data

    # 3단계: 허깅페이스 편향성 분석
    def step3_analyze_bias(self, processed_data):
        text = processed_data["cleaned_content"]
        # BERT 모델 제한으로 문장 쪼개기 (앞부분 5문장 기준)
        sentences = [s.strip() for s in text.split(".") if len(s) > 10][:5]

        results = self.bias_pipe(sentences)

        print(f"\n--- [DEBUG] 모델 원본 결과 ---")
        # 유의미한 편향 라벨만 추출 (점수 0.6 이상)
        bias_summary = {}
        for res in results:
            for label_info in res:
                label = label_info["label"]
                score = label_info["score"]

                # 'clean'은 차트 수치에서 제외 (너무 압도적이라 차트 왜곡 방지)
                if label == "clean":
                    continue

                # 문장별로 나온 편향 점수 중 최댓값을 누적 (또는 평균)
                if label not in bias_summary or score > bias_summary[label]:
                    bias_summary[label] = round(score, 4)

        # 점수 순으로 정렬하여 상위 3개만 추출 (선택 사항)
        top_bias = dict(
            sorted(bias_summary.items(), key=lambda x: x[1], reverse=True)[:3]
        )

        bias_data = processed_data.copy()
        bias_data["bias_scores"] = bias_summary
        # self.save_to_json(bias_data, "step3_bias.json")

        data = json.dumps(bias_data["bias_scores"])
        self.db.insert_data("bias_analysis_summary", processed_data["uuid"], data)

        return bias_data

    # 4단계: LLM 코멘트 생성 (OpenAI API 활용)
    def step4_llm_comment(self, bias_data):
        # 3단계 결과가 없으면 클린한 기사로 간주
        bias_labels = (
            ", ".join(bias_data["bias_scores"].keys())
            if bias_data["bias_scores"]
            else "없음(중립)"
        )

        prompt = f"""
        뉴스 제목: {bias_data['title']}
        검출된 편향 카테고리: {bias_labels}
        
        위 데이터는 AI 모델이 분석한 뉴스의 성향입니다. 
        이 기사의 전반적인 편향성에 대해 독자가 주의해야 할 점을 1~2문장으로 짧게 비평해줘.
        """

        # GPT-4o-mini 사용 (토큰 비용 절감)
        # response = self.client.chat.completions.create(
        #    model="gpt-4o-mini", messages=[{"role": "user", "content": prompt}]
        # )

        # comment = response.choices[0].message.content
        comment = "llm_comment는 준비중입니다.(토큰 문제로 비활성화)"
        final_data = bias_data.copy()
        final_data["llm_analysis"] = comment

        # self.save_to_json(final_data, "step4_final.json")

        data = json.dumps(final_data["llm_analysis"])
        # unique_id = str(uuid.uuid4())[:8]
        self.db.insert_data(
            "analysis_result", bias_data["uuid"], data, title=bias_data["title"]
        )

        return final_data


# --- 실행 프로세스 ---
# pipeline = NewsPipeline()

# 1. 크롤링 매개변수로 링크입력 나중엔 웹에서 인풋 받은 거 db에 저장하고 그거 가져올 거임
# raw = pipeline.step1_crawl("https://n.news.naver.com")
# 2. 전처리
# clean = pipeline.step2_preprocess(raw)
# 3. 모델 분석 (로컬 PC 구동)
# bias = pipeline.step3_analyze_bias(clean)
# 4. LLM 코멘트 (API 호출)
# final = pipeline.step4_llm_comment(bias)
# print("\n[최종 비평]:", final['llm_comment'])
