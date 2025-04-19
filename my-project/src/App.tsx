import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { AppDispatch } from './redux/store';
import { Toaster } from 'react-hot-toast';
import { loadVolenteer } from './redux/thunks/volenteerThunk';

import MainLayout from './layouts/MainLayout';
import NoNavbarLayout from './layouts/NoNavbarLayout';

// Import all pages
import {
  UserLoginPage, UserProfilePage, UserSignupPage, VolenteerAddDetails
} from './routes/userRoutes';
import {
  HostAddDetailsPage, HostLoginPage, HostPreviewPage,
  HostProfileEditPage, HostSignupPage
} from './routes/hostRoutes';
import {
  BlogDetails, BlogListPage, HomePage, HostDetailsPage, HostListPage
} from './routes/publicRoutes';
import {
  AdminAllHostPage, AdminAllVolenteersPage, AdminDashbordPage, CreateBlog
} from './routes/adminRoutes';
import AdminLoginPage from './pages/admin/AdminLoginPage';
import Messages from './pages/messagesPage/Messages';
import MemberShipPlanPage from './pages/user/MemberShipPlanPage';
import PlanYourTrip from './pages/TravelPlanning/PlanYourTrip';
import HotelBookingPage from './pages/publicPages/HotelBookingPage';
import HotelBookingHomePage from './pages/publicPages/HotelBookingHomePage';
import FlightPage from './pages/publicPages/FlightPage';
import VolenteerUserProfilePage from './pages/user/VolenteerUserProfilePage';
import KycPage from './pages/user/KycPage';

const App = () => {
  const dispatch = useDispatch<AppDispatch>();

  useEffect(() => {
    dispatch(loadVolenteer());
  }, [dispatch]);

  return (
    <BrowserRouter>
      <Toaster position="bottom-right" toastOptions={{
        duration: 3000,
        style: { background: '#333', color: '#fff' }
      }} />

      <Routes>
        {/* Routes with Navbar */}
        <Route element={<MainLayout />}>
          <Route path="/" element={<HomePage />} />
          <Route path="/blogs" element={<BlogListPage />} />
          <Route path="/blog/:id" element={<BlogDetails />} />
          <Route path="/volunteering-oppertunities" element={<HostListPage />} />
          <Route path="/host-details/:id" element={<HostDetailsPage />} />
          <Route path="/hotels" element={<HotelBookingHomePage />} />
          <Route path="/flights" element={<FlightPage />} />
          <Route path="/trip-planning" element={<PlanYourTrip />} />
          <Route path="/user/profile/:id" element={<UserProfilePage />} />
          <Route path="/user/membership" element={<MemberShipPlanPage />} />
          <Route path="/message/:userId" element={<Messages />} />
          <Route path="/volenteer/profile/:id" element={<VolenteerUserProfilePage />} />
        </Route>

        {/* Routes without Navbar */}
        <Route element={<NoNavbarLayout />}>
          {/* User */}
          <Route path="/user/login" element={<UserLoginPage />} />
          <Route path="/user/signup" element={<UserSignupPage />} />
          <Route path="/host/login" element={<HostLoginPage />} />
          <Route path="/host/signup" element={<HostSignupPage />} />
          <Route path="/host/add-details/:id" element={<HostAddDetailsPage />} />
          <Route path="/host/preview/:id" element={<HostPreviewPage />} />
          <Route path="/host/edit-profile/:id" element={<HostProfileEditPage />} />
          <Route path="/search-hotels" element={<HotelBookingPage />} />
          {/* Admin */}
          <Route path="/admin/login" element={<AdminLoginPage />} />
          <Route path="/admin/dashboard" element={<AdminDashbordPage />} />
          <Route path="/admin/dashboard/all-volenteers" element={<AdminAllVolenteersPage />} />
          <Route path="/admin/dashboard/all-hosts" element={<AdminAllHostPage />} />
          <Route path="/admin/dashboard/create-blog" element={<CreateBlog />} />

          {/* Volenteer */}
          <Route path="/volenteer/add-details/:id" element={<VolenteerAddDetails />} />
          <Route path="/volenteer/kyc" element={<KycPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
};

export default App;
