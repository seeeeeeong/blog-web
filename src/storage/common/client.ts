import axios, {
  AxiosError,
  AxiosHeaders,
  type InternalAxiosRequestConfig,
} from "axios";
import { getUserIdFromToken, clearAuthData } from "../../core/support/auth/authToken";

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

  // API 응답 구조 탐색을 위한 단언 — null/typeof 체크 후 안전하게 접근
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

const PUBLIC_ENDPOINT_PATTERNS: Array<{ method: string; pattern: RegExp }> = [
  { method: "get", pattern: /^\/v1\/posts(?:\?.*)?$/ },
  { method: "get", pattern: /^\/v1\/posts\/\d+$/ },
  { method: "get", pattern: /^\/v1\/posts\/\d+\/comments$/ },
];

const isPublicEndpoint = (method: string, url: string): boolean => {
  const normalizedMethod = method.toLowerCase();
  return PUBLIC_ENDPOINT_PATTERNS.some(
    (ep) => ep.method === normalizedMethod && ep.pattern.test(url)
  );
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
    // Axios 내부 config 확장을 위한 단언 — _retry 플래그 추가용
    const requestConfig = config as RetryableRequestConfig;
    const method = String(requestConfig.method || "get");
    const url = requestConfig.url || "";

    if (isPublicEndpoint(method, url)) {
      return requestConfig;
    }

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
      // result 필드 존재 확인 후 envelope 구조로 단언
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

export default apiClient;
