export interface ApiResponse<T> {
  result: "SUCCESS" | "ERROR";
  data: T | null;
  error: {
    code: string;
    message: string;
    data?: unknown;
  } | null;
}

export interface PageResponse<T> {
  content: T[];
  hasNext: boolean;
}
