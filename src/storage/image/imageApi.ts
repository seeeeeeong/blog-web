import imageCompression from "browser-image-compression";
import apiClient from "../common/client";
import type { ImagePresignedUrlResponse } from "../../core/domain/image";
import { IMAGE_UPLOAD } from "../../core/support/constants";

export const imageApi = {
  getPresignedUrl: async (
    contentType: string,
    folder: string = "blog"
  ): Promise<ImagePresignedUrlResponse> => {
    const response = await apiClient.get<ImagePresignedUrlResponse>("/v1/images/presigned-url", {
      params: { contentType, folder },
    });
    return response.data;
  },

  upload: async (file: File): Promise<string> => {
    const options = {
      maxSizeMB: IMAGE_UPLOAD.MAX_SIZE_MB,
      maxWidthOrHeight: IMAGE_UPLOAD.MAX_WIDTH_OR_HEIGHT,
      useWebWorker: IMAGE_UPLOAD.USE_WEB_WORKER,
    };

    let compressedFile: File;
    try {
      compressedFile = await imageCompression(file, options);
    } catch {
      compressedFile = file;
    }

    const contentType = compressedFile.type || IMAGE_UPLOAD.FALLBACK_CONTENT_TYPE;
    const presigned = await imageApi.getPresignedUrl(contentType);

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
  },

  delete: async (key: string): Promise<boolean> => {
    await apiClient.delete("/v1/images", {
      params: { key },
    });
    return true;
  },
};
