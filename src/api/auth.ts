import apiClient from "./client";
import type {
  LoginRequest,
  SignupRequest,
  TokenResponse,
  User,
  RefreshTokenRequest,
  UpdateProfileRequest,
  ChangePasswordRequest,
} from "../types";

export const authApi = {
  signup: async (data: SignupRequest): Promise<User> => {
    const response = await apiClient.post("/users/signup", data);
    return response.data;
  },

  login: async (data: LoginRequest): Promise<TokenResponse> => {
    const response = await apiClient.post("/users/login", data);
    return response.data;
  },

  refreshToken: async (data: RefreshTokenRequest): Promise<TokenResponse> => {
    const response = await apiClient.post("/users/refresh", data);
    return response.data;
  },

  getMyProfile: async (): Promise<User> => {
    const response = await apiClient.get("/users/me");
    return response.data;
  },

  updateProfile: async (data: UpdateProfileRequest): Promise<User> => {
    const response = await apiClient.put("/users/me", data);
    return response.data;
  },

  changePassword: async (data: ChangePasswordRequest): Promise<void> => {
    await apiClient.put("/users/me/password", data);
  },

  getMe: async (userId: number): Promise<User> => {
    const response = await apiClient.get(`/users/${userId}`);
    return response.data;
  },
};
