import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import {
  MessageSquare,
  User,
  ShieldCheck,
  Trash2,
  Edit2,
  X,
  Check,
  CornerDownRight,
  Heart,
  MessageCircle,
  AtSign,
} from 'lucide-react';
import articleApi from '../../api/articles';
import { useAuth } from '../../context/AuthContext';
import { cn } from '@/lib/utils';
import { useLocation } from 'react-router-dom';

const CommentSection = ({ articleId, commentCount }) => {
  const { user } = useAuth();
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [isAnonymous, setIsAnonymous] = useState(false);

  const [editingId, setEditingId] = useState(null);
  const [editContent, setEditContent] = useState('');

  const [replyTo, setReplyTo] = useState(null);
  const [replyContent, setReplyContent] = useState('');

  const [pageInfo, setPageInfo] = useState({
    currentPage: 0,
    totalPage: 0,
    hasNext: false,
  });

  const { hash } = useLocation();

  const fetchComments = async (page = 0) => {
    if (!articleId) return;
    try {
      const data = await articleApi.getComments(articleId, page);
      if (data) {
        setComments(data.content || []);
        setPageInfo({
          currentPage: data.currentPage,
          totalPage: data.totalPage,
          hasNext: data.hasNext,
        });
      }
    } catch (err) {
      console.error('댓글 로드 실패:', err);
    }
  };

  useEffect(() => {
    fetchComments(0);
  }, [articleId]);

  // 댓글 등록
  const handleSubmit = async (parentId = null) => {
    const content = parentId ? replyContent : newComment;
    if (!content.trim()) return;
    try {
      await articleApi.addComment(articleId, {
        content,
        anonymous: isAnonymous,
        parentId,
      });

      if (parentId) {
        setReplyTo(null);
        setReplyContent('');
      } else {
        setNewComment('');
      }
      fetchComments(pageInfo.currentPage);
    } catch (err) {
      console.error('등록 실패:', err);
    }
  };

  const handleLikeToggle = async (commentId, likedByMe) => {
    if (!user) return alert('로그인이 필요합니다.');
    try {
      if (likedByMe) {
        await articleApi.removeCommentLike(commentId);
      } else {
        await articleApi.addCommentLike(commentId);
      }
      fetchComments(pageInfo.currentPage);
    } catch (err) {
      console.error('좋아요 처리 실패', err);
    }
  };

  const handleUpdate = async (commentId) => {
    try {
      await articleApi.updateComment(commentId, {
        content: editContent,
        anonymous: isAnonymous,
      });
      setEditingId(null);
      fetchComments(pageInfo.currentPage); // 현재 페이지 유지하며 갱신
    } catch (err) {
      console.error('수정 실패:', err);
    }
  };

  // 댓글 삭제
  const handleDelete = async (commentId) => {
    if (!window.confirm('정말로 삭제하시겠습니까?')) return;
    try {
      await articleApi.deleteComment(commentId);
      fetchComments(pageInfo.currentPage);
    } catch (err) {
      console.error('삭제 실패:', err);
      alert('삭제 권한이 없거나 오류가 발생했습니다.');
    }
  };

  const renderComment = (comment, isReply = false) => (
    <div
      key={comment.id}
      id={`comment-${comment.id}`}
      className={cn(
        'group relative flex gap-4 p-5 rounded-[2rem] transition-all',
        isReply
          ? 'ml-12 bg-slate-50/50 border-l-2 border-slate-200 mt-2'
          : 'bg-white hover:bg-slate-50/30',
      )}
    >
      {isReply && (
        <CornerDownRight className="w-5 h-5 text-slate-300 shrink-0 mt-2" />
      )}

      <Avatar className="w-11 h-11 border-2 border-white shadow-sm shrink-0">
        <AvatarFallback
          className={comment.anonymous ? 'bg-slate-200' : 'bg-primary/10'}
        >
          {comment.anonymous ? (
            <User className="w-5 h-5 text-slate-500" />
          ) : (
            <ShieldCheck className="w-5 h-5 text-primary" />
          )}
        </AvatarFallback>
      </Avatar>

      <div className="flex-1 space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-900">
              {comment.anonymous ? '익명' : comment.userNickName}
            </span>
            <span className="text-xs text-slate-400">
              {new Date(comment.createdAt).toLocaleDateString()}
            </span>
            {comment.status === 'DELETED' && (
              <span className="text-xs text-red-400 font-medium">
                (삭제된 댓글)
              </span>
            )}
          </div>

          {(user?.loginId === comment.loginId || user?.role === 'ADMIN') &&
            comment.status !== 'DELETED' && (
              <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setEditingId(comment.id);
                    setEditContent(comment.content);
                  }}
                  className="h-8 w-8 p-0 rounded-full hover:text-primary"
                >
                  <Edit2 className="w-4 h-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleDelete(comment.id)}
                  className="h-8 w-8 p-0 rounded-full hover:text-destructive"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            )}
        </div>

        {editingId === comment.id ? (
          <div className="space-y-3 mt-2">
            <Textarea
              value={editContent}
              onChange={(e) => setEditContent(e.target.value)}
              className="min-h-24 rounded-2xl bg-white border-slate-200 shadow-inner"
            />
            <div className="flex justify-end gap-2">
              <Button
                size="sm"
                variant="ghost"
                onClick={() => setEditingId(null)}
                className="rounded-full"
              >
                취소
              </Button>
              <Button
                size="sm"
                onClick={() => handleUpdate(comment.id)}
                className="rounded-full px-5 font-bold"
              >
                수정 완료
              </Button>
            </div>
          </div>
        ) : (
          <>
            <p
              className={cn(
                'text-slate-700 leading-relaxed whitespace-pre-wrap',
                comment.status === 'DELETED' && 'text-slate-400 italic',
              )}
            >
              {comment.status === 'DELETED'
                ? '삭제된 댓글입니다.'
                : comment.content}
            </p>

            <div className="flex items-center gap-4 mt-3">
              <button
                onClick={() => handleLikeToggle(comment.id, comment.likedByMe)}
                className={cn(
                  'flex items-center gap-1.5 text-xs font-bold transition-all',
                  comment.likedByMe
                    ? 'text-red-500'
                    : 'text-slate-400 hover:text-red-400',
                )}
              >
                <Heart
                  className={cn('w-4 h-4', comment.likedByMe && 'fill-current')}
                />
                좋아요 {comment.commentLikeCount || 0}
              </button>

              {comment.status !== 'DELETED' && (
                <button
                  onClick={() => {
                    setReplyTo({
                      id: comment.id,
                      nickname: comment.anonymous
                        ? '익명'
                        : comment.userNickName,
                      targetParentId: isReply ? comment.parentId : comment.id,
                    });
                    setReplyContent('');
                  }}
                  className="flex items-center gap-1.5 text-xs font-bold text-slate-400 hover:text-primary transition-colors"
                >
                  <MessageCircle className="w-4 h-4" />
                  답글 달기
                </button>
              )}
            </div>
          </>
        )}

        {/* 답글 입력창 (부모 댓글 아래에만 표시) */}
        {replyTo?.id === comment.id && (
          <div className="mt-4 p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3 animate-in fade-in slide-in-from-top-2">
            <div className="flex items-center gap-2 text-indigo-600 mb-1">
              <span className="text-sm font-bold">
                @{replyTo.nickname} 님에게 답글 남기는 중
              </span>
            </div>
            <Textarea
              placeholder="답글을 남겨보세요..."
              value={replyContent}
              onChange={(e) => setReplyContent(e.target.value)}
              className="min-h-20 rounded-xl bg-white border-none shadow-sm"
            />
            <div className="flex justify-end gap-2">
              <Button
                size="sm"
                variant="ghost"
                onClick={() => setReplyTo(null)}
                className="rounded-full font-bold text-slate-500"
              >
                취소
              </Button>
              <Button
                size="sm"
                onClick={() => handleSubmit(replyTo.targetParentId)}
                className="rounded-full px-6 font-bold bg-indigo-600 hover:bg-indigo-700"
              >
                답글 등록
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );

  useEffect(() => {
    // hash가 있고 (#comment-123 형태), 댓글 데이터 로딩이 완료되었을 때
    if (hash && comments.length > 0) {
      const targetId = hash.replace('#', '');

      // 리액트가 DOM을 실제로 화면에 그릴 시간을 주기 위해 setTimeout 사용
      const scrollTimer = setTimeout(() => {
        const element = document.getElementById(targetId);
        if (element) {
          element.scrollIntoView({
            behavior: 'smooth',
            block: 'center', // 화면 중앙에 오도록 설정
          });

          // 강조 효과 (관리자가 어느 댓글을 클릭했는지 알기 쉽게)
          element.classList.add('ring-4', 'ring-yellow-400', 'duration-1000');
          setTimeout(() => element.classList.remove('ring-4'), 3000);
        }
      }, 500); // 0.5초 정도 여유
      return () => clearTimeout(scrollTimer);
    }
  }, [hash, comments]);

  return (
    <div className="mt-20 space-y-8 pb-20">
      <div className="flex items-center gap-2 mb-6 text-slate-900">
        <MessageSquare className="w-6 h-6 text-primary" />
        <h3 className="text-2xl font-black">댓글</h3>
        <span className="text-2xl font-black">{commentCount || 0}</span>
      </div>

      <div className="p-6 rounded-[2.5rem] bg-slate-50 border border-slate-100 shadow-inner space-y-4">
        <Textarea
          placeholder="댓글을 남겨주세요."
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          className="min-h-32 rounded-[1.5rem] border-none bg-white p-6 resize-none shadow-sm text-lg"
        />
        <div className="flex justify-between items-center px-2">
          <div className="flex items-center space-x-3 bg-white/80 px-4 py-2 rounded-full border border-slate-200">
            <Switch
              id="anon-main"
              checked={isAnonymous}
              onCheckedChange={setIsAnonymous}
            />
            <Label htmlFor="anon-main" className="text-sm font-bold">
              익명
            </Label>
          </div>
          <Button
            onClick={() => handleSubmit()}
            className="rounded-full px-10 h-12 font-bold text-md shadow-lg"
          >
            등록하기
          </Button>
        </div>
      </div>

      <Separator className="my-10 opacity-50" />

      {/* 리스트 */}
      <div className="space-y-6">
        {comments.map((parent) => (
          <React.Fragment key={parent.id}>
            {renderComment(parent, false)}
            {parent.replies &&
              parent.replies.map((reply) => renderComment(reply, true))}
          </React.Fragment>
        ))}
      </div>

      {/* ⭐️ 페이징 버튼 영역 */}
      {pageInfo.totalPage > 1 && (
        <div className="flex justify-center items-center gap-2 py-10">
          <Button
            variant="outline"
            disabled={pageInfo.currentPage === 0}
            onClick={() => fetchComments(pageInfo.currentPage - 1)}
            className="rounded-full px-6"
          >
            이전
          </Button>
          {[...Array(pageInfo.totalPage)].map((_, i) => (
            <Button
              key={i}
              variant={pageInfo.currentPage === i ? 'default' : 'ghost'}
              onClick={() => fetchComments(i)}
              className="w-10 h-10 rounded-full font-bold"
            >
              {i + 1}
            </Button>
          ))}
          <Button
            variant="outline"
            disabled={!pageInfo.hasNext}
            onClick={() => fetchComments(pageInfo.currentPage + 1)}
            className="rounded-full px-6"
          >
            다음
          </Button>
        </div>
      )}
    </div>
  );
};

export default CommentSection;
