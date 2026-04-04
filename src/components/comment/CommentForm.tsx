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
  buttonText = "send",
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
    <form onSubmit={handleSubmit} className="space-y-2">
      {user && (
        <div className="flex items-center gap-2 text-xs mb-1">
          {user.githubAvatarUrl && (
            <img
              src={user.githubAvatarUrl}
              alt={user.githubUsername}
              className="w-4 h-4 rounded-full"
            />
          )}
          <span className="text-term-white font-medium">{user.githubUsername}</span>
        </div>
      )}

      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder={placeholder}
        autoFocus={autoFocus}
        rows={3}
        maxLength={1000}
        className="block w-full resize-none rounded border border-ink-ghost bg-panel p-2.5 text-xs text-ink placeholder:text-ink-faint focus:border-term-green focus:outline-none transition-colors"
      />

      <div className="flex justify-between items-center">
        <span className="text-[10px] text-ink-faint">{content.length}/1000</span>
        <button
          type="submit"
          disabled={!content.trim() || isSubmitting}
          className="bg-term-green text-panel rounded px-3 py-1 text-xs font-medium hover:opacity-80 disabled:opacity-30 disabled:cursor-not-allowed transition-opacity"
        >
          {isSubmitting ? "..." : buttonText}
        </button>
      </div>
    </form>
  );
}
