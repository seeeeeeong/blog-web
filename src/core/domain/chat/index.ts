export type ChatRole = "user" | "assistant";

export interface ChatMessage {
  id: string;
  role: ChatRole;
  content: string;
  streaming?: boolean;
  error?: boolean;
  sources?: ChatSource[];
  followUps?: string[];
}

export interface ChatSession {
  sessionId: string;
}

export interface ChatSource {
  company: string;
  title: string;
  url: string;
}
