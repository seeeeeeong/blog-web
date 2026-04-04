import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { adminApi } from "../api/admin";
import { postApi } from "../api/post";
import type { PostSummary } from "../types";
import { useAlert } from "../contexts/useAlert";
import { PAGINATION } from "../constants/pagination";
import { formatDate } from "../utils/format";
import Spinner from "../components/common/Spinner";

type FilterType = "all" | "published" | "draft";

export default function AdminPostsPage() {
  const [posts, setPosts] = useState<PostSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(0);
  const [hasNext, setHasNext] = useState(false);
  const [filter, setFilter] = useState<FilterType>("all");
  const { showError } = useAlert();

  useEffect(() => { setCurrentPage(0); }, [filter]);

  const loadPosts = useCallback(async () => {
    try {
      setLoading(true);
      if (filter === "draft") {
        const data = await postApi.getDraftPosts(currentPage, PAGINATION.ADMIN_POSTS_PER_PAGE);
        setPosts(data.content); setHasNext(data.hasNext || false); return;
      }
      if (filter === "published") {
        const data = await adminApi.getAllPosts(currentPage, PAGINATION.ADMIN_POSTS_PER_PAGE);
        setPosts(data.content); setHasNext(data.hasNext || false); return;
      }
      const [published, draft] = await Promise.all([
        adminApi.getAllPosts(currentPage, PAGINATION.ADMIN_POSTS_PER_PAGE),
        postApi.getDraftPosts(currentPage, PAGINATION.ADMIN_POSTS_PER_PAGE),
      ]);
      const merged = [...published.content, ...draft.content]
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      setPosts(merged);
      setHasNext((published.hasNext || false) || (draft.hasNext || false));
    } catch {
      showError("게시글 목록을 불러오지 못했습니다.");
    } finally {
      setLoading(false);
    }
  }, [currentPage, filter, showError]);

  useEffect(() => { void loadPosts(); }, [loadPosts]);

  const handleDelete = async (postId: number) => {
    try { await adminApi.deletePost(postId); await loadPosts(); }
    catch { showError("게시글 삭제에 실패했습니다."); }
  };

  return (
    <div className="animate-fade-in">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold">Admin Posts</h2>
        <Link to="/posts/create" className="text-xs font-medium text-accent-text bg-accent px-3 py-1.5 rounded-md hover:opacity-80 transition-opacity">
          + New Post
        </Link>
      </div>

      {/* Filters */}
      <div className="flex gap-1.5 mb-5">
        {(["all", "published", "draft"] as FilterType[]).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-3.5 py-1 rounded text-xs font-medium transition-colors ${
              filter === f ? "bg-accent text-accent-text" : "bg-surface-alt text-ink-light hover:bg-surface-hover hover:text-ink"
            }`}
          >
            {f}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="py-8"><Spinner /></div>
      ) : posts.length === 0 ? (
        <div className="py-8 text-ink-light text-sm">No posts found.</div>
      ) : (
        <>
          {posts.map((post) => (
            <div key={post.id} className="flex items-center gap-3 py-3 border-b border-ink-ghost text-sm group">
              <Link to={`/posts/${post.id}`} className="flex-1 min-w-0 font-medium truncate group-hover:opacity-70 transition-opacity">
                {post.title}
              </Link>
              <span className={`text-[10px] font-semibold px-2 py-0.5 rounded shrink-0 ${
                post.status === "DRAFT" ? "bg-yellow-100 text-draft" : "bg-green-50 text-success"
              }`}>
                {post.status.toLowerCase()}
              </span>
              <span className="font-mono text-xs text-ink-faint shrink-0 hidden sm:block">{post.viewCount}</span>
              <span className="text-xs text-ink-lighter shrink-0 hidden sm:block w-20 text-right">{formatDate(post.createdAt)}</span>
              <div className="flex gap-2 shrink-0 text-xs">
                <Link to={`/posts/${post.id}/edit`} className="text-info hover:opacity-70">edit</Link>
                <button onClick={() => handleDelete(post.id)} className="text-danger hover:opacity-70">del</button>
              </div>
            </div>
          ))}

          <div className="text-ink-light text-xs mt-4">{posts.length} posts &middot; Page {currentPage + 1}</div>

          {(currentPage > 0 || hasNext) && (
            <div className="flex gap-6 mt-3 text-xs">
              <button onClick={() => setCurrentPage(p => Math.max(0, p - 1))} disabled={currentPage === 0} className="text-ink hover:opacity-60 disabled:text-ink-faint disabled:cursor-not-allowed">&larr; prev</button>
              <button onClick={() => setCurrentPage(p => p + 1)} disabled={!hasNext} className="text-ink hover:opacity-60 disabled:text-ink-faint disabled:cursor-not-allowed">next &rarr;</button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
