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
        <div className="flex items-center gap-3 pb-3 mb-4 border-b border-gray-200">
          {user.githubAvatarUrl && (
            <img
              src={user.githubAvatarUrl}
              alt={user.githubUsername}
              className="w-8 h-8 rounded-full border border-gray-300"
            />
          )}
          <span className="text-sm font-mono text-gray-800">
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
        className="block w-full border-b-2 border-gray-300 bg-transparent py-2 text-gray-900 placeholder:text-gray-400 focus:border-gray-900 focus:ring-0 sm:text-sm sm:leading-6 font-mono transition-colors duration-200 resize-none"
      />

      <div className="flex justify-between items-center">
        <p className="text-xs font-mono text-gray-500">
          {content.length} / 1000
        </p>
        <button
          type="submit"
          disabled={!content.trim() || isSubmitting}
          className="px-4 py-2 text-sm font-semibold text-white bg-gray-900 rounded-lg shadow-md hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:ring-offset-2 disabled:opacity-50 font-mono transition-colors duration-200"
        >
          {isSubmitting ? "SUBMITTING..." : buttonText}
        </button>
      </div>
    </form>
  );
}