import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { postApi } from "../../../storage/post/postApi";
import type { PostSummary } from "../../domain/post";
import { useAlert } from "../../support/contexts/useAlert";
import { PAGINATION } from "../../support/constants";
import { formatDate } from "../../support/converter/format";
import { Spinner } from "../components/common/Spinner";
import { PaginationControls } from "../components/common/PaginationControls";

type FilterType = "all" | "published" | "draft";

export function AdminPostsPage() {
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
        const data = await postApi.getPosts(currentPage, PAGINATION.ADMIN_POSTS_PER_PAGE);
        setPosts(data.content); setHasNext(data.hasNext || false); return;
      }
      const [published, draft] = await Promise.all([
        postApi.getPosts(currentPage, PAGINATION.ADMIN_POSTS_PER_PAGE),
        postApi.getDraftPosts(currentPage, PAGINATION.ADMIN_POSTS_PER_PAGE),
      ]);
      const merged = [...published.content, ...draft.content]
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      setPosts(merged);
      setHasNext((published.hasNext || false) || (draft.hasNext || false));
    } catch {
      showError("Failed to load posts.");
    } finally {
      setLoading(false);
    }
  }, [currentPage, filter, showError]);

  useEffect(() => { void loadPosts(); }, [loadPosts]);

  const handleDelete = async (postId: number) => {
    try { await postApi.deletePost(postId); await loadPosts(); }
    catch { showError("Failed to delete post."); }
  };

  return (
    <div className="animate-fade-in">
      <div className="flex items-center justify-between mb-5">
        <div>
          <div className="text-xs text-ink-faint mb-1">
            <span className="text-term-blue">~/blog</span> <span className="text-term-green">$</span> <span className="text-term-amber">admin</span> --posts
          </div>
          <h2 className="text-sm font-bold text-term-white">Admin Posts</h2>
        </div>
        <Link to="/posts/create" className="text-[11px] font-medium text-panel bg-term-green px-2.5 py-1 rounded hover:opacity-80 transition-opacity">
          + new
        </Link>
      </div>

      {/* Filters */}
      <div className="flex gap-1 mb-5">
        {(["all", "published", "draft"] as FilterType[]).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-2.5 py-1 rounded text-[11px] font-medium transition-colors ${
              filter === f
                ? "bg-term-green text-panel"
                : "bg-surface text-ink-faint hover:text-term-green hover:border-term-green border border-ink-ghost"
            }`}
          >
            {f}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="py-8"><Spinner /></div>
      ) : posts.length === 0 ? (
        <div className="py-8 text-ink-faint text-xs">No posts found.</div>
      ) : (
        <>
          {posts.map((post) => (
            <div key={post.id} className="flex items-center gap-3 py-2.5 border-b border-ink-ghost text-xs group">
              <Link to={`/posts/${post.id}`} className="flex-1 min-w-0 font-medium text-term-white truncate group-hover:text-term-green transition-colors">
                {post.title}
              </Link>
              <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded border shrink-0 ${
                post.status === "DRAFT"
                  ? "text-term-amber border-[var(--c-term-amber-dim)]"
                  : "text-term-green border-term-green-dim"
              }`}>
                {post.status.toLowerCase()}
              </span>
              <span className="text-[11px] text-ink-faint shrink-0 hidden sm:block w-20 text-right">{formatDate(post.createdAt)}</span>
              <div className="flex gap-2 shrink-0 text-[11px]">
                <Link to={`/posts/${post.id}/edit`} className="text-term-blue hover:opacity-70">edit</Link>
                <button onClick={() => handleDelete(post.id)} className="text-danger hover:opacity-70">del</button>
              </div>
            </div>
          ))}

          <PaginationControls
            currentPage={currentPage}
            hasNext={hasNext}
            totalItems={posts.length}
            onPrev={() => setCurrentPage(p => Math.max(0, p - 1))}
            onNext={() => setCurrentPage(p => p + 1)}
          />
        </>
      )}
    </div>
  );
}
