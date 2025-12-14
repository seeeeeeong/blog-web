import apiClient from "./client";
import imageCompression from "browser-image-compression";

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

interface UploadSignature {
  signature: string;
  timestamp: number;
  apiKey: string;
  cloudName: string;
}

export const getUploadSignature = async (): Promise<UploadSignature> => {
  const response = await apiClient.get<UploadSignature>("/images/upload-signature");
  return response.data;
};

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
    console.warn("이미지 압축 실패, 원본 사용:", error);
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
