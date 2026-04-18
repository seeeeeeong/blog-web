import aiClient from "../common/aiClient";
import type { SimilarResponse } from "../../core/domain/similar";

export const similarApi = {
  getSimilar: async (postId: number, limit: number = 5): Promise<SimilarResponse> => {
    const response = await aiClient.get<SimilarResponse>("/v1/similar", {
      params: { postId: String(postId), limit },
    });
    return response.data;
  },
};
