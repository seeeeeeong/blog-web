import apiClient from "./client";
import type { Comment, CreateCommentRequest, UpdateCommentRequest } from "../types";

interface CommentPayload {
  id: number;
  postId: number;
  oauthId: string;
  oauthUsername: string;
  oauthAvatarUrl: string | null;
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
  oauthId: comment.oauthId,
  oauthUsername: comment.oauthUsername,
  oauthAvatarUrl: comment.oauthAvatarUrl,
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
    return response.data.map(mapComment);
  },

  createComment: async (
    postId: number,
    data: CreateCommentRequest,
    oauthToken: string
  ): Promise<Comment> => {
    const response = await apiClient.post<CommentPayload>(`/v1/posts/${postId}/comments`, data, {
      headers: { Authorization: `Bearer ${oauthToken}` },
    });
    return mapComment(response.data);
  },

  updateComment: async (
    postId: number,
    commentId: number,
    data: UpdateCommentRequest,
    oauthToken: string
  ): Promise<Comment> => {
    const response = await apiClient.put<CommentPayload>(
      `/v1/posts/${postId}/comments/${commentId}`,
      data,
      { headers: { Authorization: `Bearer ${oauthToken}` } }
    );
    return mapComment(response.data);
  },

  deleteComment: async (
    postId: number,
    commentId: number,
    oauthToken: string
  ): Promise<void> => {
    await apiClient.delete(`/v1/posts/${postId}/comments/${commentId}`, {
      headers: { Authorization: `Bearer ${oauthToken}` },
    });
  },
};
