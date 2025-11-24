import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { postApi } from "../api/post";
import type { Post } from "../types";
import { useAlert } from "../contexts/AlertContext";
import MarkdownViewer from "../components/editor/MarkdownViewer";
import CommentSection from "../components/comment/CommentSection";

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
      console.error("게시글 로딩 실패:", error);
      showError("게시글을 찾을 수 없습니다.");
      navigate("/");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    const confirmed = await showConfirm("정말 삭제하시겠습니까?");
    if (!confirmed) return;
    
    try {
      await postApi.deletePost(Number(postId));
      showSuccess("삭제되었습니다.");
      navigate("/");
    } catch (error) {
      console.error("삭제 실패:", error);
      showError("삭제에 실패했습니다.");
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
      <div className="container mx-auto px-6 py-16 max-w-3xl text-center">
        <p className="text-gray-600 mb-6">게시글을 찾을 수 없습니다.</p>
        <Link 
          to="/" 
          className="text-gray-900 hover:text-gray-600 underline"
        >
          홈으로 돌아가기
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <div className="bg-gray-100 border-b border-gray-900">
        <div className="container mx-auto px-4 sm:px-8 py-4 max-w-7xl">
          <div className="flex justify-between items-center">
            <Link
              to="/"
              className="text-sm font-mono text-gray-900 hover:underline"
            >
              ← BACK
            </Link>

            {isAuthor && (
              <div className="flex items-center gap-4 text-sm font-mono">
                <Link
                  to={`/posts/${postId}/edit`}
                  className="text-gray-900 hover:underline"
                >
                  EDIT
                </Link>
                <button
                  onClick={handleDelete}
                  className="text-gray-900 hover:underline"
                >
                  DELETE
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Article */}
      <article className="container mx-auto px-4 sm:px-8 py-12 max-w-7xl">
        <div className="border-t border-gray-900 pt-8 mb-12">
          {/* Meta */}
          <div className="mb-8">
            <div className="flex items-center gap-3 text-xs font-mono text-gray-900">
              <time>
                {new Date(post.createdAt).toLocaleDateString("ko-KR", {
                  year: "numeric",
                  month: "2-digit",
                  day: "2-digit",
                })}
              </time>
              <span>·</span>
              <span>조회 {post.viewCount}회</span>
            </div>
          </div>

          {/* Title */}
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 mb-12 leading-tight font-mono">
            {post.title}
          </h1>

          {/* Content - Markdown Viewer */}
          <div className="prose prose-lg max-w-none font-mono">
            <MarkdownViewer content={post.content} />
          </div>
        </div>
      </article>

      {/* Comments Section */}
      <div className="bg-gray-100 border-t border-gray-900">
        <div className="container mx-auto px-4 sm:px-8 py-12 max-w-7xl">
          <CommentSection postId={Number(postId)} />
        </div>
      </div>
    </div>
  );
}