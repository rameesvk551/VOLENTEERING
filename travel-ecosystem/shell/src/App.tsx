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
const AdminDashboard = lazy(() => import('adminDashboard/App'));
const TripPlanner = lazy(() => import('tripPlanner/App'));
const Volunteering = lazy(() => import('volunteering/Router'));

function App() {
  return (
    <BrowserRouter
      future={{
        v7_startTransition: true,
        v7_relativeSplatPath: true,
      }}
    >
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

              {/* Root redirect */}
              <Route 
                path="/" 
                element={<Navigate to="/admin" replace />} 
              />

              {/* Admin Dashboard - No MainLayout (uses its own layout) */}
              <Route 
                path="/admin/*" 
                element={
                  <ProtectedRoute>
                    <AdminDashboard />
                  </ProtectedRoute>
                } 
              />

              {/* Protected Routes with MainLayout */}
              <Route path="/blog/*" element={
                <ProtectedRoute>
                  <MainLayout>
                    <Blog basePath="/blog" />
                  </MainLayout>
                </ProtectedRoute>
              } />

              <Route path="/visa-explorer/*" element={
                <ProtectedRoute>
                  <MainLayout>
                    <VisaExplorer />
                  </MainLayout>
                </ProtectedRoute>
              } />

              <Route path="/trip-planner/*" element={
                <ProtectedRoute>
                  <MainLayout>
                    <TripPlanner />
                  </MainLayout>
                </ProtectedRoute>
              } />

              <Route path="/volunteering/*" element={
                <ProtectedRoute>
                  <MainLayout>
                    <Volunteering />
                  </MainLayout>
                </ProtectedRoute>
              } />

              <Route path="/host/*" element={
                <ProtectedRoute>
                  <MainLayout>
                    <Volunteering />
                  </MainLayout>
                </ProtectedRoute>
              } />

              <Route path="/volunteer/*" element={
                <ProtectedRoute>
                  <MainLayout>
                    <Volunteering />
                  </MainLayout>
                </ProtectedRoute>
              } />

              <Route path="/volenteer/*" element={
                <ProtectedRoute>
                  <MainLayout>
                    <Volunteering />
                  </MainLayout>
                </ProtectedRoute>
              } />

              {/* Catch-all redirect */}
              <Route path="*" element={<Navigate to="/admin" replace />} />
            </Routes>
          </Suspense>
        </ErrorBoundary>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
