import { aiApi } from './axios';

const analysisApi = {
  // 뉴스 URL 분석 요청
  analyzeUrl: async (url) => {
    // FastAPI 응답 구조: { status, uuid, title, analysisData, llmAnalysis, url }
    const response = await aiApi.post('/analysis', { url });
    return response.data;
  },
};

export default analysisApi;
