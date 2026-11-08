import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  ArrowRight,
  BarChart3,
  Users,
  ShieldCheck,
  Zap,
  Search,
  Database,
  Cpu,
  MessageSquare,
  Lock,
} from 'lucide-react';

const MainPage = () => {
  return (
    <div className="max-w-7xl mx-auto px-6 py-20 space-y-24">
      {/* Hero Section */}
      <section className="relative text-center space-y-6 py-12">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full bg-primary/5 blur-[120px] rounded-full -z-10" />
        <Badge
          variant="outline"
          className="animate-bounce px-4 py-1.5 border-primary/20 text-primary bg-primary/5 rounded-full text-sm font-bold"
        >
          편향성 분석 엔진
        </Badge>
        <h1 className="text-7xl font-black tracking-tighter text-slate-900 leading-[1.1]">
          뉴스의 이면을 <br />
          <span className="text-primary italic">데이터</span>로 확인하세요
        </h1>
        <p className="text-xl text-slate-500 max-w-2xl mx-auto font-medium">
          Truth Lens는 복잡한 뉴스 텍스트를 분석하여 <br />
          정치적·사회적 편향성을 투명하게 수치화합니다.
        </p>
        <div className="flex justify-center gap-4 pt-4">
          <Button
            asChild
            size="xl"
            className="rounded-full px-10 text-lg shadow-2xl shadow-primary/20"
          >
            <Link to="/analysis">
              지금 분석하기 <ArrowRight className="ml-2 w-5 h-5" />
            </Link>
          </Button>
          <Button
            asChild
            variant="outline"
            size="xl"
            className="rounded-full px-10 text-lg border-2"
          >
            <Link to="/articles">커뮤니티 탐색</Link>
          </Button>
        </div>
      </section>

      {/* Bento Grid Features */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 auto-rows-[280px]">
        {/* 큰 카드: AI 분석 도구 */}
        <Card className="md:col-span-2 md:row-span-2 relative overflow-hidden border-none shadow-2xl bg-slate-900 group">
          <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1639322537228-f710d846310a?q=80&w=2000')] opacity-20 bg-cover group-hover:scale-105 transition-transform duration-700" />
          <CardHeader className="relative z-10 p-10">
            <Zap className="w-12 h-12 text-primary mb-4" />
            <CardTitle className="text-4xl font-bold text-white mb-4">
              실시간 뉴스 분석
            </CardTitle>
            <p className="text-slate-300 text-lg max-w-md leading-relaxed">
              기사 URL만 입력하면 분석 모듈이 수초 내에 감정, 어조, 정치적
              성향을 분석하여 시각화된 리포트를 제공합니다.
            </p>
            <div className="max-w-md bg-white/10 backdrop-blur-md border border-white/20 p-2 rounded-2xl flex gap-2">
              <div className="bg-white/5 flex-1 rounded-xl px-4 py-2 text-white/40 text-sm flex items-center">
                https://news.v.daum.net/v/...
              </div>
              <Button size="sm" className="rounded-lg font-bold">
                분석하기
              </Button>
            </div>
          </CardHeader>
          <div className="absolute bottom-10 left-10 z-10">
            <Button asChild variant="secondary" className="rounded-full">
              <Link to="/analysis">엔진 가동하기</Link>
            </Button>
          </div>
        </Card>

        {/* 작은 카드 1: 커뮤니티 */}
        <Card className="md:row-span-2 flex flex-col justify-between border-none shadow-xl bg-indigo-50/50 hover:bg-indigo-50 transition-colors">
          <CardHeader>
            <Users className="w-10 h-10 text-indigo-600 mb-2" />
            <CardTitle className="text-2xl font-bold">집단 지성</CardTitle>
            <p className="text-slate-600">
              다른 사용자들의 분석 결과를 보고 자유롭게 의견을 나눠보세요.
            </p>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="h-2 w-full bg-indigo-200 rounded-full animate-pulse" />
              <div className="h-2 w-3/4 bg-indigo-200 rounded-full animate-pulse" />
            </div>
            <Button asChild variant="link" className="mt-6 p-0 text-indigo-600">
              <Link to="/articles">게시판 바로가기 →</Link>
            </Button>
          </CardContent>
        </Card>

        {/* 작은 카드 2: 데이터 신뢰성 */}
        <Card className="md:col-span-1 border-none shadow-xl bg-white flex items-center p-6 gap-6">
          <div className="p-4 bg-emerald-50 rounded-2xl">
            <ShieldCheck className="w-8 h-8 text-emerald-600" />
          </div>
          <div>
            <h4 className="font-bold text-lg">높은 신뢰도</h4>
            <p className="text-sm text-slate-500">FastAPI & LLM 기반 검증</p>
          </div>
        </Card>

        {/* 작은 카드 3: 분석 통계 */}
        <Card className="md:col-span-2 border-none shadow-xl bg-white p-8 overflow-hidden">
          <CardHeader className="p-0 mb-8">
            <CardTitle className="text-2xl font-bold flex items-center gap-2">
              <Zap className="w-6 h-6 text-primary" />
              Truth Lens 분석 프로세스
            </CardTitle>
            <p className="text-slate-500 text-sm">
              4단계의 정밀 공정을 거쳐 리포트가 생성됩니다.
            </p>
          </CardHeader>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 relative">
            {/* 단계 사이의 연결선 (데스크탑 전용) */}
            <div className="hidden md:block absolute top-1/2 left-0 w-full h-0.5 bg-slate-100 -translate-y-8 z-0" />

            {/* 1단계: 크롤링 */}
            <div className="relative z-10 flex flex-col items-center text-center space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center shadow-sm">
                <Search className="w-6 h-6" />
              </div>
              <div>
                <h5 className="font-bold text-sm">1. 뉴스 크롤링</h5>
                <p className="text-[11px] text-slate-400">
                  실시간 기사 데이터 수집
                </p>
              </div>
            </div>

            {/* 2단계: 전처리 */}
            <div className="relative z-10 flex flex-col items-center text-center space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center shadow-sm">
                <Database className="w-6 h-6" />
              </div>
              <div>
                <h5 className="font-bold text-sm">2. 데이터 전처리</h5>
                <p className="text-[11px] text-slate-400">
                  노이즈 제거 및 텍스트 정제
                </p>
              </div>
            </div>

            {/* 3단계: BERT 모델링 */}
            <div className="relative z-10 flex flex-col items-center text-center space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center shadow-sm border border-primary/20">
                <Cpu className="w-6 h-6" />
              </div>
              <div>
                <h5 className="font-bold text-sm">3. 편향성 수치화</h5>
                <Badge
                  variant="secondary"
                  className="text-[9px] px-1 py-0 mb-1"
                >
                  BERT 5-Split
                </Badge>
                <p className="text-[11px] text-slate-400">
                  문장 단위 정밀 성향 분석
                </p>
              </div>
            </div>

            {/* 4단계: LLM (비활성) */}
            <div className="relative z-10 flex flex-col items-center text-center space-y-3 opacity-50">
              <div className="w-12 h-12 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center">
                <Lock className="w-5 h-5" />
              </div>
              <div>
                <h5 className="font-bold text-sm">4. AI 코멘트</h5>
                <span className="text-[9px] font-bold text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded">
                  준비 중...
                </span>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default MainPage;
