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
  const { comments, loading, createComment, adminDeleteComment } = useComments(postId);

  return (
    <section className="pt-8 border-t border-border-dim">
      <div className="flex items-baseline gap-2 mb-6">
        <h2 className="text-[15px] font-medium text-ink">Comments</h2>
        <span className="text-[13px] text-faint font-mono">— {comments.length}</span>
      </div>

      <div className="mb-8">
        <CommentForm onSubmit={createComment} />
      </div>

      {loading ? (
        <div className="py-6">
          <Spinner />
        </div>
      ) : comments.length === 0 ? (
        <p className="text-[13px] text-faint py-4">No comments yet.</p>
      ) : (
        <div className="space-y-4">
          {comments.map((comment) => (
            <CommentItem
              key={comment.id}
              comment={comment}
              onAdminDelete={isAdmin ? adminDeleteComment : undefined}
            />
          ))}
        </div>
      )}
    </section>
  );
}
