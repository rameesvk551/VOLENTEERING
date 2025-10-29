import { Routes, Route, Navigate } from 'react-router-dom';
import { useEffect } from 'react';
import { useAppSelector } from '@/store';
import { DashboardLayout } from './layouts/DashboardLayout';
import { Dashboard } from './pages/Dashboard';
import { UsersPage } from './pages/UsersPage';
import { TripsPage } from './pages/TripsPage';
import { HostsPage } from './pages/HostsPage';
import { GearRentalsPage } from './pages/GearRentalsPage';
import { BookingsPage } from './pages/BookingsPage';
import { BlogPage } from './pages/BlogPage';
import { BlogCreatePage } from './pages/BlogCreatePage';
import { FinancePage } from './pages/FinancePage';
import { AnalyticsPage } from './pages/AnalyticsPage';
import { ContentPage } from './pages/ContentPage';

function App() {
  const { isAuthenticated, token } = useAppSelector((state) => state.auth);

  useEffect(() => {
    // Check if user is not authenticated and redirect to shell login
    if (!isAuthenticated && !token) {
      window.location.href = 'http://localhost:5000/login';
    }
  }, [isAuthenticated, token]);

  // Show loading while checking authentication
  if (!isAuthenticated && !token) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-4 text-gray-600">Redirecting to login...</p>
        </div>
      </div>
    );
  }

  return (
    <Routes>
      <Route path="/" element={<DashboardLayout />}>
        <Route index element={<Navigate to="/dashboard" replace />} />
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="users" element={<UsersPage />} />
        <Route path="trips" element={<TripsPage />} />
        <Route path="hosts" element={<HostsPage />} />
        <Route path="gear-rentals" element={<GearRentalsPage />} />
        <Route path="bookings" element={<BookingsPage />} />
        <Route path="blog" element={<BlogPage />} />
        <Route path="blog/create" element={<BlogCreatePage />} />
        <Route path="finance" element={<FinancePage />} />
        <Route path="analytics" element={<AnalyticsPage />} />
        <Route path="content" element={<ContentPage />} />
      </Route>
    </Routes>
  );
}

export default App;
