import { Routes, Route } from 'react-router-dom';
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
  // Authentication is handled by the shell's ProtectedRoute
  // No need for duplicate auth checks here
  
  return (
    <Routes>
      {/* Keep standalone routes (root) for local dev */}
      <Route path="/" element={<DashboardLayout />}>
        <Route index element={<Dashboard />} />
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="users" element={<UsersPage />} />
        <Route path="trips" element={<TripsPage />} />
        <Route path="hosts" element={<HostsPage />} />
        <Route path="gear-rentals" element={<GearRentalsPage />} />
        <Route path="bookings" element={<BookingsPage />} />
        <Route path="blog" element={<BlogPage />} />
        <Route path="blog/create" element={<BlogCreatePage />} />
        <Route path="blog-create" element={<BlogCreatePage />} />
        <Route path="finance" element={<FinancePage />} />
        <Route path="analytics" element={<AnalyticsPage />} />
        <Route path="content" element={<ContentPage />} />
      </Route>

      {/* Also support being mounted at /admin in the shell (module federation) */}
      <Route path="/admin/*" element={<DashboardLayout />}>
        <Route index element={<Dashboard />} />
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="users" element={<UsersPage />} />
        <Route path="trips" element={<TripsPage />} />
        <Route path="hosts" element={<HostsPage />} />
        <Route path="gear-rentals" element={<GearRentalsPage />} />
        <Route path="bookings" element={<BookingsPage />} />
        <Route path="blog" element={<BlogPage />} />
        <Route path="blog/create" element={<BlogCreatePage />} />
        <Route path="blog-create" element={<BlogCreatePage />} />
        <Route path="finance" element={<FinancePage />} />
        <Route path="analytics" element={<AnalyticsPage />} />
        <Route path="content" element={<ContentPage />} />
      </Route>
    </Routes>
  );
}

export default App;
