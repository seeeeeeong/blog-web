import { useState } from "react";
import { COMMENT_LIMITS } from "../../../support/constants";

interface CommentFormProps {
  onSubmit: (content: string) => void;
  placeholder?: string;
  buttonText?: string;
  autoFocus?: boolean;
}

export function CommentForm({
  onSubmit,
  placeholder = "Leave a comment...",
  buttonText = "send",
  autoFocus = false,
}: CommentFormProps) {
  const [content, setContent] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

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
      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder={placeholder}
        autoFocus={autoFocus}
        rows={3}
        maxLength={COMMENT_LIMITS.CONTENT_MAX_LENGTH}
        className="block w-full resize-none rounded border border-ink-ghost bg-panel p-2.5 text-xs text-ink placeholder:text-ink-faint focus:border-term-green focus:outline-none transition-colors"
      />

      <div className="flex justify-between items-center">
        <span className="text-[10px] text-ink-faint">{content.length}/{COMMENT_LIMITS.CONTENT_MAX_LENGTH}</span>
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
