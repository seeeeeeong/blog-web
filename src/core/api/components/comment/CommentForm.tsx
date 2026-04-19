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
  placeholder = "Leave a comment…",
  buttonText = "Post",
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
    <form onSubmit={handleSubmit} className="space-y-3">
      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder={placeholder}
        autoFocus={autoFocus}
        rows={4}
        maxLength={COMMENT_LIMITS.CONTENT_MAX_LENGTH}
        className="block w-full resize-none rounded-lg border border-border-dim bg-raised p-3 text-[14px] text-ink placeholder:text-faint focus:border-border-mid focus:outline-none transition-colors"
      />
      <div className="flex justify-between items-center">
        <span className="text-[11px] text-faint font-mono">
          {content.length}/{COMMENT_LIMITS.CONTENT_MAX_LENGTH}
        </span>
        <button
          type="submit"
          disabled={!content.trim() || isSubmitting}
          className="h-8 px-4 rounded-md bg-white text-black text-[13px] font-medium hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
        >
          {isSubmitting ? "Posting…" : buttonText}
        </button>
      </div>
    </form>
  );
}
