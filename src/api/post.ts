import apiClient from './client';
import type { Post, PageResponse, CreatePostRequest, UpdatePostRequest } from '../types';

export const postApi = {
  // 게시글 목록 조회
  getPosts: async (page: number = 0, size: number = 10): Promise<PageResponse<Post>> => {
    const response = await apiClient.get('/v1/posts', { params: { page, size } });
    return response.data;
  },

  // 게시글 상세 조회
  getPost: async (postId: number): Promise<Post> => {
    const response = await apiClient.get(`/v1/posts/${postId}`);
    return response.data;
  },

  // 게시글 작성
  createPost: async (data: CreatePostRequest): Promise<Post> => {
    const response = await apiClient.post('/v1/posts', data);
    return response.data;
  },

  // 게시글 수정
  updatePost: async (postId: number, data: UpdatePostRequest): Promise<Post> => {
    const response = await apiClient.put(`/v1/posts/${postId}`, data);
    return response.data;
  },

  // 게시글 삭제
  deletePost: async (postId: number): Promise<void> => {
    await apiClient.delete(`/v1/posts/${postId}`);
  },

  // 카테고리별 게시글 조회
  getPostsByCategory: async (
    categoryId: number,
    page: number = 0,
    size: number = 10
  ): Promise<PageResponse<Post>> => {
    const response = await apiClient.get(`/v1/posts/categories/${categoryId}`, {
      params: { page, size },
    });
    return response.data;
  },

  // 내 게시글 조회
  getMyPosts: async (page: number = 0, size: number = 10): Promise<PageResponse<Post>> => {
    const response = await apiClient.get('/v1/posts/my', { params: { page, size } });
    return response.data;
  },

  // 임시저장 게시글 조회
  getDraftPosts: async (page: number = 0, size: number = 10): Promise<PageResponse<Post>> => {
    const response = await apiClient.get('/v1/posts/drafts', { params: { page, size } });
    return response.data;
  },

  // 인기 게시글 조회
  getPopularPosts: async (limit: number = 10): Promise<Post[]> => {
    const response = await apiClient.get('/v1/posts/popular', { params: { limit } });
    return response.data;
  },

  // 유사도 기반 검색 (AI)
  searchPostsBySimilarity: async (
    query: string,
    categoryId?: number,
    page: number = 0,
    size: number = 10
  ): Promise<PageResponse<Post>> => {
    const response = await apiClient.get('/v1/posts/search/similarity', {
      params: { query, categoryId, page, size },
    });
    return response.data;
  },

  // 관련 게시글 추천
  getSimilarPosts: async (postId: number, limit: number = 5): Promise<Post[]> => {
    const response = await apiClient.get(`/v1/posts/${postId}/similar`, { params: { limit } });
    return response.data;
  },
};
