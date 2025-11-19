import { Routes, Route, Navigate } from 'react-router-dom';
import VisaExplorerPage from './pages/VisaExplorerPage';
import DemoPage from './pages/DemoPage';
import CompareDashboardPage from './pages/CompareDashboardPage';

const App = () => {
  return (
    <Routes>
      <Route path="/" element={<VisaExplorerPage />} />
      <Route path="/demo" element={<DemoPage />} />
      <Route path="/compare" element={<CompareDashboardPage />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

export default App;