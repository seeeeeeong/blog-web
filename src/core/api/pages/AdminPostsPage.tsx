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
    <div className="max-w-[1100px] mx-auto px-6 md:px-10 py-10 animate-fade-in">
      <div className="flex items-baseline justify-between mb-8 pb-6 border-b border-rule">
        <div>
          <p className="eyebrow mb-2">Admin</p>
          <h1 className="font-display text-[36px] font-medium tracking-[-0.02em] text-ink leading-none mb-2">
            Posts
          </h1>
          <p className="font-meta text-[11px] text-muted tracking-[0.08em] uppercase">
            {posts.length} in view
          </p>
        </div>
        <Link
          to="/posts/create"
          className="h-10 px-5 bg-ink text-paper font-meta text-[11px] uppercase tracking-[0.12em] hover:bg-accent inline-flex items-center transition-colors"
        >
          New post
        </Link>
      </div>

      <div className="flex gap-1 mb-6">
        {(["all", "published", "draft"] as FilterType[]).map((f) => {
          const active = filter === f;
          return (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`h-8 px-3 font-meta text-[11px] uppercase tracking-[0.1em] transition-colors border ${
                active
                  ? "border-ink text-ink bg-paper-2"
                  : "border-transparent text-muted hover:text-ink"
              }`}
            >
              {f}
            </button>
          );
        })}
      </div>

      {loading ? (
        <div className="py-16 flex justify-center">
          <Spinner />
        </div>
      ) : posts.length === 0 ? (
        <p className="py-16 text-center font-body italic text-[15px] text-muted">
          No posts found.
        </p>
      ) : (
        <>
          <div className="border border-rule">
            {posts.map((post, idx) => (
              <div
                key={post.id}
                className={`flex items-center gap-4 px-4 py-3.5 group ${
                  idx < posts.length - 1 ? "border-b border-rule-soft" : ""
                }`}
              >
                <Link
                  to={`/posts/${post.id}`}
                  className="flex-1 min-w-0 font-display text-[16px] font-medium text-ink truncate group-hover:text-accent transition-colors"
                >
                  {post.title}
                </Link>
                <span
                  className={`shrink-0 font-meta text-[10px] uppercase tracking-[0.1em] px-2 py-[3px] border ${
                    post.status === "DRAFT"
                      ? "border-accent text-accent"
                      : "border-rule text-muted"
                  }`}
                >
                  {post.status === "DRAFT" ? "Draft" : "Published"}
                </span>
                <span className="font-meta text-[11px] text-muted tracking-[0.05em] hidden sm:block w-24 text-right shrink-0">
                  {formatDate(post.createdAt)}
                </span>
                <div className="flex gap-3 shrink-0 font-meta text-[11px] uppercase tracking-[0.08em]">
                  <Link
                    to={`/posts/${post.id}/edit`}
                    className="text-muted hover:text-ink transition-colors"
                  >
                    Edit
                  </Link>
                  <button
                    onClick={() => handleDelete(post.id)}
                    className="text-muted hover:text-danger transition-colors"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>

          <PaginationControls
            currentPage={currentPage}
            hasNext={hasNext}
            totalItems={posts.length}
            onPrev={() => setCurrentPage((p) => Math.max(0, p - 1))}
            onNext={() => setCurrentPage((p) => p + 1)}
          />
        </>
      )}
    </div>
  );
}
