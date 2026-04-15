import apiClient from "./client";
import type { Comment, CreateCommentRequest, UpdateCommentRequest, DeleteCommentRequest } from "../types";

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
  replies: Array.isArray(comment.replies) ? comment.replies.map(mapComment) : [],
});

export const commentApi = {
  getComments: async (postId: number): Promise<Comment[]> => {
    const response = await apiClient.get<CommentPayload[]>(`/v1/posts/${postId}/comments`);
    return Array.isArray(response.data) ? response.data.map(mapComment) : [];
  },

  createComment: async (
    postId: number,
    data: CreateCommentRequest,
  ): Promise<Comment> => {
    const response = await apiClient.post<CommentPayload>(`/v1/posts/${postId}/comments`, data);
    return mapComment(response.data);
  },

  updateComment: async (
    postId: number,
    commentId: number,
    data: UpdateCommentRequest,
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
    data: DeleteCommentRequest,
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
