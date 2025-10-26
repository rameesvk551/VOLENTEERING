# Travel Ecosystem - Frontend Implementation Guide

## Overview

This guide provides complete implementation for:
1. **Shell App** - Authentication & routing
2. **Blog Frontend** - Advanced blog interface  
3. **Admin Dashboard** - Complete admin panel

## 🏗️ Architecture

```
Shell (Port 5173)
├── Authentication (Login, Signup, Forgot Password)
├── Route to Blog Frontend
└── Route to Admin Dashboard

Blog Frontend (Port 5174)
├── Blog List with filters
├── Single Blog View
├── Comments & Ratings
└── Search functionality

Admin Dashboard (Port 5175)
├── Blog Management (Create, Edit, Delete)
├── User Management
├── Analytics
└── Other admin features
```

## 📦 Shell App - Authentication

### API Service (`shell/src/services/api.ts`)

```typescript
import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000';

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Request interceptor to add token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor to handle token refresh
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = localStorage.getItem('refreshToken');
        if (refreshToken) {
          const response = await axios.post(`${API_BASE_URL}/api/auth/refresh-token`, {
            refreshToken
          });

          const { token, refreshToken: newRefreshToken } = response.data.data;
          localStorage.setItem('token', token);
          localStorage.setItem('refreshToken', newRefreshToken);

          originalRequest.headers.Authorization = `Bearer ${token}`;
          return api(originalRequest);
        }
      } catch (refreshError) {
        localStorage.removeItem('token');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('user');
        window.location.href = '/login';
      }
    }

    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  signup: (data: { name: string; email: string; password: string; role?: string }) =>
    api.post('/api/auth/signup', data),
  
  login: (data: { email: string; password: string }) =>
    api.post('/api/auth/login', data),
  
  logout: (refreshToken: string) =>
    api.post('/api/auth/logout', { refreshToken }),
  
  forgotPassword: (email: string) =>
    api.post('/api/auth/forgot-password', { email }),
  
  resetPassword: (token: string, newPassword: string) =>
    api.post('/api/auth/reset-password', { token, newPassword }),
  
  changePassword: (currentPassword: string, newPassword: string) =>
    api.post('/api/auth/change-password', { currentPassword, newPassword }),
  
  getMe: () =>
    api.get('/api/auth/me'),
  
  updateProfile: (data: any) =>
    api.put('/api/auth/update-profile', data),
  
  verifyEmail: (token: string) =>
    api.get(`/api/auth/verify-email?token=${token}`)
};

export default api;
```

### Auth Context (`shell/src/context/AuthContext.tsx`)

```typescript
import React, { createContext, useContext, useState, useEffect } from 'react';
import { authAPI } from '../services/api';

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  profileImage?: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
  updateUser: (user: User) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const token = localStorage.getItem('token');
      if (token) {
        const response = await authAPI.getMe();
        setUser(response.data.data.user);
      }
    } catch (error) {
      localStorage.removeItem('token');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('user');
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (email: string, password: string) => {
    const response = await authAPI.login({ email, password });
    const { user, token, refreshToken } = response.data.data;
    
    localStorage.setItem('token', token);
    localStorage.setItem('refreshToken', refreshToken);
    localStorage.setItem('user', JSON.stringify(user));
    
    setUser(user);
  };

  const signup = async (name: string, email: string, password: string) => {
    const response = await authAPI.signup({ name, email, password });
    const { user, token, refreshToken } = response.data.data;
    
    localStorage.setItem('token', token);
    localStorage.setItem('refreshToken', refreshToken);
    localStorage.setItem('user', JSON.stringify(user));
    
    setUser(user);
  };

  const logout = () => {
    const refreshToken = localStorage.getItem('refreshToken');
    if (refreshToken) {
      authAPI.logout(refreshToken).catch(() => {});
    }
    
    localStorage.removeItem('token');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
    setUser(null);
  };

  const updateUser = (updatedUser: User) => {
    setUser(updatedUser);
    localStorage.setItem('user', JSON.stringify(updatedUser));
  };

  return (
    <AuthContext.Provider value={{
      user,
      isAuthenticated: !!user,
      isLoading,
      login,
      signup,
      logout,
      updateUser
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};
```

