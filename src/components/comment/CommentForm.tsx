import { useState } from "react";

interface CommentFormProps {
  onSubmit: (nickname: string, password: string, content: string) => void;
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
  const [nickname, setNickname] = useState("");
  const [password, setPassword] = useState("");
  const [content, setContent] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nickname.trim() || !password.trim() || !content.trim()) return;
    setIsSubmitting(true);
    try {
      await onSubmit(nickname.trim(), password.trim(), content.trim());
      setContent("");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-2">
      <div className="flex gap-2">
        <input
          type="text"
          value={nickname}
          onChange={(e) => setNickname(e.target.value)}
          placeholder="nickname"
          maxLength={20}
          className="w-1/2 rounded border border-ink-ghost bg-panel px-2.5 py-1.5 text-xs text-ink placeholder:text-ink-faint focus:border-term-green focus:outline-none transition-colors"
        />
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="password"
          maxLength={50}
          className="w-1/2 rounded border border-ink-ghost bg-panel px-2.5 py-1.5 text-xs text-ink placeholder:text-ink-faint focus:border-term-green focus:outline-none transition-colors"
        />
      </div>

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
          disabled={!nickname.trim() || !password.trim() || !content.trim() || isSubmitting}
          className="bg-term-green text-panel rounded px-3 py-1 text-xs font-medium hover:opacity-80 disabled:opacity-30 disabled:cursor-not-allowed transition-opacity"
        >
          {isSubmitting ? "..." : buttonText}
        </button>
      </div>
    </form>
  );
}
