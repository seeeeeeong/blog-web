import axios from "axios";
import type { ApiResponse } from "../types";

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

apiClient.interceptors.request.use(
  (config) => {
    // 이미 Authorization 헤더가 설정되어 있으면 덮어쓰지 않음 (GitHub 댓글용)
    if (!config.headers.Authorization) {
      const token = localStorage.getItem("accessToken");
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

apiClient.interceptors.response.use(
  (response) => {
    // ApiResponse 형식의 데이터에서 data를 추출
    if (response.data && typeof response.data === 'object' && 'success' in response.data) {
      const apiResponse = response.data as ApiResponse<any>;
      if (apiResponse.success && apiResponse.data !== undefined) {
        response.data = apiResponse.data;
      } else if (!apiResponse.success) {
        return Promise.reject(new Error(apiResponse.message || 'API 요청 실패'));
      }
    }
    return response;
  },
  async (error) => {
    const originalRequest = error.config;
    const status = error.response?.status;
    const requestUrl = originalRequest?.url || '';
    const currentPath = window.location.pathname;

    // GitHub 인증 관련 요청인 경우 (댓글 API)
    if (status === 401 && requestUrl.includes('/comments')) {
      console.error('GitHub 인증이 필요합니다. 다시 로그인해주세요.');
      localStorage.removeItem("githubUser");
      return Promise.reject(error);
    }

    // 로그인/회원가입 페이지에서의 인증 에러는 리다이렉트하지 않음
    if (status === 401 && (currentPath === '/login' || currentPath === '/signup' ||
        requestUrl.includes('/auth/login') || requestUrl.includes('/auth/signup'))) {
      return Promise.reject(error);
    }

    // Public 엔드포인트 (홈페이지 게시글 목록 등)
    if (status === 401 && requestUrl.includes('/posts') &&
        !requestUrl.includes('/my') && !requestUrl.includes('/drafts')) {
      return Promise.reject(error);
    }

    // 401 에러이고 아직 재시도하지 않은 요청인 경우
    if (status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        // 이미 토큰 갱신 중이면 큐에 추가
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
        // refresh token이 없으면 로그인 페이지로
        clearAuthData();
        window.location.href = "/login";
        return Promise.reject(error);
      }

      try {
        // refresh token으로 새 토큰 발급
        const response = await axios.post(
          `${import.meta.env.VITE_API_BASE_URL}/users/refresh`,
          { refreshToken },
          { headers: { "Content-Type": "application/json" } }
        );

        const newAccessToken = response.data.data.accessToken;
        const newRefreshToken = response.data.data.refreshToken;

        // 새 토큰 저장
        localStorage.setItem("accessToken", newAccessToken);
        localStorage.setItem("refreshToken", newRefreshToken);

        // 큐에 있는 요청들 처리
        processQueue(null, newAccessToken);

        // 원래 요청 재시도
        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
        return apiClient(originalRequest);
      } catch (refreshError) {
        // refresh token도 만료된 경우
        processQueue(refreshError, null);
        clearAuthData();
        window.location.href = "/login";
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    // 403 에러 또는 다른 에러는 기존 로직 유지
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
  localStorage.removeItem("nickname");
};

export default apiClient;
