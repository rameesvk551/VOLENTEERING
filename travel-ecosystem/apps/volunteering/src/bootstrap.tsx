import React from 'react';
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

const VolunteeringRouter: React.FC = () => {
  const element = useRoutes([
    {
      path: 'host',
      children: [
        { index: true, element: <Navigate to="add-details/new" replace /> },
        { path: 'login', element: <HostLoginPage /> },
        { path: 'signup', element: <HostSignupPage /> },
        { path: 'add-details/:id', element: <HostAddDetailsPage /> },
        { path: 'preview/:id', element: <HostPreviewPage /> },
        { path: 'edit-profile/:id', element: <HostProfileEditPage /> }
      ]
    },
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
    { path: '*', element: <Navigate to="host" replace /> }
  ]);

  return element;
};

const VolunteeringApp: React.FC = () => (
  <Provider store={store}>
    <VolunteeringRouter />
  </Provider>
);

export default VolunteeringApp;
