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
  placeholder = "Leave a note…",
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
        className="block w-full resize-none border border-rule bg-paper p-3.5 font-body text-[15px] text-ink placeholder:text-faint placeholder:italic focus:border-ink focus:outline-none transition-colors"
      />
      <div className="flex justify-between items-center">
        <span className="font-meta text-[10px] text-faint tracking-[0.08em]">
          {content.length} / {COMMENT_LIMITS.CONTENT_MAX_LENGTH}
        </span>
        <button
          type="submit"
          disabled={!content.trim() || isSubmitting}
          className="h-9 px-4 bg-ink text-paper font-meta text-[11px] uppercase tracking-[0.12em] hover:bg-accent disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
        >
          {isSubmitting ? "Posting…" : buttonText}
        </button>
      </div>
    </form>
  );
}
