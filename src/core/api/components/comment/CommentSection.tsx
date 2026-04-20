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
    <section className="pt-10 border-t border-rule">
      <div className="flex items-baseline justify-between gap-3 mb-6">
        <h2 className="font-display text-[22px] font-medium tracking-[-0.015em] text-ink">
          Correspondence
        </h2>
        <span className="font-meta text-[11px] text-muted tracking-[0.08em] uppercase">
          {comments.length} {comments.length === 1 ? "note" : "notes"}
        </span>
      </div>

      <div className="mb-10">
        <CommentForm onSubmit={createComment} />
      </div>

      {loading ? (
        <div className="py-6">
          <Spinner />
        </div>
      ) : comments.length === 0 ? (
        <p className="font-body italic text-[14px] text-muted py-4">
          Be the first to leave a note.
        </p>
      ) : (
        <div className="space-y-5">
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
