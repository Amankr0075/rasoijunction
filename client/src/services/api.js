import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
    'ngrok-skip-browser-warning': 'true',
  },
});

// Request interceptor — attach token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor — handle 401 and token refresh
let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

api.interceptors.response.use(
  (response) => response.data, // Unwrap data automatically
  async (error) => {
    const originalRequest = error.config;

    // Handle 503 Service Unavailable (Maintenance Mode)
    if (error.response?.status === 503 && window.location.pathname !== '/maintenance') {
      window.location.href = '/maintenance';
      return Promise.reject(error);
    }

    // If 401 and not already retried
    if (error.response?.status === 401 && !originalRequest._retry && !originalRequest.url?.includes('/auth/login') && !originalRequest.url?.includes('/auth/register') && !originalRequest.url?.includes('/auth/refresh-token')) {
      if (isRefreshing) {
        // Queue requests while refreshing
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            return api(originalRequest);
          })
          .catch((err) => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const response = await axios.post('/api/auth/refresh-token', {}, {
          withCredentials: true,
        });

        const { accessToken } = response.data.data;
        localStorage.setItem('accessToken', accessToken);
        api.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`;

        processQueue(null, accessToken);

        originalRequest.headers.Authorization = `Bearer ${accessToken}`;
        return api(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError, null);
        localStorage.removeItem('accessToken');
        // Redirect to login if not already there and not on a public route
        const publicPaths = ['/', '/menu', '/about', '/contact', '/faq', '/privacy-policy', '/terms-of-service', '/refund-policy', '/login', '/register', '/forgot-password', '/reset-password'];
        const isPublicPath = publicPaths.some(path => {
          if (path.includes(':') || path.includes('*')) return false; // Dynamic routes handled below if needed
          return window.location.pathname === path || window.location.pathname.startsWith('/reset-password/');
        });
        if (!isPublicPath) {
          window.location.href = '/login';
        }
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    // Extract error message
    let message =
      error.response?.data?.message ||
      error.message ||
      'Something went wrong. Please try again.';

    // Custom message for offline server
    if (error.message === 'Network Error' || error.code === 'ERR_NETWORK') {
      message = 'Server is not started. Please ask the administrator/developer to start the server.';
    }

    return Promise.reject({ ...error, message });
  }
);

export default api;
