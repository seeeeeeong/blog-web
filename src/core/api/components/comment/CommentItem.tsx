import type { Comment } from "../../../domain/comment";
import { useIsAdmin } from "../../../support/hooks/useIsAdmin";
import { formatRelativeDate } from "../../../support/converter/format";

interface CommentItemProps {
  comment: Comment;
  onAdminDelete?: (commentId: number) => void;
}

export function CommentItem({ comment, onAdminDelete }: CommentItemProps) {
  const isAdmin = useIsAdmin();

  return (
    <div className="border border-ink-ghost rounded p-3 hover:border-ink-faint transition-colors">
      {/* Author line */}
      <div className="flex items-center gap-2 mb-2 text-xs">
        <div className="w-5 h-5 rounded-full bg-surface-alt flex items-center justify-center">
          <span className="text-ink-faint text-[10px] font-bold">
            {comment.nickname[0]}
          </span>
        </div>
        <span className="text-term-white font-semibold">{comment.nickname}</span>
        <span className="text-ink-faint">{formatRelativeDate(comment.createdAt)}</span>
      </div>

      {/* Content */}
      <div
        className="comment-content text-xs text-ink-light whitespace-pre-wrap break-words mb-2 leading-relaxed"
        dangerouslySetInnerHTML={{ __html: comment.contentHtml }}
      />

      {/* Admin actions */}
      {isAdmin && onAdminDelete && (
        <div className="flex items-center gap-3 text-[11px]">
          <button
            onClick={() => onAdminDelete(comment.id)}
            className="text-danger hover:opacity-70 transition-opacity"
          >
            delete
          </button>
        </div>
      )}
    </div>
  );
}
