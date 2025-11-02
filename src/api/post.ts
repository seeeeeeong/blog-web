import apiClient from './client';
import type { Post, PostListResponse, CreatePostRequest } from '../types';

export const postApi = {
  getPosts: async (page: number = 0, size: number = 10): Promise<PostListResponse> => {
    const response = await apiClient.get('/posts', { params: { page, size } });
    return response.data;
  },

  getPost: async (postId: number): Promise<Post> => {
    const response = await apiClient.get(`/posts/${postId}`);
    return response.data;
  },

  createPost: async (data: CreatePostRequest): Promise<Post> => {
    const response = await apiClient.post('/posts', data);
    return response.data;
  },

  updatePost: async (postId: number, data: CreatePostRequest): Promise<Post> => {
    const response = await apiClient.put(`/posts/${postId}`, data);
    return response.data;
  },

  deletePost: async (postId: number): Promise<void> => {
    await apiClient.delete(`/posts/${postId}`);
  },

  getPostsByCategory: async (
    categoryId: number,
    page: number = 0,
    size: number = 10
  ): Promise<PostListResponse> => {
    const response = await apiClient.get(`/posts/category/${categoryId}`, {
      params: { page, size },
    });
    return response.data;
  },
};
