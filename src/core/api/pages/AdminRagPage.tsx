import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
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
    <div className="max-w-[840px] px-6 md:px-10 py-7 md:py-8">
      <div className="flex items-center gap-1.5 text-[12.5px] text-muted mb-5">
        <Link to="/" className="hover:text-ink transition-colors">seeeeeeong.log</Link>
        <span className="text-faint">/</span>
        <span className="text-ink font-medium">admin · index</span>
      </div>

      <div className="flex items-end justify-between pb-5 border-b border-rule mb-6 gap-4 flex-wrap">
        <div>
          <h1 className="text-[28px] md:text-[30px] font-bold tracking-[-0.02em] leading-tight text-ink mb-1.5">
            Search index
          </h1>
          <p className="text-[13.5px] text-muted">
            Content &amp; embeddings 관리
          </p>
        </div>
        <button
          onClick={() => void loadStats()}
          disabled={loading}
          className="h-8 px-3 rounded-md border border-rule text-[12.5px] text-muted hover:border-ink hover:text-ink transition-colors disabled:opacity-40"
        >
          Refresh
        </button>
      </div>

      {loading && !stats ? (
        <div className="py-16 flex justify-center"><Spinner /></div>
      ) : stats ? (
        <>
          <section className="rounded-md border border-rule p-5 mb-5 bg-paper">
            <h2 className="eyebrow mb-4">Stats</h2>
            <div className="grid grid-cols-3 gap-5">
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

          <section className="rounded-md border border-rule p-5 mb-5 bg-paper">
            <div className="flex items-start justify-between gap-4 pb-4 mb-4 border-b border-rule">
              <div className="min-w-0">
                <p className="eyebrow mb-1">Quick action</p>
                <p className="text-[16px] font-semibold text-ink mb-1">
                  Run full sync
                </p>
                <p className="text-[13px] text-muted leading-relaxed">
                  content backfill → embedding 재생성을 순서대로 실행합니다
                </p>
              </div>
              <button
                onClick={runFullSync}
                disabled={busy || (stats.withoutContent === 0 && stats.unembedded === 0)}
                className="shrink-0 h-9 px-4 rounded-md bg-accent text-paper text-[13px] font-medium hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed transition-opacity"
              >
                {running === "full" ? "Running…" : "Run full sync"}
              </button>
            </div>

            <h2 className="eyebrow mb-4">Individual steps</h2>
            <div className="space-y-4">
              <ActionRow
                title="Content backfill"
                description="content가 없는 아티클의 URL을 크롤링하여 본문을 채웁니다"
                buttonLabel="Backfill content"
                loading={running === "content"}
                disabled={busy || stats.withoutContent === 0}
                onClick={runBackfillContent}
              />
              <ActionRow
                title="Embedding reprocess"
                description="임베딩이 없는 아티클을 임베딩합니다 (content backfill 후 실행)"
                buttonLabel="Backfill embedding"
                loading={running === "embedding"}
                disabled={busy || stats.unembedded === 0}
                onClick={runBackfillEmbedding}
              />
            </div>
          </section>

          {lastResult && (
            <div className="rounded-md border border-rule bg-accent-soft px-4 py-3">
              <p className="text-[13.5px] text-ink leading-relaxed">
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
      <p className={`text-[28px] font-bold leading-none tracking-[-0.02em] ${warn ? "text-accent" : "text-ink"}`}>
        {value.toLocaleString()}
      </p>
      <p className="text-[11px] text-faint mt-2 tracking-[0.06em] uppercase font-semibold font-meta">
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
    <div className="flex items-start justify-between gap-4 pb-4 border-b border-rule last:border-b-0 last:pb-0">
      <div className="min-w-0">
        <p className="text-[14.5px] font-semibold text-ink mb-1">{title}</p>
        <p className="text-[13px] text-muted leading-relaxed">{description}</p>
      </div>
      <button
        onClick={onClick}
        disabled={disabled}
        className="shrink-0 h-8 px-3 rounded-md border border-rule text-[12.5px] text-ink hover:border-accent hover:text-accent disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:border-rule disabled:hover:text-ink transition-colors"
      >
        {loading ? "Running…" : buttonLabel}
      </button>
    </div>
  );
}
