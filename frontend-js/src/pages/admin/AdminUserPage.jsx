import React, { useEffect, useState } from 'react';
import adminApi from '../../api/admin';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  UserCircle,
  Ban,
  CheckCircle2,
  ShieldCheck,
  Fingerprint,
  Mail,
  Activity,
  ArrowUpDown,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

const AdminUserPage = () => {
  const [users, setUsers] = useState([]);
  const [page, setPage] = useState(0);
  const [totalPage, setTotalPage] = useState(0);

  useEffect(() => {
    fetchUsers();
  }, [page]);

  const fetchUsers = async () => {
    try {
      const data = await adminApi.getUsers(page, 5);
      setUsers(data.content || []);
      setTotalPage(data.totalPage || 0);
    } catch (err) {
      toast.error('사용자 목록을 불러오지 못했습니다.');
    }
  };

  const handleStatusChange = async (loginId, currentStatus) => {
    const newStatus = currentStatus === 'ACTIVE' ? 'BLOCKED' : 'ACTIVE';
    try {
      await adminApi.updateUserStatus(loginId, newStatus);
      toast.success(`상태 변경 완료`, {
        description: `${loginId} 사용자가 ${newStatus === 'ACTIVE' ? '활동' : '차단'} 상태로 변경되었습니다.`,
        icon:
          newStatus === 'ACTIVE' ? (
            <CheckCircle2 className="text-emerald-500" />
          ) : (
            <Ban className="text-red-500" />
          ),
      });
      fetchUsers();
    } catch (err) {
      toast.error(err.response?.data || '상태 변경에 실패했습니다.');
    }
  };

  return (
    <div className="space-y-12 animate-in fade-in slide-in-from-top-4 duration-700">
      {' '}
      <header className="flex justify-between items-end border-b border-slate-100 pb-10">
        <div className="space-y-3">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-slate-900 text-slate-100 rounded-full text-xs font-black tracking-widest uppercase">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            User Security Control
          </div>
          <h1 className="text-5xl font-black text-slate-900 tracking-tighter">
            사용자 <span className="text-slate-400">관리</span>
          </h1>
          <p className="text-xl text-slate-400 font-medium italic">
            전체 회원 권한 및 제재 상태를 관리합니다.
          </p>
        </div>
      </header>
      {/* 2. 통계 간단 요약 (추가하면 예쁨) 
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="p-6 bg-emerald-50 rounded-[2rem] border border-emerald-100">
          <div className="text-emerald-600 font-black text-sm uppercase mb-1">
            Active Users
          </div>
          <div className="text-3xl font-black text-emerald-900 leading-none">
            Healthy
          </div>
        </div>
        //필요한 통계 카드 추가 가능
      </div>
      */}
      <Card className="border-none shadow-[0_32px_64px_-12px_rgba(0,0,0,0.08)] rounded-[3rem] overflow-hidden bg-white">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50/50 border-b border-slate-100">
                <tr>
                  <th className="px-10 py-8 text-left text-xs font-black text-slate-400 uppercase tracking-widest">
                    Identity
                  </th>
                  <th className="px-10 py-8 text-left text-xs font-black text-slate-400 uppercase tracking-widest">
                    Permission
                  </th>
                  <th className="px-10 py-8 text-left text-xs font-black text-slate-400 uppercase tracking-widest">
                    Current Status
                  </th>
                  <th className="px-10 py-8 text-right text-xs font-black text-slate-400 uppercase tracking-widest">
                    Management
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {users.map((user) => (
                  <tr
                    key={user.loginId}
                    className="group hover:bg-slate-50/50 transition-all duration-300"
                  >
                    <td className="px-10 py-8">
                      <div className="flex items-center gap-6">
                        <div className="relative shrink-0">
                          <div className="w-16 h-16 rounded-2xl bg-linear-to-br from-slate-100 to-slate-200 flex items-center justify-center shadow-inner group-hover:scale-110 transition-transform duration-500">
                            <UserCircle className="w-8 h-8 text-slate-400" />
                          </div>
                          {user.status === 'ACTIVE' && (
                            <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-emerald-500 border-4 border-white rounded-full" />
                          )}
                        </div>
                        <div className="space-y-1">
                          <div className="font-black text-slate-900 text-xl tracking-tight leading-none">
                            {user.userNickName}
                          </div>
                          <div className="flex items-center gap-1.5 text-slate-400 text-sm font-bold">
                            <Fingerprint className="w-3.5 h-3.5 opacity-50" />
                            {user.loginId}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-10 py-8">
                      <Badge
                        className={cn(
                          'rounded-xl px-4 py-2 font-black text-[10px] tracking-widest border-none',
                          user.role === 'ADMIN'
                            ? 'bg-slate-900 text-white shadow-lg shadow-slate-200'
                            : 'bg-slate-100 text-slate-500',
                        )}
                      >
                        {user.role}
                      </Badge>
                    </td>
                    <td className="px-10 py-8">
                      <div
                        className={cn(
                          'inline-flex items-center gap-2 px-4 py-2 rounded-2xl text-xs font-black tracking-tighter uppercase',
                          user.status === 'ACTIVE'
                            ? 'bg-emerald-50 text-emerald-600 border border-emerald-100'
                            : 'bg-red-50 text-red-600 border border-red-100',
                        )}
                      >
                        <Activity
                          className={cn(
                            'w-3.5 h-3.5',
                            user.status === 'ACTIVE' ? 'animate-pulse' : '',
                          )}
                        />
                        {user.status}
                      </div>
                    </td>
                    <td className="px-10 py-8 text-right">
                      <Button
                        variant="ghost"
                        onClick={() =>
                          handleStatusChange(user.loginId, user.status)
                        }
                        className={cn(
                          'rounded-2xl h-14 px-8 font-black transition-all active:scale-95 border-2 flex items-center justify-center gap-2',

                          // ✅ 활성 상태(ACTIVE)일 때: 차분하다가 호버 시에만 '경고(Red)' 스타일
                          user.status === 'ACTIVE'
                            ? 'border-transparent text-slate-400 hover:bg-red-50 hover:text-red-600 hover:border-red-100'
                            : // ✅ 차단 상태(BLOCKED)일 때: 눈에 띄는 '복구(Emerald)' 스타일
                              'bg-emerald-500 text-white border-emerald-500 hover:bg-emerald-600 hover:border-emerald-600 shadow-lg shadow-emerald-100',
                        )}
                      >
                        {user.status === 'ACTIVE' ? (
                          <>
                            <Ban className="w-5 h-5" />
                            <span>RESTRICT</span>
                          </>
                        ) : (
                          <>
                            <CheckCircle2 className="w-5 h-5" />
                            <span>ACTIVATE</span>
                          </>
                        )}
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="p-10 border-t border-slate-50 flex justify-center items-center gap-8 bg-slate-50/30">
            <Button
              variant="ghost"
              disabled={page === 0}
              onClick={() => setPage(page - 1)}
              className="rounded-full h-12 px-6 font-bold"
            >
              이전
            </Button>
            <div className="flex gap-2 font-black text-lg">
              {page + 1} <span className="text-slate-300">/</span> {totalPage}
            </div>
            <Button
              variant="ghost"
              disabled={page >= totalPage - 1}
              onClick={() => setPage(page + 1)}
              className="rounded-full h-12 px-6 font-bold"
            >
              다음
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminUserPage;
