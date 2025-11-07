import { useEffect } from 'react';
import { useAppSelector } from '@/store';

export function AuthRedirect() {
  const { isAuthenticated, token } = useAppSelector((state) => state.auth);
  const loginUrl = import.meta.env.VITE_SHELL_LOGIN_URL || '/login';

  useEffect(() => {
    // Check if user is not authenticated
    if (!isAuthenticated && !token) {
      // Redirect to shell login page
      const target = loginUrl.startsWith('http')
        ? loginUrl
        : new URL(loginUrl.startsWith('/') ? loginUrl : `/${loginUrl}`, window.location.origin).toString();
      window.location.href = target;
    }
  }, [isAuthenticated, loginUrl, token]);

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
