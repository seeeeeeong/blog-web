import apiClient from "./client";
import type { Comment, CreateCommentRequest } from "../types";

export const commentApi = {
  getComments: async (postId: number): Promise<Comment[]> => {
    const response = await apiClient.get(`/posts/${postId}/comments`);
    return response.data;
  },

  createComment: async (
    postId: number,
    data: CreateCommentRequest,
    githubToken: string
  ): Promise<Comment> => {
    const response = await apiClient.post(`/posts/${postId}/comments`, data, {
      headers: {
        Authorization: `Bearer ${githubToken}`,
      },
    });
    return response.data;
  },

  updateComment: async (
    postId: number,
    commentId: number,
    data: { content: string },
    githubToken: string
  ): Promise<Comment> => {
    const response = await apiClient.put(
      `/posts/${postId}/comments/${commentId}`,
      data,
      {
        headers: {
          Authorization: `Bearer ${githubToken}`,
        },
      }
    );
    return response.data;
  },

  deleteComment: async (
    postId: number,
    commentId: number,
    githubToken: string
  ): Promise<void> => {
    await apiClient.delete(`/posts/${postId}/comments/${commentId}`, {
      headers: {
        Authorization: `Bearer ${githubToken}`,
      },
    });
  },

  getRecentComments: async (limit: number = 10): Promise<Comment[]> => {
    const response = await apiClient.get('/comments/recent', { params: { limit } });
    return response.data;
  },
};