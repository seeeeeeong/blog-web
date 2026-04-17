import apiClient from '../common/client';
import type { Post, PostSummary, PostCreateRequest, PostUpdateRequest } from '../../core/domain/post';
import type { PageResponse } from '../../core/support/response';

export const postApi = {
  getPosts: async (page: number = 0, size: number = 10): Promise<PageResponse<PostSummary>> => {
    const response = await apiClient.get('/v1/posts', { params: { page, size } });
    return response.data;
  },

  getPost: async (postId: number): Promise<Post> => {
    const response = await apiClient.get(`/v1/posts/${postId}`);
    return response.data;
  },

  getPostForAdmin: async (postId: number): Promise<Post> => {
    const response = await apiClient.get(`/v1/posts/${postId}/admin`);
    return response.data;
  },

  createPost: async (data: PostCreateRequest): Promise<Post> => {
    const response = await apiClient.post('/v1/posts', data);
    return response.data;
  },

  updatePost: async (postId: number, data: PostUpdateRequest): Promise<Post> => {
    const response = await apiClient.put(`/v1/posts/${postId}`, data);
    return response.data;
  },

  deletePost: async (postId: number): Promise<void> => {
    await apiClient.delete(`/v1/posts/${postId}`);
  },

  getPostsByCategory: async (
    categoryId: number,
    page: number = 0,
    size: number = 10
  ): Promise<PageResponse<PostSummary>> => {
    const response = await apiClient.get(`/v1/posts/categories/${categoryId}`, {
      params: { page, size },
    });
    return response.data;
  },

  getDraftPosts: async (page: number = 0, size: number = 10): Promise<PageResponse<PostSummary>> => {
    const response = await apiClient.get('/v1/posts/drafts', { params: { page, size } });
    return response.data;
  },

  searchPosts: async (
    query: string,
    categoryId?: number,
    page: number = 0,
    size: number = 10
  ): Promise<PageResponse<PostSummary>> => {
    const response = await apiClient.get('/v1/posts/search', {
      params: { query, categoryId, page, size },
    });
    return response.data;
  },

};
