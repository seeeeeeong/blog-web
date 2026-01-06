// API Response
export interface ApiResponse<T> {
  result: "SUCCESS" | "ERROR";
  data: T | null;
  error: {
    code: string;
    message: string;
    data?: any;
  } | null;
}

export interface PageResponse<T> {
  content: T[];
  hasNext: boolean;
}

// User
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
  refreshTokenId: string;
  user: User;
}

export interface RefreshTokenRequest {
  refreshToken: string;
}

// Category
export interface Category {
  id: number;
  name: string;
  slug: string;
  createdAt: string;
}

// Post
export interface Post {
  id: number;
  userId: number;
  categoryId: number;
  title: string;
  content: string;
  contentHtml: string;
  thumbnailUrl: string | null;
  viewCount: number;
  status: "DRAFT" | "PUBLISHED";
  createdAt: string;
  updatedAt: string;
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

// Comment
export interface Comment {
  id: number;
  postId: number;
  githubId: string;
  githubUsername: string;
  githubAvatarUrl: string | null;
  parentId: number | null;
  content: string;
  contentHtml: string;
  createdAt: string;
  updatedAt: string;
  replies: Comment[];
}

export interface CreateCommentRequest {
  content: string;
  parentId?: number | null;
}

export interface UpdateCommentRequest {
  content: string;
}

// Image
export interface ImageUploadResponse {
  url: string;
  publicId: string;
  format: string;
  width: number;
  height: number;
}
