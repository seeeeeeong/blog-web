import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { marked } from "marked";
import { chatApi } from "../../../../storage/chat/chatApi";
import type { ChatMessage, ChatSource } from "../../../domain/chat";
import { CHAT_LIMITS } from "../../../support/constants";
import { Spinner } from "./Spinner";

const SESSION_STORAGE_KEY = "blog-ai:chatSessionId";

const SAMPLE_PROMPTS = [
  "Spring AI로 RAG 시스템 만드는 방법이 뭐야?",
  "쿠팡은 실시간 DB 스트리밍을 어떻게 처리해?",
  "pgvector HNSW 인덱스 튜닝 팁 알려줘",
];

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

interface ChatDrawerProps {
  open: boolean;
  onClose: () => void;
}

export function ChatDrawer({ open, onClose }: ChatDrawerProps) {
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [sessionError, setSessionError] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [streaming, setStreaming] = useState(false);
  const [remaining, setRemaining] = useState<number>(CHAT_LIMITS.MAX_MESSAGES_PER_SESSION);
  const [booted, setBooted] = useState(false);

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
      setSessionError("세션을 생성하지 못했습니다. 잠시 후 다시 시도해주세요.");
    }
  }, []);

  useEffect(() => {
    if (open && !booted) {
      void bootstrap(false);
      setBooted(true);
    }
  }, [open, booted, bootstrap]);

  useEffect(() => {
    return () => {
      closeStreamRef.current?.();
    };
  }, []);

  useEffect(() => {
    if (open) {
      bottomRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
    }
  }, [messages, open]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && open) onClose();
    };
    if (open) window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

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
            content: m.content || "응답을 받지 못했습니다. 다시 시도해주세요.",
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

  const handleFeedback = (messageId: string, rating: "up" | "down") => {
    if (!sessionId) return;
    setMessages((prev) =>
      prev.map((m) => (m.id === messageId ? { ...m, feedback: rating } : m)),
    );
    chatApi.submitFeedback(sessionId, messageId, rating).catch(() => {});
  };

  const charCount = input.length;
  const isEmpty = messages.length === 0;
  const sessionShort = useMemo(
    () => (sessionId ? sessionId.slice(0, 8) : "…"),
    [sessionId],
  );

  if (!open) return null;

  return (
    <>
      <div
        onClick={onClose}
        className="fixed inset-0 z-40 bg-ink/20 backdrop-blur-[1px] lg:hidden"
        aria-hidden
      />
      <aside
        className="animate-drawer-in fixed right-0 top-0 bottom-0 z-50 w-full sm:w-[420px] lg:w-[440px] bg-paper border-l border-rule flex flex-col shadow-[0_0_40px_rgba(0,0,0,0.25)]"
        aria-label="Chat drawer"
      >
        <header className="px-5 py-5 border-b border-rule flex items-center justify-between">
          <div>
            <p className="eyebrow mb-1">Correspondence</p>
            <h2 className="font-display text-[22px] font-medium tracking-[-0.02em] text-ink leading-none">
              Ask the Room
            </h2>
            <p className="font-meta text-[10px] text-faint mt-1.5 tracking-[0.08em]">
              session · {sessionShort} · {remaining} left
            </p>
          </div>
          <div className="flex items-center gap-1.5">
            <button
              onClick={resetSession}
              disabled={streaming}
              className="h-7 px-2.5 border border-rule rounded-sm font-meta text-[10px] text-muted hover:border-ink hover:text-ink transition-colors lowercase tracking-[0.08em] disabled:opacity-40"
              title="Clear"
            >
              :clear
            </button>
            <button
              onClick={onClose}
              className="w-7 h-7 border border-rule rounded-sm text-muted hover:border-ink hover:text-ink flex items-center justify-center text-[16px] leading-none transition-colors"
              aria-label="Close"
            >
              ×
            </button>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto px-5 py-5">
          {sessionError ? (
            <div className="py-12 text-center">
              <p className="text-danger text-[13px] mb-4">! {sessionError}</p>
              <button
                onClick={() => void bootstrap(true)}
                className="h-8 px-3 border border-rule rounded-sm font-meta text-[11px] text-muted hover:border-ink hover:text-ink transition-colors"
              >
                :retry
              </button>
            </div>
          ) : !sessionId ? (
            <div className="py-16 flex justify-center">
              <Spinner />
            </div>
          ) : isEmpty ? (
            <div>
              <p className="eyebrow mb-4">Try a question</p>
              <ul className="space-y-2.5">
                {SAMPLE_PROMPTS.map((p) => (
                  <li key={p}>
                    <button
                      onClick={() => send(p)}
                      className="w-full text-left text-[14.5px] text-ink-soft hover:text-accent transition-colors leading-snug font-body"
                    >
                      <span className="text-accent mr-1.5">›</span>
                      {p}
                    </button>
                  </li>
                ))}
              </ul>
              <p className="mt-10 text-[13px] text-muted italic leading-relaxed font-body">
                A small correspondence desk. Ask about the essays or the engineering,
                and the room will answer in kind.
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              {messages.map((m) => (
                <ChatMessageBlock
                  key={m.id}
                  message={m}
                  onFeedback={handleFeedback}
                  onFollowUp={send}
                />
              ))}
              <div ref={bottomRef} />
            </div>
          )}
        </div>

        <footer className="border-t border-rule px-5 py-4 bg-paper-2/40">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              send(input);
            }}
            className="space-y-2"
          >
            <textarea
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value.slice(0, CHAT_LIMITS.QUESTION_MAX_LENGTH))}
              onKeyDown={handleKeyDown}
              disabled={streaming || remaining <= 0 || !sessionId}
              rows={2}
              placeholder={
                remaining <= 0
                  ? "메시지 한도에 도달했습니다. 세션을 초기화해주세요."
                  : streaming
                    ? "응답 생성 중…"
                    : "질문을 입력하세요 (Enter=전송)"
              }
              className="w-full bg-paper border border-rule focus:border-ink rounded-sm px-3 py-2 text-[14px] text-ink placeholder:text-faint outline-none resize-none font-body transition-colors"
            />
            <div className="flex items-center justify-between">
              <span className="font-meta text-[10px] text-faint tracking-[0.08em]">
                {streaming ? "● streaming…" : `${charCount} / ${CHAT_LIMITS.QUESTION_MAX_LENGTH}`}
              </span>
              {streaming ? (
                <button
                  type="button"
                  onClick={stopStreaming}
                  className="h-8 px-3 border border-danger text-danger rounded-sm font-meta text-[11px] hover:bg-danger hover:text-paper transition-colors lowercase tracking-[0.08em]"
                >
                  :stop
                </button>
              ) : (
                <button
                  type="submit"
                  disabled={!input.trim() || remaining <= 0 || !sessionId}
                  className="h-8 px-3 border border-ink bg-ink text-paper rounded-sm font-meta text-[11px] hover:bg-accent hover:border-accent transition-colors lowercase tracking-[0.08em] disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  :send
                </button>
              )}
            </div>
          </form>
        </footer>
      </aside>
    </>
  );
}

