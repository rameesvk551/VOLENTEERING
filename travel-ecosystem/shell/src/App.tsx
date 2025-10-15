import React, { Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import MainLayout from './layout/MainLayout';
import ErrorBoundary from './components/ErrorBoundary';
import LoadingFallback from './components/LoadingFallback';

// Lazy load micro-frontends
const Blog = lazy(() => import('blog/App'));
const VisaExplorer = lazy(() => import('visaExplorer/App'));
const TravelHub = lazy(() => import('travelHub/App'));
const TripPlanner = lazy(() => import('tripPlanner/App'));
const Volunteering = lazy(() => import('volunteering/App'));

function App() {
  return (
    <BrowserRouter>
      <MainLayout>
        <ErrorBoundary>
          <Suspense fallback={<LoadingFallback />}>
            <Routes>
              <Route path="/" element={<Navigate to="/travel-hub" replace />} />
              <Route path="/blog/*" element={<Blog />} />
              <Route path="/visa-explorer/*" element={<VisaExplorer />} />
              <Route path="/travel-hub/*" element={<TravelHub />} />
              <Route path="/trip-planner/*" element={<TripPlanner />} />
              <Route path="/volunteering/*" element={<Volunteering />} />
              <Route path="*" element={<Navigate to="/travel-hub" replace />} />
            </Routes>
          </Suspense>
        </ErrorBoundary>
      </MainLayout>
    </BrowserRouter>
  );
}

export default App;
