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

export interface LoginRequest {
  email: string;
  password: string;
}

export interface TokenResponse {
  accessToken: string;
  refreshToken: string;
}

export interface RefreshTokenRequest {
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

export interface CreatePostRequest {
  categoryId: number;
  title: string;
  content: string;
  thumbnailUrl?: string | null;
  isDraft?: boolean;
}

export interface UpdatePostRequest {
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

export interface CreateCommentRequest {
  nickname: string;
  password: string;
  content: string;
  parentId?: number | null;
}

export interface UpdateCommentRequest {
  password: string;
  content: string;
}

export interface DeleteCommentRequest {
  password: string;
}

export interface ImagePresignedUrlResponse {
  uploadUrl: string;
  fileUrl: string;
  key: string;
  expiresInSeconds: number;
}
