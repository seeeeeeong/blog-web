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
    <form onSubmit={handleSubmit} className="space-y-3">
      {/* 사용자 정보 */}
      {user && (
        <div className="flex items-center gap-3">
          {user.githubAvatarUrl && (
            <img
              src={user.githubAvatarUrl}
              alt={user.githubUsername}
              className="w-8 h-8 rounded-full"
            />
          )}
          <span className="text-sm font-medium text-gray-700">
            @{user.githubUsername}
          </span>
        </div>
      )}

      {/* 입력 영역 */}
      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder={placeholder}
        autoFocus={autoFocus}
        rows={4}
        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-gray-900 focus:ring-1 focus:ring-gray-900 resize-none"
      />

      {/* 버튼 */}
      <div className="flex justify-end">
        <button
          type="submit"
          disabled={!content.trim() || isSubmitting}
          className="px-6 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSubmitting ? "작성 중..." : buttonText}
        </button>
      </div>
    </form>
  );
}