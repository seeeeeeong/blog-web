import aiClient from "../common/aiClient";
import type { ChatMessage, ChatSession } from "../../core/domain/chat";

export interface ChatStreamHandlers {
  onChunk: (text: string) => void;
  onDone: () => void;
  onError: (err: Error) => void;
}

interface ChatMessageResponse {
  role: string;
  content: string;
}

export const chatApi = {
  createSession: async (): Promise<ChatSession> => {
    const response = await aiClient.get<ChatSession>("/v1/chat/session");
    return response.data;
  },

  loadMessages: async (sessionId: string): Promise<ChatMessage[]> => {
    const response = await aiClient.get<ChatMessageResponse[]>(
      `/v1/chat/messages?sessionId=${encodeURIComponent(sessionId)}`,
    );
    const messages = response.data as ChatMessageResponse[];
    return messages.map((m, i) => ({
      id: `restored-${i}`,
      role: m.role as "user" | "assistant",
      content: m.content,
    }));
  },

  streamChat: (
    sessionId: string,
    question: string,
    handlers: ChatStreamHandlers,
  ): (() => void) => {
    const base = import.meta.env.VITE_AI_BASE_URL;
    const url = `${base}/v1/chat/stream`;

    const controller = new AbortController();
    let closed = false;

    const close = () => {
      if (closed) return;
      closed = true;
      controller.abort();
    };

    (async () => {
      try {
        const response = await fetch(url, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ sessionId, question }),
          signal: controller.signal,
        });

        if (!response.ok || !response.body) {
          throw new Error(`HTTP ${response.status}`);
        }

        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let buffer = "";

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split("\n");
          buffer = lines.pop() ?? "";

          for (const line of lines) {
            if (!line.startsWith("data:")) continue;
            const data = line.slice(5);
            if (data === "[DONE]") {
              handlers.onDone();
              close();
              return;
            }
            handlers.onChunk(data);
          }
        }

        if (!closed) handlers.onDone();
      } catch (err) {
        if (closed) return;
        handlers.onError(err instanceof Error ? err : new Error("Chat stream failed"));
      } finally {
        close();
      }
    })();

    return close;
  },

  submitFeedback: async (
    sessionId: string,
    messageId: string,
    rating: "up" | "down",
  ): Promise<void> => {
    await aiClient.post(
      `/v1/chat/${encodeURIComponent(sessionId)}/feedback?messageId=${encodeURIComponent(messageId)}&rating=${rating}`,
    );
  },
};
