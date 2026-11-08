import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import authApi from '../api/auth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';

const FindAccountPage = () => {
  const [mode, setMode] = useState('ID'); // 'ID' | 'PW'
  const [step, setStep] = useState(1);
  const [form, setForm] = useState({ email: '', code: '', newPassword: '' });
  const [foundId, setFoundId] = useState('');
  const [timer, setTimer] = useState(180);
  const navigate = useNavigate();

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  useEffect(() => {
    let interval;
    if (step === 2 && timer > 0) {
      interval = setInterval(() => setTimer((t) => t - 1), 1000);
    }
    return () => clearInterval(interval);
  }, [step, timer]);

  const formatTime = (s) =>
    `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;

  const handleSendCode = async () => {
    try {
      console.log(form.email);
      await authApi.sendVerificationEmail(form.email);
      alert('인증코드가 발송되었습니다.');
      setStep(2);
      setTimer(180);
    } catch (err) {
      alert(err.response?.data?.message || '등록된 사용자가 없습니다.');
    }
  };

  const handleSubmit = async () => {
    try {
      if (mode === 'ID') {
        const res = await authApi.verifyAndFindId(form.email, form.code);
        setFoundId(res);
        setStep(3);
      } else {
        await authApi.resetPassword(form.email, form.code, form.newPassword);
        alert('비밀번호가 변경되었습니다.');
        navigate('/login');
      }
    } catch (err) {
      alert('인증 정보가 올바르지 않습니다.');
    }
  };

  return (
    <div className="flex items-center justify-center min-h-[80vh] px-4">
      <Card className="w-full max-w-100 border-none shadow-2xl rounded-[2rem] bg-white/80 backdrop-blur-md">
        <CardHeader className="space-y-2 text-center pt-10">
          <div className="flex justify-center gap-4 mb-4">
            <button
              onClick={() => {
                setMode('ID');
                setStep(1);
              }}
              className={`text-sm font-bold pb-1 transition-all ${mode === 'ID' ? 'text-primary border-b-2 border-primary' : 'text-muted-foreground'}`}
            >
              아이디 찾기
            </button>
            <button
              onClick={() => {
                setMode('PW');
                setStep(1);
              }}
              className={`text-sm font-bold pb-1 transition-all ${mode === 'PW' ? 'text-primary border-b-2 border-primary' : 'text-muted-foreground'}`}
            >
              비밀번호 재설정
            </button>
          </div>
          <CardTitle className="text-3xl font-black tracking-tight">
            {mode === 'ID' ? '아이디 찾기' : '비밀번호 재설정'}
          </CardTitle>
          <CardDescription>
            {step === 1
              ? '등록된 이메일로 인증을 진행하세요.'
              : '전송된 인증번호를 입력하세요.'}
          </CardDescription>
        </CardHeader>

        <CardContent className="p-8">
          <div className="space-y-6">
            {step === 1 && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>이메일</Label>
                  <Input
                    name="email"
                    placeholder="example@email.com"
                    onChange={handleChange}
                    className="h-12 rounded-xl bg-slate-50 border-none focus-visible:ring-primary/20"
                  />
                </div>
                <Button
                  onClick={handleSendCode}
                  className="w-full h-12 rounded-xl font-bold"
                >
                  인증코드 받기
                </Button>
              </div>
            )}

            {step === 2 && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>인증번호</Label>
                  <div className="relative">
                    <Input
                      name="code"
                      placeholder="6자리 입력"
                      onChange={handleChange}
                      className="h-12 rounded-xl bg-slate-50 border-none"
                    />
                    <span className="absolute right-4 top-3 text-red-500 font-mono">
                      {formatTime(timer)}
                    </span>
                  </div>
                </div>
                {mode === 'PW' && (
                  <div className="space-y-2">
                    <Label>새 비밀번호</Label>
                    <Input
                      name="newPassword"
                      type="password"
                      placeholder="8자리 이상 입력"
                      onChange={handleChange}
                      className="h-12 rounded-xl bg-slate-50 border-none"
                    />
                  </div>
                )}
                <Button
                  onClick={handleSubmit}
                  disabled={timer === 0}
                  className="w-full h-12 rounded-xl font-bold"
                >
                  {mode === 'ID' ? '아이디 확인' : '비밀번호 변경'}
                </Button>
              </div>
            )}

            {step === 3 && (
              <div className="text-center space-y-6 py-4">
                <div className="bg-slate-50 p-6 rounded-2xl">
                  <p className="text-sm text-muted-foreground mb-1">
                    찾으시는 아이디는
                  </p>
                  <p className="text-2xl font-black">{foundId}</p>
                </div>
                <Button
                  onClick={() => navigate('/login')}
                  className="w-full h-12 rounded-xl font-bold"
                >
                  로그인하러 가기
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default FindAccountPage;
