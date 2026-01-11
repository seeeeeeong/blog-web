import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { postApi } from "../api/post";
import type { Post } from "../types";
import { useAlert } from "../contexts/AlertContext";
import MarkdownViewer from "../components/editor/MarkdownViewer";
import CommentSection from "../components/comment/CommentSection";
import PageLayout from "../components/common/PageLayout";
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
      <div className="flex justify-center items-center min-h-screen">
        <Spinner />
      </div>
    );
  }

  if (!post) {
    return (
      <PageLayout title="Error">
        <div className="text-center py-20">
          <p className="text-[11px] sm:text-xs font-sans text-secondary mb-8">Post not found.</p>
          <Link
            to="/"
            className="px-4 py-2 bg-card text-text font-sans text-[11px] border border-border shadow-md rounded-lg hover:bg-primary hover:text-white transition-all inline-block"
          >
            Back to home
          </Link>
        </div>
      </PageLayout>
    );
  }

  return (
    <PageLayout title={post.title}>
      <div className="max-w-4xl mx-auto">
        <div className="bg-card border border-border p-8 sm:p-10 mb-8 sm:mb-12 shadow-md rounded-lg transition-all-smooth hover:shadow-lg animate-fade-in">
          <h1 className="text-2xl sm:text-3xl font-sans text-text mb-6 sm:mb-8 leading-tight font-bold">
            {post.title}
          </h1>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-6 sm:pb-8 border-b border-border">
            <div className="flex items-center gap-3 sm:gap-4 text-xs sm:text-sm font-sans text-mutedr">
              <time>{formatDate(post.createdAt)}</time>
              <span>·</span>
              <span>{post.viewCount} VIEWS</span>
            </div>
            {isAuthor && (
              <div className="flex items-center gap-4 sm:gap-6 text-xs sm:text-sm font-sansr animate-slide-in-up delay-100">
                <Link
                  to={`/posts/${postId}/edit`}
                  className="text-secondary hover:text-text transition-all-smooth relative after:absolute after:bottom-0 after:left-0 after:w-0 after:h-0.5 after:bg-text after:transition-all hover:after:w-full font-semibold"
                >
                  EDIT
                </Link>
                <button
                  onClick={handleDelete}
                  className="text-red-600 hover:text-red-700 transition-all-smooth relative after:absolute after:bottom-0 after:left-0 after:w-0 after:h-0.5 after:bg-red-600 after:transition-all hover:after:w-full font-semibold"
                >
                  DELETE
                </button>
              </div>
            )}
          </div>
        </div>

        <article className="bg-card border border-border p-8 sm:p-10 mb-12 sm:mb-16 shadow-md rounded-lg transition-all-smooth hover:shadow-lg animate-slide-in-up delay-100">
          <MarkdownViewer contentHtml={post.contentHtml} />
        </article>

        <div className="animate-slide-in-up delay-200">
          <CommentSection postId={Number(postId)} />
        </div>
      </div>
    </PageLayout>
  );
}