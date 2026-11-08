import React, { createContext, useState, useContext, useEffect } from 'react';
import authApi from '../api/auth';
import { springApi } from '../api/axios';
import { jwtDecode } from 'jwt-decode';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        console.log(payload.role);
        const decoded = jwtDecode(token);
        return {
          loginId: decoded.sub,
          userNickName: decoded.userNickName,
          role: decoded.role,
          email: decoded.email || '',
        };
      } catch (err) {
        console.error('Initial Token Decode Error:', err);
        return null;
      }
    }
    return null;
  });
  const [loading, setLoading] = useState(true);

  // 1. 로그인 함수
  const login = async (loginId, password) => {
    try {
      const response = await authApi.login(loginId, password);
      // axios 설정에 따라 response.data 또는 response 자체를 처리
      const data = response.data || response;
      console.log('Login Response Data:', data);

      if (data.accessToken) {
        localStorage.setItem('accessToken', data.accessToken);
        localStorage.setItem('refreshToken', data.refreshToken);

        const decoded = jwtDecode(data.accessToken);
        const newUser = {
          loginId: decoded.sub,
          userNickName: decoded.userNickName,
          role: decoded.role,
          email: data.email || '',
        };
        setUser(newUser);
        return newUser; // 로그인 성공 시 사용자 정보 반환 (선택 사항)
      }
    } catch (error) {
      console.error('Login Error:', error);
      throw error; // LoginPage에서 catch하여 처리할 수 있게 던짐
    }
  };

  // 2. 로그아웃 함수
  const logout = async () => {
    try {
      await authApi.logout();
      console.log('Logout Success');
    } catch (err) {
      console.error('Logout API Error:', err);
    } finally {
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      setUser(null);
    }
  };

  // 3. 인증 체크 및 토큰 재발급 로직
  const checkAuth = async () => {
    const token = localStorage.getItem('accessToken');

    if (!token) {
      setLoading(false);
      return;
    }

    try {
      const decoded = jwtDecode(token);
      console.log('토큰 페이로드 전체:', decoded);
      const isExpired = decoded.exp * 1000 < Date.now();

      if (!isExpired) {
        setUser({
          loginId: decoded.sub,
          userNickName: decoded.userNickName,
          role: decoded.role,
          email: decoded.email || '',
        });
        setLoading(false);
        return;
      }
      const response = await springApi.post('/auth/reissue', {});
      const data = response.data;

      localStorage.setItem('accessToken', data.accessToken);
      localStorage.setItem('refreshToken', data.refreshToken);

      const newDecoded = jwtDecode(data.accessToken);
      setUser({
        loginId: newDecoded.sub,
        userNickName: newDecoded.userNickName,
        role: newDecoded.role,
        email: data.email || '',
      });
    } catch (err) {
      console.error('Auth Check Failed (Server Error or Expired):', err);

      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
    } finally {
      // 성공하든 실패하든 화면을 보여주기 위해 loading은 false가 되어야 합니다.
      setLoading(false);
    }
  };

  useEffect(() => {
    checkAuth();
  }, []);

  return (
    <AuthContext.Provider value={{ user, setUser, login, logout, loading }}>
      {/* 로딩 중일 때는 로딩 UI를, 완료 후에는 실제 앱(children)을 렌더링 */}
      {!loading ? (
        children
      ) : (
        <div className="flex h-screen items-center justify-center bg-slate-50">
          <div className="text-indigo-600 font-semibold italic animate-pulse">
            인증 정보를 확인 중입니다...
          </div>
        </div>
      )}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};

export const checkIsAdmin = (user) => {
  if (!user) return false;

  if (Array.isArray(user.authorities)) {
    return user.authorities.some((auth) => auth.authorityName === 'ADMIN');
  }

  const userRole = user.role || user.authority;
  return userRole === 'ADMIN';
};
