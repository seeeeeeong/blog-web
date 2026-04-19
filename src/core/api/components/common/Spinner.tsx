export function Spinner() {
  return (
    <div className="flex items-center gap-2 text-muted text-[13px]">
      <div className="spinner-modern" />
      <span>Loading…</span>
    </div>
  );
}
