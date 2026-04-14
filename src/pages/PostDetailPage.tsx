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
        <p className="text-danger text-xs mb-4">error: post not found</p>
        <Link to="/" className="text-xs text-ink-faint hover:text-term-green">$ cd ..</Link>
      </div>
    );
  }

  return (
    <div className="animate-fade-in">
      {/* Back */}
      <Link to="/" className="text-[11px] text-ink-faint hover:text-term-green transition-colors">
        <span className="text-ink-faint">$ cd .. # </span>back
      </Link>

      {/* Post Header */}
      <div className="mt-4 mb-6 pb-6 border-b border-ink-ghost">
        <h1 className="text-lg sm:text-xl font-bold text-term-white mb-3 leading-tight" style={{ fontFamily: "'IBM Plex Sans KR', sans-serif" }}>
          {post.title}
        </h1>
        <div className="flex flex-col sm:flex-row sm:items-center gap-2 text-[11px] text-ink-faint">
          <div className="flex items-center gap-4">
            <span><span className="text-ink-lighter">date:</span> {formatDate(post.createdAt)}</span>
            <span><span className="text-ink-lighter">views:</span> {post.viewCount}</span>
          </div>
          {isAuthor && (
            <div className="flex items-center gap-3 sm:ml-auto">
              <Link to={`/posts/${postId}/edit`} className="text-term-blue hover:opacity-70 transition-opacity">edit</Link>
              <button onClick={handleDelete} className="text-danger hover:opacity-70 transition-opacity">delete</button>
            </div>
          )}
        </div>
      </div>

      <article className="mb-8 max-w-[700px]">
        <MarkdownViewer contentHtml={post.contentHtml} />
      </article>

      <hr className="border-ink-ghost border-dashed mb-6" />

      <CommentSection postId={Number(postId)} />

      {/* Similar Articles — fixed to right margin on wide screens, below content otherwise */}
      {post.content && (
        <aside className="similar-aside mt-8">
          <SimilarArticles
            title={post.title}
            content={post.content}
            topicHints={post.topicHints}
          />
        </aside>
      )}
    </div>
  );
}
