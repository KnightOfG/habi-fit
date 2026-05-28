import { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider, useAuth } from './hooks/useAuth';
import Auth from './components/Auth';
import Navigation from './components/Navigation';
import { useNotifications } from './components/NotificationService';

const TodayPage = lazy(() => import('./pages/TodayPage'));
const CalendarPage = lazy(() => import('./pages/CalendarPage'));
const CategoriesPage = lazy(() => import('./pages/CategoriesPage'));
const AllRemindersPage = lazy(() => import('./pages/AllRemindersPage'));

function PageLoader() {
  return (
    <div className="flex items-center justify-center py-20">
      <div className="w-5 h-5 border-2 border-accent/30 border-t-accent rounded-full animate-spin" />
    </div>
  );
}

function AppContent() {
  const { user, loading } = useAuth();
  useNotifications();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-surface-0">
        <div className="w-6 h-6 border-2 border-accent/30 border-t-accent rounded-full animate-spin" />
      </div>
    );
  }

  if (!user) return <Auth />;

  return (
    <div className="min-h-screen bg-surface-0 max-w-lg mx-auto relative">
      <Suspense fallback={<PageLoader />}>
        <Routes>
          <Route path="/" element={<TodayPage />} />
          <Route path="/calendar" element={<CalendarPage />} />
          <Route path="/categories" element={<CategoriesPage />} />
          <Route path="/all" element={<AllRemindersPage />} />
        </Routes>
      </Suspense>
      <Navigation />
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </BrowserRouter>
  );
}
