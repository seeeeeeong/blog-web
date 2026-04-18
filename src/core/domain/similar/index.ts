export type SimilarStatus = "READY" | "PENDING" | "NOT_FOUND" | "DELETED";

export interface SimilarItem {
  id: number;
  title: string;
  url: string;
  company: string;
  score: number;
}

export interface SimilarResponse {
  status: SimilarStatus;
  items: SimilarItem[];
}
