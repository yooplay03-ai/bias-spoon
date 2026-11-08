import React, { useEffect, useRef, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import articleApi from '../api/articles';
import AnalysisChart from '../components/analysis/AnalysisChart';
import CommentSection from '../components/articles/CommentSection';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils'; // cn 추가
import { Heart, Share2, Trash2, Edit3, BarChart2 } from 'lucide-react'; // BarChart2 추가

const ArticleDetailPage = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [article, setArticle] = useState(null);
  const [likedByMe, setLikedByMe] = useState(false);
  const [articleLikeCount, setArticleLikeCount] = useState(0);
  const [analysisDetail, setAnalysisDetail] = useState(null);
  const { user } = useAuth();

  const fetchDetail = async (pageNum = 0) => {
    try {
      const data = await articleApi.getArticleDetail(id, pageNum);

      if (data) {
        if (typeof data.analysisData === 'string') {
          try {
            data.analysisData = JSON.parse(data.analysisData);
          } catch (err) {
            console.error('JSON 파싱 에러:', err);
          }
        }
        setArticle(data);
        setLikedByMe(data.likedByMe);
        setArticleLikeCount(data.articleLikeCount);
      }
    } catch (err) {
      console.error('Failed to fetch article detail:', err);
    }
  };

  const fetchAnalysisFromFastAPI = async (uuid) => {
    try {
      const response = await fetch(
        `http://${window.location.hostname}:8000/api/analysis/${uuid}`,
      );
      const result = await response.json();
      if (result.status === 'success') {
        setAnalysisDetail(result.data);
        console.log('분석 상세:', result.data);
      }
    } catch (err) {
      console.error('Failed to fetch analysis detail:', err);
    }
  };

  useEffect(() => {
    fetchDetail();
  }, [id]);

  useEffect(() => {
    if (article && article.category === 'ANALYSIS') {
      fetchAnalysisFromFastAPI(article.pythonAnalysisId);
    }
  }, [article]);

  const handleLikeToggle = async () => {
    if (!user) return alert('로그인이 필요합니다.');
    try {
      const response = likedByMe
        ? await articleApi.removelike(id)
        : await articleApi.addlike(id);
      setLikedByMe(response.likedByMe);
      setArticleLikeCount(response.articleLikeCount);
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('정말로 삭제하시겠습니까?')) return;
    try {
      await articleApi.deleteArticle(id);
      navigate('/articles');
    } catch (err) {
      alert('삭제 실패');
    }
  };

  if (!article)
    return <div className="flex justify-center py-20">로딩 중...</div>;
  return (
    <main className="max-w-4xl mx-auto py-20 px-6">
      <header className="space-y-6 mb-12">
        <div className="flex items-center gap-3">
          <Badge className="bg-primary/10 text-primary border-none px-4 py-1 rounded-full font-bold">
            {article.category}
          </Badge>
          <span className="text-sm text-muted-foreground">
            {new Date(article.createdAt).toLocaleString()}
          </span>
        </div>

        <h1 className="text-5xl font-black tracking-tighter leading-tight text-slate-900">
          {article.subject}
        </h1>

        <div className="flex justify-between items-center pt-4 border-b border-slate-100 pb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-slate-900 text-white flex items-center justify-center font-bold">
              {article.userNickName[0]}
            </div>
            <span className="font-bold text-slate-700">
              {article.userNickName}
            </span>
          </div>

          {(user?.loginId === article.loginId || user?.role === 'ADMIN') && (
            <div className="flex gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate(`/articles/edit/${id}`)}
                className="rounded-full"
              >
                <Edit3 className="w-4 h-4 mr-2" /> 수정
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleDelete}
                className="rounded-full text-destructive hover:text-destructive"
              >
                <Trash2 className="w-4 h-4 mr-2" /> 삭제
              </Button>
            </div>
          )}
        </div>
      </header>

      {article.category === 'ANALYSIS' && (
        <section className="mb-16 p-1 rounded-[2.5rem] bg-linear-to-br from-indigo-500 to-purple-600 shadow-2xl">
          <div className="bg-white/95 backdrop-blur-sm rounded-[2.4rem] p-10">
            <h3 className="text-xl font-black mb-8 flex items-center gap-2">
              <BarChart2 className="text-indigo-600" /> 분석 리포트
            </h3>
            <div className="text-xl font-black mb-8 flex items-center gap-2">
              {analysisDetail?.title}
            </div>
            {!analysisDetail ? (
              <div className="flex h-64 items-center justify-center text-slate-400 animate-pulse">
                분석 데이터를 불러오는 중입니다...
              </div>
            ) : analysisDetail.analysisData &&
              analysisDetail.analysisData.length > 0 ? (
              <AnalysisChart data={analysisDetail.analysisData} />
            ) : (
              <div className="flex h-full items-center justify-center text-slate-400">
                데이터를 표시할 수 없습니다.
              </div>
            )}
            <div className="mt-10 p-8 bg-slate-50 rounded-3xl border border-slate-100 italic text-lg text-slate-600">
              "{analysisDetail?.llmAnalysis || '분석 코멘트가 없습니다.'}"
            </div>
          </div>
        </section>
      )}

      <article className="prose prose-slate max-w-none text-xl leading-loose text-slate-800 mb-20 whitespace-pre-wrap">
        {article.content}
      </article>

      <div className="flex justify-center gap-6 py-12 border-t border-slate-100">
        <Button
          variant={likedByMe ? 'default' : 'outline'}
          size="xl"
          onClick={handleLikeToggle}
          className={cn(
            'rounded-full px-10 gap-3 h-16 text-lg font-bold transition-all',
            likedByMe
              ? 'bg-red-500 hover:bg-red-600 border-none shadow-lg shadow-red-200'
              : '',
          )}
        >
          <Heart className={cn('w-6 h-6', likedByMe ? 'fill-current' : '')} />
          {articleLikeCount}
        </Button>
        <Button
          variant="outline"
          size="xl"
          className="rounded-full px-10 h-16 text-lg font-bold border-2"
        >
          <Share2 className="w-6 h-6 mr-2" /> 공유하기
        </Button>
      </div>

      <CommentSection articleId={id} commentCount={article.commentCount} />
    </main>
  );
};

export default ArticleDetailPage;
