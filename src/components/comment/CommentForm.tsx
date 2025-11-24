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
  placeholder = "댓글을 입력하세요...",
  buttonText = "댓글 작성",
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
        <div className="flex items-center gap-3 pb-3 border-b border-gray-900">
          {user.githubAvatarUrl && (
            <img
              src={user.githubAvatarUrl}
              alt={user.githubUsername}
              className="w-8 h-8 border border-gray-900"
            />
          )}
          <span className="text-xs font-mono font-bold text-gray-900">
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
        className="w-full px-4 py-3 bg-gray-100 border border-gray-900 font-mono text-sm text-gray-900 focus:outline-none focus:bg-white resize-none transition-all"
      />

      <div className="flex justify-between items-center">
        <p className="text-xs font-mono text-gray-600">
          {content.length} / 1000
        </p>
        <button
          type="submit"
          disabled={!content.trim() || isSubmitting}
          className="px-4 py-2 border border-gray-900 text-sm font-mono text-gray-900 hover:bg-gray-900 hover:text-gray-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSubmitting ? "SUBMITTING..." : buttonText.toUpperCase()}
        </button>
      </div>
    </form>
  );
}