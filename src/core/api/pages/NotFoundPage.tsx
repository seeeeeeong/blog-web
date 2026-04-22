import { Link } from "react-router-dom";

export function NotFoundPage() {
  return (
    <div className="px-6 md:px-10 py-20 md:py-28 text-center">
      <p className="font-meta text-[11px] text-faint uppercase tracking-[0.08em] font-semibold mb-5">
        Error · 404
      </p>
      <h1 className="text-[44px] md:text-[56px] font-bold tracking-[-0.025em] leading-[1] mb-4 text-ink">
        Page not found
      </h1>
      <p className="text-[15px] text-muted mb-8 max-w-md mx-auto">
        요청하신 페이지가 없거나 이동되었습니다.
      </p>
      <Link
        to="/"
        className="inline-flex h-10 px-5 items-center rounded-md bg-accent text-paper text-[13.5px] font-medium hover:opacity-90 transition-opacity"
      >
        ← Back to home
      </Link>
    </div>
  );
}
