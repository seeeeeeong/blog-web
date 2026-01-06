import apiClient from "./client";
import imageCompression from "browser-image-compression";
import type { ImageUploadResponse } from "../types";

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

// 업로드 서명 가져오기
interface UploadSignature {
  signature: string;
  timestamp: number;
  apiKey: string;
  cloudName: string;
}

export const getUploadSignature = async (folder: string = "blog"): Promise<UploadSignature> => {
  const response = await apiClient.get<UploadSignature>("/images/upload-signature", {
    params: { folder },
  });
  return response.data;
};

// Cloudinary 직접 업로드 (압축 포함)
export const uploadImageDirectly = async (file: File): Promise<string> => {
  // 이미지 압축
  const options = {
    maxSizeMB: 1,
    maxWidthOrHeight: 1920,
    useWebWorker: true,
  };

  let compressedFile: File;
  try {
    compressedFile = await imageCompression(file, options);
  } catch (error) {
    console.warn("Image compression failed, using original:", error);
    compressedFile = file;
  }

  // Presigned Upload
  const signatureData = await getUploadSignature();

  const formData = new FormData();
  formData.append("file", compressedFile);
  formData.append("signature", signatureData.signature);
  formData.append("timestamp", String(signatureData.timestamp));
  formData.append("api_key", signatureData.apiKey);
  formData.append("folder", "blog");

  const response = await fetch(
    `https://api.cloudinary.com/v1_1/${signatureData.cloudName}/image/upload`,
    {
      method: "POST",
      body: formData,
    }
  );

  if (!response.ok) {
    throw new Error("Image upload failed");
  }

  const result = await response.json();
  return result.secure_url;
};

// 이미지 삭제
export const deleteImage = async (publicId: string): Promise<boolean> => {
  const response = await apiClient.delete<{ deleted: boolean }>(`/images/${publicId}`);
  return response.data.deleted;
};
