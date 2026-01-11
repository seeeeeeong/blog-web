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
      <div className="border-t border-border pt-6 transition-all-smooth hover:bg-card hover:-translate-x-1 px-4 py-3 -mx-4 -mt-3">
        <div className="flex gap-4">
          <div className="flex-shrink-0">
            {comment.githubAvatarUrl ? (
              <img
                src={comment.githubAvatarUrl}
                alt={comment.githubUsername}
                className="w-10 h-10 rounded-full border border-border transition-transform-smooth hover:scale-110 hover:rotate-3"
              />
            ) : (
              <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center transition-transform-smooth hover:scale-110">
                <span className="text-white text-sm font-sans font-bold">
                  {comment.githubUsername[0]}
                </span>
              </div>
            )}
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-3 mb-3 flex-wrap">
              <span className="text-sm font-sans font-bold text-text">
                {comment.githubUsername}
              </span>
              {isAuthor && (
                <span className="px-2 py-0.5 text-xs font-sans border border-border bg-primary text-whiter shadow-md rounded-lg">
                  AUTHOR
                </span>
              )}
              <span className="text-xs font-sans text-muted">
                {formatDate(comment.createdAt)}
              </span>
            </div>

            <div
              className="comment-content text-sm font-sans text-secondary whitespace-pre-wrap break-words mb-4 leading-relaxed"
              dangerouslySetInnerHTML={{ __html: comment.contentHtml }}
            />

            <div className="flex items-center gap-6 text-xs font-sans">
              {user && (
                <button
                  onClick={() => setShowReplyForm(!showReplyForm)}
                  className="text-text hover:text-accent transition-all-smooth font-semibold relative after:absolute after:bottom-0 after:left-0 after:w-0 after:h-0.5 after:bg-text after:transition-all hover:after:w-full"
                >
                  {showReplyForm ? "↑ CANCEL" : "↓ REPLY"}
                </button>
              )}

              {isAuthor && (
                <button
                  onClick={handleDelete}
                  className="text-red-600 hover:text-red-700 transition-all-smooth font-semibold relative after:absolute after:bottom-0 after:left-0 after:w-0 after:h-0.5 after:bg-red-600 after:transition-all hover:after:w-full"
                >
                  DELETE
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {showReplyForm && (
        <div className="ml-14 pl-6 border-l-2 border-border animate-slide-in-up">
          <div className="bg-card border border-border p-6 shadow-md rounded-lg transition-all-smooth hover:shadow-lg">
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
        <div className="ml-14 pl-6 space-y-6 border-l-2 border-border">
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