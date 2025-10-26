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
