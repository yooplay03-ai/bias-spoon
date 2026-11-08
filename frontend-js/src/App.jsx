import React from 'react';
import {
  BrowserRouter as Router,
  Routes,
  Route,
  useLocation,
  Navigate,
  Outlet,
} from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Header from './components/layout/Header';
import MainPage from './pages/MainPage';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import AnalysisPage from './pages/AnalysisPage';
import ArticleListPage from './pages/ArticleListPage';
import ArticleDetailPage from './pages/ArticleDetailPage';
import ArticleWritePage from './pages/ArticleWritePage';
import ArticleEditPage from './pages/ArticleEditPage';
import ProfilePage from './pages/ProfilePage';
import AdminDashboardPage from './pages/admin/AdminDashboardPage';
import AdminUserPage from './pages/admin/AdminUserPage';
import AdminCommentPage from './pages/admin/AdminCommentPage';
import AdminArticlePage from './pages/admin/AdminArticlePage';
import AdminNoticeWritePage from './pages/admin/AdminNoticeWritePage';
import FindAccountPage from './pages/FindAccountPage';
import Navbar from './components/layout/Navbar';
import { Toaster } from 'sonner';
import AdminLayout from './components/admin/AdminLayout';

console.log('App rendered');

const Private = ({ children }) => {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return <div>Loading...</div>;
  }

  return user ? (
    children
  ) : (
    <Navigate to="/login" state={{ from: location }} replace />
  );
};

const AdminPrivate = ({ user }) => {
  const isAdmin = user?.role === 'ADMIN';

  if (!isAdmin) {
    alert('관리자만 접근 가능한 페이지입니다.');
    return <Navigate to="/" replace />;
  }
  return <Outlet />;
};

function App() {
  return (
    <AuthProvider>
      <AppContent />;
    </AuthProvider>
  );
}

function AppContent() {
  const { user, loading } = useAuth();

  if (loading) return <div>Loading...</div>;

  return (
    <Router>
      <Navbar />
      <Toaster position="top-center" richColors closeButton />
      <main>
        <Routes>
          <Route path="/" element={<MainPage />} />

          <Route path="/find-account" element={<FindAccountPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />
          <Route path="/articles" element={<ArticleListPage />} />
          <Route
            path="/profile"
            element={
              <Private>
                <ProfilePage />
              </Private>
            }
          />
          <Route
            path="/analysis"
            element={
              <Private>
                <AnalysisPage />
              </Private>
            }
          />
          <Route
            path="/articles/write"
            element={
              <Private>
                <ArticleWritePage />
              </Private>
            }
          />
          <Route path="/articles/:id" element={<ArticleDetailPage />} />
          <Route
            path="/articles/edit/:id"
            element={
              <Private>
                <ArticleEditPage />
              </Private>
            }
          />

          <Route element={<AdminPrivate user={user} />}>
            <Route path="/admin" element={<AdminLayout />}>
              <Route index element={<AdminDashboardPage />} />
              <Route path="notice/write" element={<AdminNoticeWritePage />} />
              <Route path="users" element={<AdminUserPage />} />
              <Route path="comments" element={<AdminCommentPage />} />
              <Route path="articles" element={<AdminArticlePage />} />
            </Route>
          </Route>

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
    </Router>
  );
}

export default App;
