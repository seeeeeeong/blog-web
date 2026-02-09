import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { adminApi } from "../api/admin";
import { postApi } from "../api/post";
import type { Post } from "../types";
import { useAlert } from "../contexts/AlertContext";
import PageLayout from "../components/common/PageLayout";
import { PAGINATION } from "../constants/pagination";
import { formatDate } from "../utils/format";
import Spinner from "../components/common/Spinner";

type FilterType = "all" | "published" | "draft";

export default function AdminPostsPage() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(0);
  const [hasNext, setHasNext] = useState(false);
  const [filter, setFilter] = useState<FilterType>("all");
  const { showSuccess, showError, showConfirm } = useAlert();

  useEffect(() => {
    setCurrentPage(0);
  }, [filter]);

  useEffect(() => {
    loadPosts();
  }, [currentPage, filter]);

  const loadPosts = async () => {
    try {
      setLoading(true);
      const data = filter === "draft"
        ? await postApi.getDraftPosts(currentPage, PAGINATION.ADMIN_POSTS_PER_PAGE)
        : await adminApi.getAllPosts(currentPage, PAGINATION.ADMIN_POSTS_PER_PAGE);

      const filteredPosts = filter === "published"
        ? data.content.filter((post: Post) => post.status === "PUBLISHED")
        : data.content;

      setPosts(filteredPosts);
      setHasNext(data.hasNext || false);
    } catch {
      showError("Failed to load posts.");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (postId: number) => {
    const confirmed = await showConfirm("Are you sure you want to delete this post?");
    if (!confirmed) return;

    try {
      await adminApi.deletePost(postId);
      showSuccess("Deleted successfully.");
      loadPosts();
    } catch {
      showError("Failed to delete post.");
    }
  };

  return (
    <PageLayout title="Admin">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-end justify-between mb-8">
          <h2 className="text-2xl font-bold text-text tracking-tight">
            / ADMIN
          </h2>
          <Link
            to="/posts/create"
            className="font-mono text-sm text-gray-800 hover:text-text underline"
          >
            + NEW POST
          </Link>
        </div>

        {/* Filter */}
        <div className="flex items-center gap-4 mb-6 border-b border-gray-500 pb-3 font-mono text-sm">
          <span className="text-muted">/ FILTER</span>
          {(["all", "published", "draft"] as FilterType[]).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`uppercase ${
                filter === f
                  ? "text-text font-semibold underline"
                  : "text-gray-800 hover:text-text"
              }`}
            >
              {f}
            </button>
          ))}
        </div>

        {/* Post Table */}
        {loading ? (
          <div className="flex justify-center py-16">
            <Spinner />
          </div>
        ) : (
          <>
            <div className="w-full">
              {/* Table Header */}
              <div className="flex items-center font-mono text-sm text-muted border-b border-gray-500 pb-2">
                <span className="w-5/12">TITLE</span>
                <span className="w-2/12">STATUS</span>
                <span className="w-1/12">VIEWS</span>
                <span className="w-2/12">DATE</span>
                <span className="w-2/12 text-right">ACTIONS</span>
              </div>

              {/* Table Rows */}
              {posts.length === 0 ? (
                <div className="py-12 text-center">
                  <p className="text-sm font-mono text-muted">No posts found.</p>
                </div>
              ) : (
                posts.map((post) => (
                  <div
                    key={post.id}
                    className="flex items-center border-b border-gray-300 py-3 text-sm hover:bg-hover/50 transition-colors"
                  >
                    <div className="w-5/12 pr-4">
                      <Link
                        to={`/posts/${post.id}`}
                        className="text-text hover:underline truncate block font-medium"
                      >
                        {post.title}
                      </Link>
                    </div>
                    <div className="w-2/12 font-mono text-muted text-xs uppercase">
                      {post.status}
                    </div>
                    <div className="w-1/12 font-mono text-muted text-xs">
                      {post.viewCount}
                    </div>
                    <div className="w-2/12 font-mono text-muted text-xs">
                      {formatDate(post.createdAt)}
                    </div>
                    <div className="w-2/12 flex justify-end gap-4 font-mono text-xs">
                      <Link
                        to={`/posts/${post.id}/edit`}
                        className="text-gray-800 hover:text-text underline"
                      >
                        EDIT
                      </Link>
                      <button
                        onClick={() => handleDelete(post.id)}
                        className="text-primary hover:text-red-700 underline"
                      >
                        DEL
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Pagination */}
            {(currentPage > 0 || hasNext) && (
              <div className="flex justify-center items-center gap-8 mt-10 pt-6 font-mono text-sm">
                <button
                  onClick={() => setCurrentPage((prev) => Math.max(0, prev - 1))}
                  disabled={currentPage === 0}
                  className="text-gray-800 hover:text-text underline disabled:opacity-30 disabled:no-underline disabled:cursor-not-allowed"
                >
                  &larr; PREV
                </button>
                <span className="text-muted">
                  PAGE {currentPage + 1}
                </span>
                <button
                  onClick={() => setCurrentPage((prev) => prev + 1)}
                  disabled={!hasNext}
                  className="text-gray-800 hover:text-text underline disabled:opacity-30 disabled:no-underline disabled:cursor-not-allowed"
                >
                  NEXT &rarr;
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </PageLayout>
  );
}
