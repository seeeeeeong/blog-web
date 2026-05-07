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
    <div className="px-6 md:px-10 py-7 md:py-8">
      <div className="flex items-center gap-1.5 text-[12.5px] text-muted mb-5">
        <Link to="/" className="hover:text-ink transition-colors">seeeeeeong.log</Link>
        <span className="text-faint">/</span>
        <span className="text-ink font-medium">admin · posts</span>
      </div>

      <div className="flex items-end justify-between pb-5 border-b border-rule mb-6 gap-4 flex-wrap">
        <div>
          <h1 className="text-[28px] md:text-[30px] font-bold tracking-[-0.02em] leading-tight text-ink mb-1.5">
            All posts
          </h1>
          <p className="text-[13.5px] text-muted">
            {posts.length} in view
          </p>
        </div>
        <Link
          to="/posts/create"
          className="h-9 px-4 rounded-md bg-accent text-[var(--c-on-accent)] text-[13px] font-medium hover:opacity-90 inline-flex items-center transition-opacity"
        >
          + New post
        </Link>
      </div>

      <div className="flex items-center gap-2 mb-5 px-3 py-2 bg-paper-2 border border-rule rounded-md">
        {(["all", "published", "draft"] as FilterType[]).map((f) => {
          const active = filter === f;
          const label = f.charAt(0).toUpperCase() + f.slice(1);
          return (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-2.5 py-1 rounded-full text-[12.5px] border transition-colors ${
                active
                  ? "bg-paper text-ink border-rule font-medium"
                  : "text-muted border-transparent hover:bg-paper hover:text-ink hover:border-rule"
              }`}
            >
              {label}
            </button>
          );
        })}
      </div>

      {loading ? (
        <div className="py-16 flex justify-center">
          <Spinner />
        </div>
      ) : posts.length === 0 ? (
        <p className="py-16 text-center text-[14px] text-muted">
          No posts found.
        </p>
      ) : (
        <>
          <div className="rounded-md border border-rule overflow-hidden">
            <table className="w-full text-left text-[14px]">
              <thead className="bg-paper-2">
                <tr>
                  <th className="text-left px-3 py-2 text-[11.5px] font-semibold text-faint uppercase tracking-[0.06em] border-b border-rule w-[52%]">
                    Title
                  </th>
                  <th className="text-left px-3 py-2 text-[11.5px] font-semibold text-faint uppercase tracking-[0.06em] border-b border-rule w-[14%] hidden md:table-cell">
                    Status
                  </th>
                  <th className="text-left px-3 py-2 text-[11.5px] font-semibold text-faint uppercase tracking-[0.06em] border-b border-rule w-[18%]">
                    Created
                  </th>
                  <th className="text-right px-3 py-2 text-[11.5px] font-semibold text-faint uppercase tracking-[0.06em] border-b border-rule w-[16%]">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {posts.map((post) => {
                  const isDraft = post.status === "DRAFT";
                  return (
                    <tr key={post.id} className="border-b border-rule last:border-b-0 hover:bg-paper-2 transition-colors">
                      <td className="px-3 py-2.5 align-middle">
                        <Link
                          to={`/posts/${post.id}`}
                          className={`text-[14px] font-medium hover:text-accent transition-colors truncate block ${isDraft ? "text-muted" : "text-ink"}`}
                        >
                          {post.title}
                        </Link>
                      </td>
                      <td className="px-3 py-2.5 align-middle hidden md:table-cell">
                        <span className={`status-chip ${isDraft ? "draft" : "published"}`}>
                          <span className="dot" />
                          {isDraft ? "Draft" : "Published"}
                        </span>
                      </td>
                      <td className="px-3 py-2.5 align-middle font-meta text-[12px] text-muted">
                        {formatDate(post.createdAt)}
                      </td>
                      <td className="px-3 py-2.5 align-middle">
                        <div className="flex items-center justify-end gap-1">
                          <Link
                            to={`/posts/${post.id}/edit`}
                            className="h-7 px-2 inline-flex items-center rounded-md text-[12px] text-muted hover:bg-chip hover:text-ink transition-colors"
                          >
                            Edit
                          </Link>
                          <button
                            onClick={() => handleDelete(post.id)}
                            className="h-7 px-2 inline-flex items-center rounded-md text-[12px] text-muted hover:bg-[var(--c-input)] hover:text-danger transition-colors"
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
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
