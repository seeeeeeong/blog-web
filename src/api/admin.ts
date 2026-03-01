import apiClient from "./client";
import type { PageResponse, PostSummary } from "../types";

export const adminApi = {
  getAllPosts: async (page: number = 0, size: number = 20): Promise<PageResponse<PostSummary>> => {
    const response = await apiClient.get("/v1/posts", {
      params: { page, size },
    });
    return response.data;
  },

  deletePost: async (postId: number): Promise<void> => {
    await apiClient.delete(`/v1/posts/${postId}`);
  },
};
