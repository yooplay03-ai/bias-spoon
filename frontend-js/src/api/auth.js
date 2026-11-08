import { springApi } from './axios';

const authApi = {
  // 회원가입: UserDTO (loginId, nickName, email, password) 전송
  signup: async (userData) => {
    const response = await springApi.post('/users/signup', userData);
    return response.data;
  },

  checkLoginId: async (loginId) => {
    const response = await springApi.get(`/users/check-loginId/${loginId}`);
    return response.data;
  },

  checkNickName: async (nickname) => {
    const response = await springApi.get(`/users/check-nickname`, {
      params: { nickname },
    });
    return response.data;
  },

  updateUser: async (profileData) => {
    const response = await springApi.put('/users/profile/edit', profileData);
    return response.data;
  },

  passwordChange: async (passwordData) => {
    const response = await springApi.put(
      '/users/password/change',
      passwordData,
    );
    return response.data;
  },

  userDelete: async (passwordData) => {
    const response = await springApi.delete('/users/profile/delete', {
      data: passwordData,
    });
    return response.data;
  },

  getUserProfile: async () => {
    const response = await springApi.get('/users/profile');
    return response.data;
  },

  sendVerificationEmail: async (email) => {
    const response = await springApi.post('/users/send-code', { email });
    return response.data;
  },

  verifyAndFindId: async (email, code) => {
    const response = await springApi.post('/users/find-loginId/verify', {
      email,
      code,
    });
    return response.data;
  },

  resetPassword: async (email, code, newPassword) => {
    const response = await springApi.post('/users/password/reset', {
      email,
      code,
      newPassword,
    });
    return response.data;
  },

  // 로그인: 아이디와 비밀번호 전송
  login: async (loginId, password) => {
    const response = await springApi.post('/auth/login', { loginId, password });
    const { accessToken, refreshToken } = response.data;
    // 백엔드 응답 예시: { accessToken: "...", nickName: "..." }
    if (accessToken) {
      localStorage.setItem('accessToken', accessToken);
    }
    if (refreshToken) {
      localStorage.setItem('refreshToken', refreshToken);
    }
    return response.data;
  },

  // 로그아웃
  logout: async () => {
    const accessToken = localStorage.getItem('accessToken');
    const refreshToken = localStorage.getItem('refreshToken');
    const response = await springApi.post(
      '/auth/logout',
      {
        refreshToken: refreshToken,
      },
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      },
    );

    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    return response.data;
  },
};

export default authApi;
