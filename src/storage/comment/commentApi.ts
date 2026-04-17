import apiClient from "../common/client";
import { AxiosError } from "axios";
import type { Comment, CommentCreateRequest } from "../../core/domain/comment";

export const commentApi = {
  getComments: async (postId: number): Promise<Comment[]> => {
    try {
      const response = await apiClient.get<Comment[]>(`/v1/posts/${postId}/comments`);
      if (!Array.isArray(response.data)) {
        return [];
      }
      return response.data;
    } catch (error) {
      if (error instanceof AxiosError && error.response?.status === 404) {
        return [];
      }
      throw error;
    }
  },

  createComment: async (
    postId: number,
    data: CommentCreateRequest,
  ): Promise<Comment> => {
    const response = await apiClient.post<Comment>(`/v1/posts/${postId}/comments`, data);
    return response.data;
  },

  deleteCommentByAdmin: async (
    postId: number,
    commentId: number,
  ): Promise<void> => {
    await apiClient.delete(`/v1/posts/${postId}/comments/${commentId}/admin`);
  },
};
