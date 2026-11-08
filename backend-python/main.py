import json
import uvicorn
from fastapi import FastAPI, Body, HTTPException
from pydantic import BaseModel
from fastapi.middleware.cors import CORSMiddleware
from analyzer import NewsPipeline
from database import PyToMySQL

app = FastAPI()

origins = ["http://localhost:5173", "http://192.168.0.66:5173"]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

pipeline = NewsPipeline()


class AnalysisRequest(BaseModel):
    url: str
    loginId: str


@app.get("/")
def read_root():
    return {"message": "FastAPI Server is Running"}


@app.post("/api/analysis")
async def create_analysis(request: AnalysisRequest):
    """
    프론트엔드에서 URL을 받아 전체 분석 프로세스를 실행하고
    시각화에 필요한 데이터를 즉시 반환함
    """
    llm_result = (
        "AI 요약을 생성할 수 없습니다."  # 토큰 문제로 인해 LLM 결과는 임시 비활성화
    )
    try:
        raw_data = pipeline.step1_crawl(request.url, request.loginId)
        if not raw_data:
            raise HTTPException(status_code=400, detail="크롤링 실패")

        clean_data = pipeline.step2_preprocess(raw_data)

        bias_data = pipeline.step3_analyze_bias(clean_data)

        # 토큰 문제 때문에 임시 비활성화
        final_data = pipeline.step4_llm_comment(bias_data)
        llm_result = final_data["llm_analysis"]

        analysis_data = [
            {"name": label, "value": score}
            for label, score in bias_data["bias_scores"].items()
        ]

        return {
            "status": "success",
            "uuid": bias_data["uuid"],
            "title": raw_data["title"],
            "analysisData": analysis_data,
            "llmAnalysis": llm_result,
            "url": request.url,
        }

    except Exception as e:
        print(f"AnalysisError: {str(e)}")
        raise HTTPException(status_code=500, detail=f"분석 중 오류 발생: {str(e)}")


@app.get("/api/analysis/{uuid}")
async def get_analysis(uuid: str):
    """
    Spring 서버나 상세 페이지에서 특정 UUID로 데이터를 조회할 때 사용
    """
    db = PyToMySQL()
    try:
        db.connect()
        sql = "SELECT data FROM bias_analysis_summary WHERE uuid = %s"
        db.cursor.execute(sql, (uuid,))
        row = db.cursor.fetchone()
        if not row:
            return {"status": "error", "message": "데이터를 찾을 수 없습니다."}
        bias_scores = json.loads(row[0])

        analysis_data = [
            {"name": label, "value": score} for label, score in bias_scores.items()
        ]
        sql_llm = "SELECT title FROM analysis_result WHERE uuid = %s"
        db.cursor.execute(sql_llm, (uuid,))
        title = db.cursor.fetchone()
        if title:
            title = title[0]
        else:
            title = "데이터를 찾을 수 없습니다."

        return {
            "status": "success",
            "data": {
                "uuid": uuid,
                "title": title,
                "analysisData": analysis_data,
                "llmAnalysis": "데이터 기반 ai 코멘트",  # LLM 분석 결과는 별도 조회 필요
            },
        }

    except Exception as e:
        raise HTTPException(status_code=404, detail="데이터를 찾을 수 없습니다.")
    finally:
        db.conn.close()


@app.get("/api/analysis/my-list/{loginId}")
async def get_my_analysis_list(loginId: str):
    """
    특정 사용자의 분석 목록을 조회
    """
    db = PyToMySQL()
    try:
        db.connect()
        sql = "SELECT uuid, title FROM scraped_raw_data WHERE login_id = %s ORDER BY created_at DESC"
        db.cursor.execute(sql, (loginId,))
        rows = db.cursor.fetchall()

        return [{"uuid": row[0], "title": row[1]} for row in rows]
    except Exception as e:
        raise HTTPException(
            status_code=500, detail=f"사용자 분석 목록 조회 중 오류 발생: {str(e)}"
        )
    finally:
        db.conn.close()


if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)
