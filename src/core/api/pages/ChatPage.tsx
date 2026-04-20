import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { marked } from "marked";
import { chatApi } from "../../../storage/chat/chatApi";
import type { ChatMessage, ChatSource } from "../../domain/chat";
import { CHAT_LIMITS } from "../../support/constants";
import { Spinner } from "../components/common/Spinner";

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

export function ChatPage() {
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
      setSessionError("세션을 생성하지 못했습니다. 잠시 후 다시 시도해주세요.");
    }
  }, []);

  useEffect(() => {
    void bootstrap(false);
    return () => {
      closeStreamRef.current?.();
    };
  }, [bootstrap]);

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

  return (
    <div className="max-w-[900px] mx-auto px-6 md:px-8 py-8 animate-fade-in">
      <section className="border-b border-dashed border-border-mid pb-4 mb-6 flex items-baseline justify-between gap-4">
        <div>
          <h1 className="text-[15px] text-cat-amber">
            <span className="text-muted">$ </span>chat --rag --stream
          </h1>
          <p className="text-[12px] text-faint mt-1">
            <span className="prompt-muted">//</span> Korean tech blog RAG assistant ·
            session <span className="text-muted">{sessionShort}</span>
            <span className="ml-2 text-faint">({remaining} left)</span>
          </p>
        </div>
        <button
          onClick={resetSession}
          disabled={streaming}
          className="h-7 px-2.5 border border-border-dim hover:border-cat-pink hover:text-cat-pink text-[11px] text-muted transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          title="Clear session"
        >
          :clear
        </button>
      </section>

      {sessionError ? (
        <div className="py-16 text-center">
          <p className="text-danger text-[13px] mb-4">
            <span className="prompt-pink">!</span> {sessionError}
          </p>
          <button
            onClick={() => void bootstrap(true)}
            className="h-8 px-3 border border-border-mid text-[12px] text-muted hover:text-cat-green hover:border-cat-green transition-colors"
          >
            :retry
          </button>
        </div>
      ) : !sessionId ? (
        <div className="py-16 flex justify-center">
          <Spinner />
        </div>
      ) : (
        <>
          <section className="space-y-8 mb-6 min-h-[40vh]">
            {isEmpty ? (
              <div className="py-10">
                <p className="text-[12px] text-faint mb-4">
                  <span className="prompt-green">▸</span> try asking…
                </p>
                <ul className="space-y-2">
                  {SAMPLE_PROMPTS.map((p) => (
                    <li key={p}>
                      <button
                        onClick={() => send(p)}
                        className="text-left text-[14px] text-muted hover:text-cat-green transition-colors"
                      >
                        <span className="prompt-amber mr-1.5">❯</span>
                        {p}
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            ) : (
              messages.map((m) => (
                <MessageBlock
                  key={m.id}
                  message={m}
                  onFeedback={handleFeedback}
                  onFollowUp={send}
                />
              ))
            )}
            <div ref={bottomRef} />
          </section>

          <section className="border-t border-dashed border-border-mid pt-4 sticky bottom-4 bg-bg">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                send(input);
              }}
              className="flex items-start gap-2"
            >
              <span className="prompt-green text-[13px] pt-2">❯</span>
              <textarea
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value.slice(0, CHAT_LIMITS.QUESTION_MAX_LENGTH))}
                onKeyDown={handleKeyDown}
                disabled={streaming || remaining <= 0}
                rows={2}
                placeholder={
                  remaining <= 0
                    ? "메시지 한도에 도달했습니다. 세션을 초기화해주세요."
                    : streaming
                      ? "응답 생성 중…"
                      : "질문을 입력하세요 (Enter=전송, Shift+Enter=줄바꿈)"
                }
                className="flex-1 bg-bg-2 border border-border-dim focus:border-cat-green outline-none px-3 py-2 text-[13px] text-ink placeholder:text-faint resize-none font-mono"
              />
              {streaming ? (
                <button
                  type="button"
                  onClick={stopStreaming}
                  className="h-10 px-3 border border-cat-pink text-cat-pink text-[12px] hover:bg-cat-pink hover:text-bg transition-colors"
                >
                  :stop
                </button>
              ) : (
                <button
                  type="submit"
                  disabled={!input.trim() || remaining <= 0}
                  className="h-10 px-3 border border-cat-green text-cat-green text-[12px] hover:bg-cat-green hover:text-bg transition-colors disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-transparent disabled:hover:text-cat-green"
                >
                  :send
                </button>
              )}
            </form>
            <div className="flex items-center justify-between mt-1.5 text-[11px] text-faint">
              <span>
                {streaming ? (
                  <>
                    <span className="prompt-amber">●</span> streaming…
                  </>
                ) : (
                  <span>&nbsp;</span>
                )}
              </span>
              <span>
                {charCount} / {CHAT_LIMITS.QUESTION_MAX_LENGTH}
              </span>
            </div>
          </section>
        </>
      )}
    </div>
  );
}

