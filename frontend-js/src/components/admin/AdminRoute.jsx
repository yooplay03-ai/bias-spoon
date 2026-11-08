import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const AdminRoute = () => {
  const { user, loading } = useAuth();

  if (loading) return null; // 로딩 중일 때는 아무것도 안 보여줌

  // 사용자가 없거나, 권한 중 ADMIN이 포함되어 있지 않으면 튕겨냄
  const isAdmin = user?.authorities?.some(
    (auth) => auth.authorityName === 'ADMIN',
  );

  if (!isAdmin) {
    alert('관리자만 접근 가능한 페이지입니다.');
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
};

export default AdminRoute;
