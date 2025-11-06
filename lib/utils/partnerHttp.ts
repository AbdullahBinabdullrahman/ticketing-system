/**
 * Partner HTTP Client
 * Axios instance configured for partner API requests with automatic token injection
 */
import axios from "axios";

export const partnerHttp = axios.create({
  baseURL: "/api/partner",
  headers: {
    "Content-Type": "application/json",
  },
});

/**
 * Request interceptor - Add partner auth token and language preference
 */
partnerHttp.interceptors.request.use((config) => {
  // Only run in browser
  if (typeof window !== "undefined") {
    // Add language preference
    const language = localStorage.getItem("i18nextLng") || "en";
    config.headers["Accept-Language"] = language;

    // Add partner authentication token
    const partnerToken = localStorage.getItem("partnerToken");
    if (partnerToken) {
      config.headers.Authorization = `Bearer ${partnerToken}`;
    }
  }

  return config;
});

/**
 * Response interceptor - Handle common errors
 */
partnerHttp.interceptors.response.use(
  (response) => response,
  (error) => {
    // Handle 401 Unauthorized - redirect to partner login
    if (error.response?.status === 401) {
      if (typeof window !== "undefined") {
        localStorage.removeItem("partnerToken");
        localStorage.removeItem("auth_tokens");
        window.location.href = "/login";
      }
    }
    return Promise.reject(error);
  }
);

export default partnerHttp;
