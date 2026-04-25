import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { marked } from "marked";
import { chatApi } from "../../../../storage/chat/chatApi";
import type { ChatMessage, ChatSource } from "../../../domain/chat";
import { CHAT_LIMITS } from "../../../support/constants";
import { Spinner } from "./Spinner";

const SESSION_STORAGE_KEY = "blog-ai:chatSessionId";

const SOURCE_REGEX = /\[([^\]]+)\s*-\s*([^\]]+)\]\((https?:\/\/[^)]+)\)/g;

function extractSources(text: string): ChatSource[] {
  const sources: ChatSource[] = [];
  const seen = new Set<string>();
  let match;
  while ((match = SOURCE_REGEX.exec(text)) !== null) {
    const url = match[3];
    if (seen.has(url)) continue;
    seen.add(url);
    sources.push({ company: match[1].trim(), title: match[2].trim(), url });
  }
  SOURCE_REGEX.lastIndex = 0;
  return sources;
}

function extractFollowUps(text: string): { cleaned: string; followUps: string[] } {
  const patterns = [
    /(?:관련\s*질문|추가\s*질문|더\s*알아보기)[:\s]*\n((?:\s*[-•*\d.]+\s*.+\n?)+)/gi,
    /(?:follow[- ]?up|related)[:\s]*\n((?:\s*[-•*\d.]+\s*.+\n?)+)/gi,
  ];

  for (const pattern of patterns) {
    const match = pattern.exec(text);
    if (match) {
      const items = match[1]
        .split("\n")
        .map((line) => line.replace(/^\s*[-•*\d.]+\s*/, "").trim())
        .filter((line) => line.length > 0);
      if (items.length > 0) {
        const cleaned = text.slice(0, match.index).trimEnd();
        return { cleaned, followUps: items.slice(0, 3) };
      }
    }
    pattern.lastIndex = 0;
  }

  return { cleaned: text, followUps: [] };
}

function renderMarkdown(text: string): string {
  return marked(text, { breaks: true, gfm: true }) as string;
}

function createId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

interface ChatPanelProps {
  variant?: "fixed" | "drawer";
  onClose?: () => void;
}

