import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import articleApi from '../api/articles';
import { useAuth } from '../context/AuthContext';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';
import { Heart, Plus, Eye, MessageSquare, Clock, Search } from 'lucide-react';

const categoryLabels = {
  ALL: '전체',
  ANALYSIS: '분석 리포트',
  FREE: '자유게시판',
  NOTICE: '공지사항',
};

const ArticleListPage = () => {
  const [articles, setArticles] = useState([]);
  const [notices, setNotices] = useState([]);
  const [category, setCategory] = useState('ALL');
  const [totalPage, setTotalPage] = useState(0);
  const [page, setPage] = useState(0);

  const [sort, setSort] = useState('createdAt');
  const [order, setOrder] = useState('desc');

  const [searchType, setSearchType] = useState('all');
  const [searchKeyword, setSearchKeyword] = useState('');
  const [activeSearch, setActiveSearch] = useState({
    type: 'all',
    keyword: '',
  });

  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchNotices = async () => {
      try {
        const response = await articleApi.getArticles(
          'NOTICE',
          0,
          'all',
          '',
          'createdAt',
          'desc',
        );
        setNotices(response.data.content?.slice(0, 3) || []);
      } catch (err) {
        console.error('Failed to fetch notices:', err);
      }
    };
    fetchNotices();
  }, []);

  useEffect(() => {
    const fetchArticles = async () => {
      try {
        const response = await articleApi.getArticles(
          category,
          page,
          activeSearch.type,
          activeSearch.keyword,
          sort,
          order,
        );
        const data = response.data;
        // console.log(data);
        setArticles(data.content || []);
        setTotalPage(data.totalPage || 0);
      } catch (err) {
        console.error('Failed to fetch articles:', err);
      }
    };
    fetchArticles();
  }, [category, page, activeSearch, sort, order]);

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = (now - date) / 1000 / 60;

    if (diff < 60) return `${Math.floor(diff)}분 전`;
    if (diff < 1440) return `${Math.floor(diff / 60)}시간 전`;
    return date.toLocaleDateString();
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setPage(0);
    setActiveSearch({ type: searchType, keyword: searchKeyword });
  };

  const handleSortChange = (type) => {
    if (sort === type) {
      setOrder(order === 'asc' ? 'desc' : 'asc');
    } else {
      setSort(type);
      setOrder('desc');
    }
    setPage(0);
  };

  return (
    <div className="max-w-5xl mx-auto py-20 px-6">
      {/* 상단 헤더 */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-12">
        <div className="space-y-2">
          <h1 className="text-5xl font-black tracking-tighter">Community</h1>
          <p className="text-slate-500 font-medium">
            다양한 시각과 분석 리포트를 확인해보세요.
          </p>
        </div>
        {user && (
          <Button
            onClick={() => navigate('/articles/write')}
            className="rounded-full px-8 h-12 shadow-xl shadow-primary/20 gap-2"
          >
            <Plus className="w-5 h-5" /> 새 글 작성하기
          </Button>
        )}
      </div>
      {/* 검색 바 영역 */}
      <form
        onSubmit={handleSearch}
        className="flex flex-wrap md:flex-nowrap gap-2 mb-6 bg-slate-50 p-2 rounded-3xl border border-slate-100"
      >
        <select
          value={searchType}
          onChange={(e) => setSearchType(e.target.value)}
          className="bg-transparent font-bold text-sm px-4 py-2 outline-none border-r border-slate-200"
        >
          <option value="all">전체</option>
          <option value="title">제목</option>
          <option value="content">내용</option>
          <option value="author">작성자</option>
        </select>
        <div className="flex-1 flex items-center px-2">
          <Search className="w-4 h-4 text-slate-400 mr-2" />
          <input
            type="text"
            value={searchKeyword}
            onChange={(e) => setSearchKeyword(e.target.value)}
            placeholder="검색어를 입력하세요..."
            className="bg-transparent w-full outline-none text-sm font-medium"
          />
        </div>
        <Button
          type="submit"
          className="rounded-2xl px-6 h-10 bg-slate-900 hover:bg-slate-800"
        >
          검색
        </Button>
      </form>

      <div className="flex justify-between items-start gap-4 mb-10">
        <div className="flex flex-wrap gap-2 flex-1">
          {Object.entries(categoryLabels).map(([key, label]) => (
            <button
              key={key}
              onClick={() => {
                setCategory(key);
                setPage(0);
                setSearchKeyword('');
                setActiveSearch({ type: 'all', keyword: '' });
              }}
              className={cn(
                'px-6 py-2.5 rounded-full text-sm font-bold transition-all border whitespace-nowrap',
                category === key
                  ? 'bg-slate-900 text-white border-slate-900 shadow-lg shadow-slate-200'
                  : 'bg-white text-slate-500 border-slate-200 hover:border-slate-400',
              )}
            >
              {label}
            </button>
          ))}
        </div>

        <div className="shrink-0 flex items-center gap-2 bg-slate-50/80 px-3 py-2 rounded-2xl border border-slate-200/60 shadow-sm hover:bg-white hover:border-slate-300 transition-all group sticky top-0">
          <select
            value={`${sort},${order}`}
            onChange={(e) => {
              const [newSort, newOrder] = e.target.value.split(',');
              setSort(newSort);
              setOrder(newOrder);
              setPage(0);
            }}
            className="bg-transparent text-[13px] font-bold text-slate-600 outline-none cursor-pointer appearance-none"
          >
            <option value="createdAt,desc">최신순</option>
            <option value="createdAt,asc">오래된순</option>
            <option value="articleLikeCount,desc">좋아요순</option>
            <option value="commentCount,desc">댓글순</option>
          </select>
          <div className="text-slate-400 pointer-events-none">
            <svg
              width="10"
              height="10"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="m6 9 6 6 6-6" />
            </svg>
          </div>
        </div>
      </div>

      {/* 리스트 영역 */}
      <div className="space-y-4">
        {notices.length > 0 && (
          <div className="bg-slate-50 rounded-[2rem] p-2 border border-slate-100 mb-6 shadow-sm">
            {notices.map((notice) => (
              <div
                key={notice.articleId} // notice.id 대신 실제 필드명인 articleId 사용
                onClick={() => navigate(`/articles/${notice.articleId}`)}
                className="flex items-center gap-3 p-4 hover:bg-white rounded-2xl transition-all cursor-pointer group"
              >
                <div className="flex items-center justify-center px-3 py-1 bg-indigo-50 text-indigo-600 rounded-lg text-[11px] font-black uppercase tracking-tighter border border-indigo-100 group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                  NOTICE
                </div>

                <span className="font-bold text-slate-600 group-hover:text-indigo-600 transition-colors line-clamp-1">
                  {notice.subject}
                </span>

                <div className="ml-auto flex items-center gap-2">
                  <div className="w-1 h-1 bg-slate-300 rounded-full group-hover:bg-indigo-300 transition-colors" />
                  <span className="text-[11px] font-bold text-slate-400 tabular-nums">
                    {formatDate(notice.createdAt)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}

        {articles.length > 0 ? (
          articles.map((article) => (
            <div
              key={article.articleId}
              onClick={() => navigate(`/articles/${article.articleId}`)}
              className="group relative bg-white p-7 rounded-[2rem] border border-slate-100 hover:border-primary/20 hover:shadow-[0_20px_40px_rgba(0,0,0,0.04)] transition-all cursor-pointer overflow-hidden"
            >
              <div className="flex flex-col md:flex-row justify-between gap-4">
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <Badge
                      className={cn(
                        'rounded-md px-3 py-1 font-black text-[10px] uppercase tracking-wider border-none',
                        article.category === 'NOTICE'
                          ? 'bg-slate-900 text-white hover:bg-slate-800'
                          : 'bg-slate-100 text-slate-500 hover:bg-slate-200',
                      )}
                    >
                      {categoryLabels[article.category]}
                    </Badge>
                    <div className="flex items-center text-slate-400 text-xs gap-1">
                      <Clock className="w-3 h-3" />
                      {new Date(article.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                  <h2
                    className={cn(
                      'text-2xl font-bold transition-colors leading-tight',
                      article.category === 'NOTICE'
                        ? 'text-slate-900 group-hover:text-indigo-600'
                        : 'text-slate-700 group-hover:text-primary',
                    )}
                  >
                    {article.subject}
                  </h2>
                </div>

                <div className="flex flex-row md:flex-col justify-between items-center md:items-end text-sm">
                  <span className="font-bold text-slate-900 bg-slate-100 px-3 py-1 rounded-full">
                    {article.userNickName}
                  </span>
                  <div className="flex items-center gap-4 text-slate-400 mt-auto">
                    <span className="flex items-center gap-1">
                      <Eye className="w-4 h-4" /> {article.hitcount}
                    </span>
                    <span
                      className="flex items-center gap-1 text-red-400/80"
                      title="좋아요"
                    >
                      <Heart className="w-4 h-4 fill-current" />{' '}
                      {article.articleLikeCount || 0}
                    </span>
                    <span className="flex items-center gap-1">
                      <MessageSquare className="w-4 h-4" />
                      {article.commentCount || 0}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="py-20 text-center text-slate-400 border-2 border-dashed rounded-[2rem]">
            게시글이 존재하지 않습니다.
          </div>
        )}
      </div>
      {/* 페이지네이션 (간결한 스타일) */}
      {totalPage > 0 && (
        <div className="flex justify-center items-center gap-4 mt-16">
          <Button
            variant="ghost"
            disabled={page === 0}
            onClick={() => setPage(page - 1)}
            className="rounded-full"
          >
            이전
          </Button>
          <div className="flex gap-2 font-bold text-sm">
            {page + 1} <span className="text-slate-300">/</span> {totalPage}
          </div>
          <Button
            variant="ghost"
            disabled={page >= totalPage - 1}
            onClick={() => setPage(page + 1)}
            className="rounded-full"
          >
            다음
          </Button>
        </div>
      )}
    </div>
  );
};

export default ArticleListPage;
