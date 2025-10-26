import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import AdvancedTripPlanner from './pages/AdvancedTripPlanner';
import { DiscoveryPage } from './pages/DiscoveryPage';
import RouteOptimizationPage from './pages/RouteOptimizationPage';

const App: React.FC = () => {
  return (
    <Router
      future={{
        v7_startTransition: true,
        v7_relativeSplatPath: true,
      }}
    >
      <Routes>
        <Route path="/" element={<AdvancedTripPlanner />} />
        <Route path="/trip-planner/*" element={<AdvancedTripPlanner />} />
        <Route path="/discover" element={<DiscoveryPage />} />
        <Route path="/ai-discovery" element={<DiscoveryPage />} />
        <Route path="/route-optimizer" element={<RouteOptimizationPage />} />
        <Route path="/optimize-route" element={<RouteOptimizationPage />} />
      </Routes>
    </Router>
  );
};

export default App;