export function ChatPanel({ variant = "fixed", onClose }: ChatPanelProps) {
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [sessionError, setSessionError] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [streaming, setStreaming] = useState(false);
  const [remaining, setRemaining] = useState<number>(CHAT_LIMITS.MAX_MESSAGES_PER_SESSION);

  const bottomRef = useRef<HTMLDivElement>(null);
  const closeStreamRef = useRef<(() => void) | null>(null);
  const streamingIdRef = useRef<string | null>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const bootstrap = useCallback(async (force: boolean) => {
    try {
      setSessionError(null);
      if (!force) {
        const cached = sessionStorage.getItem(SESSION_STORAGE_KEY);
        if (cached) {
          setSessionId(cached);
          try {
            const restored = await chatApi.loadMessages(cached);
            if (restored.length > 0) setMessages(restored);
          } catch {
            /* session may have expired */
          }
          return;
        }
      }
      const session = await chatApi.createSession();
      sessionStorage.setItem(SESSION_STORAGE_KEY, session.sessionId);
      setSessionId(session.sessionId);
    } catch {
      setSessionError("Could not create a session. Please try again in a moment.");
    }
  }, []);

  useEffect(() => {
    void bootstrap(false);
  }, [bootstrap]);

  useEffect(() => {
    return () => {
      closeStreamRef.current?.();
    };
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messages]);

  const appendChunk = (id: string, chunk: string) => {
    setMessages((prev) =>
      prev.map((m) => (m.id === id ? { ...m, content: m.content + chunk } : m)),
    );
  };

  const finalizeStream = (id: string, opts: { error?: boolean }) => {
    setMessages((prev) =>
      prev.map((m) => {
        if (m.id !== id) return m;

        if (opts.error) {
          return {
            ...m,
            streaming: false,
            error: true,
            content: m.content || "Could not receive a response. Please try again.",
          };
        }

        const sources = extractSources(m.content);
        const { cleaned, followUps } = extractFollowUps(m.content);

        return {
          ...m,
          streaming: false,
          error: false,
          content: cleaned,
          sources: sources.length > 0 ? sources : undefined,
          followUps: followUps.length > 0 ? followUps : undefined,
        };
      }),
    );
    setStreaming(false);
    setRemaining((r) => Math.max(0, r - 1));
    streamingIdRef.current = null;
    closeStreamRef.current = null;
  };

  const stopStreaming = () => {
    closeStreamRef.current?.();
    if (streamingIdRef.current) {
      finalizeStream(streamingIdRef.current, {});
    }
  };

  const send = (text: string) => {
    if (!sessionId || streaming) return;
    const trimmed = text.trim();
    if (!trimmed) return;
    if (remaining <= 0) return;

    const userMsg: ChatMessage = { id: createId(), role: "user", content: trimmed };
    const assistantId = createId();
    const assistantMsg: ChatMessage = {
      id: assistantId,
      role: "assistant",
      content: "",
      streaming: true,
    };

    setMessages((prev) => [...prev, userMsg, assistantMsg]);
    setInput("");
    setStreaming(true);
    streamingIdRef.current = assistantId;

    closeStreamRef.current = chatApi.streamChat(sessionId, trimmed, {
      onChunk: (c) => appendChunk(assistantId, c),
      onDone: () => finalizeStream(assistantId, {}),
      onError: () => finalizeStream(assistantId, { error: true }),
    });
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey && !e.nativeEvent.isComposing) {
      e.preventDefault();
      send(input);
    }
  };

  const resetSession = async () => {
    closeStreamRef.current?.();
    setMessages([]);
    setStreaming(false);
    setRemaining(CHAT_LIMITS.MAX_MESSAGES_PER_SESSION);
    streamingIdRef.current = null;
    sessionStorage.removeItem(SESSION_STORAGE_KEY);
    setSessionId(null);
    await bootstrap(true);
    requestAnimationFrame(() => inputRef.current?.focus());
  };

  const charCount = input.length;
  const isEmpty = messages.length === 0;
  const sessionShort = useMemo(
    () => (sessionId ? sessionId.slice(0, 8) : "…"),
    [sessionId],
  );

  const containerClass =
    variant === "drawer"
      ? "animate-drawer-in fixed right-0 top-0 bottom-0 z-50 w-full sm:w-[380px] bg-[#111827] border-l border-[#273244] flex flex-col shadow-[0_0_40px_rgba(0,0,0,0.28)]"
      : "h-full flex flex-col bg-[#111827] border-l border-[#273244]";

  return (
    <aside className={containerClass} aria-label="Ask this blog">
      <header className="px-5 py-3.5 border-b border-[#273244] bg-[#0f1724] flex items-center justify-between gap-3">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-6 h-6 rounded-md bg-slate-50 text-slate-950 grid place-items-center font-meta text-[10px] font-semibold shrink-0">
            AI
          </div>
          <div className="min-w-0">
            <div className="text-[13.5px] font-semibold text-slate-50 leading-tight">Space assistant</div>
            <div className="font-meta text-[10.5px] text-slate-400 leading-tight truncate">
              rag · {sessionShort} · {remaining} left
            </div>
          </div>
        </div>
        <div className="flex items-center gap-1 shrink-0">
          <button
            onClick={resetSession}
            disabled={streaming}
            className="h-7 px-2 font-meta text-[10.5px] text-slate-400 hover:text-white hover:bg-white/[0.06] rounded-md transition-colors disabled:opacity-40"
            title="Clear session"
          >
            clear
          </button>
          {variant === "drawer" && onClose && (
            <button
              onClick={onClose}
              className="w-7 h-7 grid place-items-center text-slate-400 hover:text-white hover:bg-white/[0.06] rounded-md text-[18px] leading-none transition-colors"
              aria-label="Close"
            >
              ×
            </button>
          )}
        </div>
      </header>

      <div className="flex-1 overflow-y-auto px-4 py-4">
        {sessionError ? (
          <div className="py-12 text-center">
            <p className="text-red-300 text-[13px] mb-4">! {sessionError}</p>
            <button
              onClick={() => void bootstrap(true)}
              className="h-8 px-3 border border-[#273244] rounded-md font-meta text-[11px] text-slate-400 hover:border-[#6ab0ff] hover:text-[#6ab0ff] transition-colors"
            >
              retry
            </button>
          </div>
        ) : !sessionId ? (
          <div className="py-16 flex justify-center">
            <Spinner />
          </div>
        ) : isEmpty ? (
          <EmptyPrompts />
        ) : (
          <div className="space-y-4">
            {messages.map((m) => (
              <ChatMessageBlock
                key={m.id}
                message={m}
                onFollowUp={send}
              />
            ))}
            <div ref={bottomRef} />
          </div>
        )}
      </div>

      <footer className="border-t border-[#273244] px-3.5 py-3 bg-[#0f1724]">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            send(input);
          }}
        >
          <div
            className={`flex items-end gap-2 pl-3 pr-1.5 py-1.5 rounded-md bg-[#182231] border transition-colors ${
              streaming ? "border-[#6ab0ff]" : "border-[#273244] focus-within:border-[#6ab0ff]"
            }`}
          >
            <textarea
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value.slice(0, CHAT_LIMITS.QUESTION_MAX_LENGTH))}
              onKeyDown={handleKeyDown}
              disabled={streaming || remaining <= 0 || !sessionId}
              rows={1}
              placeholder={
                remaining <= 0
                  ? "Message limit reached"
                  : streaming
                    ? "Generating a response..."
                    : "Ask anything about this blog"
              }
              className="flex-1 bg-transparent outline-none resize-none text-[13.5px] text-slate-100 placeholder:text-slate-500 py-1.5 max-h-[140px]"
            />
            {streaming ? (
              <button
                type="button"
                onClick={stopStreaming}
                className="w-7 h-7 rounded-md bg-red-500 text-white grid place-items-center text-[11px] font-semibold hover:bg-red-400 transition-colors"
                title="Stop"
              >
                ■
              </button>
            ) : (
              <button
                type="submit"
                disabled={!input.trim() || remaining <= 0 || !sessionId}
                className="w-7 h-7 rounded-md bg-[#0a66c2] text-white grid place-items-center text-[12px] font-semibold hover:bg-[#1677d8] transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                title="Send"
              >
                ↑
              </button>
            )}
          </div>
          <div className="mt-2 flex items-center justify-between font-meta text-[10.5px] text-slate-500">
            <span>{streaming ? "● streaming…" : `${charCount} / ${CHAT_LIMITS.QUESTION_MAX_LENGTH}`}</span>
            <span>↵ send · ⇧↵ newline</span>
          </div>
        </form>
      </footer>
    </aside>
  );
}

