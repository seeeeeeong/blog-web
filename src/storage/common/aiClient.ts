import axios from "axios";

const aiClient = axios.create({
  baseURL: import.meta.env.VITE_AI_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

type ApiEnvelope<T = unknown> = {
  result: "SUCCESS" | "ERROR";
  data?: T;
  error?: { code?: string; message?: string } | null;
};

aiClient.interceptors.response.use((response) => {
  if (response.data && typeof response.data === "object" && "result" in response.data) {
    const envelope = response.data as ApiEnvelope;
    if (envelope.result === "SUCCESS") {
      response.data = envelope.data ?? null;
    } else if (envelope.result === "ERROR") {
      return Promise.reject(new Error(envelope.error?.message ?? "AI request failed"));
    }
  }
  return response;
});

export default aiClient;
