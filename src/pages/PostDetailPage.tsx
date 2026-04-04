import { useCallback, useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { postApi } from "../api/post";
import type { Post } from "../types";
import { useAlert } from "../contexts/useAlert";
import MarkdownViewer from "../components/editor/MarkdownViewer";
import CommentSection from "../components/comment/CommentSection";
import SimilarArticles from "../components/post/SimilarArticles";
import Spinner from "../components/common/Spinner";
import { formatDate } from "../utils/format";

export default function PostDetailPage() {
  const { postId } = useParams<{ postId: string }>();
  const navigate = useNavigate();
  const [post, setPost] = useState<Post | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAuthor, setIsAuthor] = useState(false);
  const { showError } = useAlert();

  const loadPost = useCallback(async () => {
    try {
      const data = await postApi.getPost(Number(postId));
      setPost(data);
      const userId = localStorage.getItem("userId");
      setIsAuthor(userId === String(data.userId));
    } catch {
      showError("게시글을 찾을 수 없습니다.");
      navigate("/");
    } finally {
      setLoading(false);
    }
  }, [navigate, postId, showError]);

  useEffect(() => { void loadPost(); }, [loadPost]);

  const handleDelete = async () => {
    try {
      await postApi.deletePost(Number(postId));
      navigate("/");
    } catch {
      showError("게시글 삭제에 실패했습니다.");
    }
  };

  if (loading) return <div className="flex justify-center items-center min-h-[60vh]"><Spinner /></div>;

  if (!post) {
    return (
      <div className="py-12">
        <p className="text-danger text-sm mb-4">Post not found.</p>
        <Link to="/" className="text-sm text-ink hover:opacity-60">&larr; Back</Link>
      </div>
    );
  }

  return (
    <div className="animate-fade-in">
      <Link to="/" className="text-xs text-ink-light hover:text-ink transition-colors">&larr; Back</Link>

      {/* Post Header */}
      <div className="mt-4 mb-6 pb-6 border-b border-ink-ghost">
        <h1 className="text-xl sm:text-2xl font-bold mb-3 leading-tight">{post.title}</h1>
        <div className="flex flex-col sm:flex-row sm:items-center gap-2 text-xs text-ink-light">
          <div className="flex items-center gap-3">
            <span>{formatDate(post.createdAt)}</span>
            <span className="font-mono">{post.viewCount} views</span>
          </div>
          {isAuthor && (
            <div className="flex items-center gap-3 sm:ml-auto">
              <Link to={`/posts/${postId}/edit`} className="text-info hover:opacity-70 transition-opacity">Edit</Link>
              <button onClick={handleDelete} className="text-danger hover:opacity-70 transition-opacity">Delete</button>
            </div>
          )}
        </div>
      </div>

      <article className="mb-8">
        <MarkdownViewer contentHtml={post.contentHtml} />
      </article>

      {post.content && (
        <>
          <hr className="border-ink-ghost mb-6" />
          <SimilarArticles
            title={post.title}
            content={post.content}
            topicHints={post.topicHints}
          />
        </>
      )}

      <hr className="border-ink-ghost mb-6" />

      <CommentSection postId={Number(postId)} />
    </div>
  );
}
