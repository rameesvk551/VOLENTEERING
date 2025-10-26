import { Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import MainLayout from './layout/MainLayout';
import ErrorBoundary from './components/ErrorBoundary';
import LoadingFallback from './components/LoadingFallback';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';

// Auth pages - not lazy loaded
import Login from './pages/Login';
import Signup from './pages/Signup';

// Lazy load micro-frontends
const Blog = lazy(() => import('blog/App'));
const VisaExplorer = lazy(() => import('visaExplorer/App'));
const TravelHub = lazy(() => import('travelHub/App'));
const TripPlanner = lazy(() => import('tripPlanner/App'));
const Volunteering = lazy(() => import('volunteering/Router'));

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <ErrorBoundary>
          <Suspense fallback={<LoadingFallback />}>
            <Routes>
              {/* Public Auth Routes - No MainLayout */}
              <Route 
                path="/login" 
                element={
                  <ProtectedRoute requireAuth={false}>
                    <Login />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/signup" 
                element={
                  <ProtectedRoute requireAuth={false}>
                    <Signup />
                  </ProtectedRoute>
                } 
              />

              {/* Protected Routes with MainLayout */}
              <Route path="/*" element={
                <ProtectedRoute>
                  <MainLayout>
                    <Routes>
                      <Route path="/" element={<Navigate to="/travel-hub" replace />} />
                      <Route path="/blog/*" element={<Blog />} />
                      <Route path="/visa-explorer/*" element={<VisaExplorer />} />
                      <Route path="/travel-hub/*" element={<TravelHub />} />
                      <Route path="/trip-planner/*" element={<TripPlanner />} />
                      <Route path="/volunteering/*" element={<Volunteering />} />
                      <Route path="/host/*" element={<Volunteering />} />
                      <Route path="/volunteer/*" element={<Volunteering />} />
                      <Route path="/volenteer/*" element={<Volunteering />} />
                      <Route path="*" element={<Navigate to="/travel-hub" replace />} />
                    </Routes>
                  </MainLayout>
                </ProtectedRoute>
              } />
            </Routes>
          </Suspense>
        </ErrorBoundary>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
