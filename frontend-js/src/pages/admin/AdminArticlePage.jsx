import React, { useEffect, useState } from 'react';
import adminApi from '../../api/admin';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  RefreshCcw,
  Trash2,
  Clock,
  Square,
  CheckSquare,
  Hash,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

const AdminArticlePage = () => {
  const [articles, setArticles] = useState([]);
  const [page, setPage] = useState(0);
  const [totalPage, setTotalPage] = useState(0);

  const [selectedIds, setSelectedIds] = useState([]);

  useEffect(() => {
    fetchDeletedArticles();
    setSelectedIds([]);
  }, [page]);

  const toggleSelect = (id) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id],
    );
  };

  const toggleAll = () => {
    if (selectedIds.length === articles.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(articles.map((article) => article.articleId));
    }
  };

  const fetchDeletedArticles = async () => {
    try {
      const data = await adminApi.getDeletedArticles(page, 5);
      setArticles(data.content || []);
      setTotalPage(data.totalPage || 0);
    } catch (err) {
      toast.error('삭제된 게시글을 불러오지 못했습니다.');
    }
  };

  const handleRestore = async (id) => {
    try {
      await adminApi.restoreArticle(id);
      toast.success('게시글이 성공적으로 복구되었습니다.');
      fetchDeletedArticles();
    } catch (err) {
      toast.error('복구 처리 중 오류가 발생했습니다.');
    }
  };

  const handleBulkRestore = async () => {
    if (!window.confirm(`${selectedIds.length}개의 게시글을 복구하시겠습니까?`))
      return;

    try {
      await adminApi.restoreArticlesBulk({ ids: selectedIds });

      toast.success(
        `${selectedIds.length}개의 게시글이 성공적으로 복구되었습니다.`,
      );
      setSelectedIds([]);
      fetchDeletedArticles();
    } catch (err) {
      toast.error('일괄 복구 중 일부 항목에서 오류 발생');
    }
  };

  return (
    <div className="space-y-10">
      <header className="flex justify-between items-end border-b border-slate-100 pb-10 mb-10">
        <div className="space-y-3">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-amber-50 text-amber-600 rounded-full text-sm font-bold tracking-tight">
            <Hash className="w-4 h-4" />
            ARTICLE MODERATION
          </div>
          <h1 className="text-5xl font-black text-slate-900 tracking-tighter">
            게시글 <span className="text-amber-500">관리</span>
          </h1>
          <p className="text-xl text-slate-400 mt-3 font-medium italic">
            삭제된(DELETED) 게시글 리스트를 확인하고 복구합니다.
          </p>
        </div>

        <div className="h-16 flex items-center">
          {(selectedIds?.length ?? 0) > 0 ? (
            <Button
              onClick={handleBulkRestore}
              className="h-full px-8 bg-amber-500 hover:bg-amber-600 text-white font-black rounded-2xl shadow-2xl shadow-amber-100 transition-all hover:-translate-y-1 active:scale-95 flex gap-3 animate-in fade-in slide-in-from-right-8 duration-300"
            >
              <RefreshCcw className="w-6 h-6" />
              {selectedIds.length}개 항목 일괄 복구
            </Button>
          ) : (
            <div className="h-full w-20" />
          )}
        </div>
      </header>

      {/* 전체 선택 바 */}
      <div
        onClick={toggleAll}
        className={cn(
          'sticky top-4 z-10 flex items-center gap-4 p-5 mb-8 cursor-pointer rounded-2xl transition-all border',
          selectedIds.length > 0
            ? 'bg-amber-50/80 border-amber-200 backdrop-blur-md shadow-sm'
            : 'bg-white/80 border-slate-100 backdrop-blur-md shadow-sm hover:bg-slate-50',
        )}
      >
        <div className="transition-transform duration-200 hover:scale-110"></div>
        {selectedIds.length === articles.length && articles?.length > 0 ? (
          <CheckSquare className="w-6 h-6 text-amber-500" />
        ) : (
          <Square className="w-6 h-6 text-slate-300" />
        )}
        <span
          className={cn(
            'font-bold text-sm tracking-tighter uppercase',
            selectedIds.length > 0 ? 'text-amber-700' : 'text-slate-500',
          )}
        >
          전체 선택 ({selectedIds.length} / {articles.length})
        </span>
      </div>

      <div className="grid gap-6">
        {articles && articles.length > 0 ? (
          articles.map((article) => (
            <Card
              key={article.articleId}
              onClick={() =>
                window.open(`/articles/${article.articleId}`, '_blank')
              }
              className={cn(
                'group relative border-none rounded-[2.5rem] bg-white transition-all duration-300',
                selectedIds.includes(article.articleId)
                  ? 'ring-2 ring-amber-500 shadow-2xl shadow-amber-100 translate-x-2'
                  : 'shadow-xl shadow-slate-100 hover:shadow-2xl hover:shadow-slate-200 hover:-translate-y-1',
              )}
            >
              <CardContent className="p-10 flex justify-between items-center gap-8">
                <div
                  onClick={(e) => {
                    e.stopPropagation(); // 카드 클릭(이동) 방지
                    toggleSelect(article.articleId);
                  }}
                  className="shrink-0 p-3 rounded-2xl transition-colors group-hover:bg-slate-50"
                >
                  {selectedIds.includes(article.articleId) ? (
                    <CheckSquare className="w-7 h-7 text-amber-500" />
                  ) : (
                    <Square className="w-7 h-7 text-slate-200 group-hover:text-slate-300" />
                  )}
                </div>

                <div className="flex-1 space-y-4">
                  <div className="flex items-center gap-3">
                    <span className="px-3 py-1 bg-slate-100 text-slate-500 text-xs font-bold rounded-full uppercase tracking-widest">
                      Article #{article.articleId}
                    </span>
                    <span className="text-slate-300">|</span>
                    <div className="flex items-center gap-1.5 text-slate-400 text-sm font-medium">
                      <Clock className="w-4 h-4" />
                      {new Date(article.updatedAt).toLocaleDateString()} 삭제됨
                    </div>
                  </div>

                  <h3 className="text-2xl font-bold text-slate-800 leading-tight group-hover:text-amber-600 transition-colors">
                    {article.subject}
                  </h3>

                  <div className="flex items-center gap-3 text-slate-500 font-medium">
                    <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-xs font-bold text-slate-400">
                      {article.loginId.charAt(0).toUpperCase()}
                    </div>
                    <span>{article.loginId}</span>
                  </div>
                </div>

                <Button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleRestore(article.articleId);
                  }}
                  className="shrink-0 w-20 h-20 rounded-full bg-slate-900 hover:bg-amber-500 text-white shadow-xl transition-all duration-300 hover:rotate-12 group-hover:scale-110"
                >
                  <RefreshCcw className="w-8 h-8" />
                </Button>
              </CardContent>
            </Card>
          ))
        ) : (
          <div className="py-40 text-center border-4 border-dashed border-slate-100 rounded-[3rem]">
            <Trash2 className="w-20 h-20 text-slate-100 mx-auto mb-6" />
            <p className="text-2xl font-bold text-slate-300 tracking-tight">
              삭제된 게시글이 없습니다.
            </p>
          </div>
        )}
      </div>
      {totalPage > 0 && (
        <div className="flex justify-center items-center gap-6 py-10">
          <Button
            variant="ghost"
            disabled={page === 0}
            onClick={() => setPage(page - 1)}
            className="rounded-full h-12 px-6 font-black"
          >
            이전
          </Button>
          <div className="flex gap-2 font-black text-lg text-slate-900">
            {page + 1} <span className="text-slate-200">/</span> {totalPage}
          </div>
          <Button
            variant="ghost"
            disabled={page >= totalPage - 1}
            onClick={() => setPage(page + 1)}
            className="rounded-full h-12 px-6 font-black"
          >
            다음
          </Button>
        </div>
      )}
    </div>
  );
};

export default AdminArticlePage;
