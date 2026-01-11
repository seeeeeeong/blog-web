import apiClient from "./client";
import type { Comment, CreateCommentRequest, UpdateCommentRequest } from "../types";

const mapComment = (comment: any): Comment => {
  const githubId = comment.githubId ?? comment.oauthId;
  const githubUsername = comment.githubUsername ?? comment.oauthUsername;
  const githubAvatarUrl = comment.githubAvatarUrl ?? comment.oauthAvatarUrl ?? null;
  const parentId = comment.parentId === 0 ? null : comment.parentId;

  return {
    id: comment.id,
    postId: comment.postId,
    githubId,
    githubUsername,
    githubAvatarUrl,
    parentId,
    content: comment.content,
    contentHtml: comment.contentHtml,
    createdAt: comment.createdAt,
    updatedAt: comment.updatedAt,
    replies: Array.isArray(comment.replies) ? comment.replies.map(mapComment) : [],
  };
};

export const commentApi = {
  // 댓글 목록 조회
  getComments: async (postId: number): Promise<Comment[]> => {
    const response = await apiClient.get(`/v1/posts/${postId}/comments`);
    return response.data.map(mapComment);
  },

  // 댓글 작성
  createComment: async (
    postId: number,
    data: CreateCommentRequest,
    githubToken: string
  ): Promise<Comment> => {
    const response = await apiClient.post(`/v1/posts/${postId}/comments`, data, {
      headers: {
        Authorization: `Bearer ${githubToken}`,
      },
    });
    return mapComment(response.data);
  },

  // 댓글 수정
  updateComment: async (
    postId: number,
    commentId: number,
    data: UpdateCommentRequest,
    githubToken: string
  ): Promise<Comment> => {
    const response = await apiClient.put(
      `/v1/posts/${postId}/comments/${commentId}`,
      data,
      {
        headers: {
          Authorization: `Bearer ${githubToken}`,
        },
      }
    );
    return mapComment(response.data);
  },

  // 댓글 삭제
  deleteComment: async (
    postId: number,
    commentId: number,
    githubToken: string
  ): Promise<void> => {
    await apiClient.delete(`/v1/posts/${postId}/comments/${commentId}`, {
      headers: {
        Authorization: `Bearer ${githubToken}`,
      },
    });
  },
};
