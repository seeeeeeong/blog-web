export interface SimilarArticle {
  articleId: number;
  title: string;
  company: string;
  url: string;
  summary: string | null;
  publishedAt: string | null;
  similarity: number;
}
