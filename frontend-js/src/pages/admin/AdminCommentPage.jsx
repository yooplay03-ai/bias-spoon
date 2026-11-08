import React, { useEffect, useState } from 'react';
import adminApi from '../../api/admin';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  MessageCircle,
  RefreshCcw,
  User,
  Clock,
  Trash2,
  Square,
  CheckSquare,
  Hash,
  ArrowRight,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

const AdminCommentPage = () => {
  const [comments, setComments] = useState([]);
  const [page, setPage] = useState(0);
  const [totalPage, setTotalPage] = useState(0);

  const [selectedIds, setSelectedIds] = useState([]);

  useEffect(() => {
    fetchDeletedComments();
    setSelectedIds([]);
  }, [page]);

  const toggleSelect = (id) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id],
    );
  };

  const toggleAll = () => {
    if (selectedIds.length === comments.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(comments.map((comment) => comment.commentId));
    }
  };

  const fetchDeletedComments = async () => {
    try {
      // adminApi.getDeletedComments (백엔드: GET /api/admin/comments/deleted)
      const data = await adminApi.getDeletedComments(page, 5);
      setComments(data.content || []);
      setTotalPage(data.totalPage || 0);
    } catch (err) {
      toast.error('삭제된 댓글 목록을 불러오지 못했습니다.');
    }
  };

  const handleRestore = async (id) => {
    try {
      // adminApi.restoreComment (백엔드: PATCH /api/admin/comments/{id}/restore)
      await adminApi.restoreComment(id);
      toast.success('댓글이 성공적으로 복구되었습니다.');
      fetchDeletedComments();
    } catch (err) {
      toast.error('댓글 복구에 실패했습니다.');
    }
  };

  const handleBulkRestore = async () => {
    if (!window.confirm(`${selectedIds.length}개의 댓글을 복구하시겠습니까?`))
      return;

    try {
      await adminApi.restoreCommentsBulk({ ids: selectedIds });

      toast.success(
        `${selectedIds.length}개의 댓글이 성공적으로 복구되었습니다.`,
      );
      setSelectedIds([]);
      fetchDeletedComments();
    } catch (err) {
      toast.error('일괄 복구 중 일부 항목에서 오류 발생');
    }
  };

  return (
    <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <header className="flex justify-between items-end border-b border-slate-100 pb-10">
        <div className="space-y-3">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-indigo-50 text-indigo-600 rounded-full text-sm font-bold tracking-tight">
            <MessageCircle className="w-4 h-4" />
            COMMENT MODERATION
          </div>
          <h2 className="text-5xl font-black text-slate-900 tracking-tight">
            댓글 <span className="text-indigo-600">관리</span>
          </h2>
          <p className="text-lg text-slate-400 font-medium italic">
            사용자가 삭제한 댓글을 확인하고 복구할 수 있습니다.
          </p>
        </div>

        {/* 일괄 처리 플로팅 버튼 (선택된 게 있을 때만 표시) */}
        {(selectedIds?.length ?? 0) > 0 && (
          <Button
            onClick={handleBulkRestore}
            className="h-16 px-8 bg-indigo-600 hover:bg-indigo-700 text-white font-black rounded-2xl shadow-2xl shadow-indigo-200 transition-all hover:-translate-y-1 flex gap-3"
          >
            <RefreshCcw className="w-6 h-6 animate-spin-reverse" />
            {selectedIds.length}개 댓글 일괄 복구
          </Button>
        )}
      </header>

      {/* 전체 선택 바 */}
      <div
        className={cn(
          'sticky top-6 z-20 flex items-center gap-4 p-5 rounded-[2rem] cursor-pointer transition-all border',
          selectedIds.length > 0
            ? 'bg-indigo-600 border-indigo-400 shadow-xl shadow-indigo-100'
            : 'bg-white/80 backdrop-blur-md border-slate-100 shadow-sm hover:bg-slate-50',
        )}
        onClick={toggleAll}
      >
        <div className="transition-transform active:scale-90">
          {selectedIds.length === comments.length && comments.length > 0 ? (
            <CheckSquare
              className={cn(
                'w-7 h-7',
                selectedIds.length > 0 ? 'text-white' : 'text-indigo-600',
              )}
            />
          ) : (
            <Square className="w-7 h-7 text-slate-300" />
          )}
        </div>
        <span
          className={cn(
            'font-black text-sm uppercase tracking-widest',
            selectedIds.length > 0 ? 'text-white' : 'text-slate-500',
          )}
        >
          {selectedIds.length > 0
            ? `${selectedIds.length}개 선택됨`
            : '전체 선택'}
        </span>
      </div>

      <div className="grid gap-8">
        {comments.length > 0 ? (
          comments.map((comment) => (
            <Card
              key={comment.commentId}
              onClick={() =>
                window.open(
                  `/articles/${comment.articleId}#comment-${comment.commentId}`,
                  '_blank',
                )
              }
              className={cn(
                'border-none rounded-[3rem] bg-white transition-all duration-500 overflow-hidden',
                selectedIds.includes(comment.commentId)
                  ? 'ring-4 ring-indigo-500/20 bg-indigo-50/30 translate-x-4'
                  : 'shadow-2xl shadow-slate-200/40 hover:shadow-indigo-100 hover:-translate-y-1',
              )}
            >
              <CardContent className="p-0">
                <div className="flex flex-col md:flex-row items-stretch">
                  <div
                    onClick={(e) => {
                      e.stopPropagation(); // 카드 클릭(이동) 방지
                      toggleSelect(comment.commentId);
                    }}
                    className={cn(
                      'w-full md:w-20 flex items-center justify-center cursor-pointer transition-colors',
                      selectedIds.includes(comment.commentId)
                        ? 'bg-indigo-500 text-white'
                        : 'bg-slate-50 text-slate-200 hover:text-slate-400',
                    )}
                  >
                    {selectedIds.includes(comment.commentId) ? (
                      <CheckSquare className="w-8 h-8" />
                    ) : (
                      <Square className="w-8 h-8" />
                    )}
                  </div>

                  <div className="flex-1 p-10 space-y-6">
                    <div className="flex flex-wrap items-center gap-4">
                      <div className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-100 rounded-2xl shadow-sm">
                        <User className="w-4 h-4 text-indigo-500" />
                        <span className="font-black text-slate-700">
                          {comment.userNickName}
                        </span>
                        <span className="text-slate-300 font-medium">
                          @{comment.loginId}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-slate-400 font-bold text-xs uppercase tracking-tighter">
                        <Clock className="w-4 h-4" />
                        {new Date(comment.updatedAt).toLocaleString()} 삭제됨
                      </div>
                    </div>

                    <div className="relative p-8 bg-white border-2 border-slate-50 rounded-[2.5rem] rounded-tl-none shadow-inner group-hover:border-indigo-100 transition-all">
                      <p className="text-xl text-slate-700 font-medium leading-relaxed">
                        {comment.content}
                      </p>
                    </div>

                    <div className="flex items-center gap-4">
                      <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-slate-100 rounded-lg text-[10px] font-black text-slate-400 uppercase">
                        <Hash className="w-3 h-3" /> ORIGIN ARTICLE ID:{' '}
                        {comment.articleId} | COMMENT ID: {comment.commentId}
                      </div>
                      <Button
                        variant="link"
                        onClick={() =>
                          window.open(
                            `/articles/${comment.articleId}`,
                            '_blank',
                          )
                        }
                        className="text-xs font-bold text-indigo-500 p-0 h-auto"
                      >
                        원문 보기 <ArrowRight className="w-3 h-3 ml-1" />
                      </Button>
                    </div>
                  </div>

                  <div className="w-full md:w-48 p-8 flex items-center justify-center border-t md:border-t-0 md:border-l border-slate-50">
                    <Button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleRestore(comment.commentId);
                      }}
                      className="w-24 h-24 rounded-full bg-slate-900 hover:bg-indigo-600 text-white shadow-2xl transition-all duration-300 hover:rotate-12 group-hover:scale-110"
                    >
                      <RefreshCcw className="w-10 h-10" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          <div className="py-48 text-center border-4 border-dashed border-slate-100 rounded-[4rem] bg-slate-50/50">
            <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center mx-auto mb-8 shadow-xl">
              <Trash2 className="w-12 h-12 text-slate-200" />
            </div>
            <p className="text-3xl font-black text-slate-300 tracking-tighter">
              삭제된 댓글 내역이 없습니다.
            </p>
          </div>
        )}
      </div>

      {/* 페이징 스타일 유지 */}
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

export default AdminCommentPage;
