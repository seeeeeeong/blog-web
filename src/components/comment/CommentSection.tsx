import { useState, useEffect, useCallback } from "react";
import { commentApi } from "../../api/comment";
import type { Comment } from "../../types";
import { useGitHubAuth } from "../../contexts/useGitHubAuth";
import { useAlert } from "../../contexts/useAlert";
import { extractApiErrorMessage } from "../../utils/error";
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
  const { showError } = useAlert();

  const loadComments = useCallback(async () => {
    try {
      setLoading(true);
      const data = await commentApi.getComments(postId);
      setComments(data);
    } catch {
      showError("댓글을 불러오지 못했습니다.");
    } finally {
      setLoading(false);
    }
  }, [postId, showError]);

  useEffect(() => { void loadComments(); }, [loadComments]);

  const handleSubmitComment = async (content: string, parentId?: number) => {
    if (!user) return;
    try {
      await commentApi.createComment(postId, { content, parentId: parentId ?? null }, user.commentToken);
      await loadComments();
    } catch (error: unknown) {
      showError(extractApiErrorMessage(error, "댓글 등록에 실패했습니다."));
    }
  };

  const handleDeleteComment = async (commentId: number) => {
    if (!user) return;
    try {
      await commentApi.deleteComment(postId, commentId, user.commentToken);
      await loadComments();
    } catch (error: unknown) {
      const parsedError = typeof error === "object" && error != null
        ? (error as { response?: { status?: number } })
        : undefined;
      const errorMessage = parsedError?.response?.status === 401
        ? "인증이 만료되었습니다. GitHub 로그인을 다시 시도해 주세요."
        : extractApiErrorMessage(error, "댓글 삭제에 실패했습니다.");
      showError(errorMessage);
    }
  };

  if (loading) {
    return <div className="py-8"><Spinner /></div>;
  }

  return (
    <div className="space-y-4 text-sm">
      <h3 className="text-base font-semibold">
        Comments <span className="text-ink-light font-normal">({comments.length})</span>
      </h3>

      {/* Comment Form or Login Prompt */}
      <div className="border-[1.5px] border-ink-ghost rounded-lg p-4">
        {isAuthenticated ? (
          <CommentForm onSubmit={(content) => handleSubmitComment(content)} />
        ) : (
          <div className="text-center py-2">
            <p className="text-ink-light text-xs mb-3">
              Login with GitHub to leave a comment.
            </p>
            <button
              onClick={login}
              className="inline-flex items-center gap-2 bg-accent text-accent-text rounded-md px-3 py-1.5 text-xs font-medium hover:opacity-80 transition-opacity"
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
              </svg>
              Login with GitHub
            </button>
          </div>
        )}
      </div>

      {/* Comments List */}
      {comments.length === 0 ? (
        <div className="text-ink-light text-xs py-4">
          No comments yet.
        </div>
      ) : (
        <div className="space-y-2">
          {comments.map((comment) => (
            <CommentItem
              key={comment.id}
              comment={comment}
              postId={postId}
              onDelete={handleDeleteComment}
              onReply={(content: string) => handleSubmitComment(content, comment.id)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
