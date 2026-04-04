export default function Spinner() {
  return (
    <div className="flex items-center gap-2 text-ink-faint text-xs">
      <div className="spinner-modern" />
      <span className="animate-blink">loading...</span>
    </div>
  );
}
