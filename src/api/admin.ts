import apiClient from "./client";
import type { PostListResponse } from "../types";

export const adminApi = {
  getAllPosts: async (page: number = 0, size: number = 20): Promise<PostListResponse> => {
    const response = await apiClient.get("/admin/posts", {
      params: { page, size },
    });
    return response.data;
  },

  deletePost: async (postId: number): Promise<void> => {
    await apiClient.delete(`/admin/posts/${postId}`);
  },
};