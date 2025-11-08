import apiClient from "./client";
import type {
  LoginRequest,
  SignupRequest,
  TokenResponse,
  User,
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

  getMe: async (userId: number): Promise<User> => {
    const response = await apiClient.get(`/users/${userId}`);
    return response.data;
  },
};
