import axios from "axios";
import { getUserIdFromToken } from "../utils/authToken";

const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

let isRefreshing = false;
let failedQueue: Array<{
  resolve: (token: string) => void;
  reject: (error: any) => void;
}> = [];

const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token!);
    }
  });

  failedQueue = [];
};

interface ApiErrorPayload {
  code?: string;
  message?: string;
}

const extractApiError = (data: unknown): ApiErrorPayload | null => {
  if (data == null || typeof data !== "object") {
    return null;
  }

  const apiResponse = data as {
    result?: string;
    error?: { code?: string; message?: string };
    message?: string;
  };

  if (apiResponse.result === "ERROR" && apiResponse.error) {
    return {
      code: apiResponse.error.code,
      message: apiResponse.error.message,
    };
  }

  if (typeof apiResponse.message === "string") {
    return { message: apiResponse.message };
  }

  return null;
};

apiClient.interceptors.request.use(
  (config) => {
    if (!config.headers.Authorization) {
      const token = localStorage.getItem("accessToken");
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);

apiClient.interceptors.response.use(
  (response) => {
    if (response.data && typeof response.data === "object" && "result" in response.data) {
      const apiResponse = response.data as { result: string; data: any; error: any };

      if (apiResponse.result === "SUCCESS") {
        response.data = apiResponse.data;
      } else if (apiResponse.result === "ERROR") {
        const errorMessage = apiResponse.error?.message || "API request failed";
        return Promise.reject(new Error(errorMessage));
      }
    }
    return response;
  },
  async (error) => {
    const originalRequest = error.config;
    const status = error.response?.status;
    const requestUrl = originalRequest?.url || "";
    const currentPath = window.location.pathname;
    const apiError = extractApiError(error.response?.data);
    if (apiError?.message) {
      error.message = apiError.message;
    }

    const isUserAuthEndpoint =
      requestUrl.includes("/v1/users/login") ||
      requestUrl.includes("/v1/users/refresh") ||
      requestUrl.includes("/v1/users/logout");

    if (status === 401 && requestUrl.includes("/comments")) {
      localStorage.removeItem("githubUser");
      return Promise.reject(error);
    }

    if (status === 401 && (isUserAuthEndpoint || currentPath === "/login")) {
      return Promise.reject(error);
    }

    if (status === 401 && requestUrl.includes("/posts") && !requestUrl.includes("/drafts")) {
      return Promise.reject(error);
    }

    if (status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            return apiClient(originalRequest);
          })
          .catch((err) => {
            return Promise.reject(err);
          });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      const refreshToken = localStorage.getItem("refreshToken");

      if (!refreshToken) {
        clearAuthData();
        window.location.href = "/login";
        return Promise.reject(error);
      }

      try {
        const response = await axios.post(
          `${import.meta.env.VITE_API_BASE_URL}/v1/users/refresh`,
          { refreshToken },
          { headers: { "Content-Type": "application/json" } }
        );

        const tokenData = response.data?.data ?? response.data;
        const newAccessToken = tokenData.accessToken;
        const newRefreshToken = tokenData.refreshToken;
        const userId = getUserIdFromToken(newAccessToken);

        localStorage.setItem("accessToken", newAccessToken);
        localStorage.setItem("refreshToken", newRefreshToken);
        if (userId) {
          localStorage.setItem("userId", userId);
        }

        processQueue(null, newAccessToken);

        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
        return apiClient(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError, null);
        clearAuthData();
        window.location.href = "/login";
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    if (status === 403) {
      clearAuthData();
      window.location.href = "/login";
    }

    return Promise.reject(error);
  }
);

const clearAuthData = () => {
  localStorage.removeItem("accessToken");
  localStorage.removeItem("refreshToken");
  localStorage.removeItem("userId");
};

export default apiClient;
