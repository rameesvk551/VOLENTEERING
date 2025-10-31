import { useEffect } from 'react';
import { useAppSelector } from '@/store';

export function AuthRedirect() {
  const { isAuthenticated, token } = useAppSelector((state) => state.auth);

  useEffect(() => {
    // Check if user is not authenticated
    if (!isAuthenticated && !token) {
      // Redirect to shell login page
  window.location.href = 'http://localhost:1001/login';
    }
  }, [isAuthenticated, token]);

  // Show loading while checking authentication
  if (!isAuthenticated && !token) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-4 text-gray-600">Redirecting to login...</p>
        </div>
      </div>
    );
  }

  return null;
}
