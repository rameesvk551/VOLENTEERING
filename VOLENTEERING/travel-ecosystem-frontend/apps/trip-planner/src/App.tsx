import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import PlanYourTrip from './pages/PlanYourTrip';
import AdvancedTripPlanner from './pages/AdvancedTripPlanner';
import { DiscoveryPage } from './pages/DiscoveryPage';

const App: React.FC = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<AdvancedTripPlanner />} />
        <Route path="/trip-planner/*" element={<AdvancedTripPlanner />} />
        <Route path="/discover" element={<DiscoveryPage />} />
        <Route path="/ai-discovery" element={<DiscoveryPage />} />
      </Routes>
    </Router>
  );
};

export default App;
