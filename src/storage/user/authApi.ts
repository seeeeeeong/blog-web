import apiClient from "../common/client";
import type {
  UserLoginRequest,
  TokenResponse,
  UserTokenRequest,
} from "../../core/domain/user";

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
