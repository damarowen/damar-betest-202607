import { Routes, Route, Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { RootState } from './redux/store';
import { OnlineStatusProvider } from './hooks/useOnlineStatus';
import LoginPage from './pages/LoginPage';
import UserListPage from './pages/UserListPage';
import UserDetailPage from './pages/UserDetailPage';
import UserFormPage from './pages/UserFormPage';
import NotFoundPage from './pages/NotFoundPage';
import MainLayout from './components/layout/MainLayout';
import OfflineBanner from './components/common/OfflineBanner';
import './index.css';

function App() {
  const token = useSelector((state: RootState) => state.auth.token);

  return (
    <OnlineStatusProvider>
      <div className="min-h-screen bg-slate-50">
        <OfflineBanner />
        <Routes>
          <Route path="/login" element={!token ? <LoginPage /> : <Navigate to="/users" />} />
          <Route path="/" element={token ? <MainLayout /> : <Navigate to="/login" />}>
            <Route index element={<Navigate to="/users" />} />
            <Route path="users" element={<UserListPage />} />
            <Route path="users/add" element={<UserFormPage />} />
            <Route path="users/:userId" element={<UserDetailPage />} />
            <Route path="users/edit/:userId" element={<UserFormPage />} />
          </Route>
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </div>
    </OnlineStatusProvider>
  );
}

export default App;
