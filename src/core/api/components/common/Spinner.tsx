export function Spinner() {
  return (
    <div className="flex items-center gap-2.5 text-muted font-meta text-[11px] tracking-[0.08em] uppercase">
      <div className="spinner-modern" />
      <span>Loading…</span>
    </div>
  );
}