function ChatMessageBlock({
  message,
  onFeedback,
  onFollowUp,
}: {
  message: ChatMessage;
  onFeedback: (id: string, rating: "up" | "down") => void;
  onFollowUp: (q: string) => void;
}) {
  if (message.role === "user") {
    return (
      <div>
        <p className="eyebrow mb-1.5 text-[9px]">You</p>
        <div className="font-body text-[15px] leading-[1.65] text-ink whitespace-pre-wrap break-words pl-3 border-l border-rule">
          {message.content}
        </div>
      </div>
    );
  }

  return (
    <div>
      <p className="eyebrow mb-2 text-[9px]">
        <span className="text-accent">The Room</span>
        {message.streaming && <span className="ml-2 text-faint normal-case tracking-normal">· streaming…</span>}
        {message.error && <span className="ml-2 text-danger normal-case tracking-normal">· error</span>}
      </p>
      {message.content ? (
        <>
          <div
            className="chat-markdown text-ink font-body"
            dangerouslySetInnerHTML={{ __html: renderMarkdown(message.content) }}
          />
          {message.sources && message.sources.length > 0 && (
            <ChatSources sources={message.sources} />
          )}
          {!message.streaming && !message.error && (
            <ChatFeedback
              messageId={message.id}
              current={message.feedback}
              onFeedback={onFeedback}
            />
          )}
          {message.followUps && message.followUps.length > 0 && (
            <ChatFollowUps followUps={message.followUps} onSelect={onFollowUp} />
          )}
        </>
      ) : (
        <p className="font-meta text-[11px] text-faint">◦ thinking…</p>
      )}
    </div>
  );
}

function ChatSources({ sources }: { sources: ChatSource[] }) {
  return (
    <div className="mt-3 pt-3 border-t border-rule-soft">
      <p className="eyebrow mb-2 text-[9px]">Sources</p>
      <ul className="space-y-1.5">
        {sources.map((source, i) => (
          <li key={source.url}>
            <a
              href={source.url}
              target="_blank"
              rel="noopener noreferrer"
              className="block text-[12.5px] text-ink-soft hover:text-accent transition-colors leading-snug"
            >
              <span className="font-meta text-[10px] text-accent mr-1.5">[{i + 1}]</span>
              <span className="font-meta text-[10px] text-muted mr-1.5 uppercase tracking-[0.06em]">{source.company}</span>
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
    <div className="mt-3 pt-3 border-t border-rule-soft">
      <p className="eyebrow mb-2 text-[9px]">Related</p>
      <div className="flex flex-col gap-1.5">
        {followUps.map((q) => (
          <button
            key={q}
            onClick={() => onSelect(q)}
            className="text-left text-[13px] text-ink-soft hover:text-accent transition-colors leading-snug"
          >
            <span className="text-accent mr-1.5">›</span>
            {q}
          </button>
        ))}
      </div>
    </div>
  );
}

function ChatFeedback({
  messageId,
  current,
  onFeedback,
}: {
  messageId: string;
  current?: "up" | "down";
  onFeedback: (id: string, rating: "up" | "down") => void;
}) {
  return (
    <div className="mt-3 flex items-center gap-2">
      <button
        onClick={() => onFeedback(messageId, "up")}
        disabled={current !== undefined}
        className={`font-meta text-[10px] px-2 py-0.5 border rounded-sm transition-colors tracking-[0.08em] ${
          current === "up"
            ? "border-accent text-accent"
            : "border-rule text-muted hover:border-ink hover:text-ink"
        }`}
      >
        +1
      </button>
      <button
        onClick={() => onFeedback(messageId, "down")}
        disabled={current !== undefined}
        className={`font-meta text-[10px] px-2 py-0.5 border rounded-sm transition-colors tracking-[0.08em] ${
          current === "down"
            ? "border-danger text-danger"
            : "border-rule text-muted hover:border-danger hover:text-danger"
        }`}
      >
        −1
      </button>
    </div>
  );
}
