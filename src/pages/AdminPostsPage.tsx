import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { adminApi } from "../api/admin";
import type { Post } from "../types";
import { useAlert } from "../contexts/AlertContext";

export default function AdminPostsPage() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const { showSuccess, showError, showConfirm } = useAlert();

  useEffect(() => {
    loadPosts();
  }, [currentPage]);

  const loadPosts = async () => {
    try {
      setLoading(true);
      const data = await adminApi.getAllPosts(currentPage, 20);
      setPosts(data.posts);
      setTotalPages(data.totalPages);
    } catch (error) {
      console.error("게시글 로딩 실패:", error);
      showError("게시글을 불러오는데 실패했습니다.");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (postId: number) => {
    const confirmed = await showConfirm("정말 삭제하시겠습니까?");
    if (!confirmed) return;

    try {
      await adminApi.deletePost(postId);
      showSuccess("삭제되었습니다.");
      loadPosts();
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

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="container mx-auto px-4 sm:px-8 py-12 max-w-7xl">
        {/* Header */}
        <div className="flex justify-between items-end mb-12 border-b border-gray-900 pb-4">
          <div>
            <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-2 font-mono">
              Admin
            </h1>
            <p className="text-xs font-mono text-gray-600">
              전체 {posts.length}개의 게시글
            </p>
          </div>

          <Link
            to="/posts/create"
            className="px-4 py-2 border border-gray-900 text-sm font-mono text-gray-900 hover:bg-gray-900 hover:text-gray-100 transition-colors"
          >
            NEW POST
          </Link>
        </div>

        {/* Posts Table */}
        <div className="space-y-4">
          {posts.map((post) => (
            <div
              key={post.id}
              className="border-t border-gray-900 pt-4 hover:bg-gray-200 transition-colors -mx-4 sm:-mx-8 px-4 sm:px-8"
            >
              <div className="grid grid-cols-1 sm:grid-cols-[1fr_auto] gap-4">
                <div>
                  <Link
                    to={`/posts/${post.id}`}
                    className="text-lg sm:text-xl font-bold text-gray-900 hover:underline font-mono block mb-2"
                  >
                    {post.title}
                  </Link>
                  <div className="flex items-center gap-3 text-xs font-mono text-gray-600">
                    <span className="px-2 py-1 border border-gray-900 inline-block">
                      {post.status === "DRAFT" ? "DRAFT" : "PUBLISHED"}
                    </span>
                    <span>조회 {post.viewCount}회</span>
                    <span>
                      {new Date(post.createdAt).toLocaleDateString("ko-KR", {
                        year: "numeric",
                        month: "2-digit",
                        day: "2-digit",
                      })}
                    </span>
                  </div>
                </div>
                <div className="flex items-start gap-4 text-sm font-mono">
                  <Link
                    to={`/posts/${post.id}/edit`}
                    className="text-gray-900 hover:underline"
                  >
                    EDIT
                  </Link>
                  <button
                    onClick={() => handleDelete(post.id)}
                    className="text-gray-900 hover:underline"
                  >
                    DELETE
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-center items-center gap-4 mt-12 text-sm font-mono">
            <button
              onClick={() => setCurrentPage((prev) => Math.max(0, prev - 1))}
              disabled={currentPage === 0}
              className="text-gray-900 hover:underline disabled:opacity-50 disabled:cursor-not-allowed"
            >
              ← PREV
            </button>

            <span className="text-gray-900">
              {currentPage + 1} / {totalPages}
            </span>

            <button
              onClick={() =>
                setCurrentPage((prev) => Math.min(totalPages - 1, prev + 1))
              }
              disabled={currentPage >= totalPages - 1}
              className="text-gray-900 hover:underline disabled:opacity-50 disabled:cursor-not-allowed"
            >
              NEXT →
            </button>
          </div>
        )}
      </div>
    </div>
  );
}