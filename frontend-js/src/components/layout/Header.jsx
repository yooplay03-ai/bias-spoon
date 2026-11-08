import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.jsx';

const Header = () => {
  const { user, logout } = useAuth();
  return (
    <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        <Link
          to="/"
          className="text-xl font-bold bg-linear-to-r from-indigo-600 to-violet-600 bg-clip-text text-transparent"
        >
          AI News Insight
        </Link>
        <nav className="flex items-center gap-6 text-sm font-medium text-slate-600">
          {user ? (
            <>
              <Link to="/analysis" className="hover:text-indigo-600">
                뉴스 분석
              </Link>
              <Link to="/articles" className="hover:text-indigo-600">
                게시판
              </Link>
              <div className="h-4 w-px bg-slate-200" />
              <span className="text-slate-900">{user.userNickName}님</span>
              <button
                onClick={logout}
                className="text-rose-500 hover:text-rose-600"
              >
                로그아웃
              </button>
            </>
          ) : (
            <Link
              to="/login"
              className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700"
            >
              시작하기
            </Link>
          )}
        </nav>
      </div>
    </header>
  );
};
export default Header;
