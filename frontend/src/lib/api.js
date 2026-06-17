 function _optionalChain(ops) { let lastAccessLHS = undefined; let value = ops[0]; let i = 1; while (i < ops.length) { const op = ops[i]; const fn = ops[i + 1]; i += 2; if ((op === 'optionalAccess' || op === 'optionalCall') && value == null) { return undefined; } if (op === 'access' || op === 'optionalAccess') { lastAccessLHS = value; value = fn(value); } else if (op === 'call' || op === 'optionalCall') { value = fn((...args) => value.call(lastAccessLHS, ...args)); lastAccessLHS = undefined; } } return value; }import axios from "axios";

// Standard Backend API is hosted at localhost:4000
const API_URL = import.meta.env.VITE_API_URL || "http://localhost:4000/api/v1";

export const api = axios.create({
  baseURL: API_URL,
  withCredentials: true, // Crucial for sending httpOnly cookies (Access and Refresh Tokens)
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor to add access token from localStorage (fallback if needed)
api.interceptors.request.use(
  (config) => {
    if (typeof window !== "undefined") {
      const token = localStorage.getItem("accessToken");
      if (token && config.headers) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle token refresh automatically on 401
let isRefreshing = false;
let failedQueue


 = [];

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
  (response) => response.data, // Strip the axios response envelope and return our custom { success, data, message, etc }
  async (error) => {
    const originalRequest = error.config;

    // Avoid infinite loop if refreshing fails
    if (_optionalChain([originalRequest, 'access', _ => _.url, 'optionalAccess', _2 => _2.includes, 'call', _3 => _3("/auth/refresh")])) {
      if (typeof window !== "undefined") {
        localStorage.removeItem("accessToken");
        localStorage.removeItem("user");
        window.dispatchEvent(new Event("auth-changed"));
      }
      return Promise.reject(error);
    }

    if (_optionalChain([error, 'access', _4 => _4.response, 'optionalAccess', _5 => _5.status]) === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            return api(originalRequest);
          })
          .catch((err) => {
            return Promise.reject(err);
          });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const refreshResponse = await axios.post(
          `${API_URL}/auth/refresh`,
          {},
          { withCredentials: true }
        );

        const newAccessToken = refreshResponse.data.data.accessToken;
        
        if (typeof window !== "undefined") {
          localStorage.setItem("accessToken", newAccessToken);
        }

        api.defaults.headers.common.Authorization = `Bearer ${newAccessToken}`;
        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;

        processQueue(null, newAccessToken);
        isRefreshing = false;

        return api(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError, null);
        isRefreshing = false;

        // Clear local storage and redirect if auth fails
        if (typeof window !== "undefined") {
          localStorage.removeItem("accessToken");
          localStorage.removeItem("user");
          window.dispatchEvent(new Event("auth-changed"));
        }
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(_optionalChain([error, 'access', _6 => _6.response, 'optionalAccess', _7 => _7.data]) || error);
  }
);