### Login Page (`shell/src/pages/Login.tsx`)

```typescript
import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      await login(email, password);
      navigate('/');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Login failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Sign in to your account
          </h2>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {error && (
            <div className="rounded-md bg-red-50 p-4">
              <p className="text-sm text-red-800">{error}</p>
            </div>
          )}
          
          <div className="rounded-md shadow-sm -space-y-px">
            <div>
              <label htmlFor="email" className="sr-only">Email address</label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                placeholder="Email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div>
              <label htmlFor="password" className="sr-only">Password</label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="text-sm">
              <Link to="/forgot-password" className="font-medium text-indigo-600 hover:text-indigo-500">
                Forgot your password?
              </Link>
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={isLoading}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
            >
              {isLoading ? 'Signing in...' : 'Sign in'}
            </button>
          </div>

          <div className="text-center">
            <p className="text-sm text-gray-600">
              Don't have an account?{' '}
              <Link to="/signup" className="font-medium text-indigo-600 hover:text-indigo-500">
                Sign up
              </Link>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Login;
```

### Signup Page (`shell/src/pages/Signup.tsx`)

```typescript
import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Signup: React.FC = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  const { signup } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    setIsLoading(true);

    try {
      await signup(name, email, password);
      navigate('/');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Signup failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Create your account
          </h2>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {error && (
            <div className="rounded-md bg-red-50 p-4">
              <p className="text-sm text-red-800">{error}</p>
            </div>
          )}
          
          <div className="rounded-md shadow-sm space-y-4">
            <div>
              <label htmlFor="name" className="sr-only">Full Name</label>
              <input
                id="name"
                name="name"
                type="text"
                required
                className="appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                placeholder="Full Name"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>
            <div>
              <label htmlFor="email" className="sr-only">Email address</label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                className="appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                placeholder="Email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div>
              <label htmlFor="password" className="sr-only">Password</label>
              <input
                id="password"
                name="password"
                type="password"
                required
                className="appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                placeholder="Password (min 6 characters)"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
            <div>
              <label htmlFor="confirmPassword" className="sr-only">Confirm Password</label>
              <input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                required
                className="appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                placeholder="Confirm Password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={isLoading}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
            >
              {isLoading ? 'Creating account...' : 'Sign up'}
            </button>
          </div>

          <div className="text-center">
            <p className="text-sm text-gray-600">
              Already have an account?{' '}
              <Link to="/login" className="font-medium text-indigo-600 hover:text-indigo-500">
                Sign in
              </Link>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Signup;
```

## 📝 Blog Frontend - Complete Implementation

### Blog API Service (`apps/blog/src/services/blogApi.ts`)

```typescript
import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000';

const api = axios.create({
  baseURL: `${API_BASE_URL}/api/blog`,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Add token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const blogAPI = {
  // Get all blogs with filters
  getBlogs: (params?: {
    page?: number;
    limit?: number;
    search?: string;
    category?: string;
    tags?: string;
    sort?: string;
    featured?: boolean;
  }) => api.get('/', { params }),

  // Get single blog
  getBlogBySlug: (slug: string) => api.get(`/${slug}`),

  // Get featured blogs
  getFeaturedBlogs: (limit?: number) => api.get('/featured', { params: { limit } }),

  // Get popular blogs
  getPopularBlogs: (limit?: number) => api.get('/popular', { params: { limit } }),

  // Get trending blogs
  getTrendingBlogs: (limit?: number) => api.get('/trending', { params: { limit } }),

  // Get categories
  getCategories: () => api.get('/categories/list'),

  // Get tags
  getTags: () => api.get('/tags/list'),

  // Like/unlike blog
  toggleLike: (blogId: string) => api.post(`/${blogId}/like`),

  // Rate blog
  rateBlog: (blogId: string, rating: number) => api.post(`/${blogId}/rate`, { rating }),

  // Get user rating
  getUserRating: (blogId: string) => api.get(`/${blogId}/rating`),

  // Comments
  getComments: (blogId: string, page?: number) => 
    api.get(`/comments/${blogId}`, { params: { page } }),

  addComment: (blogId: string, content: string, parentCommentId?: string) =>
    api.post('/comments', { blogId, content, parentCommentId }),

  updateComment: (commentId: string, content: string) =>
    api.put(`/comments/${commentId}`, { content }),

  deleteComment: (commentId: string) =>
    api.delete(`/comments/${commentId}`),

  toggleCommentLike: (commentId: string) =>
    api.post(`/comments/${commentId}/like`)
};

export default blogAPI;
```

