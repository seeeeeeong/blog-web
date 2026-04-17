import { useState, useEffect, useCallback, useRef } from "react";
import { commentApi } from "../../../storage/comment/commentApi";
import type { Comment } from "../../domain/comment";
import { useAlert } from "../contexts/useAlert";
import { extractApiErrorMessage } from "../error/error";

export function useComments(postId: number) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const { showError } = useAlert();

  const showErrorRef = useRef(showError);
  showErrorRef.current = showError;

  const loadComments = useCallback(async () => {
    try {
      setLoading(true);
      const data = await commentApi.getComments(postId);
      setComments(data);
    } catch {
      showErrorRef.current("Failed to load comments.");
    } finally {
      setLoading(false);
    }
  }, [postId]);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);

    commentApi.getComments(postId)
      .then((data) => {
        if (!cancelled) setComments(data);
      })
      .catch(() => {
        if (!cancelled) showErrorRef.current("Failed to load comments.");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => { cancelled = true; };
  }, [postId]);

  const createComment = async (content: string) => {
    try {
      await commentApi.createComment(postId, { content });
      await loadComments();
    } catch (error: unknown) {
      showError(extractApiErrorMessage(error, "Failed to add comment."));
    }
  };

  const adminDeleteComment = async (commentId: number) => {
    try {
      await commentApi.deleteCommentByAdmin(postId, commentId);
      await loadComments();
    } catch (error: unknown) {
      showError(extractApiErrorMessage(error, "Failed to delete comment."));
    }
  };

  return { comments, loading, createComment, adminDeleteComment };
}
