export interface ImagePresignedUrlResponse {
  uploadUrl: string;
  fileUrl: string;
  key: string;
  expiresInSeconds: number;
}
