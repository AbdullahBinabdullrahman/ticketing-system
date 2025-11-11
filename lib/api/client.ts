import axios, {
  AxiosInstance,
  AxiosError,
  InternalAxiosRequestConfig,
} from "axios";
import { logger } from "../utils/logger";

/**
 * Create axios instance with default configuration
 */
export const apiClient: AxiosInstance = axios.create({
  baseURL: "/api",
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 30000,
});

/**
 * Request interceptor - Add auth token and language preference
 */
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    // Add auth token if available
    if (typeof window !== "undefined") {
      const authTokens = localStorage.getItem("auth_tokens");
      if (authTokens) {
        try {
          const tokens = JSON.parse(authTokens);
          if (tokens.accessToken) {
            config.headers.Authorization = `Bearer ${tokens.accessToken}`;
          }
        } catch (error) {
          logger.error("Failed to parse auth tokens", { error });
        }
      }

      // Add language preference
      const language = localStorage.getItem("i18nextLng") || "en";
      config.headers["Accept-Language"] = language;
    }

    return config;
  },
  (error: AxiosError) => {
    logger.error("API request error", { error: error.message });
    return Promise.reject(error);
  }
);

/**
 * Response interceptor - Handle errors globally
 */
apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & {
      _retry?: boolean;
    };

    // Handle 401 unauthorized - try to refresh token
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        if (typeof window !== "undefined") {
          const authTokens = localStorage.getItem("auth_tokens");
          if (authTokens) {
            const tokens = JSON.parse(authTokens);
            if (tokens.refreshToken) {
              // Try to refresh the token
              const response = await axios.post(`/auth/refresh`, {
                refreshToken: tokens.refreshToken,
              });

              const newTokens = response.data.tokens;
              localStorage.setItem(
                "auth_tokens",
                JSON.stringify({
                  ...newTokens,
                  userId: tokens.userId,
                })
              );

              // Retry original request with new token
              originalRequest.headers.Authorization = `Bearer ${newTokens.accessToken}`;
              return apiClient(originalRequest);
            }
          }
        }

        // If refresh fails, logout user
        if (typeof window !== "undefined") {
          localStorage.removeItem("auth_tokens");
          window.location.href = "/login";
        }
      } catch (refreshError) {
        logger.error("Token refresh failed", { error: refreshError });
        if (typeof window !== "undefined") {
          localStorage.removeItem("auth_tokens");
          window.location.href = "/login";
        }
        return Promise.reject(refreshError);
      }
    }

    // Log other errors
    logger.error("API response error", {
      status: error.response?.status,
      statusText: error.response?.statusText,
      data: error.response?.data,
    });

    return Promise.reject(error);
  }
);

export default apiClient;
