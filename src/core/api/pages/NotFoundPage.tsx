import { Link } from "react-router-dom";

export function NotFoundPage() {
  return (
    <div className="animate-fade-in py-12">
      <div className="text-xs text-ink-faint mb-2">
        <span className="text-term-blue">~/blog</span> <span className="text-term-green">$</span> <span className="text-term-white">cat page</span>
      </div>
      <p className="text-danger text-xs mb-1">error: file not found (404)</p>
      <p className="text-xs text-ink-faint mb-6">The requested path does not exist.</p>
      <Link to="/" className="text-xs text-ink-faint hover:text-term-green transition-colors">
        $ cd ~/blog
      </Link>
    </div>
  );
}