function SourceCards({ sources }: { sources: ChatSource[] }) {
  return (
    <div className="mt-3 flex flex-wrap gap-2">
      {sources.map((source, i) => (
        <a
          key={source.url}
          href={source.url}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 px-2.5 py-1.5 border border-border-dim hover:border-cat-green text-[11px] text-muted hover:text-cat-green transition-colors"
        >
          <span className="text-cat-amber">[{i + 1}]</span>
          <span className="truncate max-w-[200px]">{source.company}</span>
          <span className="text-faint">·</span>
          <span className="truncate max-w-[200px]">{source.title}</span>
        </a>
      ))}
    </div>
  );
}

function FollowUpChips({
  followUps,
  onSelect,
}: {
  followUps: string[];
  onSelect: (q: string) => void;
}) {
  return (
    <div className="mt-3 space-y-1.5">
      <p className="text-[11px] text-faint">
        <span className="prompt-green">▸</span> related
      </p>
      <div className="flex flex-wrap gap-1.5">
        {followUps.map((q) => (
          <button
            key={q}
            onClick={() => onSelect(q)}
            className="px-2.5 py-1 border border-border-dim hover:border-cat-green text-[12px] text-muted hover:text-cat-green transition-colors text-left"
          >
            {q}
          </button>
        ))}
      </div>
    </div>
  );
}

function FeedbackButtons({
  messageId,
  current,
  onFeedback,
}: {
  messageId: string;
  current?: "up" | "down";
  onFeedback: (id: string, rating: "up" | "down") => void;
}) {
  return (
    <div className="mt-2 flex items-center gap-2">
      <button
        onClick={() => onFeedback(messageId, "up")}
        className={`text-[12px] px-1.5 py-0.5 border transition-colors ${
          current === "up"
            ? "border-cat-green text-cat-green"
            : "border-border-dim text-faint hover:text-cat-green hover:border-cat-green"
        }`}
        disabled={current !== undefined}
      >
        +1
      </button>
      <button
        onClick={() => onFeedback(messageId, "down")}
        className={`text-[12px] px-1.5 py-0.5 border transition-colors ${
          current === "down"
            ? "border-cat-pink text-cat-pink"
            : "border-border-dim text-faint hover:text-cat-pink hover:border-cat-pink"
        }`}
        disabled={current !== undefined}
      >
        -1
      </button>
    </div>
  );
}

function MessageBlock({
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
      <div className="pl-1">
        <p className="text-[11px] text-muted mb-1.5">
          <span className="prompt-blue">user</span>
          <span className="prompt-muted">@journal</span>
        </p>
        <div className="text-[15px] leading-[1.7] text-ink-bright whitespace-pre-wrap break-words">
          <span className="prompt-green mr-2">❯</span>
          {message.content}
        </div>
      </div>
    );
  }

  return (
    <div className="pl-1">
      <p className="text-[11px] text-muted mb-2">
        <span className="prompt-amber">assistant</span>
        <span className="prompt-muted">@rag</span>
        {message.streaming && <span className="ml-2 text-faint">streaming…</span>}
        {message.error && <span className="ml-2 text-danger">error</span>}
      </p>
      <div className="border-l-2 border-cat-green/40 pl-5">
        {message.content ? (
          <>
            <div
              className="markdown-viewer chat-markdown text-[15px] leading-[1.75] text-ink-bright"
              dangerouslySetInnerHTML={{ __html: renderMarkdown(message.content) }}
            />
            {message.sources && message.sources.length > 0 && (
              <SourceCards sources={message.sources} />
            )}
            {!message.streaming && !message.error && (
              <FeedbackButtons
                messageId={message.id}
                current={message.feedback}
                onFeedback={onFeedback}
              />
            )}
            {message.followUps && message.followUps.length > 0 && (
              <FollowUpChips followUps={message.followUps} onSelect={onFollowUp} />
            )}
          </>
        ) : (
          <p className="text-[13px] text-faint">
            <span className="prompt-green">▸</span> thinking…
          </p>
        )}
      </div>
    </div>
  );
}
