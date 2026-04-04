import { Link } from "react-router-dom";

export default function NotFoundPage() {
  return (
    <div className="animate-fade-in py-12">
      <h1 className="text-2xl font-bold mb-2">404</h1>
      <p className="text-sm text-ink-light mb-6">Page not found.</p>
      <Link to="/" className="text-sm text-ink hover:opacity-60 transition-opacity">
        &larr; Back to home
      </Link>
    </div>
  );
}
