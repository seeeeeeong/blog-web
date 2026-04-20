import { Link } from "react-router-dom";

export function NotFoundPage() {
  return (
    <div className="px-6 md:px-10 py-24 md:py-32 text-center animate-fade-in">
      <p className="eyebrow mb-6">Err · 404</p>
      <h1 className="font-display text-[56px] md:text-[80px] font-normal tracking-[-0.03em] leading-[1] mb-5 text-ink">
        Page not found.
      </h1>
      <p className="font-body italic text-[18px] text-ink-soft mb-10 max-w-md mx-auto">
        The page you're looking for doesn't exist or has been moved.
      </p>
      <Link
        to="/"
        className="inline-flex h-10 px-5 items-center bg-ink text-paper font-meta text-[12px] uppercase tracking-[0.12em] hover:bg-accent transition-colors"
      >
        ← Back to the room
      </Link>
    </div>
  );
}
