export interface Comment {
  id: number;
  nickname: string;
  content: string;
  contentHtml: string;
  createdAt: string;
}

export interface CommentCreateRequest {
  content: string;
}
