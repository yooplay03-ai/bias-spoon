import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { aiApi } from '../api/axios';
import AnalysisChart from '../components/analysis/AnalysisChart';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, Search, Share2 } from 'lucide-react'; // 아이콘 활용
import { useAuth } from '../context/AuthContext';

const AnalysisPage = () => {
  const { user } = useAuth();
  const [url, setUrl] = useState('');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const onAnalyze = async (e) => {
    if (e) e.preventDefault();
    if (!url) return;

    setLoading(true);
    try {
      // const loginid = localStorage.getItem('loginId') || 'anonymous';
      const loginid = user.loginId || 'anonymous';
      const response = await aiApi.post('/analysis', { url, loginId: loginid });
      setResult(response.data);
    } catch (err) {
      console.error('Analysis failed:', err);
      alert('분석에 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="max-w-4xl mx-auto py-20 px-6 space-y-16">
      {/* 헤더 섹션 */}
      <div className="text-center space-y-4 animate-in fade-in slide-in-from-top-4 duration-700">
        <h1 className="text-6xl font-black tracking-tighter text-foreground italic">
          Truth <span className="text-primary italic">Lens</span>
        </h1>
        <p className="text-xl text-muted-foreground font-medium">
          뉴스의 이면을 AI로 투명하게 분석합니다.
        </p>
      </div>

      {/* 입력창 섹션 (글래스모피즘) */}
      <section className="p-1 rounded-3xl bg-white/30 backdrop-blur-2xl border border-border shadow-2xl shadow-primary/5 transition-all focus-within:shadow-primary/10">
        <form onSubmit={onAnalyze} className="flex gap-2">
          <div className="flex-1 flex items-center px-4 gap-3">
            <Search className="text-muted-foreground w-6 h-6" />
            <Input
              className="h-16 text-xl border-none bg-transparent shadow-none focus-visible:ring-0 placeholder:text-muted-foreground/60"
              placeholder="뉴스 기사 URL을 입력하세요..."
              value={url}
              onChange={(e) => setUrl(e.target.value)}
            />
          </div>
          <Button
            disabled={loading}
            size="xl"
            className="h-16 px-10 rounded-2xl text-lg font-bold"
          >
            {loading ? (
              <Loader2 className="mr-2 h-5 w-5 animate-spin" />
            ) : (
              '분석하기'
            )}
          </Button>
        </form>
      </section>

      {/* 결과 섹션 (벤토 그리드 느낌) */}
      {result && (
        <div className="grid gap-8 animate-in fade-in zoom-in-95 duration-500">
          <Card className="border-none shadow-2xl rounded-[2.5rem] overflow-hidden">
            <CardHeader className="bg-primary text-primary-foreground p-10">
              <CardTitle className="text-3xl font-bold leading-tight tracking-tight">
                {result.title}
              </CardTitle>
            </CardHeader>
            <CardContent className="p-10 space-y-10">
              {/* 차트 영역 */}
              <div className="bg-secondary/50 rounded-[2rem] p-8 border border-border/50">
                <AnalysisChart data={result.analysisData} />
              </div>

              {/* AI 총평 영역 */}
              <div className="relative p-8 bg-primary/5 rounded-[2rem] border border-primary/10">
                <div className="absolute -top-4 left-8 bg-primary text-primary-foreground px-4 py-1 rounded-full text-xs font-black tracking-widest uppercase">
                  AI Commentary
                </div>
                <p className="text-xl text-foreground leading-relaxed italic font-medium">
                  "{result.llmAnalysis}"
                </p>
              </div>

              <Button
                onClick={() =>
                  navigate('/articles/write', {
                    state: { analysisResult: result },
                  })
                }
                className="w-full h-16 text-xl rounded-2xl gap-3"
                variant="outline"
              >
                <Share2 className="w-5 h-5" />
                분석 리포트 공유하기
              </Button>
            </CardContent>
          </Card>
        </div>
      )}
    </main>
  );
};

export default AnalysisPage;
