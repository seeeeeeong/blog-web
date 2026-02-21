import apiClient from "./client";
import type {
  LoginRequest,
  TokenResponse,
  RefreshTokenRequest,
} from "../types";

export const authApi = {
  login: async (data: LoginRequest): Promise<TokenResponse> => {
    const response = await apiClient.post("/v1/users/login", data);
    return response.data;
  },

  refreshToken: async (data: RefreshTokenRequest): Promise<TokenResponse> => {
    const response = await apiClient.post("/v1/users/refresh", data);
    return response.data;
  },

  logout: async (refreshToken: string): Promise<void> => {
    await apiClient.post("/v1/users/logout", { refreshToken });
  },
};
