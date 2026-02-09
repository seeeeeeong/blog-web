import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { postApi } from "../api/post";
import type { Post } from "../types";
import { useAlert } from "../contexts/AlertContext";
import MarkdownViewer from "../components/editor/MarkdownViewer";
import CommentSection from "../components/comment/CommentSection";
import Spinner from "../components/common/Spinner";
import { formatDate } from "../utils/format";

export default function PostDetailPage() {
  const { postId } = useParams<{ postId: string }>();
  const navigate = useNavigate();
  const [post, setPost] = useState<Post | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAuthor, setIsAuthor] = useState(false);
  const { showSuccess, showError, showConfirm } = useAlert();

  useEffect(() => {
    loadPost();
  }, [postId]);

  const loadPost = async () => {
    try {
      const data = await postApi.getPost(Number(postId));
      setPost(data);

      const userId = localStorage.getItem("userId");
      setIsAuthor(userId === String(data.userId));
    } catch {
      showError("Post not found.");
      navigate("/");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    const confirmed = await showConfirm("Are you sure you want to delete this post?");
    if (!confirmed) return;

    try {
      await postApi.deletePost(Number(postId));
      showSuccess("Deleted successfully.");
      navigate("/");
    } catch {
      showError("Failed to delete post.");
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <Spinner />
      </div>
    );
  }

  if (!post) {
    return (
      <div className="w-full lg:px-8 px-4 py-20 text-center">
        <p className="text-sm font-mono text-muted mb-6">Post not found.</p>
        <Link to="/" className="font-mono text-sm text-gray-800 underline hover:text-text">
          Home
        </Link>
      </div>
    );
  }

  return (
    <div className="w-full lg:px-8 px-4 py-8">
      <div className="max-w-3xl mx-auto">
        {/* Back link */}
        <Link
          to="/"
          className="font-mono text-sm text-gray-800 hover:text-text underline inline-block mb-8"
        >
          &larr; Feed
        </Link>

        {/* Post Header */}
        <div className="mb-8 pb-6 border-b border-gray-500">
          <h1 className="text-3xl lg:text-4xl font-bold text-text tracking-tight leading-tight mb-4">
            {post.title}
          </h1>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
            <div className="flex items-center gap-3 font-mono text-sm text-muted">
              <time>{formatDate(post.createdAt)}</time>
              <span>&middot;</span>
              <span>{post.viewCount} views</span>
            </div>
            {isAuthor && (
              <div className="flex items-center gap-4 font-mono text-sm">
                <Link
                  to={`/posts/${postId}/edit`}
                  className="text-gray-800 hover:text-text underline"
                >
                  EDIT
                </Link>
                <button
                  onClick={handleDelete}
                  className="text-red-600 hover:text-red-700 underline"
                >
                  DELETE
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Post Content */}
        <article className="pb-12 mb-8 border-b border-gray-300">
          <MarkdownViewer contentHtml={post.contentHtml} />
        </article>

        {/* Comments */}
        <CommentSection postId={Number(postId)} />
      </div>
    </div>
  );
}
