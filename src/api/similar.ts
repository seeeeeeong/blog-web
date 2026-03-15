import axios from "axios";

const DEVLOG_ARCHIVE_URL = import.meta.env.VITE_DEVLOG_ARCHIVE_URL ?? "http://localhost:8082";

export interface SimilarArticle {
  articleId: number;
  title: string;
  company: string;
  url: string;
  summary: string | null;
  publishedAt: string | null;
  similarity: number;
}

export async function fetchSimilarArticles(
  title: string,
  content: string,
  topK = 5
): Promise<SimilarArticle[]> {
  const res = await axios.post<{ items: SimilarArticle[] }>(
    `${DEVLOG_ARCHIVE_URL}/api/v1/similar`,
    { title, content: content.slice(0, 2000), topK },
    { timeout: 5000 }
  );
  return res.data.items;
}
