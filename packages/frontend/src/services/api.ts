import axios from 'axios';
// import { store } from '../store'; // Removed direct import
// import { logout } from '../store/slices/auth.slice'; // Removed direct import
import { type AppStore } from '../store'; // Import AppStore type
import { logout as authLogout } from '../store/slices/auth.slice'; // Import logout action with alias
import { authService } from './auth.service';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

let isRefreshing = false;
let failedQueue: Array<{ resolve: (value?: any) => void; reject: (reason?: any) => void; originalRequest: any }> = [];

const processQueue = (error: any | null, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

// Request interceptor to add token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// New setup function for response interceptor
export const setupInterceptors = (store: AppStore) => {
  api.interceptors.response.use(
    (response) => {
      return response;
    },
    async (error) => {
      const originalRequest = error.config;

      if (error.response?.status === 401 && !originalRequest._retry) {
        if (isRefreshing) {
          return new Promise((resolve, reject) => {
            failedQueue.push({ resolve, reject, originalRequest });
          });
        }

        originalRequest._retry = true;
        isRefreshing = true;

        try {
          const { token } = await authService.refreshToken();
          localStorage.setItem('token', token);
          api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
          processQueue(null, token);
          return api(originalRequest);
        } catch (refreshError) {
          processQueue(refreshError);
          store.dispatch(authLogout());
          return Promise.reject(refreshError);
        } finally {
          isRefreshing = false;
        }
      }

      const { response } = error;

      if (response) {
        if (response.status === 403) {
          console.error('Forbidden access:', response.data.error.message);
          alert(response.data.error.message || 'You do not have permission to perform this action.');
        } else if (response.status >= 400 && response.status < 500) {
          console.error('Client Error:', response.data.error.message);
          alert(response.data.error.message || 'An error occurred.');
        } else if (response.status >= 500) {
          console.error('Server Error:', response.data.error.message);
          alert('Server error. Please try again later.');
        }
      }

      return Promise.reject(error);
    }
  );
};

export default api;