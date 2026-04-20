import type { Comment } from "../../../domain/comment";
import { useIsAdmin } from "../../../support/hooks/useIsAdmin";
import { formatRelativeDate } from "../../../support/converter/format";

interface CommentItemProps {
  comment: Comment;
  onAdminDelete?: (commentId: number) => void;
}

export function CommentItem({ comment, onAdminDelete }: CommentItemProps) {
  const isAdmin = useIsAdmin();
  const initial = comment.nickname.charAt(0).toUpperCase();

  return (
    <article className="border-l-2 border-rule pl-4 hover:border-accent transition-colors">
      <header className="flex items-center gap-2.5 mb-2.5">
        <div className="w-6 h-6 rounded-full bg-paper-2 border border-rule flex items-center justify-center font-meta text-[10px] font-semibold text-ink-soft">
          {initial}
        </div>
        <span className="font-display text-[14px] text-ink font-medium">{comment.nickname}</span>
        <span className="font-meta text-[10px] text-muted tracking-[0.08em] uppercase">
          {formatRelativeDate(comment.createdAt)}
        </span>
      </header>

      <div
        className="comment-content font-body text-[15px] text-ink whitespace-pre-wrap break-words leading-[1.7]"
        dangerouslySetInnerHTML={{ __html: comment.contentHtml }}
      />

      {isAdmin && onAdminDelete && (
        <div className="mt-3 flex items-center gap-3">
          <button
            onClick={() => onAdminDelete(comment.id)}
            className="font-meta text-[10px] text-muted hover:text-danger transition-colors uppercase tracking-[0.08em]"
          >
            Delete
          </button>
        </div>
      )}
    </article>
  );
}
