/**
 * Customer HTTP Client
 * Dedicated axios instance for customer API calls
 * Uses customerToken from localStorage
 */

import axios from "axios";
import { logger } from "./logger";

const customerHttp = axios.create({
  baseURL: "/api",
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor - Add customer token
customerHttp.interceptors.request.use(
  (config) => {
    if (typeof window !== "undefined") {
      const token = localStorage.getItem("customerToken");
      const language = localStorage.getItem("i18nextLng") || "en";

      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }

      config.headers["Accept-Language"] = language;
    }

    return config;
  },
  (error) => {
    logger.error("Customer HTTP request error", { error });
    return Promise.reject(error);
  }
);

// Response interceptor - Handle errors
customerHttp.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Unauthorized - clear token and redirect to login
      //   if (typeof window !== "undefined") {
      //     localStorage.removeItem("customerToken");
      //     localStorage.removeItem("auth_tokens");
      //     window.location.href = "/login";
      //   }
    }

    logger.error("Customer HTTP response error", {
      status: error.response?.status,
      message: error.response?.data?.message || error.message,
    });

    return Promise.reject(error);
  }
);

export default customerHttp;



