import { useCallback, useEffect, useState } from "react";
import { adminAiApi, type BackfillStats } from "../../../storage/admin/adminAiApi";
import { Spinner } from "../components/common/Spinner";

const ADMIN_KEY_STORAGE = "blog-ai:adminKey";

export function AdminRagPage() {
  const [adminKey, setAdminKey] = useState(
    () => sessionStorage.getItem(ADMIN_KEY_STORAGE) ?? "",
  );
  const [authenticated, setAuthenticated] = useState(false);
  const [stats, setStats] = useState<BackfillStats | null>(null);
  const [loading, setLoading] = useState(false);
  const [running, setRunning] = useState<string | null>(null);
  const [lastResult, setLastResult] = useState<string | null>(null);

  const loadStats = useCallback(async (key: string) => {
    try {
      setLoading(true);
      const data = await adminAiApi.getStats(key);
      setStats(data);
      setAuthenticated(true);
      sessionStorage.setItem(ADMIN_KEY_STORAGE, key);
    } catch {
      setAuthenticated(false);
      setLastResult("Admin key 인증 실패");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (adminKey) void loadStats(adminKey);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const handleAuth = (e: React.FormEvent) => {
    e.preventDefault();
    if (adminKey.trim()) void loadStats(adminKey.trim());
  };

  const runBackfillContent = async () => {
    setRunning("content");
    setLastResult(null);
    try {
      const filled = await adminAiApi.backfillContent(adminKey);
      setLastResult(`Content backfill 완료: ${filled}개 아티클 크롤링됨`);
      await loadStats(adminKey);
    } catch {
      setLastResult("Content backfill 실패");
    } finally {
      setRunning(null);
    }
  };

  const runBackfillEmbedding = async () => {
    setRunning("embedding");
    setLastResult(null);
    try {
      const count = await adminAiApi.backfillEmbedding(adminKey);
      setLastResult(`Embedding 재생성 완료: ${count}개 처리됨`);
      await loadStats(adminKey);
    } catch {
      setLastResult("Embedding 재생성 실패");
    } finally {
      setRunning(null);
    }
  };

  if (!authenticated) {
    return (
      <div className="max-w-[500px] mx-auto px-6 py-16 animate-fade-in">
        <h1 className="text-[18px] text-cat-amber mb-6">
          <span className="text-muted">$ </span>admin --rag
        </h1>
        <form onSubmit={handleAuth} className="space-y-4">
          <div>
            <label className="text-[12px] text-faint block mb-1.5">Admin API Key</label>
            <input
              type="password"
              value={adminKey}
              onChange={(e) => setAdminKey(e.target.value)}
              placeholder="Enter admin key"
              className="w-full bg-bg-2 border border-border-dim focus:border-cat-green outline-none px-3 py-2 text-[13px] text-ink font-mono"
            />
          </div>
          <button
            type="submit"
            disabled={!adminKey.trim() || loading}
            className="h-9 px-4 border border-cat-green text-cat-green text-[12px] hover:bg-cat-green hover:text-bg transition-colors disabled:opacity-40"
          >
            {loading ? "connecting…" : ":connect"}
          </button>
          {lastResult && (
            <p className="text-[12px] text-danger">{lastResult}</p>
          )}
        </form>
      </div>
    );
  }

  return (
    <div className="max-w-[700px] mx-auto px-6 py-10 animate-fade-in">
      <div className="flex items-baseline justify-between mb-8">
        <div>
          <h1 className="text-[18px] text-cat-amber">
            <span className="text-muted">$ </span>admin --rag
          </h1>
          <p className="text-[12px] text-faint mt-1">RAG pipeline management</p>
        </div>
        <button
          onClick={() => void loadStats(adminKey)}
          disabled={loading}
          className="h-7 px-2.5 border border-border-dim text-[11px] text-muted hover:text-cat-green hover:border-cat-green transition-colors disabled:opacity-40"
        >
          :refresh
        </button>
      </div>

      {loading && !stats ? (
        <div className="py-16 flex justify-center"><Spinner /></div>
      ) : stats ? (
        <>
          <section className="border border-border-dim rounded-lg p-5 mb-6">
            <h2 className="text-[13px] text-muted mb-4 font-mono">
              <span className="prompt-green">▸</span> stats
            </h2>
            <div className="grid grid-cols-3 gap-4">
              <StatCard label="Total Articles" value={stats.totalArticles} />
              <StatCard
                label="Without Content"
                value={stats.withoutContent}
                warn={stats.withoutContent > 0}
              />
              <StatCard
                label="Unembedded"
                value={stats.unembedded}
                warn={stats.unembedded > 0}
              />
            </div>
          </section>

          <section className="border border-border-dim rounded-lg p-5 mb-6">
            <h2 className="text-[13px] text-muted mb-4 font-mono">
              <span className="prompt-green">▸</span> actions
            </h2>
            <div className="space-y-3">
              <ActionRow
                title="Content Backfill"
                description="content가 없는 아티클의 URL을 크롤링하여 본문을 채웁니다"
                buttonLabel=":backfill content"
                loading={running === "content"}
                disabled={running !== null || stats.withoutContent === 0}
                onClick={runBackfillContent}
              />
              <ActionRow
                title="Embedding Reprocess"
                description="임베딩이 없는 아티클을 임베딩합니다 (content backfill 후 실행)"
                buttonLabel=":backfill embedding"
                loading={running === "embedding"}
                disabled={running !== null || stats.unembedded === 0}
                onClick={runBackfillEmbedding}
              />
            </div>
          </section>

          {lastResult && (
            <div className="border border-border-dim rounded-lg p-4">
              <p className="text-[13px] text-cat-green font-mono">
                <span className="prompt-green">✓</span> {lastResult}
              </p>
            </div>
          )}
        </>
      ) : null}
    </div>
  );
}

function StatCard({
  label,
  value,
  warn,
}: {
  label: string;
  value: number;
  warn?: boolean;
}) {
  return (
    <div className="text-center">
      <p className={`text-[24px] font-mono ${warn ? "text-cat-amber" : "text-ink"}`}>
        {value.toLocaleString()}
      </p>
      <p className="text-[11px] text-faint mt-1">{label}</p>
    </div>
  );
}

function ActionRow({
  title,
  description,
  buttonLabel,
  loading,
  disabled,
  onClick,
}: {
  title: string;
  description: string;
  buttonLabel: string;
  loading: boolean;
  disabled: boolean;
  onClick: () => void;
}) {
  return (
    <div className="flex items-center justify-between gap-4 py-2">
      <div className="min-w-0">
        <p className="text-[13px] text-ink">{title}</p>
        <p className="text-[11px] text-faint mt-0.5">{description}</p>
      </div>
      <button
        onClick={onClick}
        disabled={disabled}
        className="shrink-0 h-8 px-3 border border-cat-amber text-cat-amber text-[12px] hover:bg-cat-amber hover:text-bg transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
      >
        {loading ? "running…" : buttonLabel}
      </button>
    </div>
  );
}
