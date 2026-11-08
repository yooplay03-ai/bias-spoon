import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import authApi from '../api/auth'; // 중복체크, 수정 API 등
import articleApi from '../api/articles'; // 내 글/댓글 조회 API
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import {
  User,
  Settings,
  FileText,
  MessageSquare,
  ShieldAlert,
  Clock,
  ChevronRight,
  Heart,
  UserX,
} from 'lucide-react';

const ProfilePage = () => {
  const { user, setUser, logout } = useAuth();
  const navigate = useNavigate();

  // 상태 관리
  const [profileData, setProfileData] = useState({
    userNickName: user?.userNickName || '',
    email: user?.email || '',
    createdAt: '',
    updataedAt: '',
    status: '',
  });
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    newPasswordConfirm: '',
  });

  const [articlePage, setArticlePage] = useState(0);
  const [commentPage, setCommentPage] = useState(0);

  const [articleTotalPage, setArticleTotalPage] = useState(0);
  const [commentTotalPage, setCommentTotalPage] = useState(0);

  const [myArticles, setMyArticles] = useState([]);
  const [myComments, setMyComments] = useState([]);
  const [loading, setLoading] = useState(true);

  // 1. 프로필 수정 핸들러
  const handleUpdateNickname = async (e) => {
    if (!profileData.userNickName) return toast.error('닉네임을 입력해주세요.');
    try {
      // 닉네임 중복 체크 로직 포함 필요
      const data = await authApi.updateUser({
        userNickName: profileData.userNickName,
      });
      if (data) {
        setProfileData((prev) => ({
          ...prev,
          userNickName: data.userNickName,
        }));
      }
      setUser((prev) => ({
        ...prev,
        data,
      }));

      toast.success('닉네임이 변경되었습니다.');
    } catch (err) {
      toast.error(err.response?.data?.message || '닉네임 변경 실패');
    }
  };
  const handleUpdateEmail = async (e) => {
    if (!profileData.email) return toast.error('이메일을 입력해주세요.');
    try {
      // 닉네임 중복 체크 로직 포함 필요
      const data = await authApi.updateUser({ email: profileData.email });

      if (data) {
        setProfileData((prev) => ({
          ...prev,
          userNickName: data.userNickName,
        }));
      }
      setUser((prev) => ({
        ...prev,
        data,
      }));

      toast.success('이메일이 변경되었습니다.');
    } catch (err) {
      toast.error(err.response?.data?.message || '이메일 변경 실패');
    }
  };

  // 2. 비밀번호 변경 핸들러 (오늘 백엔드 로직 반영)
  const handleChangePassword = async (e) => {
    e.preventDefault();

    if (passwordData.newPassword !== passwordData.newPasswordConfirm) {
      toast.error('새 비밀번호와 확인 비밀번호가 일치하지 않습니다.');
      return;
    }

    try {
      await authApi.passwordChange(passwordData);
      toast.success('비밀번호가 변경되었습니다. 다시 로그인해주세요.');
      logout(); // 백엔드에서 토큰을 지웠으므로 프론트에서도 로그아웃 처리
      navigate('/login');
    } catch (err) {
      toast.error(err.response?.data?.message || '비밀번호 변경 실패');
    }
  };

  const fetchUserProfile = async () => {
    try {
      const data = await authApi.getUserProfile();
      if (data) {
        setProfileData((prev) => ({
          ...prev,
          userNickName: data.userNickName,
          email: data.email,
          createdAt: data.createdAt,
          updataedAt: data.updatedAt,
          status: data.status,
        }));

        setUser((prev) => ({
          ...prev,
          data,
        }));
      }
    } catch (err) {
      console.error('프로필 로딩 실패:', err);
    }
  };

  useEffect(() => {
    fetchUserProfile();
  }, []);

  const handleWithdraw = async () => {
    if (
      !window.confirm(
        '정말로 탈퇴하시겠습니까? 작성한 데이터는 삭제되지 않을 수 있습니다.',
      )
    )
      return;
    const password = prompt('본인 확인을 위해 비밀번호를 입력해주세요.');
    if (!password) return;

    try {
      await authApi.userDelete({ currentPassword: password });
      toast.success('탈퇴 처리가 완료되었습니다.');

      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');

      setUser(null);

      navigate('/');
    } catch (err) {
      toast.error('탈퇴 처리 중 오류가 발생했습니다.');
    }
  };
  const fetchMyArticles = async () => {
    if (!user) return;
    try {
      setLoading(true);
      const articlesData = await articleApi.getMyArticles({
        page: articlePage,
        size: 5,
      });
      setMyArticles(articlesData.content || []);
      setArticleTotalPage(articlesData.totalPages || 0);
    } catch (err) {
      console.error('글 작성 내역 로딩 실패:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchMyComments = async () => {
    if (!user) return;
    try {
      const commentsData = await articleApi.getMyComments({
        page: commentPage,
        size: 5,
      });
      setMyComments(commentsData.content || []);
      setCommentTotalPage(commentsData.totalPages || 0);
    } catch (err) {
      console.error('댓글 작성 내역 로딩 실패:', err);
    }
  };
  useEffect(() => {
    fetchMyArticles();
  }, [user, articlePage]);

  useEffect(() => {
    fetchMyComments();
  }, [user, commentPage]);

  return (
    <div className="max-w-5xl mx-auto py-12 px-6">
      <div className="flex items-center gap-4 mb-10">
        <div className="w-16 h-16 bg-indigo-600 rounded-3xl flex items-center justify-center shadow-lg shadow-indigo-200">
          <User className="w-8 h-8 text-white" />
        </div>
        <div>
          <h1 className="text-3xl font-black text-slate-900">
            {profileData.userNickName}님의 마이페이지
          </h1>
          <p className="text-slate-500 font-medium">
            {user?.loginId} 계정으로 로그인 중
          </p>
        </div>
      </div>
      {/* 헤더 바로 아래에 추가하여 현재 정보를 브리핑해줌 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <Card className="border-none shadow-md rounded-2xl bg-indigo-50/50">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="p-2 bg-white rounded-lg shadow-sm">
              <Clock className="w-5 h-5 text-indigo-600" />
            </div>
            <div>
              <p className="text-xs text-slate-500 font-bold">가입일</p>
              <p className="text-sm font-black text-slate-800">
                {profileData.createdAt
                  ? profileData.createdAt.split('T')[0]
                  : '정보 없음'}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-none shadow-md rounded-2xl bg-emerald-50/50">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="p-2 bg-white rounded-lg shadow-sm">
              <Heart className="w-5 h-5 text-emerald-600" />
            </div>
            <div>
              <p className="text-xs text-slate-500 font-bold">활동 상태</p>
              <p className="text-sm font-black text-slate-800">
                {user?.status === 'ACTIVE' ? '활동 중' : '휴면'}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-none shadow-md rounded-2xl bg-slate-50/50">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="p-2 bg-white rounded-lg shadow-sm">
              <Settings className="w-5 h-5 text-slate-600" />
            </div>
            <div>
              <p className="text-xs text-slate-500 font-bold">아이디</p>
              <p className="text-sm font-black text-slate-800">
                {user?.loginId}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="account" className="space-y-8">
        <TabsList className="bg-slate-100 p-1.5 rounded-2xl h-auto gap-2">
          <TabsTrigger
            value="account"
            className="rounded-xl px-6 py-3 font-bold data-[state=active]:bg-white data-[state=active]:shadow-sm"
          >
            <Settings className="w-4 h-4 mr-2" /> 계정 설정
          </TabsTrigger>
          <TabsTrigger
            value="activity"
            className="rounded-xl px-6 py-3 font-bold data-[state=active]:bg-white data-[state=active]:shadow-sm"
          >
            <FileText className="w-4 h-4 mr-2" /> 활동 내역
          </TabsTrigger>
          <TabsTrigger
            value="security"
            className="rounded-xl px-6 py-3 font-bold data-[state=active]:bg-white data-[state=active]:shadow-sm"
          >
            <ShieldAlert className="w-4 h-4 mr-2" /> 보안 및 기타
          </TabsTrigger>
        </TabsList>

        {/* 탭 1: 계정 설정 (프로필 수정) */}
        <TabsContent value="account">
          <Card className="border-none shadow-xl rounded-[2.5rem] p-6">
            <CardHeader>
              <CardTitle>프로필 정보 수정</CardTitle>
              <CardDescription>
                공개될 닉네임과 이메일 정보를 변경할 수 있습니다.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label>닉네임</Label>
                <div className="flex gap-2">
                  <Input
                    value={profileData.userNickName}
                    onChange={(e) =>
                      setProfileData({
                        ...profileData,
                        userNickName: e.target.value,
                      })
                    }
                    className="h-12 rounded-xl bg-slate-50/50"
                  />
                  <Button
                    onClick={handleUpdateNickname}
                    className="h-12 px-6 rounded-xl font-bold transition-all active:scale-95"
                  >
                    닉네임 변경
                  </Button>
                </div>
                <p className="text-xs text-slate-400">
                  한글, 영문, 숫자 포함 16자 이내
                </p>
              </div>

              <hr className="border-slate-100" />

              <div className="space-y-2">
                <Label>이메일 주소</Label>
                <div className="flex gap-2">
                  <Input
                    type="email"
                    value={profileData.email}
                    onChange={(e) =>
                      setProfileData({
                        ...profileData,
                        email: e.target.value,
                      })
                    }
                    className="h-12 rounded-xl bg-slate-50/50"
                  />
                  <Button
                    onClick={handleUpdateEmail}
                    variant="outline"
                    className="h-12 px-6 rounded-xl font-bold border-indigo-100 text-indigo-600 hover:bg-indigo-50"
                  >
                    이메일 변경
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* 탭 2: 활동 내역 (글/댓글 목록) */}
        <TabsContent value="activity">
          <div className="grid gap-8 md:grid-cols-2">
            {/* 내가 쓴 글 목록 */}
            <Card className="border-none shadow-xl rounded-[2.5rem] overflow-hidden">
              <CardHeader className="bg-slate-50/50 border-b border-slate-100 pb-4">
                <CardTitle className="text-xl flex items-center gap-2">
                  <FileText className="w-5 h-5 text-indigo-600" /> 내가 쓴 글
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                {myArticles.length > 0 ? (
                  <>
                    <div className="divide-y divide-slate-50">
                      {myArticles.map((article) => (
                        <Link
                          key={article.articleId}
                          to={`/articles/${article.articleId}`}
                          className="flex items-center justify-between p-5 hover:bg-slate-50 transition-colors group"
                        >
                          <div className="space-y-1">
                            <p className="font-bold text-slate-800 group-hover:text-indigo-600 transition-colors">
                              {article.subject}
                            </p>
                            <div className="flex items-center gap-3 text-xs text-slate-400">
                              <span className="flex items-center gap-1">
                                <Clock className="w-3 h-3" />{' '}
                                {article.createdAt.split('T')[0]}
                              </span>
                              <span className="flex items-center gap-1">
                                <Heart className="w-3 h-3 fill-current text-red-400" />{' '}
                                {article.articleLikeCount || 0}
                              </span>
                            </div>
                          </div>
                          <ChevronRight className="w-5 h-5 text-slate-300 group-hover:text-indigo-400 transition-all group-hover:translate-x-1" />
                        </Link>
                      ))}
                    </div>

                    {/* 글 페이지네이션 컨트롤 */}
                    <div className="flex items-center justify-between p-4 bg-slate-50/50 border-t border-slate-100">
                      <Button
                        variant="outline"
                        size="sm"
                        disabled={articlePage === 0}
                        onClick={() => setArticlePage((prev) => prev - 1)}
                      >
                        이전
                      </Button>
                      <span className="text-sm font-medium text-slate-500">
                        {articlePage + 1} /{' '}
                        {articleTotalPage === 0 ? 1 : articleTotalPage}
                      </span>
                      <Button
                        variant="outline"
                        size="sm"
                        disabled={
                          articleTotalPage === 0 ||
                          articlePage >= articleTotalPage - 1
                        }
                        onClick={() => setArticlePage((prev) => prev + 1)}
                      >
                        다음
                      </Button>
                    </div>
                  </>
                ) : (
                  <div className="p-10 text-center text-slate-400 italic">
                    작성한 글이 없습니다.
                  </div>
                )}
              </CardContent>
            </Card>

            {/* 내가 쓴 댓글 목록 */}
            <Card className="border-none shadow-xl rounded-[2.5rem] overflow-hidden">
              <CardHeader className="bg-slate-50/50 border-b border-slate-100 pb-4">
                <CardTitle className="text-xl flex items-center gap-2">
                  <MessageSquare className="w-5 h-5 text-indigo-600" /> 내가 쓴
                  댓글
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                {myComments.length > 0 ? (
                  <>
                    <div className="divide-y divide-slate-50">
                      {myComments.map((comment) => (
                        <Link
                          key={comment.commentId}
                          to={`/articles/${comment.articleId}`}
                          className="block p-5 hover:bg-slate-50 transition-colors"
                        >
                          <p className="text-sm text-slate-700 font-medium mb-2 line-clamp-1">
                            "{comment.content}"
                          </p>
                          <div className="flex justify-between items-center text-[11px]">
                            <span className="text-indigo-500 font-bold bg-indigo-50 px-2 py-0.5 rounded">
                              원문 보기
                            </span>
                            <span className="text-slate-400">
                              {comment.createdAt.split('T')[0]}
                            </span>
                          </div>
                        </Link>
                      ))}
                    </div>

                    <div className="flex items-center justify-between p-4 bg-slate-50/50 border-t border-slate-100">
                      <Button
                        variant="outline"
                        size="sm"
                        disabled={commentPage === 0}
                        onClick={() => setCommentPage((prev) => prev - 1)}
                      >
                        이전
                      </Button>
                      <span className="text-sm font-medium text-slate-500">
                        {commentPage + 1} /{' '}
                        {commentTotalPage === 0 ? 1 : commentTotalPage}
                      </span>
                      <Button
                        variant="outline"
                        size="sm"
                        disabled={
                          commentTotalPage === 0 ||
                          commentPage >= commentTotalPage - 1
                        }
                        onClick={() => setCommentPage((prev) => prev + 1)}
                      >
                        다음
                      </Button>
                    </div>
                  </>
                ) : (
                  <div className="p-10 text-center text-slate-400 italic">
                    작성한 댓글이 없습니다.
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* 탭 3: 보안 (비밀번호 변경/탈퇴) */}
        <TabsContent value="security" className="space-y-6">
          <Card className="border-none shadow-xl rounded-[2.5rem] p-6">
            <CardHeader>
              <CardTitle>비밀번호 변경</CardTitle>
              <CardDescription>
                안전을 위해 정기적으로 비밀번호를 변경해주세요.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form
                onSubmit={handleChangePassword}
                className="space-y-4 max-w-sm"
              >
                <div className="space-y-2">
                  <Label>현재 비밀번호</Label>
                  <Input
                    type="password"
                    placeholder="현재 비밀번호를 입력하세요"
                    className="h-12 rounded-xl bg-slate-50/50 border-slate-100"
                    value={passwordData.currentPassword}
                    onChange={(e) =>
                      setPasswordData({
                        ...passwordData,
                        currentPassword: e.target.value,
                      })
                    }
                  />
                </div>

                <div className="space-y-2">
                  <Label>새 비밀번호</Label>
                  <Input
                    type="password"
                    placeholder="새 비밀번호를 입력하세요"
                    className="h-12 rounded-xl bg-slate-50/50 border-slate-100"
                    value={passwordData.newPassword}
                    onChange={(e) =>
                      setPasswordData({
                        ...passwordData,
                        newPassword: e.target.value,
                      })
                    }
                  />
                </div>

                <div className="space-y-2">
                  <Label>새 비밀번호 확인</Label>
                  <Input
                    type="password"
                    placeholder="새 비밀번호를 한 번 더 입력하세요"
                    className="h-12 rounded-xl bg-slate-50/50 border-slate-100"
                    value={passwordData.newPasswordConfirm}
                    onChange={(e) =>
                      setPasswordData({
                        ...passwordData,
                        newPasswordConfirm: e.target.value,
                      })
                    }
                  />
                </div>

                <Button
                  type="submit"
                  className="w-full h-12 rounded-xl font-bold mt-2"
                >
                  비밀번호 업데이트
                </Button>
              </form>
            </CardContent>
          </Card>

          <Card className="border border-red-100 bg-red-50/30 rounded-[2.5rem] p-6">
            <CardHeader>
              <CardTitle className="text-red-600 flex items-center gap-2">
                <UserX className="w-5 h-5" /> 위험 구역
              </CardTitle>
            </CardHeader>
            <CardContent className="flex items-center justify-between">
              <p className="text-slate-600 text-sm font-medium">
                계정을 삭제하면 모든 활동 정보가 삭제되며 복구할 수 없습니다.
              </p>
              <Button
                onClick={handleWithdraw}
                variant="destructive"
                className="rounded-xl font-bold"
              >
                회원 탈퇴
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ProfilePage;
