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
    const token = localStorage.getItem("accessToken");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
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
      localStorage.removeItem("accessToken");
      localStorage.removeItem("userId");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

export default apiClient;
