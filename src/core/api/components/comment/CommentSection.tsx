import { useIsAdmin } from "../../../support/hooks/useIsAdmin";
import { useComments } from "../../../support/hooks/useComments";
import { CommentItem } from "./CommentItem";
import { CommentForm } from "./CommentForm";
import { Spinner } from "../common/Spinner";

interface CommentSectionProps {
  postId: number;
}

export function CommentSection({ postId }: CommentSectionProps) {
  const isAdmin = useIsAdmin();
  const { comments, loading, createComment, deleteComment, adminDeleteComment } = useComments(postId);

  if (loading) {
    return <div className="py-8"><Spinner /></div>;
  }

  return (
    <div className="space-y-4 text-sm">
      <h3 className="text-xs font-semibold text-term-green">
        $ cat comments <span className="text-ink-faint font-normal">({comments.length})</span>
      </h3>

      <div className="border border-ink-ghost rounded p-4">
        <CommentForm onSubmit={(nickname, password, content) => createComment(nickname, password, content)} />
      </div>

      {comments.length === 0 ? (
        <div className="text-ink-faint text-xs py-4">
          No comments yet.
        </div>
      ) : (
        <div className="space-y-2">
          {comments.map((comment) => (
            <CommentItem
              key={comment.id}
              comment={comment}
              postId={postId}
              onDelete={deleteComment}
              onAdminDelete={isAdmin ? adminDeleteComment : undefined}
              onReply={(nickname, password, content) => createComment(nickname, password, content, comment.id)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
