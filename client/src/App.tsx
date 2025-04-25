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
  HomePage, HostDetailsPage, HostListPage
} from './routes/publicRoutes';


import Messages from './pages/messagesPage/Messages';
import MemberShipPlanPage from './pages/user/MemberShipPlanPage';
import PlanYourTrip from './pages/TravelPlanning/PlanYourTrip';
import HotelBookingPage from './pages/publicPages/HotelBookingPage';
import HotelBookingHomePage from './pages/publicPages/HotelBookingHomePage';
import VolenteerUserProfilePage from './pages/user/VolenteerUserProfilePage';
import NoFooter from './layouts/NoFooter';
import { loadHost } from './redux/thunks/hostTunk';
import UserProtectedRoute from './routes/userProtectedRoutes';
import HostProtectedRoute from './routes/hostProtectedRoutes';
import HostRedirectRoute from './routes/RedirectionPage';
import RedirectRoute from './routes/RedirectionPage';

const App = () => {
  const dispatch = useDispatch<AppDispatch>();

  useEffect(() => {
    dispatch(loadVolenteer());
  }, [dispatch]);
    useEffect(() => {
      dispatch(loadHost());
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
          <Route path="/volunteering-oppertunities" element={
          <HostListPage />}
           />
          <Route path="/host-details/:id" element={<HostDetailsPage />} />
          <Route path="/hotels" element={<HotelBookingHomePage />} />
          <Route path="/trip-planning" element={<PlanYourTrip />} />
          <Route path="/user/profile/:id" element={<UserProfilePage />} />
          <Route path="/user/membership" element={<MemberShipPlanPage />} />      
          <Route path="/volenteer/profile/:id" element={<VolenteerUserProfilePage />} />
        </Route>

        {/* Routes without Navbar */}
        <Route element={<NoNavbarLayout />}>
          {/* User */}
          <Route path="/user/login" element={<RedirectRoute><UserLoginPage /></RedirectRoute>} />
          <Route path="/user/signup" element={<RedirectRoute><UserSignupPage /></RedirectRoute>} />
          <Route path="/host/login" element={<RedirectRoute><HostLoginPage /></RedirectRoute>} />
          <Route path="/host/signup" element={<RedirectRoute><HostLoginPage /></RedirectRoute>} />
          <Route path="/host/add-details/:id" element={ <HostProtectedRoute><HostAddDetailsPage /></HostProtectedRoute>} />
          <Route path="/host/preview/:id" element={ <HostProtectedRoute><HostPreviewPage /></HostProtectedRoute>} />
          <Route path="/host/edit-profile/:id" element={ <HostProtectedRoute><HostProfileEditPage /></HostProtectedRoute>} />
          <Route path="/search-hotels" element={<HotelBookingPage />} />
     
          {/* Volenteer */}
          <Route path="/volenteer/add-details/:id" element={<UserProtectedRoute><VolenteerAddDetails /></UserProtectedRoute>} />
        </Route>
        <Route element={<NoFooter />}>
        <Route path="/message" element={<Messages />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
};

export default App;
