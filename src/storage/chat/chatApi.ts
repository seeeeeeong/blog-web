import aiClient from "../common/aiClient";
import type { ChatSession } from "../../core/domain/chat";

export interface ChatStreamHandlers {
  onChunk: (text: string) => void;
  onDone: () => void;
  onError: (err: Error) => void;
}

export const chatApi = {
  createSession: async (): Promise<ChatSession> => {
    const response = await aiClient.get<ChatSession>("/v1/chat/session");
    return response.data;
  },

  streamChat: (
    sessionId: string,
    question: string,
    handlers: ChatStreamHandlers,
  ): (() => void) => {
    const base = import.meta.env.VITE_AI_BASE_URL;
    const url =
      `${base}/v1/chat/stream` +
      `?question=${encodeURIComponent(question)}` +
      `&sessionId=${encodeURIComponent(sessionId)}`;

    const source = new EventSource(url);
    let closed = false;

    const close = () => {
      if (closed) return;
      closed = true;
      source.close();
    };

    source.onmessage = (evt) => {
      if (evt.data === "[DONE]") {
        handlers.onDone();
        close();
        return;
      }
      handlers.onChunk(evt.data);
    };

    source.onerror = () => {
      if (closed) return;
      handlers.onError(new Error("Chat stream failed"));
      close();
    };

    return close;
  },
};
