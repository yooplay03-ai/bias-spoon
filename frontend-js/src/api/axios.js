import axios from 'axios';

// 1. FastAPI 인스턴스 (인증 헤더 없이 깔끔하게 유지)
export const aiApi = axios.create({
  baseURL: `http://${window.location.hostname}:8000/api`,
});

// 2. Spring 인스턴스 (인증 및 게시판용)
export const springApi = axios.create({
  // baseURL: 'http://localhost:8080/api',
  baseURL: `http://${window.location.hostname}:8080/api`,
  withCredentials: true,
});

let isRefreshing = false;
let refreshSubscribers = [];

const SubscribeTokenRefresh = (callback) => {
  refreshSubscribers.push(callback);
};

const onRefreshed = (token) => {
  refreshSubscribers.map((callback) => callback(token));
  refreshSubscribers = [];
};

// [Request Interceptor] 요청 보내기 전 토큰 자동 주입
springApi.interceptors.request.use(
  (config) => {
    config.withCredentials = true;
    const token = localStorage.getItem('accessToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error),
);

// [Response Interceptor] 응답 에러 공통 처리
springApi.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    const originalRequest = error.config;

    // 1. 401 에러 (인증 만료 또는 탈퇴 유저 차단) 처리
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      if (isRefreshing) {
        return new Promise((resolve) => {
          SubscribeTokenRefresh((token) => {
            originalRequest.headers['Authorization'] = `Bearer ${token}`;
            resolve(springApi(originalRequest));
          });
        });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        console.log('Access Token 만료. 토큰 재발급 시도...');
        const refreshToken = localStorage.getItem('refreshToken');

        if (!refreshToken) throw new Error('Refresh Token 만료');

        const response = await axios.post(
          `http:///${window.location.hostname}:8080/api/auth/reissue`,
          {
            refreshToken: refreshToken,
          },
        );
        console.log('토큰 재발급 성공.', response.data);

        if (response.status === 200) {
          const { accessToken, refreshToken: newRefreshToken } = response.data;
          localStorage.setItem('accessToken', accessToken);
          if (newRefreshToken)
            localStorage.setItem('refreshToken', newRefreshToken);

          isRefreshing = false;
          onRefreshed(accessToken);

          originalRequest.headers['Authorization'] = `Bearer ${accessToken}`;
          return springApi(originalRequest);
        }
      } catch (refreshError) {
        isRefreshing = false;
        console.error(
          '세션이 만료되어 로그아웃합니다., refreshToken 만료:',
          refreshError,
        );
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        if (window.location.pathname !== '/login') {
          alert('세션이 만료되었습니다. 다시 로그인 해주세요.');
          window.location.href = '/login';
        }
        return Promise.reject(refreshError);
      }
    }

    // 2. 500 에러 처리
    if (error.response?.status === 500) {
      console.error('서버 내부 오류가 발생했습니다.');
    }

    return Promise.reject(error);
  },
);
