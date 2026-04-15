export interface ApiResponse<T> {
  result: "SUCCESS" | "ERROR";
  data: T | null;
  error: {
    code: string;
    message: string;
    data?: unknown;
  } | null;
}

export interface PageResponse<T> {
  content: T[];
  hasNext: boolean;
}

export interface User {
  id: number;
  email: string;
  nickname: string;
  profileImageUrl: string | null;
  createdAt: string;
}

export interface UserLoginRequest {
  email: string;
  password: string;
}

export interface TokenResponse {
  accessToken: string;
  refreshToken: string;
}

export interface UserTokenRequest {
  refreshToken: string;
}

export interface Category {
  id: number;
  name: string;
  slug: string;
  createdAt: string;
}

export interface PostSummary {
  id: number;
  userId: number;
  categoryId: number;
  title: string;
  excerpt: string;
  thumbnailUrl: string | null;
  viewCount: number;
  status: "DRAFT" | "PUBLISHED";
  createdAt: string;
  updatedAt: string;
}

export interface Post extends PostSummary {
  content: string;
  contentHtml: string;
}

export interface PostCreateRequest {
  categoryId: number;
  title: string;
  content: string;
  thumbnailUrl?: string | null;
  isDraft?: boolean;
}

export interface PostUpdateRequest {
  categoryId: number;
  title: string;
  content: string;
  thumbnailUrl?: string | null;
  isDraft?: boolean;
}

export interface Comment {
  id: number;
  postId: number;
  nickname: string;
  parentId: number | null;
  content: string;
  contentHtml: string;
  createdAt: string;
  updatedAt: string;
  replies: Comment[];
}

export interface CommentCreateRequest {
  nickname: string;
  password: string;
  content: string;
  parentId?: number | null;
}

export interface CommentUpdateRequest {
  password: string;
  content: string;
}

export interface CommentDeleteRequest {
  password: string;
}

export interface ImagePresignedUrlResponse {
  uploadUrl: string;
  fileUrl: string;
  key: string;
  expiresInSeconds: number;
}

export interface SimilarArticle {
  articleId: number;
  title: string;
  company: string;
  url: string;
  summary: string | null;
  publishedAt: string | null;
  similarity: number;
}
