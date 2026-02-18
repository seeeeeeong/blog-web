import apiClient from "./client";
import imageCompression from "browser-image-compression";
import type { ImageUploadResponse, ImagePresignedUrlResponse } from "../types";

// 서버를 통한 이미지 업로드
export const uploadImage = async (file: File): Promise<ImageUploadResponse> => {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("folder", "blog");

  const response = await apiClient.post<ImageUploadResponse>("/images/upload", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });

  return response.data;
};

// S3 Presigned URL 가져오기
export const getPresignedUrl = async (
  contentType: string,
  folder: string = "blog"
): Promise<ImagePresignedUrlResponse> => {
  const response = await apiClient.get<ImagePresignedUrlResponse>("/images/presigned-url", {
    params: { contentType, folder },
  });
  return response.data;
};

// S3 Presigned URL로 직접 업로드 (압축 포함)
export const uploadImageDirectly = async (file: File): Promise<string> => {
  const options = {
    maxSizeMB: 1,
    maxWidthOrHeight: 1920,
    useWebWorker: true,
  };

  let compressedFile: File;
  try {
    compressedFile = await imageCompression(file, options);
  } catch {
    compressedFile = file;
  }

  const contentType = compressedFile.type || "image/png";
  const presigned = await getPresignedUrl(contentType);

  const response = await fetch(presigned.uploadUrl, {
    method: "PUT",
    headers: {
      "Content-Type": contentType,
    },
    body: compressedFile,
  });

  if (!response.ok) {
    throw new Error("Image upload failed");
  }

  return presigned.fileUrl;
};

// 이미지 삭제
export const deleteImage = async (key: string): Promise<boolean> => {
  const response = await apiClient.delete<{ deleted: boolean }>(`/images/${encodeURIComponent(key)}`);
  return response.data.deleted;
};
