import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { postApi } from "../api/post";
import type { Post } from "../types";
import { useAlert } from "../contexts/AlertContext";
import MarkdownViewer from "../components/editor/MarkdownViewer";
import CommentSection from "../components/comment/CommentSection";
import PageLayout from "../components/common/PageLayout";

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
    } catch (error) {
      console.error("Failed to load post:", error);
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
    } catch (error) {
      console.error("Failed to delete:", error);
      showError("Failed to delete post.");
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <div className="w-8 h-8 border-2 border-gray-300 border-t-gray-900 rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!post) {
    return (
      <PageLayout title="Error">
        <div className="text-center">
          <p className="text-gray-600 mb-6">Post not found.</p>
          <Link to="/" className="text-gray-900 hover:text-gray-600 underline">
            Back to home
          </Link>
        </div>
      </PageLayout>
    );
  }

  return (
    <PageLayout title={post.title}>
      <div className="flex justify-between items-center mb-8 pb-4 border-b border-gray-200">
        <div className="flex items-center gap-3 text-xs font-mono text-gray-500">
          <time>
            {new Date(post.createdAt).toLocaleDateString("en-US", {
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </time>
          <span>·</span>
          <span>Views {post.viewCount}</span>
        </div>
        {isAuthor && (
          <div className="flex items-center gap-4 text-sm font-mono">
            <Link
              to={`/posts/${postId}/edit`}
              className="text-gray-500 hover:text-gray-900 underline"
            >
              Edit
            </Link>
            <button
              onClick={handleDelete}
              className="text-gray-500 hover:text-gray-900 underline"
            >
              Delete
            </button>
          </div>
        )}
      </div>

      <div className="prose prose-lg max-w-none mb-16">
        <MarkdownViewer contentHtml={post.contentHtml} />
      </div>

      <CommentSection postId={Number(postId)} />
    </PageLayout>
  );
}