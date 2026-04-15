import apiClient from "./client";
import type {
  UserLoginRequest,
  TokenResponse,
  UserTokenRequest,
} from "../types";

export const authApi = {
  login: async (data: UserLoginRequest): Promise<TokenResponse> => {
    const response = await apiClient.post("/v1/users/login", data);
    return response.data;
  },

  refreshToken: async (data: UserTokenRequest): Promise<TokenResponse> => {
    const response = await apiClient.post("/v1/users/refresh", data);
    return response.data;
  },
};
