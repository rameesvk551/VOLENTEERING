import { Routes, Route, Navigate } from 'react-router-dom';
import { DashboardLayout } from './layouts/DashboardLayout';
import { Dashboard } from './pages/Dashboard';
import { UsersPage } from './pages/UsersPage';
import { TripsPage } from './pages/TripsPage';
import { HostsPage } from './pages/HostsPage';
import { GearRentalsPage } from './pages/GearRentalsPage';
import { BookingsPage } from './pages/BookingsPage';
import { BlogPage } from './pages/BlogPage';
import { FinancePage } from './pages/FinancePage';
import { AnalyticsPage } from './pages/AnalyticsPage';
import { ContentPage } from './pages/ContentPage';
import { LoginPage } from './pages/LoginPage';

function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/" element={<DashboardLayout />}>
        <Route index element={<Navigate to="/dashboard" replace />} />
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="users" element={<UsersPage />} />
        <Route path="trips" element={<TripsPage />} />
        <Route path="hosts" element={<HostsPage />} />
        <Route path="gear-rentals" element={<GearRentalsPage />} />
        <Route path="bookings" element={<BookingsPage />} />
        <Route path="blog" element={<BlogPage />} />
        <Route path="finance" element={<FinancePage />} />
        <Route path="analytics" element={<AnalyticsPage />} />
        <Route path="content" element={<ContentPage />} />
      </Route>
    </Routes>
  );
}

export default App;
