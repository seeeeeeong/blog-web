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
      {/* Comment */}
      <div className="border-t border-gray-900 pt-4">
        <div className="flex gap-4">
          {/* Profile Image */}
          <div className="flex-shrink-0">
            {comment.githubAvatarUrl ? (
              <img
                src={comment.githubAvatarUrl}
                alt={comment.githubUsername}
                className="w-10 h-10 border border-gray-900"
              />
            ) : (
              <div className="w-10 h-10 bg-gray-900 flex items-center justify-center">
                <span className="text-gray-100 text-xs font-mono font-bold">
                  {comment.githubUsername[0].toUpperCase()}
                </span>
              </div>
            )}
          </div>

          {/* Comment */}
          <div className="flex-1 min-w-0">
            {/* Header */}
            <div className="flex items-center gap-3 mb-2 flex-wrap text-xs font-mono">
              <span className="text-gray-900 font-bold">
                {comment.githubUsername}
              </span>
              {isAuthor && (
                <span className="px-2 py-1 border border-gray-900 inline-block">
                  AUTHOR
                </span>
              )}
              <span className="text-gray-600">
                {formatDate(comment.createdAt)}
              </span>
            </div>

            {/* Comment Text */}
            <div
              className="comment-content text-sm font-mono text-gray-900 whitespace-pre-wrap break-words mb-3 leading-relaxed"
              dangerouslySetInnerHTML={{ __html: comment.contentHtml }}
            />

            {/* Button */}
            <div className="flex items-center gap-4 text-xs font-mono">
              {user && (
                <button
                  onClick={() => setShowReplyForm(!showReplyForm)}
                  className="text-gray-900 hover:underline"
                >
                  REPLY
                </button>
              )}

              {isAuthor && (
                <button
                  onClick={handleDelete}
                  className="text-gray-900 hover:underline"
                >
                  DELETE
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Reply */}
      {showReplyForm && (
        <div className="ml-8 sm:ml-14">
          <div className="border border-gray-900 p-4">
            <CommentForm
              onSubmit={handleReplySubmit}
              placeholder="답글을 입력하세요..."
              buttonText="답글 작성"
              autoFocus
            />
          </div>
        </div>
      )}

      {/* Reply List */}
      {comment.replies && comment.replies.length > 0 && (
        <div className="ml-8 sm:ml-14 space-y-4 border-l border-gray-900 pl-4 sm:pl-6">
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