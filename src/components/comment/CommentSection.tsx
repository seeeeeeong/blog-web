import { useState, useEffect } from "react";
import { commentApi } from "../../api/comment";
import type { Comment } from "../../types";
import { useGitHubAuth } from "../../contexts/GitHubAuthContext";
import { useAlert } from "../../contexts/AlertContext";
import CommentItem from "./CommentItem";
import CommentForm from "./CommentForm";

interface CommentSectionProps {
  postId: number;
}

export default function CommentSection({ postId }: CommentSectionProps) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const { isAuthenticated, login, user } = useGitHubAuth();
  const { showSuccess, showError } = useAlert();

  useEffect(() => {
    loadComments();
  }, [postId]);

  const loadComments = async () => {
    try {
      const data = await commentApi.getComments(postId);
      setComments(data);
    } catch {
      showError("Failed to load comments.");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitComment = async (content: string, parentId?: number) => {
    if (!user) return;

    try {
      await commentApi.createComment(
        postId,
        { content, parentId: parentId ?? null },
        user.commentToken
      );
      showSuccess("Comment posted successfully.");
      await loadComments();
    } catch (error: any) {
      const errorData = error.response?.data;
      const errorMessage = errorData?.errors?.length > 0
        ? errorData.errors.join(", ")
        : errorData?.message || "Failed to post comment.";
      showError(errorMessage);
    }
  };

  const handleDeleteComment = async (commentId: number) => {
    if (!user) return;

    try {
      await commentApi.deleteComment(postId, commentId, user.commentToken);
      showSuccess("Comment deleted successfully.");
      await loadComments();
    } catch (error: any) {
      const errorMessage = error.response?.status === 401
        ? "Authentication failed. Please try logging in with GitHub again."
        : error.response?.data?.message || "Failed to delete comment.";
      showError(errorMessage);
    }
  };

  const Spinner = () => (
    <div className="w-8 h-8 border-2 border-tertiary border-t-primary rounded-full animate-spin" />
  );

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <Spinner />
      </div>
    );
  }

  return (
    <div className="space-y-6 sm:space-y-10">
      <div className="bg-whitesmoke border border-primary p-6 sm:p-8 shadow-[1px_1px_0_#232324] transition-all-smooth hover:shadow-[2px_2px_0_#232324]">
        {isAuthenticated ? (
          <CommentForm onSubmit={(content) => handleSubmitComment(content)} />
        ) : (
          <div className="text-center py-6">
            <p className="text-[11px] sm:text-xs font-mono text-secondary mb-6 tracking-wide uppercase">
              LOGIN WITH GITHUB TO LEAVE A COMMENT
            </p>
            <button
              onClick={login}
              className="btn-interactive px-4 sm:px-6 py-2 sm:py-3 border border-primary text-[11px] sm:text-xs font-mono text-primary bg-whitesmoke hover:bg-primary hover:text-white transition-all-smooth inline-flex items-center gap-2 sm:gap-3 tracking-wide uppercase shadow-[1px_1px_0_#232324] hover:shadow-[2px_2px_0_#232324] hover:-translate-y-0.5 active:translate-y-0"
            >
              <svg className="w-4 h-4 transition-transform-smooth group-hover:rotate-12" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
              </svg>
              LOGIN WITH GITHUB
            </button>
          </div>
        )}
      </div>

      <div className="space-y-4 sm:space-y-6">
        {comments.length === 0 ? (
          <div className="border-t border-primary pt-8 sm:pt-12 text-center">
            <p className="text-[11px] sm:text-xs font-mono text-tertiary tracking-wide uppercase">NO COMMENTS YET.</p>
          </div>
        ) : (
          comments.map((comment) => (
            <CommentItem
              key={comment.id}
              comment={comment}
              postId={postId}
              onDelete={handleDeleteComment}
              onReply={(content: string) =>
                handleSubmitComment(content, comment.id)
              }
            />
          ))
        )}
      </div>
    </div>
  );
}