import aiClient from "../common/aiClient";

export interface BackfillStats {
  totalArticles: number;
  unembedded: number;
  withoutContent: number;
}

export const adminAiApi = {
  getStats: async (adminKey: string): Promise<BackfillStats> => {
    const response = await aiClient.get<BackfillStats>("/v1/admin/stats", {
      headers: { "X-Admin-Key": adminKey },
    });
    return response.data;
  },

  backfillContent: async (adminKey: string, batchSize = 50): Promise<number> => {
    const response = await aiClient.post<number>(
      `/v1/admin/backfill/content?batchSize=${batchSize}`,
      null,
      { headers: { "X-Admin-Key": adminKey } },
    );
    return response.data;
  },

  backfillEmbedding: async (adminKey: string): Promise<number> => {
    const response = await aiClient.post<number>(
      "/v1/admin/backfill/embedding",
      null,
      { headers: { "X-Admin-Key": adminKey } },
    );
    return response.data;
  },
};
