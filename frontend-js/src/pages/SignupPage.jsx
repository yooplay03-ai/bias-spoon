import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import authApi from '../api/auth';
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
import { toast } from 'sonner';
import {
  UserPlus,
  Mail,
  Lock,
  UserCircle,
  ArrowRight,
  Check,
  AlertCircle,
} from 'lucide-react';

const SignupPage = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    loginId: '',
    userNickName: '',
    email: '',
    password: '',
  });

  const [idChecked, setIdChecked] = useState(false);
  const [nickNameChecked, setNickNameChecked] = useState(false);

  const checkId = async () => {
    if (!formData.loginId) return toast.error('아이디를 입력해주세요.');
    try {
      const isDuplicate = await authApi.checkLoginId(formData.loginId);
      if (isDuplicate) {
        toast.error('아이디 중복!', {
          description: '다른 아이디를 사용해주세요.',
        });
        setIdChecked(false);
      } else {
        toast.success('아이디 사용가능!', {
          description: '사용가능한 아이디입니다.',
        });
        setIdChecked(true);
      }
    } catch (err) {
      toast.error('중복 체크 중 오류 발생');
    }
  };

  const checkNickName = async () => {
    if (!formData.userNickName) return toast.error('닉네임를 입력해주세요.');
    try {
      const isDuplicate = await authApi.checkNickName(formData.userNickName);
      if (isDuplicate) {
        toast.error('닉네임 중복!', {
          description: '다른 닉네임을 사용해주세요.',
        });
        setNickNameChecked(false);
      } else {
        toast.success('닉네임 사용가능!', {
          description: '사용가능한 닉네임입니다.',
        });
        setNickNameChecked(true);
      }
    } catch (err) {
      toast.error('중복 체크 중 오류 발생');
    }
  };
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!idChecked || !nickNameChecked) {
      toast.error('아이디와 닉네임 중복 체크 를 완료해주세요.');
      return;
    }

    try {
      await authApi.signup(formData);
      toast.success('회원가입 성공!');
      navigate('/login');
    } catch (err) {
      toast.error(err.response?.data?.message || '회원가입에 실패했습니다.', {
        description: '입력 형식을 다시 확인해주세요.',
      });
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === 'loginId') setIdChecked(false);
    if (name === 'userNickName') setNickNameChecked(false);
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  return (
    <div className="flex items-center justify-center min-h-[90vh] px-4 py-12">
      <Card className="w-full max-w-112.5 border-none shadow-[0_32px_64px_-12px_rgba(0,0,0,0.1)] rounded-[2.5rem] bg-white/90 backdrop-blur-xl">
        <CardHeader className="space-y-3 text-center pt-12">
          <div className="mx-auto w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mb-2">
            <UserPlus className="w-8 h-8 text-primary" />
          </div>
          <CardTitle className="text-4xl font-black tracking-tight">
            회원가입
          </CardTitle>
          <CardDescription className="text-lg">
            회원 가입하고 분석 리포트를 공유해보세요.
          </CardDescription>
        </CardHeader>

        <CardContent className="p-10 pt-6">
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* 아이디 */}
            <div className="space-y-2">
              <Label htmlFor="loginId">아이디</Label>
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <UserCircle className="absolute left-4 top-3.5 h-5 w-5 text-muted-foreground" />
                  <Input
                    id="loginId"
                    name="loginId"
                    placeholder="아이디를 입력하세요"
                    value={formData.loginId}
                    onChange={handleChange}
                    className="pl-12 h-12 rounded-xl bg-slate-50/50 border-slate-100 focus-visible:ring-primary/20"
                    required
                  />
                </div>
                <Button
                  type="button"
                  onClick={checkId}
                  variant={idChecked ? 'outline' : 'secondary'}
                  className="h-12 px-4 rounded-xl font-bold transition-all min-w-25"
                >
                  {idChecked ? (
                    <Check className="w-5 h-5 text-green-500" />
                  ) : (
                    '중복 확인'
                  )}
                </Button>
              </div>
            </div>

            {/* 닉네임 */}
            <div className="space-y-2">
              <Label htmlFor="userNickName">닉네임</Label>
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <UserCircle className="absolute left-4 top-3.5 h-5 w-5 text-muted-foreground" />
                  <Input
                    id="userNickName"
                    name="userNickName"
                    placeholder="활동할 이름을 정해주세요"
                    value={formData.userNickName}
                    onChange={handleChange}
                    className="pl-12 h-12 rounded-xl bg-slate-50/50 border-slate-100 focus-visible:ring-primary/20"
                    required
                  />
                </div>
                <Button
                  type="button"
                  onClick={checkNickName}
                  variant={nickNameChecked ? 'outline' : 'secondary'}
                  className="h-12 px-4 rounded-xl font-bold transition-all min-w-25"
                >
                  {nickNameChecked ? (
                    <Check className="w-5 h-5 text-green-500" />
                  ) : (
                    '중복 확인'
                  )}
                </Button>
              </div>
            </div>

            {/* 이메일 */}
            <div className="space-y-2">
              <Label htmlFor="email">이메일</Label>
              <div className="relative">
                <Mail className="absolute left-4 top-3.5 h-5 w-5 text-muted-foreground" />
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="example@truthlens.com"
                  value={formData.email}
                  onChange={handleChange}
                  className="pl-12 h-12 rounded-xl bg-slate-50/50 border-slate-100 focus-visible:ring-primary/20"
                  required
                />
              </div>
            </div>

            {/* 비밀번호 */}
            <div className="space-y-2">
              <Label htmlFor="password">비밀번호</Label>
              <div className="relative">
                <Lock className="absolute left-4 top-3.5 h-5 w-5 text-muted-foreground" />
                <Input
                  id="password"
                  name="password"
                  type="password"
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={handleChange}
                  className="pl-12 h-12 rounded-xl bg-slate-50/50 border-slate-100 focus-visible:ring-primary/20"
                  required
                />
              </div>
            </div>

            <Button
              type="submit"
              className={`w-full h-14 rounded-2xl text-lg font-bold shadow-xl mt-4 transition-all active:scale-[0.98] ${
                !idChecked || !nickNameChecked
                  ? 'opacity-50 grayscale'
                  : 'shadow-primary/20'
              }`}
            >
              회원가입 완료 <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
          </form>

          <div className="mt-10 text-center text-slate-500">
            이미 계정이 있으신가요?{' '}
            <Link
              to="/login"
              className="text-primary font-bold hover:underline ml-1"
            >
              로그인하기
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SignupPage;