function EmptyPrompts() {
  return (
    <div>
      <p className="text-[12.5px] text-slate-400 leading-relaxed">
        This assistant has learned from every post on this blog. It can summarize posts, explain concepts, and find related articles.
      </p>
    </div>
  );
}

function ChatMessageBlock({
  message,
  onFollowUp,
}: {
  message: ChatMessage;
  onFollowUp: (q: string) => void;
}) {
  if (message.role === "user") {
    return (
      <div className="flex justify-end">
        <div className="max-w-[92%] bg-[#0a66c2] text-white px-3 py-2 rounded-lg text-[13.5px] leading-[1.55] whitespace-pre-wrap break-words">
          {message.content}
        </div>
      </div>
    );
  }

  return (
    <div className="flex gap-2.5 items-start">
      <div className="w-6 h-6 rounded-md bg-slate-50 text-slate-950 grid place-items-center font-meta text-[10px] font-semibold shrink-0 mt-0.5">
        AI
      </div>
      <div className="min-w-0 flex-1">
        {message.content ? (
          <>
            <div className="bg-[#182231] border border-[#273244] rounded-lg px-3 py-2">
              <div
                className="chat-markdown chat-markdown-dark"
                dangerouslySetInnerHTML={{ __html: renderMarkdown(message.content) }}
              />
              {message.streaming && (
                <p className="font-meta text-[10.5px] text-slate-500 mt-1.5">● streaming…</p>
              )}
              {message.error && (
                <p className="font-meta text-[10.5px] text-red-300 mt-1.5">! error</p>
              )}
              {message.sources && message.sources.length > 0 && (
                <ChatSources sources={message.sources} />
              )}
            </div>
            {message.followUps && message.followUps.length > 0 && (
              <ChatFollowUps followUps={message.followUps} onSelect={onFollowUp} />
            )}
          </>
        ) : (
          <p className="font-meta text-[11px] text-slate-500 py-1">◦ thinking…</p>
        )}
      </div>
    </div>
  );
}

function ChatSources({ sources }: { sources: ChatSource[] }) {
  return (
    <div className="mt-2.5 pt-2.5 border-t border-[#273244]">
      <p className="font-meta text-[10px] text-slate-500 uppercase tracking-[0.08em] font-semibold mb-1.5">
        Sources
      </p>
      <ul className="space-y-1">
        {sources.map((source, i) => (
          <li key={source.url}>
            <a
              href={source.url}
              target="_blank"
              rel="noopener noreferrer"
              className="block text-[12.5px] text-slate-200 hover:text-[#6ab0ff] transition-colors leading-snug"
            >
              <span className="font-meta text-[10px] text-[#6ab0ff] mr-1.5">[{i + 1}]</span>
              <span className="font-meta text-[10px] text-slate-500 mr-1.5 uppercase tracking-[0.04em]">
                {source.company}
              </span>
              {source.title}
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}

function ChatFollowUps({
  followUps,
  onSelect,
}: {
  followUps: string[];
  onSelect: (q: string) => void;
}) {
  return (
    <div className="mt-2 flex flex-col gap-1.5">
      {followUps.map((q) => (
        <button
          key={q}
          onClick={() => onSelect(q)}
          className="text-left text-[12.5px] px-3 py-1.5 rounded-md border border-[#273244] bg-[#182231] hover:border-[#6ab0ff] hover:text-[#6ab0ff] text-slate-200 transition-colors flex items-center justify-between gap-3"
        >
          <span>{q}</span>
          <span className="font-meta text-slate-500">→</span>
        </button>
      ))}
    </div>
  );
}
