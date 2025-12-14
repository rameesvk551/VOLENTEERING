import React, { Suspense, lazy } from 'react';
import { Navigate, useRoutes } from 'react-router-dom';
import { Provider } from 'react-redux';
import HostAddDetailsPage from './pages/host/HostAddDetailsPage';
import HostPreviewPage from './pages/host/HostPreviewPage';
import HostProfileEditPage from './pages/host/HostProfileEditPage';
import HostLoginPage from './pages/host/HostLoginPage';
import HostSignupPage from './pages/host/HostSignupPage';
import VolunteerAddDetailsPage from './pages/volunteer/VolunteerAddDetailsPage';
import VolunteerProfilePage from './pages/volunteer/VolunteerProfilePage';
import { store } from './redux/store';

// New Redesigned Pages (lazy loaded for performance)
const HomePage = lazy(() => import('./pages/home/HomePage'));
const ExplorePage = lazy(() => import('./pages/explore/ExplorePage'));
const OpportunityDetailsPage = lazy(() => import('./pages/explore/OpportunityDetailsPage'));
const UserDashboard = lazy(() => import('./pages/dashboard/UserDashboard'));
const ProfilePage = lazy(() => import('./pages/dashboard/ProfilePage'));
const HostDashboard = lazy(() => import('./pages/dashboard/HostDashboard'));
const CreateOpportunityPage = lazy(() => import('./pages/dashboard/CreateOpportunityPage'));

// Loading fallback
const PageLoader: React.FC = () => (
  <div className="min-h-screen flex items-center justify-center bg-gray-50">
    <div className="w-10 h-10 border-4 border-primary-200 border-t-primary-500 rounded-full animate-spin" />
  </div>
);

const VolunteeringRouter: React.FC = () => {
  const element = useRoutes([
    // NEW: Public landing and explore pages
    { 
      index: true, 
      element: (
        <Suspense fallback={<PageLoader />}>
          <HomePage />
        </Suspense>
      ) 
    },
    { 
      path: 'explore', 
      element: (
        <Suspense fallback={<PageLoader />}>
          <ExplorePage />
        </Suspense>
      ) 
    },
    { 
      path: 'opportunity/:id', 
      element: (
        <Suspense fallback={<PageLoader />}>
          <OpportunityDetailsPage />
        </Suspense>
      ) 
    },

    // NEW: User Dashboard routes
    {
      path: 'dashboard',
      children: [
        { 
          index: true, 
          element: (
            <Suspense fallback={<PageLoader />}>
              <UserDashboard />
            </Suspense>
          ) 
        },
        { 
          path: 'profile', 
          element: (
            <Suspense fallback={<PageLoader />}>
              <ProfilePage />
            </Suspense>
          ) 
        },
      ]
    },

    // EXISTING: Host routes (legacy)
    {
      path: 'host',
      children: [
        { index: true, element: <Navigate to="add-details/new" replace /> },
        { path: 'login', element: <HostLoginPage /> },
        { path: 'signup', element: <HostSignupPage /> },
        { path: 'add-details/:id', element: <HostAddDetailsPage /> },
        { path: 'preview/:id', element: <HostPreviewPage /> },
        { path: 'edit-profile/:id', element: <HostProfileEditPage /> },
        // NEW: Host dashboard
        { 
          path: 'dashboard', 
          element: (
            <Suspense fallback={<PageLoader />}>
              <HostDashboard />
            </Suspense>
          ) 
        },
        { 
          path: 'create', 
          element: (
            <Suspense fallback={<PageLoader />}>
              <CreateOpportunityPage />
            </Suspense>
          ) 
        },
      ]
    },

    // EXISTING: Volunteer routes (legacy)
    {
      path: 'volunteer',
      children: [
        { index: true, element: <Navigate to="profile/me" replace /> },
        { path: 'add-details/:id', element: <VolunteerAddDetailsPage /> },
        { path: 'profile/:id', element: <VolunteerProfilePage /> }
      ]
    },
    {
      path: 'volenteer',
      children: [
        { index: true, element: <Navigate to="../volunteer/profile/me" replace /> },
        { path: 'add-details/:id', element: <VolunteerAddDetailsPage /> },
        { path: 'profile/:id', element: <VolunteerProfilePage /> }
      ]
    },
    { path: '*', element: <Navigate to="/" replace /> }
  ]);

  return element;
};

const VolunteeringApp: React.FC = () => (
  <Provider store={store}>
    <VolunteeringRouter />
  </Provider>
);

export default VolunteeringApp;
