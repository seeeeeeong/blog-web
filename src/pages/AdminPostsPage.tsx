import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { adminApi } from "../api/admin";
import { postApi } from "../api/post";
import type { Post } from "../types";
import { useAlert } from "../contexts/AlertContext";
import PageLayout from "../components/common/PageLayout";
import { PAGINATION } from "../constants/pagination";
import { formatShortDate } from "../utils/format";

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

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <div className="w-8 h-8 border-2 border-tertiary border-t-primary rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <PageLayout title="Admin">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 sm:mb-10 gap-4">
          <div className="flex items-center gap-3 flex-wrap">
            <button
              onClick={() => setFilter("all")}
              className={`btn-interactive px-4 sm:px-6 py-2.5 sm:py-3 text-xs sm:text-sm font-mono border transition-all-smooth tracking-wider uppercase shadow-[1px_1px_0_#232324] hover:shadow-[2px_2px_0_#232324] hover:-translate-y-0.5 active:translate-y-0 ${
                filter === "all"
                  ? "bg-primary text-white border-primary"
                  : "bg-whitesmoke text-secondary border-primary hover:bg-primary hover:text-white"
              }`}
            >
              ALL
            </button>
            <button
              onClick={() => setFilter("published")}
              className={`btn-interactive px-4 sm:px-6 py-2.5 sm:py-3 text-xs sm:text-sm font-mono border transition-all-smooth tracking-wider uppercase shadow-[1px_1px_0_#232324] hover:shadow-[2px_2px_0_#232324] hover:-translate-y-0.5 active:translate-y-0 ${
                filter === "published"
                  ? "bg-primary text-white border-primary"
                  : "bg-whitesmoke text-secondary border-primary hover:bg-primary hover:text-white"
              }`}
            >
              PUBLISHED
            </button>
            <button
              onClick={() => setFilter("draft")}
              className={`btn-interactive px-4 sm:px-6 py-2.5 sm:py-3 text-xs sm:text-sm font-mono border transition-all-smooth tracking-wider uppercase shadow-[1px_1px_0_#232324] hover:shadow-[2px_2px_0_#232324] hover:-translate-y-0.5 active:translate-y-0 ${
                filter === "draft"
                  ? "bg-primary text-white border-primary"
                  : "bg-whitesmoke text-secondary border-primary hover:bg-primary hover:text-white"
              }`}
            >
              DRAFT
            </button>
          </div>
          <Link
            to="/posts/create"
            className="btn-interactive inline-flex items-center gap-2 px-4 sm:px-6 py-2.5 sm:py-3 bg-primary text-white text-xs sm:text-sm font-mono hover:bg-accent-green hover:text-primary border border-primary tracking-wider uppercase shadow-[1px_1px_0_#232324] hover:shadow-[2px_2px_0_#232324] hover:-translate-y-0.5 active:translate-y-0 transition-all-smooth font-semibold"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
            </svg>
            NEW POST
          </Link>
        </div>

        <div className="bg-whitesmoke border border-primary shadow-[1px_1px_0_#232324] transition-all-smooth hover:shadow-[2px_2px_0_#232324] overflow-x-auto">
          <table className="w-full table-fixed text-left font-mono">
            <thead className="border-b border-primary bg-white">
              <tr>
                <th className="w-5/12 p-4 sm:p-5 text-xs sm:text-sm text-secondary font-semibold tracking-widest uppercase">TITLE</th>
                <th className="w-2/12 p-4 sm:p-5 text-xs sm:text-sm text-secondary font-semibold tracking-widest uppercase">STATUS</th>
                <th className="w-1/12 p-4 sm:p-5 text-xs sm:text-sm text-secondary font-semibold tracking-widest uppercase">VIEWS</th>
                <th className="w-2/12 p-4 sm:p-5 text-xs sm:text-sm text-secondary font-semibold tracking-widest uppercase">DATE</th>
                <th className="w-2/12 p-4 sm:p-5 text-xs sm:text-sm text-secondary font-semibold text-right tracking-widest uppercase">ACTIONS</th>
              </tr>
            </thead>
            <tbody>
              {posts.map((post) => (
                <tr key={post.id} className="border-b border-border last:border-b-0 hover:bg-white transition-all-smooth">
                  <td className="p-4 sm:p-5 text-xs sm:text-sm">
                    <Link to={`/posts/${post.id}`} className="text-primary hover:text-secondary truncate block transition-all-smooth font-medium">
                      {post.title}
                    </Link>
                  </td>
                  <td className="p-4 sm:p-5 text-secondary text-xs sm:text-sm uppercase tracking-wider font-medium">
                    {post.status}
                  </td>
                  <td className="p-4 sm:p-5 text-tertiary text-xs sm:text-sm">{post.viewCount}</td>
                  <td className="p-4 sm:p-5 text-tertiary text-xs sm:text-sm">
                    {formatShortDate(post.createdAt)}
                  </td>
                  <td className="p-4 sm:p-5 text-right text-xs sm:text-sm">
                    <div className="flex justify-end items-center gap-4 sm:gap-5">
                      <Link to={`/posts/${post.id}/edit`} className="text-tertiary hover:text-primary transition-all-smooth" title="Edit">
                        <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.5L16.732 3.732z" /></svg>
                      </Link>
                      <button onClick={() => handleDelete(post.id)} className="text-tertiary hover:text-red-600 transition-all-smooth" title="Delete">
                        <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {(currentPage > 0 || hasNext) && (
          <div className="flex justify-center items-center gap-6 sm:gap-8 mt-8 sm:mt-10 pt-8 sm:pt-10 border-t border-primary text-xs sm:text-sm font-mono tracking-wider">
            <button
              onClick={() => setCurrentPage((prev) => Math.max(0, prev - 1))}
              disabled={currentPage === 0}
              className="btn-interactive px-6 sm:px-8 py-3 bg-whitesmoke border border-primary text-primary hover:bg-primary hover:text-white transition-all-smooth disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:bg-whitesmoke disabled:hover:text-primary uppercase shadow-[1px_1px_0_#232324] hover:shadow-[2px_2px_0_#232324] hover:-translate-y-0.5 active:translate-y-0 font-semibold"
            >
              ← PREV
            </button>
            <span className="text-secondary uppercase font-bold tracking-widest">
              PAGE {currentPage + 1}
            </span>
            <button
              onClick={() => setCurrentPage((prev) => prev + 1)}
              disabled={!hasNext}
              className="btn-interactive px-6 sm:px-8 py-3 bg-whitesmoke border border-primary text-primary hover:bg-primary hover:text-white transition-all-smooth disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:bg-whitesmoke disabled:hover:text-primary uppercase shadow-[1px_1px_0_#232324] hover:shadow-[2px_2px_0_#232324] hover:-translate-y-0.5 active:translate-y-0 font-semibold"
            >
              NEXT →
            </button>
          </div>
        )}
      </div>
    </PageLayout>
  );
}