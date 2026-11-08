import React from 'react';
import { NavLink, Outlet, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Button } from '@/components/ui/button';
import {
  Users,
  FileText,
  MessageSquare,
  LogOut,
  ShieldCheck,
  Home,
  AlertCircle,
} from 'lucide-react';
import { cn } from '@/lib/utils';

const AdminLayout = () => {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const menuItems = [
    { to: '/admin/notice/write', label: '공지사항 작성', icon: AlertCircle },
    { to: '/admin/users', label: '사용자 관리', icon: Users },
    { to: '/admin/articles', label: '게시글 관리', icon: FileText },
    { to: '/admin/comments', label: '댓글 관리', icon: MessageSquare },
  ];

  return (
    <div className="flex min-h-screen bg-slate-50/50">
      {/* Sidebar */}
      <aside className="w-80 bg-white border-r border-slate-100 flex flex-col sticky top-0 h-screen shadow-sm">
        <div className="p-10 flex items-center gap-3">
          <div className="p-2.5 bg-primary rounded-2xl shadow-lg shadow-primary/20">
            <ShieldCheck className="w-7 h-7 text-white" />
          </div>
          <Link
            to="/admin" // 관리자 메인 주소
            className="flex items-center gap-2 hover:opacity-80 transition-opacity cursor-pointer"
          >
            <span className="text-2xl font-black tracking-tighter text-slate-900 uppercase">
              Admin <span className="text-primary">Lens</span>
            </span>
          </Link>
        </div>

        <nav className="flex-1 px-6 space-y-3">
          {menuItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                cn(
                  'flex items-center gap-4 px-6 py-5 rounded-[1.5rem] text-lg font-bold transition-all duration-300',
                  isActive
                    ? 'bg-primary text-white shadow-xl shadow-primary/20 scale-[1.02]'
                    : 'text-slate-400 hover:bg-slate-50 hover:text-slate-900',
                )
              }
            >
              <item.icon className="w-6 h-6" />
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="p-8 space-y-3">
          <Button
            variant="outline"
            className="w-full h-14 justify-start gap-4 rounded-2xl border-slate-100 font-bold"
            onClick={() => navigate('/')}
          >
            <Home className="w-5 h-5 text-slate-400" /> 메인으로 이동
          </Button>
          <Button
            variant="ghost"
            className="w-full h-14 justify-start gap-4 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-2xl font-bold"
            onClick={() => {
              logout();
              navigate('/login');
            }}
          >
            <LogOut className="w-5 h-5" /> 로그아웃
          </Button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-12 overflow-y-auto">
        <div className="max-w-6xl mx-auto animate-in fade-in duration-700">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default AdminLayout;
