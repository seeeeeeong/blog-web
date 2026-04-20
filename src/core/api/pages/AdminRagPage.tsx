import { useCallback, useEffect, useState } from "react";
import { adminAiApi, type BackfillStats } from "../../../storage/admin/adminAiApi";
import { Spinner } from "../components/common/Spinner";

type RunningAction = "content" | "embedding" | "full" | null;

export function AdminRagPage() {
  const [stats, setStats] = useState<BackfillStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [running, setRunning] = useState<RunningAction>(null);
  const [lastResult, setLastResult] = useState<string | null>(null);

  const loadStats = useCallback(async () => {
    try {
      setLoading(true);
      const data = await adminAiApi.getStats();
      setStats(data);
    } catch {
      setLastResult("Stats 조회 실패");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadStats();
  }, [loadStats]);

  const runBackfillContent = async () => {
    setRunning("content");
    setLastResult(null);
    try {
      const filled = await adminAiApi.backfillContent();
      setLastResult(`Content backfill 완료: ${filled}개 아티클 크롤링됨`);
      await loadStats();
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
      const count = await adminAiApi.backfillEmbedding();
      setLastResult(`Embedding 재생성 완료: ${count}개 처리됨`);
      await loadStats();
    } catch {
      setLastResult("Embedding 재생성 실패");
    } finally {
      setRunning(null);
    }
  };

  const runFullSync = async () => {
    setRunning("full");
    setLastResult(null);
    try {
      const filled = await adminAiApi.backfillContent();
      const processed = await adminAiApi.backfillEmbedding();
      setLastResult(`Full sync 완료: content ${filled}개 · embedding ${processed}개`);
      await loadStats();
    } catch {
      setLastResult("Full sync 실패");
    } finally {
      setRunning(null);
    }
  };

  const busy = running !== null;

  return (
    <div className="max-w-[760px] mx-auto px-6 md:px-10 py-10 animate-fade-in">
      <div className="flex items-baseline justify-between mb-8 pb-6 border-b border-rule">
        <div>
          <p className="eyebrow mb-2">Admin</p>
          <h1 className="font-display text-[36px] font-medium tracking-[-0.02em] text-ink leading-none mb-2">
            Index
          </h1>
          <p className="font-meta text-[11px] text-muted tracking-[0.08em] uppercase">
            Search index · content & embeddings
          </p>
        </div>
        <button
          onClick={() => void loadStats()}
          disabled={loading}
          className="h-8 px-3 border border-rule font-meta text-[11px] uppercase tracking-[0.1em] text-muted hover:border-ink hover:text-ink transition-colors disabled:opacity-40"
        >
          :refresh
        </button>
      </div>

      {loading && !stats ? (
        <div className="py-16 flex justify-center"><Spinner /></div>
      ) : stats ? (
        <>
          <section className="border border-rule p-6 mb-6">
            <h2 className="eyebrow mb-5">Stats</h2>
            <div className="grid grid-cols-3 gap-6">
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

          <section className="border border-rule p-6 mb-6">
            <div className="flex items-start justify-between gap-4 pb-5 mb-5 border-b border-rule-soft">
              <div className="min-w-0">
                <p className="eyebrow mb-1">Quick action</p>
                <p className="font-display text-[18px] font-medium text-ink mb-1">
                  Run full sync
                </p>
                <p className="font-body text-[13.5px] text-muted leading-relaxed">
                  content backfill → embedding 재생성을 순서대로 실행합니다
                </p>
              </div>
              <button
                onClick={runFullSync}
                disabled={busy || (stats.withoutContent === 0 && stats.unembedded === 0)}
                className="shrink-0 h-10 px-5 bg-ink text-paper font-meta text-[11px] uppercase tracking-[0.12em] hover:bg-accent transition-colors disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-ink"
              >
                {running === "full" ? "running…" : ":run full sync"}
              </button>
            </div>

            <h2 className="eyebrow mb-4">Individual steps</h2>
            <div className="space-y-5">
              <ActionRow
                title="Content backfill"
                description="content가 없는 아티클의 URL을 크롤링하여 본문을 채웁니다"
                buttonLabel=":backfill content"
                loading={running === "content"}
                disabled={busy || stats.withoutContent === 0}
                onClick={runBackfillContent}
              />
              <ActionRow
                title="Embedding reprocess"
                description="임베딩이 없는 아티클을 임베딩합니다 (content backfill 후 실행)"
                buttonLabel=":backfill embedding"
                loading={running === "embedding"}
                disabled={busy || stats.unembedded === 0}
                onClick={runBackfillEmbedding}
              />
            </div>
          </section>

          {lastResult && (
            <div className="border border-rule p-4 bg-paper-2/40">
              <p className="font-body text-[14px] text-ink leading-relaxed">
                <span className="text-accent font-meta mr-2">✓</span>
                {lastResult}
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
    <div>
      <p className={`font-display text-[32px] font-medium leading-none ${warn ? "text-accent" : "text-ink"}`}>
        {value.toLocaleString()}
      </p>
      <p className="font-meta text-[10px] text-muted mt-2 tracking-[0.1em] uppercase">
        {label}
      </p>
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
    <div className="flex items-start justify-between gap-4 pb-4 border-b border-rule-soft last:border-b-0 last:pb-0">
      <div className="min-w-0">
        <p className="font-display text-[16px] font-medium text-ink mb-1">{title}</p>
        <p className="font-body text-[13.5px] text-muted leading-relaxed">{description}</p>
      </div>
      <button
        onClick={onClick}
        disabled={disabled}
        className="shrink-0 h-9 px-3 border border-ink font-meta text-[11px] uppercase tracking-[0.1em] text-ink hover:bg-ink hover:text-paper transition-colors disabled:opacity-40 disabled:cursor-not-allowed disabled:border-rule disabled:text-muted disabled:hover:bg-transparent disabled:hover:text-muted"
      >
        {loading ? "running…" : buttonLabel}
      </button>
    </div>
  );
}
