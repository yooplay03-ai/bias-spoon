import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Megaphone, ArrowLeft, Send, ShieldCheck } from 'lucide-react';
import { toast } from 'sonner';
import articleApi from '../../api/articles';

const AdminNoticeWritePage = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    subject: '',
    content: '',
    category: 'NOTICE', // 공지사항 카테고리 고정
    pythonAnalysisId: null,
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log('버튼 클릭됨');
    if (!formData.subject || !formData.content) {
      console.log('검증 실패: 제목이나 내용이 비었음');
      toast.error('공지 제목와 내용을 입력해주세요.');
      return;
    }

    setLoading(true);
    try {
      // 기존 게시글 생성 API 사용, 카테고리만 NOTICE로 강제
      await articleApi.createArticle(formData);
      toast.success('공지사항이 등록되었습니다.');
      navigate('/admin');
    } catch (error) {
      toast.error('등록 실패');
    }
  };

  return (
    <div className="max-w-5xl mx-auto py-12 px-6 animate-in fade-in duration-700">
      {/* --- 상단 헤더 --- */}
      <div className="flex items-center justify-between mb-10">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate(-1)}
            className="p-3 hover:bg-slate-100 rounded-full transition-colors"
          >
            <ArrowLeft className="w-6 h-6 text-slate-500" />
          </button>
          <div>
            <h2 className="text-4xl font-black text-slate-900 tracking-tighter flex items-center gap-3">
              <Megaphone className="text-rose-500 w-8 h-8" /> 공지사항 작성
            </h2>
            <p className="text-slate-400 font-medium mt-1">
              사용자들에게 전달할 중요 소식을 작성합니다.
            </p>
          </div>
        </div>
      </div>

      {/* --- 작성 폼 --- */}
      <Card className="border-none shadow-[0_32px_64px_-12px_rgba(0,0,0,0.08)] rounded-[3rem] overflow-hidden bg-white">
        <form onSubmit={handleSubmit} className="p-10 space-y-8">
          {/* 공지 레이블 */}
          <div className="flex items-center gap-2 px-4 py-2 bg-rose-50 text-rose-600 rounded-full w-fit font-black text-xs uppercase tracking-widest">
            <ShieldCheck className="w-3 h-3" /> Admin Official Notice
          </div>

          {/* 제목 입력 */}
          <div className="space-y-2">
            <input
              type="text"
              placeholder="공지사항 제목을 입력하세요"
              className="w-full text-3xl font-bold border-none outline-none placeholder:text-slate-200 focus:ring-0"
              value={formData.subject}
              onChange={(e) =>
                setFormData({ ...formData, subject: e.target.value })
              }
            />
            <div className="h-px bg-slate-100 w-full" />
          </div>

          {/* 내용 입력 */}
          <div className="space-y-2">
            <textarea
              placeholder="공지 내용을 상세히 적어주세요..."
              className="w-full h-80 text-lg border-none outline-none resize-none placeholder:text-slate-200 focus:ring-0 leading-relaxed"
              value={formData.content}
              onChange={(e) =>
                setFormData({ ...formData, content: e.target.value })
              }
            />
          </div>

          {/* 하단 버튼 섹션 */}
          <div className="pt-8 border-t border-slate-50 flex justify-between items-center">
            <p className="text-sm text-slate-400 font-medium italic">
              * 작성된 공지는 모든 사용자 게시판 상단에 노출될 수 있습니다.
            </p>
            <div className="flex gap-4">
              <Button
                type="button"
                variant="ghost"
                onClick={() => navigate(-1)}
                className="px-8 py-6 rounded-2xl font-bold text-slate-400 hover:text-slate-600"
              >
                취소
              </Button>
              <Button
                type="submit"
                disabled={loading}
                className="px-10 py-6 bg-slate-900 hover:bg-slate-800 text-white rounded-2xl font-black flex items-center gap-3 shadow-xl transition-all active:scale-95 disabled:opacity-50"
              >
                {loading ? (
                  '등록 중...'
                ) : (
                  <>
                    공지 등록 <Send className="w-4 h-4" />
                  </>
                )}
              </Button>
            </div>
          </div>
        </form>
      </Card>
    </div>
  );
};

export default AdminNoticeWritePage;
