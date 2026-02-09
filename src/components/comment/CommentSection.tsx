import { useState, useEffect } from "react";
import { commentApi } from "../../api/comment";
import type { Comment } from "../../types";
import { useGitHubAuth } from "../../contexts/GitHubAuthContext";
import { useAlert } from "../../contexts/AlertContext";
import CommentItem from "./CommentItem";
import CommentForm from "./CommentForm";
import Spinner from "../common/Spinner";

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

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <Spinner />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Comment Form */}
      <div className="border-b border-gray-300 pb-6">
        <h3 className="font-mono text-sm text-muted mb-4">/ COMMENTS</h3>
        {isAuthenticated ? (
          <CommentForm onSubmit={(content) => handleSubmitComment(content)} />
        ) : (
          <div className="py-4">
            <p className="text-sm font-mono text-muted mb-4">
              Login with GitHub to leave a comment.
            </p>
            <button
              onClick={login}
              className="font-mono text-sm text-gray-800 hover:text-text underline inline-flex items-center gap-2"
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
              </svg>
              Login with GitHub
            </button>
          </div>
        )}
      </div>

      {/* Comment List */}
      <div className="space-y-0">
        {comments.length === 0 ? (
          <div className="py-8 text-center">
            <p className="text-sm font-mono text-muted">No comments yet.</p>
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
