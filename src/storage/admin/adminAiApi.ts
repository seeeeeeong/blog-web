import apiClient from "../common/client";

export interface BackfillStats {
  totalArticles: number;
  unembedded: number;
  withoutContent: number;
}

export const adminAiApi = {
  getStats: async (): Promise<BackfillStats> => {
    const response = await apiClient.get<BackfillStats>("/v1/admin/backfill/stats");
    return response.data;
  },

  backfillContent: async (batchSize = 50): Promise<number> => {
    const response = await apiClient.post<{ filled: number }>(
      `/v1/admin/backfill/content?batchSize=${batchSize}`,
    );
    return (response.data as { filled: number }).filled;
  },

  backfillEmbedding: async (): Promise<number> => {
    const response = await apiClient.post<{ processed: number }>(
      "/v1/admin/backfill/embedding",
    );
    return (response.data as { processed: number }).processed;
  },
};
