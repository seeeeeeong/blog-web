import apiClient from "../common/client";
import type { Category } from "../../core/domain/category";

export const categoryApi = {
  getCategories: async (): Promise<Category[]> => {
    const response = await apiClient.get("/v1/categories");
    return response.data;
  },
};
