import apiClient from "./client";
import type { PageResponse, Post } from "../types";

export const adminApi = {
  // 내 게시글 전체 조회 (Admin용)
  getAllPosts: async (page: number = 0, size: number = 20): Promise<PageResponse<Post>> => {
    const response = await apiClient.get("/v1/posts/my", {
      params: { page, size },
    });
    return response.data;
  },

  // 게시글 삭제
  deletePost: async (postId: number): Promise<void> => {
    await apiClient.delete(`/v1/posts/${postId}`);
  },
};
