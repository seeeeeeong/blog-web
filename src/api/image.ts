import apiClient from "./client";

export const uploadImage = async (file: File): Promise<string> => {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("folder", "blog");

  const response = await apiClient.post<{ url: string }>("/images/upload", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });

  return response.data.url;
};
