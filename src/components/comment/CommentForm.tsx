import { useState } from "react";
import { useGitHubAuth } from "../../contexts/GitHubAuthContext";

interface CommentFormProps {
  onSubmit: (content: string) => void;
  placeholder?: string;
  buttonText?: string;
  autoFocus?: boolean;
}

export default function CommentForm({
  onSubmit,
  placeholder = "Leave a comment...",
  buttonText = "Post Comment",
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
    <form onSubmit={handleSubmit} className="space-y-4">
      {user && (
        <div className="flex items-center gap-3 pb-4 mb-4 border-b border-border">
          {user.githubAvatarUrl && (
            <img
              src={user.githubAvatarUrl}
              alt={user.githubUsername}
              className="w-8 h-8 rounded-full border border-border transition-transform-smooth hover:scale-110 hover:rotate-3"
            />
          )}
          <span className="text-sm font-sans font-semibold text-text">
            {user.githubUsername}
          </span>
        </div>
      )}

      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder={placeholder}
        autoFocus={autoFocus}
        rows={4}
        maxLength={1000}
        className="block w-full border border-border bg-white p-4 text-text placeholder:text-muted focus:border-border focus:ring-2 focus:ring-primary text-sm font-sans transition-all-smooth resize-none"
      />

      <div className="flex justify-between items-center">
        <p className="text-xs font-sans text-muted">
          {content.length} / 1000
        </p>
        <button
          type="submit"
          disabled={!content.trim() || isSubmitting}
          className="btn-interactive px-6 py-2.5 text-sm font-sans font-semibold text-white bg-primary hover:bg-accent-green hover:text-text disabled:opacity-50 disabled:cursor-not-allowed transition-all-smooth border border-border shadow-md rounded-lg hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0"
        >
          {isSubmitting ? "SUBMITTING..." : buttonText}
        </button>
      </div>
    </form>
  );
}