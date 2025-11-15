import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { Toaster } from 'react-hot-toast';
import { loadVolenteer } from './redux/thunks/volenteerThunk';
import MainLayout from './layouts/MainLayout';
import NoNavbarLayout from './layouts/NoNavbarLayout';
// Import all pages
import { UserLoginPage, UserProfilePage, UserSignupPage, VolenteerAddDetails } from './routes/userRoutes';
import { HostAddDetailsPage, HostLoginPage, HostPreviewPage, HostProfileEditPage } from './routes/hostRoutes';
import { HomePage, HostDetailsPage, HostListPage, ProductPage, RentalHomePage } from './routes/publicRoutes';
import Messages from './pages/messagesPage/Messages';
import MemberShipPlanPage from './pages/user/MemberShipPlanPage';
import PlanYourTrip from './pages/TravelPlanning/PlanYourTrip';
import HotelBookingPage from './pages/publicPages/HotelBookingPage';
import HotelBookingHomePage from './pages/publicPages/HotelBookingHomePage';
import VolenteerUserProfilePage from './pages/user/VolenteerUserProfilePage';
import NoFooter from './layouts/NoFooter';
import { loadHost } from './redux/thunks/hostTunk';
import HostProtectedRoute from './routes/hostProtectedRoutes';
import RedirectRoute from './routes/RedirectionPage';
const App = () => {
    const dispatch = useDispatch();
    useEffect(() => {
        dispatch(loadVolenteer());
    }, [dispatch]);
    useEffect(() => {
        dispatch(loadHost());
    }, [dispatch]);
    return (_jsxs(BrowserRouter, { children: [_jsx(Toaster, { position: "bottom-right", toastOptions: {
                    duration: 3000,
                    style: { background: '#333', color: '#fff' }
                } }), _jsxs(Routes, { children: [_jsxs(Route, { element: _jsx(MainLayout, {}), children: [_jsx(Route, { path: "/", element: _jsx(HomePage, {}) }), _jsx(Route, { path: "/rentals", element: _jsx(RentalHomePage, {}) }), _jsx(Route, { path: "/product", element: _jsx(ProductPage, {}) }), _jsx(Route, { path: "/volunteering-oppertunities", element: _jsx(HostListPage, {}) }), _jsx(Route, { path: "/host-details/:id", element: _jsx(HostDetailsPage, {}) }), _jsx(Route, { path: "/hotels", element: _jsx(HotelBookingHomePage, {}) }), _jsx(Route, { path: "/trip-planning", element: _jsx(PlanYourTrip, {}) }), _jsx(Route, { path: "/user/profile/:id", element: _jsx(UserProfilePage, {}) }), _jsx(Route, { path: "/user/membership", element: _jsx(MemberShipPlanPage, {}) }), _jsx(Route, { path: "/volenteer/profile/:id", element: _jsx(VolenteerUserProfilePage, {}) })] }), _jsxs(Route, { element: _jsx(NoNavbarLayout, {}), children: [_jsx(Route, { path: "/user/login", element: _jsx(RedirectRoute, { children: _jsx(UserLoginPage, {}) }) }), _jsx(Route, { path: "/user/signup", element: _jsx(RedirectRoute, { children: _jsx(UserSignupPage, {}) }) }), _jsx(Route, { path: "/host/login", element: _jsx(RedirectRoute, { children: _jsx(HostLoginPage, {}) }) }), _jsx(Route, { path: "/host/signup", element: _jsx(RedirectRoute, { children: _jsx(HostLoginPage, {}) }) }), _jsx(Route, { path: "/host/add-details/:id", element: _jsx(HostAddDetailsPage, {}) }), _jsx(Route, { path: "/host/preview/:id", element: _jsx(HostProtectedRoute, { children: _jsx(HostPreviewPage, {}) }) }), _jsx(Route, { path: "/host/edit-profile/:id", element: _jsx(HostProtectedRoute, { children: _jsx(HostProfileEditPage, {}) }) }), _jsx(Route, { path: "/search-hotels", element: _jsx(HotelBookingPage, {}) }), _jsx(Route, { path: "/rentals", element: _jsx(RentalHomePage, {}) }), _jsx(Route, { path: "/volenteer/add-details/:id", element: _jsx(VolenteerAddDetails, {}) })] }), _jsx(Route, { element: _jsx(NoFooter, {}), children: _jsx(Route, { path: "/message", element: _jsx(Messages, {}) }) })] })] }));
};
export default App;
