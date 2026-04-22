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
        className="block w-full resize-none rounded-md border border-rule bg-paper p-3 text-[14px] text-ink placeholder:text-faint focus:border-accent focus:outline-none transition-colors"
      />
      <div className="flex justify-between items-center">
        <span className="font-meta text-[10px] text-faint tracking-[0.08em]">
          {content.length} / {COMMENT_LIMITS.CONTENT_MAX_LENGTH}
        </span>
        <button
          type="submit"
          disabled={!content.trim() || isSubmitting}
          className="h-8 px-4 rounded-md bg-accent text-paper text-[12.5px] font-medium hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed transition-opacity"
        >
          {isSubmitting ? "Posting…" : buttonText}
        </button>
      </div>
    </form>
  );
}