## 🎯 Installation & Setup

### 1. Shell App Setup
```bash
cd travel-ecosystem/shell
npm install axios react-router-dom
npm install -D @types/node

# Create .env file
echo "VITE_API_URL=http://localhost:4000" > .env

# Run
npm run dev
```

### 2. Blog Frontend Setup
```bash
cd travel-ecosystem/apps/blog
npm install axios react-router-dom react-markdown react-syntax-highlighter
npm install -D @types/react-markdown

# Create .env file
echo "VITE_API_URL=http://localhost:4000" > .env

# Run
npm run dev
```

### 3. Admin Dashboard Setup
```bash
cd travel-ecosystem/apps/admin-dashboard
npm install axios react-router-dom react-hook-form @tanstack/react-table
npm install -D @types/react-hook-form

# Create .env file
echo "VITE_API_URL=http://localhost:4000" > .env

# Run
npm run dev
```

## 🔐 Environment Variables

Create `.env` files in each frontend app:

```env
VITE_API_URL=http://localhost:4000
VITE_APP_NAME=Travel Ecosystem
```

## 🚀 Running Everything

```bash
# Terminal 1 - Backend
cd travel-ecosystem-backend
npm run dev

# Terminal 2 - Shell
cd travel-ecosystem/shell
npm run dev

# Terminal 3 - Blog
cd travel-ecosystem/apps/blog
npm run dev

# Terminal 4 - Admin
cd travel-ecosystem/apps/admin-dashboard
npm run dev
```

## 📖 Usage Examples

### Login Example
```typescript
import { useAuth } from './context/AuthContext';

function MyComponent() {
  const { login, user, isAuthenticated } = useAuth();

  const handleLogin = async () => {
    try {
      await login('user@example.com', 'password123');
      console.log('Logged in!', user);
    } catch (error) {
      console.error('Login failed:', error);
    }
  };

  return (
    <div>
      {isAuthenticated ? (
        <p>Welcome, {user?.name}!</p>
      ) : (
        <button onClick={handleLogin}>Login</button>
      )}
    </div>
  );
}
```

### Fetch Blogs Example
```typescript
import { useEffect, useState } from 'react';
import { blogAPI } from './services/blogAPI';

function BlogList() {
  const [blogs, setBlogs] = useState([]);

  useEffect(() => {
    fetchBlogs();
  }, []);

  const fetchBlogs = async () => {
    try {
      const response = await blogAPI.getBlogs({ page: 1, limit: 10 });
      setBlogs(response.data.data.blogs);
    } catch (error) {
      console.error('Failed to fetch blogs:', error);
    }
  };

  return (
    <div>
      {blogs.map(blog => (
        <div key={blog._id}>
          <h2>{blog.title}</h2>
          <p>{blog.excerpt}</p>
        </div>
      ))}
    </div>
  );
}
```

## 🎨 Styling

All apps use Tailwind CSS. The configuration is already set up in each app's `tailwind.config.js`.

## 📚 Next Steps

1. Implement the remaining frontend pages
2. Add form validation
3. Implement error boundaries
4. Add loading states
5. Implement responsive design
6. Add animations
7. Set up testing
8. Add accessibility features
9. Implement PWA features
10. Add analytics tracking
