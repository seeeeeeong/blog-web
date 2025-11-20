import { useState } from "react";
import type { Comment } from "../../types";
import { useGitHubAuth } from "../../contexts/GitHubAuthContext";
import { useAlert } from "../../contexts/AlertContext";
import CommentForm from "./CommentForm";

interface CommentItemProps {
  comment: Comment;
  postId: number;
  onDelete: (commentId: number) => void;
  onReply: (content: string) => void;
}

export default function CommentItem({
  comment,
  postId,
  onDelete,
  onReply,
}: CommentItemProps) {
  const [showReplyForm, setShowReplyForm] = useState(false);
  const { user } = useGitHubAuth();
  const { showConfirm } = useAlert();

  const isAuthor = user?.githubId === comment.githubId;

  const handleDelete = async () => {
    const confirmed = await showConfirm("정말 삭제하시겠습니까?");
    if (confirmed) {
      onDelete(comment.id);
    }
  };

  const handleReplySubmit = async (content: string) => {
    await onReply(content);
    setShowReplyForm(false);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diffInSeconds < 60) return "방금 전";
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}분 전`;
    if (diffInSeconds < 86400)
      return `${Math.floor(diffInSeconds / 3600)}시간 전`;
    if (diffInSeconds < 604800)
      return `${Math.floor(diffInSeconds / 86400)}일 전`;

    return date.toLocaleDateString("ko-KR", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  return (
    <div className="space-y-4">
      {/* 댓글 본문 */}
      <div className="flex gap-4">
        {/* 프로필 이미지 */}
        <div className="flex-shrink-0">
          {comment.githubAvatarUrl ? (
            <img
              src={comment.githubAvatarUrl}
              alt={comment.githubUsername}
              className="w-10 h-10 rounded-full"
            />
          ) : (
            <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center">
              <span className="text-gray-600 text-sm font-medium">
                {comment.githubUsername[0].toUpperCase()}
              </span>
            </div>
          )}
        </div>

        {/* 댓글 내용 */}
        <div className="flex-1 min-w-0">
          {/* 헤더 */}
          <div className="flex items-center gap-2 mb-2">
            <span className="font-medium text-gray-900">
              {comment.githubUsername}
            </span>
            <span className="text-sm text-gray-500">
              {formatDate(comment.createdAt)}
            </span>
            {isAuthor && (
              <span className="text-xs bg-gray-900 text-white px-2 py-0.5 rounded">
                작성자
              </span>
            )}
          </div>

          {/* 내용 */}
          <p className="text-gray-700 whitespace-pre-wrap break-words mb-3">
            {comment.content}
          </p>

          {/* 액션 버튼 */}
          <div className="flex items-center gap-4">
            {user && (
              <button
                onClick={() => setShowReplyForm(!showReplyForm)}
                className="text-sm text-gray-600 hover:text-gray-900 transition-colors"
              >
                답글
              </button>
            )}

            {isAuthor && (
              <button
                onClick={handleDelete}
                className="text-sm text-red-600 hover:text-red-700 transition-colors"
              >
                삭제
              </button>
            )}
          </div>
        </div>
      </div>

      {/* 답글 작성 폼 */}
      {showReplyForm && (
        <div className="ml-14">
          <CommentForm
            onSubmit={handleReplySubmit}
            placeholder="답글을 입력하세요..."
            buttonText="답글 작성"
            autoFocus
          />
        </div>
      )}

      {/* 대댓글 목록 */}
      {comment.replies && comment.replies.length > 0 && (
        <div className="ml-14 space-y-4 border-l-2 border-gray-200 pl-4">
          {comment.replies.map((reply) => (
            <CommentItem
              key={reply.id}
              comment={reply}
              postId={postId}
              onDelete={onDelete}
              onReply={onReply}
            />
          ))}
        </div>
      )}
    </div>
  );
}