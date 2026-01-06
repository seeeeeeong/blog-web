import apiClient from "./client";
import type { Category } from "../types";

export const categoryApi = {
  getCategories: async (): Promise<Category[]> => {
    const response = await apiClient.get("/v1/categories");
    return response.data;
  },
};
