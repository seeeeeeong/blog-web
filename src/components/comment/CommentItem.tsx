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
    const confirmed = await showConfirm("Are you sure you want to delete this comment?");
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

    if (diffInSeconds < 60) return "just now";
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
    if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}d ago`;

    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, "0");
    const d = String(date.getDate()).padStart(2, "0");
    return `${y}.${m}.${d}`;
  };

  return (
    <div className="space-y-0">
      <div className="border-b border-gray-300 py-4">
        <div className="flex gap-3">
          <div className="shrink-0">
            {comment.githubAvatarUrl ? (
              <img
                src={comment.githubAvatarUrl}
                alt={comment.githubUsername}
                className="w-8 h-8 rounded-full border border-border"
              />
            ) : (
              <div className="w-8 h-8 rounded-full bg-text flex items-center justify-center">
                <span className="text-white text-xs font-mono font-bold">
                  {comment.githubUsername[0]}
                </span>
              </div>
            )}
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-2 flex-wrap">
              <span className="text-sm font-mono font-semibold text-text">
                {comment.githubUsername}
              </span>
              {isAuthor && (
                <span className="px-1.5 py-0.5 text-xs font-mono border border-border text-muted">
                  AUTHOR
                </span>
              )}
              <span className="text-xs font-mono text-muted">
                {formatDate(comment.createdAt)}
              </span>
            </div>

            <div
              className="comment-content text-sm text-secondary whitespace-pre-wrap break-words mb-3 leading-relaxed"
              dangerouslySetInnerHTML={{ __html: comment.contentHtml }}
            />

            <div className="flex items-center gap-4 font-mono text-xs">
              {user && (
                <button
                  onClick={() => setShowReplyForm(!showReplyForm)}
                  className="text-gray-800 hover:text-text underline"
                >
                  {showReplyForm ? "CANCEL" : "REPLY"}
                </button>
              )}
              {isAuthor && (
                <button
                  onClick={handleDelete}
                  className="text-red-600 hover:text-red-700 underline"
                >
                  DELETE
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {showReplyForm && (
        <div className="ml-11 pl-4 border-l-2 border-gray-300 py-4">
          <CommentForm
            onSubmit={handleReplySubmit}
            placeholder="Write a reply..."
            buttonText="Reply"
            autoFocus
          />
        </div>
      )}

      {comment.replies && comment.replies.length > 0 && (
        <div className="ml-11 pl-4 border-l-2 border-gray-300">
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
