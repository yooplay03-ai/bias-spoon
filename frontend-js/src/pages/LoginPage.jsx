import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import { Label } from '@/components/ui/label';

const LoginPage = () => {
  const [loginId, setLoginId] = useState('');
  const [password, setPassword] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await login(loginId, password);
      const originPath = location.state?.from?.pathname || '/';
      navigate(originPath, { replace: true });
    } catch (err) {
      const serverMessage = err.response?.data?.message || err.response?.data;

      if (serverMessage) {
        alert(serverMessage);
      } else {
        alert(
          '로그인 중 오류가 발생했습니다. 아이디 또는 비밀번호를 확인해주세요.',
        );
      }
    }
  };

  return (
    <div className="flex items-center justify-center min-h-[80vh] px-4">
      <Card className="w-full max-w-100 border-none shadow-2xl rounded-[2rem] bg-white/80 backdrop-blur-md">
        <CardHeader className="space-y-2 text-center pt-10">
          <CardTitle className="text-3xl font-black tracking-tight">
            로그인
          </CardTitle>
          <CardDescription>
            서비스 이용을 위해 계정 정보를 입력하세요.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="loginId">아이디</Label>
              <Input
                id="loginId"
                placeholder="아이디를 입력하세요"
                value={loginId}
                onChange={(e) => setLoginId(e.target.value)}
                className="h-12 rounded-xl bg-slate-50 border-none focus-visible:ring-primary/20"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">비밀번호</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="h-12 rounded-xl bg-slate-50 border-none focus-visible:ring-primary/20"
                required
              />
            </div>
            <Button
              type="submit"
              className="w-full h-12 rounded-xl text-lg font-bold shadow-lg shadow-primary/20 transition-all active:scale-95"
            >
              로그인
            </Button>

            <div className="mt-4 text-center">
              <Link
                to="/find-account"
                className="text-sm text-muted-foreground hover:text-primary transition-colors"
              >
                아이디 또는 비밀번호를 잊으셨나요?
              </Link>
            </div>
          </form>

          <div className="mt-8 text-center text-sm text-muted-foreground">
            아직 계정이 없으신가요?{' '}
            <Link
              to="/signup"
              className="text-primary font-bold hover:underline"
            >
              회원가입
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default LoginPage;
