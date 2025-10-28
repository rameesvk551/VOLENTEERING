/**
 * Auth Service for Shell
 * Purpose: Handle authentication API calls with existing microservices
 * Architecture: Service layer for frontend auth connecting to auth microservice
 */

const AUTH_API_URL = import.meta.env.VITE_AUTH_API_URL || 'http://localhost:4001/api/auth';

export interface User {
  id: string;
  email: string;
  name: string;
  role: 'admin' | 'user' | 'super_admin';
  profileImage?: string;
  isEmailVerified?: boolean;
}

export interface AuthResponse {
  user: User;
  token: string;
  refreshToken: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface SignupCredentials {
  email: string;
  password: string;
  name: string;
}

/**
 * Login user
 */
export const login = async (credentials: LoginCredentials): Promise<AuthResponse> => {
  const response = await fetch(`${AUTH_API_URL}/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(credentials),
    credentials: 'include',
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Login failed');
  }

  const data = await response.json();
  return data.data;
};

/**
 * Signup user
 */
export const signup = async (credentials: SignupCredentials): Promise<AuthResponse> => {
  const response = await fetch(`${AUTH_API_URL}/signup`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(credentials),
    credentials: 'include',
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Signup failed');
  }

  const data = await response.json();
  return data.data;
};

/**
 * Logout user
 */
export const logout = async (): Promise<void> => {
  const token = localStorage.getItem('auth_token');
  
  if (token) {
    try {
      await fetch(`${AUTH_API_URL}/logout`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        credentials: 'include',
      });
    } catch (error) {
      console.error('Logout API call failed:', error);
    }
  }
  
  clearAuth();
};

/**
 * Verify token and get user
 */
export const verifyToken = async (token: string): Promise<User | null> => {
  try {
    const response = await fetch(`${AUTH_API_URL}/me`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
      credentials: 'include',
    });

    if (!response.ok) {
      return null;
    }

    const data = await response.json();
    return data.data.user;
  } catch (error) {
    return null;
  }
};

/**
 * Refresh access token
 */
export const refreshAccessToken = async (refreshToken: string): Promise<string | null> => {
  try {
    const response = await fetch(`${AUTH_API_URL}/refresh`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ refreshToken }),
      credentials: 'include',
    });

    if (!response.ok) {
      return null;
    }

    const data = await response.json();
    return data.data.token;
  } catch (error) {
    return null;
  }
};

/**
 * Get stored auth token
 */
export const getToken = (): string | null => {
  return localStorage.getItem('auth_token');
};

/**
 * Store auth token
 */
export const setToken = (token: string): void => {
  localStorage.setItem('auth_token', token);
};

/**
 * Get stored refresh token
 */
export const getRefreshToken = (): string | null => {
  return localStorage.getItem('auth_refresh_token');
};

/**
 * Store refresh token
 */
export const setRefreshToken = (token: string): void => {
  localStorage.setItem('auth_refresh_token', token);
};

/**
 * Get stored user
 */
export const getStoredUser = (): User | null => {
  const userStr = localStorage.getItem('auth_user');
  if (!userStr) return null;
  
  try {
    return JSON.parse(userStr);
  } catch {
    return null;
  }
};

/**
 * Store user
 */
export const setStoredUser = (user: User): void => {
  localStorage.setItem('auth_user', JSON.stringify(user));
};

/**
 * Clear auth data
 */
export const clearAuth = (): void => {
  localStorage.removeItem('auth_token');
  localStorage.removeItem('auth_refresh_token');
  localStorage.removeItem('auth_user');
};
