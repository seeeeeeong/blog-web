import axios, {
  AxiosError,
  AxiosHeaders,
  type InternalAxiosRequestConfig,
} from "axios";
import { getUserIdFromToken } from "../utils/authToken";

const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

let isRefreshing = false;
type RetryableRequestConfig = InternalAxiosRequestConfig & { _retry?: boolean };
type ApiEnvelope<T = unknown> = {
  result: "SUCCESS" | "ERROR";
  data?: T;
  error?: { code?: string; message?: string } | null;
  message?: string;
};

let failedQueue: Array<{
  resolve: (token: string) => void;
  reject: (error: unknown) => void;
}> = [];

const processQueue = (error: unknown, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
      return;
    }

    if (token != null) {
      prom.resolve(token);
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

const setAuthorizationHeader = (
  config: RetryableRequestConfig,
  token: string
) => {
  const headers = AxiosHeaders.from(config.headers);
  headers.set("Authorization", `Bearer ${token}`);
  config.headers = headers;
};

apiClient.interceptors.request.use(
  (config) => {
    const requestConfig = config as RetryableRequestConfig;
    const headers = AxiosHeaders.from(requestConfig.headers);
    const hasAuthorizationHeader = headers.has("Authorization");

    if (!hasAuthorizationHeader) {
      const token = localStorage.getItem("accessToken");
      if (token) {
        setAuthorizationHeader(requestConfig, token);
      }
    }
    return requestConfig;
  },
  (error) => Promise.reject(error)
);

apiClient.interceptors.response.use(
  (response) => {
    if (response.data && typeof response.data === "object" && "result" in response.data) {
      const apiResponse = response.data as ApiEnvelope;

      if (apiResponse.result === "SUCCESS") {
        response.data = apiResponse.data ?? null;
      } else if (apiResponse.result === "ERROR") {
        const errorMessage = apiResponse.error?.message || "API request failed";
        return Promise.reject(new Error(errorMessage));
      }
    }
    return response;
  },
  async (error: AxiosError<unknown>) => {
    const originalRequest = error.config as RetryableRequestConfig | undefined;
    const status = error.response?.status;
    const requestUrl = originalRequest?.url || "";
    const method = String(originalRequest?.method || "get").toLowerCase();
    const currentPath = window.location.pathname;
    const apiError = extractApiError(error.response?.data);
    if (apiError?.message) {
      error.message = apiError.message;
    }

    const isUserAuthEndpoint =
      requestUrl.includes("/v1/users/login") ||
      requestUrl.includes("/v1/users/refresh");

    if (status === 401 && (isUserAuthEndpoint || currentPath === "/login")) {
      return Promise.reject(error);
    }

    const isPublicPostReadEndpoint =
      method === "get" &&
      requestUrl.startsWith("/v1/posts") &&
      !requestUrl.includes("/drafts");

    if (status === 401 && isPublicPostReadEndpoint && originalRequest && !originalRequest._retry) {
      originalRequest._retry = true;
      const headers = AxiosHeaders.from(originalRequest.headers);
      headers.delete("Authorization");
      originalRequest.headers = headers;
      return apiClient(originalRequest);
    }

    if (status === 401 && originalRequest && !originalRequest._retry) {
      if (isRefreshing) {
        return new Promise<string>((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            setAuthorizationHeader(originalRequest, token);
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
        const tokenData = await apiClient.post<{
          accessToken: string;
          refreshToken: string;
        }>(
          "/v1/users/refresh",
          { refreshToken }
        );

        const newAccessToken = tokenData.data.accessToken;
        const newRefreshToken = tokenData.data.refreshToken;
        const userId = getUserIdFromToken(newAccessToken);

        localStorage.setItem("accessToken", newAccessToken);
        localStorage.setItem("refreshToken", newRefreshToken);
        if (userId) {
          localStorage.setItem("userId", userId);
        }

        processQueue(null, newAccessToken);

        setAuthorizationHeader(originalRequest, newAccessToken);
        return apiClient(originalRequest);
      } catch (refreshError: unknown) {
        processQueue(refreshError, null);
        clearAuthData();
        window.location.href = "/login";
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
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
