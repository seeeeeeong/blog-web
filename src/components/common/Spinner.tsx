export default function Spinner() {
  return (
    <div className="flex items-center gap-2 text-ink-light text-sm">
      <div className="spinner-modern" />
      <span className="animate-blink">Loading...</span>
    </div>
  );
}
