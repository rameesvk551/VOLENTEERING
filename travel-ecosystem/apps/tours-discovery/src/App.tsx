import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ToursPage } from './pages/ToursPage';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<ToursPage />} />
        <Route path="/tours" element={<ToursPage />} />
      </Routes>
    </Router>
  );
}

export default App;
