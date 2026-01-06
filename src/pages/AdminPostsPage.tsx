import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { adminApi } from "../api/admin";
import { postApi } from "../api/post";
import type { Post } from "../types";
import { useAlert } from "../contexts/AlertContext";
import PageLayout from "../components/common/PageLayout";

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
      let data;

      if (filter === "draft") {
        data = await postApi.getDraftPosts(currentPage, 20);
      } else {
        data = await adminApi.getAllPosts(currentPage, 20);
      }

      if (filter === "published") {
        const filteredPosts = data.content.filter(
          (post: Post) => post.status === "PUBLISHED"
        );
        setPosts(filteredPosts);
      } else {
        setPosts(data.content);
      }

      setHasNext(data.hasNext || false);
    } catch (error) {
      console.error("Failed to load posts:", error);
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

  return (
    <PageLayout title="Admin">
      <div className="flex justify-between items-center mb-8">
        <div className="flex items-center gap-2 p-1 bg-gray-100 rounded-lg">
          <button
            onClick={() => setFilter("all")}
            className={`px-4 py-1.5 text-xs font-mono rounded-md transition-colors ${
              filter === "all"
                ? "bg-white text-gray-900 shadow-sm"
                : "text-gray-500 hover:text-gray-900"
            }`}
          >
            All
          </button>
          <button
            onClick={() => setFilter("published")}
            className={`px-4 py-1.5 text-xs font-mono rounded-md transition-colors ${
              filter === "published"
                ? "bg-white text-gray-900 shadow-sm"
                : "text-gray-500 hover:text-gray-900"
            }`}
          >
            Published
          </button>
          <button
            onClick={() => setFilter("draft")}
            className={`px-4 py-1.5 text-xs font-mono rounded-md transition-colors ${
              filter === "draft"
                ? "bg-white text-gray-900 shadow-sm"
                : "text-gray-500 hover:text-gray-900"
            }`}
          >
            Draft
          </button>
        </div>
        <Link
          to="/posts/create"
          className="inline-flex items-center gap-2 px-4 py-2 bg-gray-900 text-white text-xs font-mono hover:bg-gray-700 rounded-lg shadow-sm"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
          </svg>
          New Post
        </Link>
      </div>

      <div className="bg-white border border-gray-200 rounded-xl shadow-sm">
        <table className="w-full table-fixed text-left font-mono">
          <thead className="border-b border-gray-200">
            <tr>
              <th className="w-5/12 p-4 text-xs text-gray-500 font-medium">TITLE</th>
              <th className="w-2/12 p-4 text-xs text-gray-500 font-medium">STATUS</th>
              <th className="w-1/12 p-4 text-xs text-gray-500 font-medium">VIEWS</th>
              <th className="w-2/12 p-4 text-xs text-gray-500 font-medium">DATE</th>
              <th className="w-2/12 p-4 text-xs text-gray-500 font-medium text-right">ACTIONS</th>
            </tr>
          </thead>
          <tbody>
            {posts.map((post) => (
              <tr key={post.id} className="border-b border-gray-100 last:border-b-0">
                <td className="p-4 text-sm">
                  <Link to={`/posts/${post.id}`} className="font-medium text-gray-900 hover:underline truncate block">
                    {post.title}
                  </Link>
                </td>
                <td className="p-4 text-gray-700 text-sm">
                  {post.status}
                </td>
                <td className="p-4 text-gray-500 text-sm">{post.viewCount}</td>
                <td className="p-4 text-gray-500 text-sm">
                  {new Date(post.createdAt).toLocaleDateString("en-US", { // Changed to en-US for shorter date format
                    year: 'numeric',
                    month: '2-digit',
                    day: '2-digit',
                  })}
                </td>
                <td className="p-4 text-right text-sm">
                  <div className="flex justify-end items-center gap-4">
                    <Link to={`/posts/${post.id}/edit`} className="text-gray-400 hover:text-gray-900" title="Edit">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.5L16.732 3.732z" /></svg>
                    </Link>
                    <button onClick={() => handleDelete(post.id)} className="text-gray-400 hover:text-red-600" title="Delete">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {(currentPage > 0 || hasNext) && (
        <div className="flex justify-center items-center gap-4 mt-8 pt-8 border-t border-gray-200 text-sm font-mono">
          <button
            onClick={() => setCurrentPage((prev) => Math.max(0, prev - 1))}
            disabled={currentPage === 0}
            className="text-gray-900 hover:underline disabled:opacity-30"
          >
            ← Previous
          </button>
          <span className="text-gray-600">
            Page {currentPage + 1}
          </span>
          <button
            onClick={() => setCurrentPage((prev) => prev + 1)}
            disabled={!hasNext}
            className="text-gray-900 hover:underline disabled:opacity-30"
          >
            Next →
          </button>
        </div>
      )}
    </PageLayout>
  );
}