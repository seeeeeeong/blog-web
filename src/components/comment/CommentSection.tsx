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
    } catch (error) {
      console.error("댓글 로딩 실패:", error);
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
      showSuccess("댓글이 작성되었습니다.");
      await loadComments();
    } catch (error: any) {
      console.error("댓글 작성 실패:", error);

      if (error.response?.data) {
        const errorData = error.response.data;
        if (errorData.errors && errorData.errors.length > 0) {
          showError(errorData.errors.join(", "));
        } else if (errorData.message) {
          showError(errorData.message);
        } else {
          showError("댓글 작성에 실패했습니다.");
        }
      } else {
        showError("댓글 작성에 실패했습니다.");
      }
    }
  };

  const handleDeleteComment = async (commentId: number) => {
    if (!user) return;

    try {
      await commentApi.deleteComment(postId, commentId, user.commentToken);
      showSuccess("댓글이 삭제되었습니다.");
      await loadComments();
    } catch (error: any) {
      console.error("댓글 삭제 실패:", error);

      // 401 에러(인증 실패)인 경우 재로그인 안내
      if (error.response?.status === 401) {
        showError("인증에 실패했습니다. GitHub 로그인을 다시 시도해주세요.");
      } else if (error.response?.data?.message) {
        showError(error.response.data.message);
      } else {
        showError("댓글 삭제에 실패했습니다.");
      }
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-8">
        <div className="w-8 h-8 border-2 border-gray-300 border-t-gray-900 rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="pb-4 border-b border-gray-900">
        <h3 className="text-2xl font-bold text-gray-900 font-mono">
          COMMENTS ({comments.length})
        </h3>
      </div>

      {/* Create Comment */}
      <div>
        {isAuthenticated ? (
          <CommentForm onSubmit={(content) => handleSubmitComment(content)} />
        ) : (
          <div className="border border-gray-900 p-8 text-center">
            <p className="text-sm font-mono text-gray-900 mb-4">
              댓글을 남기려면 GitHub 로그인이 필요합니다
            </p>
            <button
              onClick={login}
              className="px-4 py-2 border border-gray-900 text-sm font-mono text-gray-900 hover:bg-gray-900 hover:text-gray-100 transition-colors inline-flex items-center gap-2"
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
              </svg>
              LOGIN WITH GITHUB
            </button>
          </div>
        )}
      </div>

      {/* Comment List */}
      <div className="space-y-6">
        {comments.length === 0 ? (
          <div className="border-t border-gray-900 pt-8">
            <p className="text-sm font-mono text-gray-600">아직 댓글이 없습니다</p>
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