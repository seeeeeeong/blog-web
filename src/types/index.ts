// API Response
export interface ApiResponse<T> {
  success: boolean;
  data: T | null;
  message?: string;
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

export interface SignupRequest {
  email: string;
  password: string;
  nickname: string;
}

export interface TokenResponse {
  accessToken: string;
  refreshToken: string;
  user: User;
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
  thumbnailUrl: string | null;
  viewCount: number;
  status: "DRAFT" | "PUBLISHED";  
  createdAt: string;
  updatedAt: string;
}

export interface PostListResponse {
  posts: Post[];
  totalPages: number;
  totalElements: number;
  currentPage: number;
  pageSize: number;
}

export interface CreatePostRequest {
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
  createdAt: string;
  updatedAt: string;
  replies: Comment[];
}

export interface CreateCommentRequest {
  content: string;
  parentId?: number | null;
}
