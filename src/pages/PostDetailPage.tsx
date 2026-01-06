import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { postApi } from "../api/post";
import type { Post } from "../types";
import { useAlert } from "../contexts/AlertContext";
import MarkdownViewer from "../components/editor/MarkdownViewer";
import CommentSection from "../components/comment/CommentSection";
import PageLayout from "../components/common/PageLayout";

const Spinner = () => (
  <div className="w-8 h-8 border-2 border-gray-300 border-t-gray-900 rounded-full animate-spin" />
);

const formatDate = (date: string) =>
  new Date(date).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

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
      console.log("Loading post with ID:", postId);
      const data = await postApi.getPost(Number(postId));
      console.log("Post loaded successfully:", data);
      setPost(data);

      const userId = localStorage.getItem("userId");
      setIsAuthor(userId === String(data.userId));
    } catch (error) {
      console.error("Failed to load post:", error);
      console.error("Error details:", error instanceof Error ? error.message : String(error));
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
      <div className="flex justify-center items-center min-h-screen">
        <Spinner />
      </div>
    );
  }

  if (!post) {
    return (
      <PageLayout title="Error">
        <div className="text-center py-20">
          <p className="text-lg font-mono text-gray-600 mb-8">Post not found.</p>
          <Link
            to="/"
            className="px-6 py-3 bg-gray-900 text-white font-mono text-sm hover:bg-gray-800 transition-colors inline-block"
          >
            Back to home
          </Link>
        </div>
      </PageLayout>
    );
  }

  return (
    <PageLayout title={post.title}>
      <div className="flex justify-between items-center mb-12 pb-6 border-b-2 border-gray-200">
        <div className="flex items-center gap-4 text-sm font-mono text-gray-500">
          <time>{formatDate(post.createdAt)}</time>
          <span>·</span>
          <span>{post.viewCount} views</span>
        </div>
        {isAuthor && (
          <div className="flex items-center gap-6 text-sm font-mono">
            <Link
              to={`/posts/${postId}/edit`}
              className="text-gray-900 hover:text-gray-600 transition-colors"
            >
              Edit
            </Link>
            <button
              onClick={handleDelete}
              className="text-red-600 hover:text-red-700 transition-colors"
            >
              Delete
            </button>
          </div>
        )}
      </div>

      <article className="prose prose-lg max-w-none mb-20">
        <MarkdownViewer contentHtml={post.contentHtml} />
      </article>

      <CommentSection postId={Number(postId)} />
    </PageLayout>
  );
}