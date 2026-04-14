import { useState, useEffect, useCallback } from "react";
import { commentApi } from "../../api/comment";
import type { Comment } from "../../types";
import { useAlert } from "../../contexts/useAlert";
import { isAdminToken } from "../../utils/authToken";
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
  const { showError } = useAlert();

  const token = localStorage.getItem("accessToken");
  const isAdmin = token ? isAdminToken(token) : false;

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

  const handleSubmitComment = async (nickname: string, password: string, content: string, parentId?: number) => {
    try {
      await commentApi.createComment(postId, { nickname, password, content, parentId: parentId ?? null });
      await loadComments();
    } catch (error: unknown) {
      showError(extractApiErrorMessage(error, "댓글 등록에 실패했습니다."));
    }
  };

  const handleDeleteComment = async (commentId: number, password: string) => {
    try {
      await commentApi.deleteComment(postId, commentId, { password });
      await loadComments();
    } catch (error: unknown) {
      showError(extractApiErrorMessage(error, "댓글 삭제에 실패했습니다."));
    }
  };

  const handleAdminDeleteComment = async (commentId: number) => {
    try {
      await commentApi.deleteCommentByAdmin(postId, commentId);
      await loadComments();
    } catch (error: unknown) {
      showError(extractApiErrorMessage(error, "댓글 삭제에 실패했습니다."));
    }
  };

  if (loading) {
    return <div className="py-8"><Spinner /></div>;
  }

  return (
    <div className="space-y-4 text-sm">
      <h3 className="text-xs font-semibold text-term-green">
        $ cat comments <span className="text-ink-faint font-normal">({comments.length})</span>
      </h3>

      {/* Comment Form */}
      <div className="border border-ink-ghost rounded p-4">
        <CommentForm onSubmit={(nickname, password, content) => handleSubmitComment(nickname, password, content)} />
      </div>

      {/* Comments List */}
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
              onDelete={handleDeleteComment}
              onAdminDelete={isAdmin ? handleAdminDeleteComment : undefined}
              onReply={(nickname: string, password: string, content: string) => handleSubmitComment(nickname, password, content, comment.id)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
