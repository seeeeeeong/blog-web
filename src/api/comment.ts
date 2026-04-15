import apiClient from "./client";
import { AxiosError } from "axios";
import type { Comment, CommentCreateRequest, CommentUpdateRequest, CommentDeleteRequest } from "../types";

interface CommentPayload {
  id: number;
  postId: number;
  nickname: string;
  parentId: number | null;
  content: string;
  contentHtml: string;
  createdAt: string;
  updatedAt: string;
  replies?: CommentPayload[];
}

const mapComment = (comment: CommentPayload): Comment => ({
  id: comment.id,
  postId: comment.postId,
  nickname: comment.nickname,
  parentId: comment.parentId === 0 ? null : comment.parentId,
  content: comment.content,
  contentHtml: comment.contentHtml,
  createdAt: comment.createdAt,
  updatedAt: comment.updatedAt,
  replies: (comment.replies ?? []).map(mapComment),
});

export const commentApi = {
  getComments: async (postId: number): Promise<Comment[]> => {
    try {
      const response = await apiClient.get<CommentPayload[]>(`/v1/posts/${postId}/comments`);
      if (!Array.isArray(response.data)) {
        console.warn("[commentApi.getComments] expected array, got:", typeof response.data, response.data);
        return [];
      }
      return response.data.map(mapComment);
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
    const response = await apiClient.post<CommentPayload>(`/v1/posts/${postId}/comments`, data);
    return mapComment(response.data);
  },

  updateComment: async (
    postId: number,
    commentId: number,
    data: CommentUpdateRequest,
  ): Promise<Comment> => {
    const response = await apiClient.put<CommentPayload>(
      `/v1/posts/${postId}/comments/${commentId}`,
      data,
    );
    return mapComment(response.data);
  },

  deleteComment: async (
    postId: number,
    commentId: number,
    data: CommentDeleteRequest,
  ): Promise<void> => {
    await apiClient.delete(`/v1/posts/${postId}/comments/${commentId}`, { data });
  },

  deleteCommentByAdmin: async (
    postId: number,
    commentId: number,
  ): Promise<void> => {
    await apiClient.delete(`/v1/posts/${postId}/comments/${commentId}/admin`);
  },
};
