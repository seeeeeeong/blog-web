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

        const dispatch = (event: string): boolean => {
          const dataLines: string[] = [];
          for (const raw of event.split("\n")) {
            const line = raw.endsWith("\r") ? raw.slice(0, -1) : raw;
            if (!line.startsWith("data:")) continue;
            dataLines.push(line.slice(5));
          }
          if (dataLines.length === 0) return false;
          const data = dataLines.join("\n");
          if (data === "[DONE]") {
            handlers.onDone();
            close();
            return true;
          }
          handlers.onChunk(data);
          return false;
        };

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          buffer += decoder.decode(value, { stream: true });

          while (true) {
            const sep = buffer.indexOf("\n\n");
            if (sep === -1) break;
            const event = buffer.slice(0, sep);
            buffer = buffer.slice(sep + 2);
            if (dispatch(event)) return;
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
};
