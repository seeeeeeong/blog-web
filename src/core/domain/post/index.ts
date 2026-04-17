export interface PostSummary {
  id: number;
  userId: number;
  categoryId: number;
  title: string;
  excerpt: string;
  thumbnailUrl: string | null;
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
