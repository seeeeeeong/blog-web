import axios from "axios";
import type { ApiResponse } from "../types";

const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

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
  (error) => {
    if (error.response?.status === 401) {
      const requestUrl = error.config?.url || '';
      const currentPath = window.location.pathname;

      // GitHub 인증 관련 요청인 경우 (댓글 API)
      if (requestUrl.includes('/comments')) {
        console.error('GitHub 인증이 필요합니다. 다시 로그인해주세요.');
        localStorage.removeItem("githubUser");
      }
      // 로그인/회원가입 페이지에서의 401 에러는 리다이렉트하지 않음
      else if (currentPath === '/login' || currentPath === '/signup' || requestUrl.includes('/auth/login') || requestUrl.includes('/auth/signup')) {
        // 로그인/회원가입 실패는 페이지에서 처리
      }
      // 관리자 인증이 필요한 다른 페이지의 경우
      else {
        localStorage.removeItem("accessToken");
        localStorage.removeItem("userId");
        window.location.href = "/login";
      }
    }
    return Promise.reject(error);
  }
);

export default apiClient;
