import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { marked } from "marked";
import { chatApi } from "../../../storage/chat/chatApi";
import type { ChatMessage } from "../../domain/chat";
import { CHAT_LIMITS } from "../../support/constants";
import { Spinner } from "../components/common/Spinner";

const SESSION_STORAGE_KEY = "blog-ai:chatSessionId";

const SAMPLE_PROMPTS = [
  "Spring AI로 RAG 시스템 만드는 방법이 뭐야?",
  "쿠팡은 실시간 DB 스트리밍을 어떻게 처리해?",
  "pgvector HNSW 인덱스 튜닝 팁 알려줘",
];

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
      prev.map((m) =>
        m.id === id
          ? {
              ...m,
              streaming: false,
              error: opts.error ?? false,
              content:
                opts.error && !m.content
                  ? "응답을 받지 못했습니다. 다시 시도해주세요."
                  : m.content,
            }
          : m,
      ),
    );
    setStreaming(false);
    streamingIdRef.current = null;
    closeStreamRef.current = null;
  };

  const send = (text: string) => {
    if (!sessionId || streaming) return;
    const trimmed = text.trim();
    if (!trimmed) return;

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
          <section className="space-y-5 mb-6 min-h-[40vh]">
            {isEmpty ? (
              <div className="py-10">
                <p className="text-[12px] text-faint mb-4">
                  <span className="prompt-green">▸</span> try asking…
                </p>
                <ul className="space-y-1.5">
                  {SAMPLE_PROMPTS.map((p) => (
                    <li key={p}>
                      <button
                        onClick={() => send(p)}
                        className="text-left text-[13px] text-muted hover:text-cat-green transition-colors"
                      >
                        <span className="prompt-amber mr-1.5">❯</span>
                        {p}
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            ) : (
              messages.map((m) => <MessageBlock key={m.id} message={m} />)
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
                disabled={streaming}
                rows={2}
                placeholder={streaming ? "응답 생성 중…" : "질문을 입력하세요 (Enter=전송, Shift+Enter=줄바꿈)"}
                className="flex-1 bg-bg-2 border border-border-dim focus:border-cat-green outline-none px-3 py-2 text-[13px] text-ink placeholder:text-faint resize-none font-mono"
              />
              <button
                type="submit"
                disabled={streaming || !input.trim()}
                className="h-10 px-3 border border-cat-green text-cat-green text-[12px] hover:bg-cat-green hover:text-bg transition-colors disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-transparent disabled:hover:text-cat-green"
              >
                :send
              </button>
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

function MessageBlock({ message }: { message: ChatMessage }) {
  if (message.role === "user") {
    return (
      <div className="pl-1">
        <p className="text-[11px] text-muted mb-1">
          <span className="prompt-blue">user</span>
          <span className="prompt-muted">@journal</span>
        </p>
        <div className="text-[13px] text-ink whitespace-pre-wrap break-words">
          <span className="prompt-green mr-2">❯</span>
          {message.content}
        </div>
      </div>
    );
  }

  return (
    <div className="pl-1">
      <p className="text-[11px] text-muted mb-1">
        <span className="prompt-amber">assistant</span>
        <span className="prompt-muted">@rag</span>
        {message.streaming && <span className="ml-2 text-faint">streaming…</span>}
        {message.error && <span className="ml-2 text-danger">error</span>}
      </p>
      <div className="border-l-2 border-border-dim pl-4">
        {message.content ? (
          <div
            className="markdown-viewer text-[13px]"
            dangerouslySetInnerHTML={{ __html: renderMarkdown(message.content) }}
          />
        ) : (
          <p className="text-[12px] text-faint">
            <span className="prompt-green">▸</span> thinking…
          </p>
        )}
      </div>
    </div>
  );
}
