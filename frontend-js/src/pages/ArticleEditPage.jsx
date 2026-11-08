import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
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
import { Label } from '@/components/ui/label';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { PenLine, BarChart2, ArrowLeft, CheckCircle2 } from 'lucide-react';
import { toast } from 'sonner';

const ArticleEditPage = () => {
  const { id } = useParams(); // URL의 게시글 ID
  const navigate = useNavigate();
  // 초기값
  const [formData, setFormData] = useState({
    subject: '',
    content: '',
    category: 'FREE',
    pythonAnalysisId: null,
  });

  const [selectedAnalysisDetail, setSelectedAnalysisDetail] = useState(null);
  const [analysisList, setAnalysisList] = useState([]);
  const [loading, setLoading] = useState(false);

  // 1. 기존 데이터 로드
  useEffect(() => {
    const initData = async () => {
      try {
        const [analysisRes, articleData] = await Promise.all([
          articleApi.getUserAnalyses(),
          articleApi.getArticleDetail(id),
        ]);

        setAnalysisList(analysisRes.data);
        setFormData({
          subject: articleData.subject,
          content: articleData.content,
          category: articleData.category,
          pythonAnalysisId: articleData.pythonAnalysisId, // 기존 분석 결과 유지
        });
        if (articleData.pythonAnalysisId) {
          fetchAnalysisDetail(articleData.pythonAnalysisId);
        }
      } catch (err) {
        alert('데이터를 불러오지 못했습니다.');
      } finally {
        setLoading(false);
      }
    };
    initData();
  }, [id]);

  const fetchAnalysisDetail = async (uuid) => {
    try {
      const response = await fetch(
        `http://${window.location.hostname}:8000/api/analysis/${uuid}`,
      );
      const result = await response.json();
      if (result.status === 'success') {
        setSelectedAnalysisDetail(result.data);
      }
    } catch (err) {
      console.error('분석 상세 조회 실패:', err);
    }
  };

  const handleAnalysisChange = async (e) => {
    const selectedUuid = e.target.value;
    setFormData({ ...formData, pythonAnalysisId: selectedUuid });

    if (selectedUuid) {
      fetchAnalysisDetail(selectedUuid);
    } else {
      setSelectedAnalysisDetail(null);
    }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      await articleApi.updateArticle(id, formData);
      alert('수정되었습니다.');
      navigate(`/articles/${id}`);
    } catch (err) {
      alert('수정 실패: ' + (err.response?.data?.message || '서버 오류'));
    }
  };

  if (loading) return <div className="text-center py-10">로딩 중...</div>;

  return (
    <div className="max-w-4xl mx-auto py-20 px-6 animate-in fade-in duration-500">
      <div className="flex items-center gap-4 mb-12">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => navigate(-1)}
          className="rounded-full hover:bg-slate-100"
        >
          <ArrowLeft className="w-6 h-6" />
        </Button>
        <div>
          <h1 className="text-4xl font-black tracking-tight text-slate-900 flex items-center gap-3">
            <PenLine className="w-8 h-8 text-primary" /> 게시글 수정
          </h1>
          <p className="text-slate-500 mt-1">
            작성하신 내용을 자유롭게 수정하세요.
          </p>
        </div>
      </div>

      <form onSubmit={handleUpdate} className="space-y-10">
        <div className="space-y-4">
          <Label className="text-lg font-bold">카테고리</Label>
          <Tabs
            value={formData.category}
            onValueChange={(val) => setFormData({ ...formData, category: val })}
            className="w-full"
          >
            <TabsList className="grid w-full grid-cols-2 h-14 rounded-2xl p-1.5 bg-slate-100">
              <TabsTrigger value="FREE" className="rounded-xl font-bold">
                자유게시판
              </TabsTrigger>
              <TabsTrigger value="ANALYSIS" className="rounded-xl font-bold">
                분석 리포트 공유
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        {formData.category === 'ANALYSIS' && (
          <div className="space-y-4 p-8 rounded-[2rem] bg-indigo-50/50 border border-indigo-100 animate-in slide-in-from-top-2">
            <Label className="text-indigo-900 font-bold flex items-center gap-2">
              <BarChart2 className="w-5 h-5" /> 공유할 분석 결과 선택
            </Label>

            <Select
              onValueChange={handleAnalysisChange}
              value={formData.pythonAnalysisId || ''}
            >
              <SelectTrigger className="h-14 rounded-xl bg-white border-none shadow-sm text-lg text-slate-700">
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

            {selectedAnalysisDetail && (
              <div className="mt-8 p-6 bg-white rounded-2xl shadow-sm border border-indigo-100 animate-in zoom-in-95">
                <AnalysisChart data={selectedAnalysisDetail.analysisData} />
              </div>
            )}
          </div>
        )}

        <div className="space-y-8">
          <div className="space-y-2">
            <Label htmlFor="subject" className="text-lg font-bold">
              제목
            </Label>
            <Input
              id="subject"
              placeholder="제목을 입력하세요"
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
        {/* Buttons */}
        <div className="flex gap-4 pt-4">
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
            className="flex-2 h-14 rounded-2xl text-lg font-bold shadow-xl shadow-primary/20 bg-primary hover:bg-primary/90"
          >
            <CheckCircle2 className="w-5 h-5 mr-2" /> 수정 완료
          </Button>
        </div>
      </form>
    </div>
  );
};

export default ArticleEditPage;
