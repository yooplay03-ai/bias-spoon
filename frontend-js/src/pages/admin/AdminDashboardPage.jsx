import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import adminApi from '@/api/admin';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Users,
  FileText,
  MessageSquare,
  ShieldCheck,
  TrendingUp,
  Clock,
  ChevronRight,
  Activity,
  AlertCircle,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

const AdminDashboardPage = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [currentTime, setCurrentTime] = useState(new Date());

  const articleSafeRatio = (100 - (stats?.articleDeleteRatio || 0)).toFixed(1);
  const commentSafeRatio = (100 - (stats?.commentDeleteRatio || 0)).toFixed(1);

  const menus = [
    {
      title: '공지사항 관리',
      desc: '서비스 공지사항 작성 및 관리',
      icon: <AlertCircle />, // AlertCircle 아이콘 사용
      path: '/admin/notice/write',
      color: 'bg-rose-500',
      mainStats: '공지 작성',
      subStats: 'Notice',
      accentColor: 'text-rose-500',
    },
    {
      title: '사용자 관리',
      desc: `오늘 신규 가입: ${stats?.todayNewUsers || 0}명`,
      icon: <Users />,
      path: '/admin/users',
      color: 'bg-blue-500',
      mainStats: `${(stats?.totalUsers || 0).toLocaleString()}명`,
      subStats: `차단: ${stats?.blockedUsersCount || 0}명`,
      accentColor: 'text-blue-500',
    },
    {
      title: '게시글 관리',
      desc: `전체 대비 삭제율: ${stats?.articleDeleteRatio || 0}%`,
      icon: <FileText />,
      path: '/admin/articles',
      color: 'bg-emerald-500',
      mainStats: `${stats?.deletedArticlesCount || 0}건`,
      subStats: `전체: ${stats?.totalArticles || 0}건`,
      accentColor: 'text-emerald-500',
    },
    {
      title: '댓글 관리',
      desc: `전체 대비 삭제율: ${stats?.commentDeleteRatio || 0}%`,
      icon: <MessageSquare />,
      path: '/admin/comments',
      color: 'bg-amber-500',
      mainStats: `${stats?.deletedCommentsCount || 0}건`,
      subStats: `전체: ${stats?.totalComments || 0}건`,
      accentColor: 'text-amber-500',
    },
  ];

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const res = await adminApi.getDashboardStats();
        console.log(res.data);

        setStats(res.data);
      } catch (error) {
        toast.error(error.response.data.message);
      }
    };

    fetchDashboardData();

    const interval = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(interval);
  }, [location.pathname]);

  const formatRelativeTime = (dataString) => {
    const now = new Date();
    const past = new Date(dataString);
    const diffInMs = now - past;
    const diffInMins = Math.floor(diffInMs / 60000);

    if (diffInMins < 1) return '방금 전';
    if (diffInMins < 60) return `${diffInMins}분 전`;
    if (diffInMins < 1440) return `${Math.floor(diffInMins / 60)}시간 전`;
    return past.toLocaleDateString();
  };

  if (!stats)
    return (
      <div className="p-20 text-center font-black text-slate-200 text-4xl animate-pulse">
        LOADING SYSTEM...
      </div>
    );

  const timeString = currentTime.toLocaleTimeString('ko-KR', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  });

  const dateString = currentTime.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <div className="max-w-6xl mx-auto py-10 md:py-20 px-4 md:px-6 space-y-12 md:space-y-16 animate-in fade-in slide-in-from-bottom-4 duration-1000">
      <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
        <div className="flex items-center gap-4 md:gap-6">
          <div className="p-3 md:p-4 bg-slate-900 rounded-[1.5rem] md:rounded-[2rem] text-white shadow-2xl rotate-3 shrink-0">
            <ShieldCheck className="w-10 h-10 text-emerald-400" />
          </div>
          <div>
            <h1 className="text-6xl md:text-6xl font-black text-slate-900 tracking-tighter">
              Admin <span className="text-slate-400 font-light">Central</span>
            </h1>
            <p className="text-sm md:text-xl text-slate-400 font-medium mt-1 italic">
              "실시간 데이터가 동기화되었습니다."
            </p>
          </div>
        </div>
        <div className="text-right tabular-nums self-end sm:self-center">
          <div className="text-2xl md:text-3xl font-black text-slate-900 leading-none">
            {timeString}
          </div>
          <div className="text-[10px] md:text-sm font-bold text-slate-400 mt-2 tracking-widest uppercase text-right">
            {dateString}
          </div>
        </div>
      </header>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
        {menus.map((menu) => (
          <Card
            key={menu.path}
            onClick={() => navigate(menu.path)}
            className="border-none shadow-[0_32px_64px_-12px_rgba(0,0,0,0.06)] rounded-[3.5rem] cursor-pointer hover:scale-105 transition-all active:scale-95 group overflow-hidden bg-white"
          >
            <CardHeader className="p-6 md:p-10 pb-0">
              <div
                className={cn(
                  'w-12 h-12 md:w-16 md:h-16 rounded-2xl flex items-center justify-center text-white mb-4 md:mb-8',
                  menu.color,
                )}
              >
                {React.cloneElement(menu.icon, {
                  className: 'w-6 h-6 md:w-8 md:h-8',
                })}
              </div>
              <div className="space-y-1 md:space-y-2">
                <CardTitle className="text-xl md:text-3xl font-black text-slate-900 flex items-center justify-between">
                  {menu.title}
                  <ChevronRight className="w-5 h-5 text-slate-200" />
                </CardTitle>
                <p className="text-slate-400 font-medium text-sm md:text-lg leading-snug break-keep">
                  {menu.desc}
                </p>
              </div>
            </CardHeader>
            <CardContent className="p-6 md:p-10 pt-6 md:pt-8">
              <div className="pt-4 md:pt-6 border-t border-slate-50 flex items-center justify-between">
                <span
                  className={cn(
                    'text-xl md:text-2xl font-black',
                    menu.accentColor,
                  )}
                >
                  {menu.mainStats}
                </span>
                <span className="text-[10px] md:text-sm font-bold text-slate-300 uppercase tracking-widest">
                  {menu.subStats}
                </span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 md:gap-10">
        <Card className="border-none bg-slate-50/50 rounded-[2.5rem] md:rounded-[3rem] p-6 md:p-10">
          <div className="flex items-center justify-between mb-6 md:mb-8">
            <h3 className="text-xl md:text-2xl font-black text-slate-900 flex items-center gap-3">
              <Activity className="text-emerald-500" /> 시스템 안정도
            </h3>
            <Badge className="bg-emerald-500 text-white px-3 py-1 animate-pulse">
              HEALTHY
            </Badge>
          </div>
          <div className="space-y-8 my-auto">
            {/* 1. 게시글 안전 지수 */}
            <div className="space-y-3">
              <div className="flex justify-between items-end">
                <div>
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-tighter block mb-1">
                    Articles Safety
                  </span>
                  <span className="text-lg font-black text-slate-700">
                    게시글 건전성
                  </span>
                </div>
                <span className="text-emerald-600 font-black text-xl">
                  {articleSafeRatio}%
                </span>
              </div>
              <div className="w-full h-3 bg-white rounded-full overflow-hidden shadow-sm">
                <div
                  className="h-full bg-emerald-500 transition-all duration-1000 ease-out"
                  style={{
                    width: `${articleSafeRatio}%`,
                  }}
                />
              </div>
              <div className="space-y-3">
                <div className="flex justify-between items-end">
                  <div>
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-tighter block mb-1">
                      Comments Safety
                    </span>
                    <span className="text-lg font-black text-slate-700">
                      댓글 건전성
                    </span>
                  </div>
                  <span className="text-amber-600 font-black text-xl">
                    {commentSafeRatio}%
                  </span>
                </div>
                <div className="w-full h-3 bg-white rounded-full overflow-hidden shadow-sm">
                  <div
                    className="h-full bg-amber-500 transition-all duration-1000 ease-out"
                    style={{
                      width: `${commentSafeRatio}%`,
                    }}
                  />
                </div>
              </div>
            </div>
            <p className="text-slate-400 text-xs md:text-sm font-medium leading-relaxed mt-8 break-keep border-t border-slate-100 pt-6">
              전체 콘텐츠 중 게시글은{' '}
              <span className="text-slate-900 font-bold">
                {stats?.articleDeleteRatio}%
              </span>
              , 댓글은{' '}
              <span className="text-slate-900 font-bold">
                {stats?.commentDeleteRatio}%
              </span>
              가 규정 위반으로 필터링되었습니다.
            </p>
          </div>
        </Card>

        <Card className="border-none bg-slate-900 rounded-[3rem] p-10 text-white shadow-2xl shadow-slate-200">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-2xl font-black flex items-center gap-3">
              <Clock className="text-amber-400" /> 최근 활동 로그
            </h3>
          </div>
          <div className="space-y-6">
            {stats?.recentActivities?.length > 0 ? (
              stats.recentActivities.map((activity, idx) => (
                <ActivityItem
                  key={idx}
                  type={activity.type}
                  text={activity.targetTitle}
                  status={activity.status}
                  time={formatRelativeTime(activity.timestamp)}
                  isWarning={
                    activity.status === 'DELETED' ||
                    activity.status === 'BLOCKED'
                  }
                />
              ))
            ) : (
              <p className="text-slate-500 italic py-10 text-center">
                활동 로그가 없습니다.
              </p>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
};

const ActivityItem = ({ type, text, status, time, isWarning }) => (
  <div className="flex items-start gap-4 border-l-2 border-slate-700 pl-6 py-1 hover:border-emerald-400 transition-colors group">
    <div className="space-y-1">
      <div className="flex items-center gap-2">
        <span
          className={cn(
            'text-[10px] font-black px-2 py-0.5 rounded',
            type === 'USER'
              ? 'bg-blue-600'
              : type === 'ARTICLE'
                ? 'bg-emerald-600'
                : 'bg-amber-600',
          )}
        >
          {type}
        </span>
        <p
          className={cn(
            'text-base font-medium leading-tight group-hover:text-white transition-colors',
            isWarning ? 'text-red-400' : 'text-slate-300',
          )}
        >
          {text} <span className="text-sm opacity-60">[{status}]</span>
        </p>
      </div>
      <p className="text-xs text-slate-500 font-bold uppercase tracking-widest">
        {time}
      </p>
    </div>
  </div>
);

const Badge = ({ children, className }) => (
  <span
    className={cn(
      'text-[10px] font-black border px-2 py-0.5 rounded',
      className,
    )}
  >
    {children}
  </span>
);

export default AdminDashboardPage;
