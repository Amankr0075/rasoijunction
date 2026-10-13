import axios from 'axios';

const PRIMARY_URL = import.meta.env.VITE_API_URL || 'https://rasoijunction.up.railway.app/api';
const FALLBACK_URL = import.meta.env.VITE_FALLBACK_API_URL || 'https://zodiac-snooper-cornfield.ngrok-free.dev/api';

// Retrieve cached active base URL if previously failed over in this session
const initialBaseURL = (typeof window !== 'undefined' && sessionStorage.getItem('active_api_url')) || PRIMARY_URL;

const api = axios.create({
  baseURL: initialBaseURL,
  withCredentials: true,
  timeout: 12000,
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
    if (!originalRequest) return Promise.reject(error);

    // Failover to Fallback (Ngrok) if Primary (Railway) is unreachable or 502/503/504
    const isGatewayOrNetworkError =
      !error.response ||
      [502, 504].includes(error.response?.status) ||
      error.code === 'ECONNABORTED' ||
      error.code === 'ERR_NETWORK' ||
      error.message === 'Network Error';

    if (
      isGatewayOrNetworkError &&
      !originalRequest._fallbackAttempted &&
      FALLBACK_URL &&
      api.defaults.baseURL !== FALLBACK_URL
    ) {
      console.warn(`⚠️ Primary backend (${api.defaults.baseURL}) unreachable. Auto-switching to Ngrok (${FALLBACK_URL})...`);
      originalRequest._fallbackAttempted = true;

      // Update base URL for subsequent calls
      api.defaults.baseURL = FALLBACK_URL;
      if (typeof window !== 'undefined') {
        sessionStorage.setItem('active_api_url', FALLBACK_URL);
      }

      // Retry current request against fallback
      originalRequest.baseURL = FALLBACK_URL;
      return api(originalRequest);
    }

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
        const response = await axios.post(`${api.defaults.baseURL}/auth/refresh-token`, {}, {
          withCredentials: true,
          headers: { 'ngrok-skip-browser-warning': 'true' },
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
      message = 'Unable to establish a connection to the server. Please contact the system administrator to verify that backend services are active.';
    }

    return Promise.reject({ ...error, message });
  }
);

export default api;
