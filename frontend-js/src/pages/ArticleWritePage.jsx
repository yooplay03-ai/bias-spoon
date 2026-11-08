import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import articleApi from '../api/articles';
import AnalysisChart from '../components/analysis/AnalysisChart';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { PenLine, BarChart2, ArrowLeft, CheckCircle2 } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '../context/AuthContext';

const ArticleWritePage = () => {
  const { user } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    subject: '',
    content: '',
    category: 'FREE',
    pythonAnalysisId: null,
  });

  const [analysisList, setAnalysisList] = useState([]);
  const [selectedAnalysisDetail, setSelectedAnalysisDetail] = useState(null);
  const [loading, setLoading] = useState(false);

  // 분석 결과 페이지에서 넘어왔을 경우 자동 세팅
  useEffect(() => {
    if (location.state?.analysisResult) {
      const res = location.state.analysisResult;
      const analysisId = res.pythonAnalysisId || res.uuid;

      setFormData((prev) => ({
        ...prev,
        category: 'ANALYSIS',
        pythonAnalysisId: analysisId,
      }));
      setSelectedAnalysisDetail(res);
    }
  }, [location]);

  useEffect(() => {
    if (formData.category === 'ANALYSIS') {
      fetchAnalysisList();
    }
  }, [formData.category]);

  const fetchAnalysisList = async () => {
    setLoading(true);
    try {
      const response = await articleApi.getUserAnalysis(user.loginId);
      setAnalysisList(response.data);
      console.log('분석 목록:', response.data);
    } catch (err) {
      console.error('분석 목록 조회 실패:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAnalysisChange = async (uuid) => {
    setFormData((prev) => ({ ...prev, pythonAnalysisId: uuid }));

    try {
      const response = await fetch(
        `http://${window.location.hostname}:8000/api/analysis/${uuid}`,
      );
      const result = await response.json();

      if (result.status === 'success') {
        setSelectedAnalysisDetail({
          ...result.data,
        });
      } else {
        console.error('데이터 없음:', result.message);
      }
    } catch (err) {
      console.error('FastAPI 호출 에러:', err);
    }
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await articleApi.createArticle(formData);

      toast.success('게시글이 등록되었습니다!', {
        description: '커뮤니티에서 방금 쓴 글을 확인해보세요.',
      });

      navigate('/articles');
    } catch (err) {
      console.error(err);
      toast.error('등록에 실패했습니다.', {
        description: '입력 내용을 다시 확인해주세요.',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto py-20 px-6 animate-in fade-in duration-500">
      <Button
        variant="ghost"
        onClick={() => navigate(-1)}
        className="mb-8 group text-slate-500 hover:text-slate-900"
      >
        <ArrowLeft className="mr-2 w-4 h-4 transition-transform group-hover:-translate-x-1" />
        뒤로가기
      </Button>

      <div className="flex items-center gap-3 mb-10">
        <div className="p-3 bg-primary/10 rounded-2xl">
          <PenLine className="w-8 h-8 text-primary" />
        </div>
        <h1 className="text-4xl font-black tracking-tight">새 게시글 작성</h1>
      </div>

      <form onSubmit={onSubmit} className="space-y-10">
        {/* 카테고리 선택 (Tabs 스타일) */}
        <div className="space-y-4">
          <Label className="text-lg font-bold">카테고리</Label>
          <Tabs
            value={formData.category}
            onValueChange={(val) => setFormData({ ...formData, category: val })}
            className="w-full"
          >
            <TabsList className="grid w-full grid-cols-2 h-14 rounded-2xl p-1.5 bg-slate-100">
              <TabsTrigger
                value="FREE"
                className="rounded-xl font-bold data-[state=active]:bg-white data-[state=active]:shadow-sm"
              >
                자유게시판
              </TabsTrigger>
              <TabsTrigger
                value="ANALYSIS"
                className="rounded-xl font-bold data-[state=active]:bg-white data-[state=active]:shadow-sm"
              >
                분석 리포트 공유
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        {/* 분석 결과 선택 섹션 */}
        {formData.category === 'ANALYSIS' && (
          <div className="space-y-4 p-8 rounded-[2rem] bg-indigo-50/50 border border-indigo-100 animate-in slide-in-from-top-2">
            <Label className="text-indigo-900 font-bold flex items-center gap-2">
              <BarChart2 className="w-5 h-5" /> 공유할 분석 결과 선택
            </Label>
            <Select
              onValueChange={handleAnalysisChange}
              value={formData.pythonAnalysisId || ''}
            >
              <SelectTrigger className="h-14 rounded-xl bg-white border-none shadow-sm text-lg">
                <SelectValue placeholder="이전 분석 기록을 선택하세요" />
              </SelectTrigger>
              <SelectContent className="rounded-xl">
                {analysisList.map((analysis) => (
                  <SelectItem key={analysis.uuid} value={analysis.uuid}>
                    {analysis.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {selectedAnalysisDetail && selectedAnalysisDetail.analysisData && (
              <div className="mt-8">
                <AnalysisChart data={selectedAnalysisDetail.analysisData} />
                <div className="mt-6 p-6 bg-slate-50 rounded-2xl border border-slate-100 italic text-slate-600">
                  "
                  {selectedAnalysisDetail.llmAnalysis ||
                    'AI 분석 코멘트를 불러오는 중입니다.'}
                  "
                </div>
              </div>
            )}
          </div>
        )}

        {/* 제목 및 본문 입력 */}
        <div className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="subject" className="text-lg font-bold">
              제목
            </Label>
            <Input
              id="subject"
              placeholder="게시글 제목을 입력하세요"
              value={formData.subject}
              onChange={(e) =>
                setFormData({ ...formData, subject: e.target.value })
              }
              className="h-14 text-xl font-bold rounded-2xl border-slate-200 focus-visible:ring-primary/20"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="content" className="text-lg font-bold">
              내용
            </Label>
            <Textarea
              id="content"
              placeholder="내용을 입력하세요..."
              rows={12}
              value={formData.content}
              onChange={(e) =>
                setFormData({ ...formData, content: e.target.value })
              }
              className="rounded-[2rem] p-6 text-lg border-slate-200 focus-visible:ring-primary/20 resize-none"
              required
            />
          </div>
        </div>

        <div className="flex gap-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => navigate(-1)}
            className="flex-1 h-14 rounded-2xl text-lg font-bold"
          >
            취소
          </Button>
          <Button
            type="submit"
            className="flex-2 h-14 rounded-2xl text-lg font-bold shadow-xl shadow-primary/20"
          >
            게시글 등록하기
          </Button>
        </div>
      </form>
    </div>
  );
};

export default ArticleWritePage;
