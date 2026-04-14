import imageCompression from "browser-image-compression";
import apiClient from "./client";
import type { ImagePresignedUrlResponse } from "../types";

export const getPresignedUrl = async (
  contentType: string,
  folder: string = "blog"
): Promise<ImagePresignedUrlResponse> => {
  const response = await apiClient.get<ImagePresignedUrlResponse>("/images/presigned-url", {
    params: { contentType, folder },
  });
  return response.data;
};

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

export const deleteImage = async (key: string): Promise<boolean> => {
  await apiClient.delete("/images", {
    params: { key },
  });
  return true;
};
