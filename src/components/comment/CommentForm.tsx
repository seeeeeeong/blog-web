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
        <div className="flex items-center gap-3 pb-4 mb-4 border-b border-primary">
          {user.githubAvatarUrl && (
            <img
              src={user.githubAvatarUrl}
              alt={user.githubUsername}
              className="w-8 h-8 rounded-full border border-primary transition-transform-smooth hover:scale-110 hover:rotate-3"
            />
          )}
          <span className="text-sm font-mono font-semibold text-primary uppercase tracking-wide">
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
        className="block w-full border border-primary bg-white p-4 text-primary placeholder:text-tertiary focus:border-primary focus:ring-2 focus:ring-primary text-sm font-mono transition-all-smooth resize-none"
      />

      <div className="flex justify-between items-center">
        <p className="text-xs font-mono text-tertiary uppercase tracking-wide">
          {content.length} / 1000
        </p>
        <button
          type="submit"
          disabled={!content.trim() || isSubmitting}
          className="btn-interactive px-6 py-2.5 text-sm font-mono font-semibold text-white bg-primary hover:bg-accent-green hover:text-primary disabled:opacity-50 disabled:cursor-not-allowed transition-all-smooth border border-primary shadow-[1px_1px_0_#232324] hover:shadow-[2px_2px_0_#232324] hover:-translate-y-0.5 active:translate-y-0 uppercase tracking-wide"
        >
          {isSubmitting ? "SUBMITTING..." : buttonText}
        </button>
      </div>
    </form>
  );
}