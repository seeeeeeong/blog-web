import { useState } from "react";
import { useGitHubAuth } from "../../contexts/useGitHubAuth";

interface CommentFormProps {
  onSubmit: (content: string) => void;
  placeholder?: string;
  buttonText?: string;
  autoFocus?: boolean;
}

export default function CommentForm({
  onSubmit,
  placeholder = "Leave a comment...",
  buttonText = "Post",
  autoFocus = false,
}: CommentFormProps) {
  const [content, setContent] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { user } = useGitHubAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!content.trim()) return;

    setIsSubmitting(true);
    try {
      await onSubmit(content.trim());
      setContent("");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      {user && (
        <div className="mb-2 flex items-center gap-2">
          {user.githubAvatarUrl && (
            <img
              src={user.githubAvatarUrl}
              alt={user.githubUsername}
              className="w-5 h-5 rounded-full border border-border"
            />
          )}
          <span className="text-sm font-mono font-semibold text-text">
            {user.githubUsername}
          </span>
        </div>
      )}

      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder={placeholder}
        autoFocus={autoFocus}
        rows={3}
        maxLength={1000}
        className="block w-full resize-none rounded-md border border-gray-300 bg-white p-3 text-sm font-mono text-text placeholder:text-gray-400 transition-colors focus:border-text focus:outline-none"
      />

      <div className="flex justify-between items-center">
        <p className="text-xs font-mono text-muted">
          {content.length} / 1000
        </p>
        <button
          type="submit"
          disabled={!content.trim() || isSubmitting}
          className="rounded-md bg-text px-4 py-1.5 font-mono text-sm text-white transition-colors hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-40"
        >
          {isSubmitting ? "..." : buttonText}
        </button>
      </div>
    </form>
  );
}
