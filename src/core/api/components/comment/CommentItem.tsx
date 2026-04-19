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
    <article className="border border-border-dim rounded-lg p-4 hover:border-border-mid transition-colors">
      <header className="flex items-center gap-2.5 mb-3">
        <div className="w-6 h-6 rounded-full bg-gradient-to-br from-cat-blue to-cat-purple flex items-center justify-center text-[10px] font-semibold text-white">
          {initial}
        </div>
        <span className="text-[13px] text-ink font-medium">{comment.nickname}</span>
        <span className="text-[12px] text-faint font-mono">
          {formatRelativeDate(comment.createdAt)}
        </span>
      </header>

      <div
        className="comment-content text-[14px] text-ink whitespace-pre-wrap break-words leading-relaxed"
        dangerouslySetInnerHTML={{ __html: comment.contentHtml }}
      />

      {isAdmin && onAdminDelete && (
        <div className="mt-3 flex items-center gap-3">
          <button
            onClick={() => onAdminDelete(comment.id)}
            className="text-[12px] text-muted hover:text-danger transition-colors"
          >
            Delete
          </button>
        </div>
      )}
    </article>
  );
}
