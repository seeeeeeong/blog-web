import { Link } from "react-router-dom";

export function NotFoundPage() {
  return (
    <div className="max-w-[760px] mx-auto px-6 py-24 md:py-32 text-center animate-fade-in">
      <p className="font-mono text-[13px] text-faint mb-5">ERR_NOT_FOUND · 404</p>
      <h1 className="text-[48px] md:text-[64px] font-semibold tracking-tightest-plus leading-none mb-4 grad-text">
        Page not found.
      </h1>
      <p className="text-[15px] text-muted mb-8">
        The page you're looking for doesn't exist or has been moved.
      </p>
      <Link
        to="/"
        className="inline-flex h-10 px-5 items-center rounded-md bg-white text-black text-[14px] font-medium hover:bg-gray-100 transition-colors"
      >
        Back to home
      </Link>
    </div>
  );
}
