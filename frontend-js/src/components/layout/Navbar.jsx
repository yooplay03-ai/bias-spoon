import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { checkIsAdmin, useAuth } from '../../context/AuthContext.jsx'; // 👈 폴더 위치에 따라 ../ 또는 ../../ 확인!
import { Button } from '../ui/button'; // 👈 shadcn 버튼 경로 확인
import {
  LogOut,
  User,
  BarChart3,
  LayoutDashboard,
  LogOut as LogOutIcon,
  Zap,
  Settings,
  ShieldCheck,
} from 'lucide-react';
import { cn } from '../../lib/utils'; // 👈 lib 폴더 위치 확인

const Navbar = () => {
  const auth = useAuth();
  const user = auth?.user;
  const logout = auth?.logout;
  const navigate = useNavigate();
  const isAdmin = checkIsAdmin(user);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-white/20 bg-white/70 backdrop-blur-xl">
      <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
        {/* 로고 */}
        <Link to="/" className="flex items-center gap-2 group">
          <div className="bg-indigo-600 p-2 rounded-xl group-hover:rotate-12 transition-transform">
            <Zap className="w-6 h-6 text-white fill-current" />
          </div>
          <span className="text-2xl font-black tracking-tighter text-slate-900">
            Truth<span className="text-indigo-600">Lens</span>
          </span>
        </Link>

        {/* 메뉴 */}
        <div className="hidden md:flex items-center gap-8 font-bold text-slate-600">
          <Link
            to="/analysis"
            className="hover:text-indigo-600 transition-colors flex items-center gap-2"
          >
            <BarChart3 className="w-4 h-4" /> 뉴스 분석
          </Link>
          <Link
            to="/articles"
            className="hover:text-indigo-600 transition-colors flex items-center gap-2"
          >
            <LayoutDashboard className="w-4 h-4" /> 커뮤니티
          </Link>
          {isAdmin && (
            <Link
              to="/admin"
              className="admin-badge hover:text-indigo-600 transition-colors flex items-center gap-2"
            >
              <ShieldCheck className="w-4 h-4" /> 관리자
            </Link>
          )}
        </div>

        {/* 사용자 정보 */}
        <div className="flex items-center gap-3">
          {user ? (
            <>
              <Link
                to="/profile"
                className="hidden sm:flex items-center gap-2 bg-slate-100 hover:bg-slate-200 px-4 py-2 rounded-full transition-all group"
              >
                <User className="w-4 h-4 text-indigo-600 group-hover:scale-110 transition-transform" />
                <span className="text-sm font-bold text-slate-700">
                  {user.userNickName}님
                </span>
              </Link>
              <Button
                variant="ghost"
                onClick={handleLogout}
                className="font-bold text-red-500 hover:bg-red-50"
              >
                <LogOut className="w-4 h-4 mr-2" /> 로그아웃
              </Button>
            </>
          ) : (
            <>
              <Button asChild variant="ghost" className="font-bold">
                <Link to="/login">로그인</Link>
              </Button>
              <Button
                asChild
                className="bg-indigo-600 hover:bg-indigo-700 font-bold rounded-full px-6 text-white"
              >
                <Link to="/signup">시작하기</Link>
              </Button>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
