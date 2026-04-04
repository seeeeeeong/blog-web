import { useState } from "react";
import type { Comment } from "../../types";
import { useGitHubAuth } from "../../contexts/useGitHubAuth";
import CommentForm from "./CommentForm";

interface CommentItemProps {
  comment: Comment;
  postId: number;
  onDelete: (commentId: number) => void;
  onReply: (content: string) => void;
}

export default function CommentItem({ comment, postId, onDelete, onReply }: CommentItemProps) {
  const [showReplyForm, setShowReplyForm] = useState(false);
  const { user } = useGitHubAuth();
  const isAuthor = user?.githubId === comment.oauthId;

  const handleReplySubmit = async (content: string) => {
    await onReply(content);
    setShowReplyForm(false);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = Math.floor((now.getTime() - date.getTime()) / 1000);
    if (diff < 60) return "just now";
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    if (diff < 604800) return `${Math.floor(diff / 86400)}d ago`;
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, "0");
    const d = String(date.getDate()).padStart(2, "0");
    return `${y}.${m}.${d}`;
  };

  return (
    <div className="space-y-2">
      <div className="border border-ink-ghost rounded p-3 hover:border-ink-faint transition-colors">
        {/* Author line */}
        <div className="flex items-center gap-2 mb-2 text-xs">
          {comment.oauthAvatarUrl ? (
            <img
              src={comment.oauthAvatarUrl}
              alt={comment.oauthUsername}
              className="w-5 h-5 rounded-full"
            />
          ) : (
            <div className="w-5 h-5 rounded-full bg-surface-alt flex items-center justify-center">
              <span className="text-ink-faint text-[10px] font-bold">
                {comment.oauthUsername[0]}
              </span>
            </div>
          )}
          <span className="text-term-white font-semibold">{comment.oauthUsername}</span>
          {isAuthor && (
            <span className="text-[10px] font-medium text-term-blue border border-term-blue/30 rounded px-1">
              you
            </span>
          )}
          <span className="text-ink-faint">{formatDate(comment.createdAt)}</span>
        </div>

        {/* Content */}
        <div
          className="comment-content text-xs text-ink-light whitespace-pre-wrap break-words mb-2 leading-relaxed"
          dangerouslySetInnerHTML={{ __html: comment.contentHtml }}
        />

        {/* Actions */}
        <div className="flex items-center gap-3 text-[11px]">
          {user && (
            <button
              onClick={() => setShowReplyForm(!showReplyForm)}
              className="text-term-blue hover:opacity-70 transition-opacity"
            >
              {showReplyForm ? "cancel" : "reply"}
            </button>
          )}
          {isAuthor && (
            <button
              onClick={() => onDelete(comment.id)}
              className="text-danger hover:opacity-70 transition-opacity"
            >
              delete
            </button>
          )}
        </div>
      </div>

      {/* Reply Form */}
      {showReplyForm && (
        <div className="ml-4 border-l-2 border-ink-ghost pl-3">
          <CommentForm
            onSubmit={handleReplySubmit}
            placeholder="Write a reply..."
            buttonText="reply"
            autoFocus
          />
        </div>
      )}

      {/* Nested Replies */}
      {comment.replies && comment.replies.length > 0 && (
        <div className="ml-4 space-y-2 border-l-2 border-ink-ghost pl-3">
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
