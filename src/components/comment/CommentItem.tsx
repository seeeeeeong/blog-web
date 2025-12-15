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
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} minutes ago`;
    if (diffInSeconds < 86400)
      return `${Math.floor(diffInSeconds / 3600)} hours ago`;
    if (diffInSeconds < 604800)
      return `${Math.floor(diffInSeconds / 86400)} days ago`;

    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  return (
    <div className="space-y-4">
      <div className="border-t-2 border-gray-200 pt-6">
        <div className="flex gap-4">
          <div className="flex-shrink-0">
            {comment.githubAvatarUrl ? (
              <img
                src={comment.githubAvatarUrl}
                alt={comment.githubUsername}
                className="w-10 h-10 rounded-full border-2 border-gray-900"
              />
            ) : (
              <div className="w-10 h-10 rounded-full bg-gray-900 flex items-center justify-center">
                <span className="text-white text-sm font-mono font-bold">
                  {comment.githubUsername[0].toUpperCase()}
                </span>
              </div>
            )}
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-3 mb-3 flex-wrap">
              <span className="text-sm font-mono font-bold text-gray-900">
                {comment.githubUsername}
              </span>
              {isAuthor && (
                <span className="px-2 py-0.5 text-xs font-mono border-2 border-gray-900 bg-gray-900 text-white">
                  AUTHOR
                </span>
              )}
              <span className="text-xs font-mono text-gray-500">
                {formatDate(comment.createdAt)}
              </span>
            </div>

            <div
              className="comment-content text-sm font-mono text-gray-800 whitespace-pre-wrap break-words mb-4 leading-relaxed"
              dangerouslySetInnerHTML={{ __html: comment.contentHtml }}
            />

            <div className="flex items-center gap-6 text-xs font-mono">
              {user && (
                <button
                  onClick={() => setShowReplyForm(!showReplyForm)}
                  className="text-gray-900 hover:text-gray-600 transition-colors font-semibold"
                >
                  {showReplyForm ? "↑ CANCEL" : "↓ REPLY"}
                </button>
              )}

              {isAuthor && (
                <button
                  onClick={handleDelete}
                  className="text-red-600 hover:text-red-700 transition-colors font-semibold"
                >
                  DELETE
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {showReplyForm && (
        <div className="ml-14 pl-6 border-l-4 border-gray-300">
          <div className="bg-gray-50 border-2 border-gray-300 p-6">
            <CommentForm
              onSubmit={handleReplySubmit}
              placeholder="Write a reply..."
              buttonText="Post Reply"
              autoFocus
            />
          </div>
        </div>
      )}

      {comment.replies && comment.replies.length > 0 && (
        <div className="ml-14 pl-6 space-y-6 border-l-4 border-gray-300">
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