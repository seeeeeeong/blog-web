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
