import React from 'react';
import { useRoutes } from 'react-router-dom';
import AdvancedTripPlanner from './pages/AdvancedTripPlanner';
import { DiscoveryPage } from './pages/DiscoveryPage';
import RouteOptimizationPage from './pages/RouteOptimizationPage';
import RouteOptimizationResults from './pages/RouteOptimizationResultsPage';
import './styles/index.css';

const App: React.FC = () => {
  const element = useRoutes([
    { index: true, element: <AdvancedTripPlanner /> },
    { path: 'discover', element: <DiscoveryPage /> },
    { path: 'ai-discovery', element: <DiscoveryPage /> },
    { path: 'route-optimizer', element: <RouteOptimizationResults /> },
    { path: 'optimize-route', element: <RouteOptimizationPage /> },
    { path: '*', element: <AdvancedTripPlanner /> },
  ]);
  return element ?? null;
};

export default App;
