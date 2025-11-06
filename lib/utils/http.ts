/**
 * Admin HTTP Client
 * Axios instance configured for admin API requests with automatic token injection
 */
import axios from "axios";

export const adminHttp = axios.create({
  baseURL: "/api",
  headers: {
    "Content-Type": "application/json",
  },
});

/**
 * Request interceptor - Add admin auth token and language preference
 */
adminHttp.interceptors.request.use((config) => {
  // Only run in browser
  if (typeof window !== "undefined") {
    // Add language preference
    const language = localStorage.getItem("i18nextLng") || "en";
    config.headers["Accept-Language"] = language;

    // Add admin authentication token
    const adminToken = localStorage.getItem("adminToken");
    if (adminToken) {
      config.headers.Authorization = `Bearer ${adminToken}`;
    }
  }

  return config;
});

/**
 * Response interceptor - Handle common errors
 */
adminHttp.interceptors.response.use(
  (response) => response,
  (error) => {
    // Handle 401 Unauthorized - redirect to login
    // if (error.response?.status === 401) {
    //   if (typeof window !== "undefined") {
    //     localStorage.removeItem("admin_token");
    //     window.location.href = "/login";
    //   }
    // }
    return Promise.reject(error);
  }
);

export default adminHttp;
