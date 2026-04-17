import { useState } from "react";
import type { Comment } from "../../../domain/comment";
import { isAdminToken } from "../../../support/auth/authToken";
import { CommentForm } from "./CommentForm";

interface CommentItemProps {
  comment: Comment;
  postId: number;
  onDelete: (commentId: number, password: string) => void;
  onAdminDelete?: (commentId: number) => void;
  onReply: (nickname: string, password: string, content: string) => void;
}

export function CommentItem({ comment, postId, onDelete, onAdminDelete, onReply }: CommentItemProps) {
  // 1. Hooks
  const [showReplyForm, setShowReplyForm] = useState(false);
  const [showDeleteInput, setShowDeleteInput] = useState(false);
  const [deletePassword, setDeletePassword] = useState("");

  // 2. 파생 상태
  const token = localStorage.getItem("accessToken");
  const isAdmin = token ? isAdminToken(token) : false;

  // 3. 이벤트 핸들러
  const handleReplySubmit = async (nickname: string, password: string, content: string) => {
    await onReply(nickname, password, content);
    setShowReplyForm(false);
  };

  const handleDelete = () => {
    if (!deletePassword.trim()) return;
    onDelete(comment.id, deletePassword.trim());
    setShowDeleteInput(false);
    setDeletePassword("");
  };

  const formatRelativeDate = (dateString: string) => {
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
          <div className="w-5 h-5 rounded-full bg-surface-alt flex items-center justify-center">
            <span className="text-ink-faint text-[10px] font-bold">
              {comment.nickname[0]}
            </span>
          </div>
          <span className="text-term-white font-semibold">{comment.nickname}</span>
          <span className="text-ink-faint">{formatRelativeDate(comment.createdAt)}</span>
        </div>

        {/* Content */}
        <div
          className="comment-content text-xs text-ink-light whitespace-pre-wrap break-words mb-2 leading-relaxed"
          dangerouslySetInnerHTML={{ __html: comment.contentHtml }}
        />

        {/* Actions */}
        <div className="flex items-center gap-3 text-[11px]">
          <button
            onClick={() => setShowReplyForm(!showReplyForm)}
            className="text-term-blue hover:opacity-70 transition-opacity"
          >
            {showReplyForm ? "cancel" : "reply"}
          </button>
          <button
            onClick={() => { setShowDeleteInput(!showDeleteInput); setDeletePassword(""); }}
            className="text-danger hover:opacity-70 transition-opacity"
          >
            {showDeleteInput ? "cancel" : "delete"}
          </button>
          {isAdmin && onAdminDelete && (
            <button
              onClick={() => onAdminDelete(comment.id)}
              className="text-danger hover:opacity-70 transition-opacity"
            >
              admin-delete
            </button>
          )}
        </div>

        {/* Delete password input */}
        {showDeleteInput && (
          <div className="flex items-center gap-2 mt-2">
            <input
              type="password"
              value={deletePassword}
              onChange={(e) => setDeletePassword(e.target.value)}
              placeholder="password"
              onKeyDown={(e) => e.key === "Enter" && handleDelete()}
              className="rounded border border-ink-ghost bg-panel px-2 py-1 text-xs text-ink placeholder:text-ink-faint focus:border-danger focus:outline-none transition-colors"
            />
            <button
              onClick={handleDelete}
              disabled={!deletePassword.trim()}
              className="text-danger text-xs hover:opacity-70 disabled:opacity-30 transition-opacity"
            >
              confirm
            </button>
          </div>
        )}
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
              onAdminDelete={onAdminDelete}
              onReply={onReply}
            />
          ))}
        </div>
      )}
    </div>
  );
}
