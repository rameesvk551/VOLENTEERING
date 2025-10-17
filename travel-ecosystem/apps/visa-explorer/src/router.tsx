import React from 'react';
import { Routes, Route } from 'react-router-dom';
import VisaExplorerPage from './pages/VisaExplorerPage';

const AppRoutes: React.FC = () => {
  return (
    <Routes>
      <Route path="/" element={<VisaExplorerPage />} />
    </Routes>
  );
};

export default AppRoutes;