import { useCallback, useEffect, useMemo, useState } from "react";
import { postApi } from "../../../storage/post/postApi";
import { categoryApi } from "../../../storage/category/categoryApi";
import type { PostSummary } from "../../domain/post";
import type { Category } from "../../domain/category";
import { Link, useSearchParams } from "react-router-dom";
import { Spinner } from "../components/common/Spinner";
import { PAGINATION } from "../../support/constants";
import { calculateWordCount } from "../../support/converter/format";

function formatDateShort(iso: string): string {
  const d = new Date(iso);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function readMinutes(excerpt: string | null | undefined, title: string): number {
  const base = (excerpt ?? "").length + title.length;
  const words = Math.max(300, calculateWordCount(excerpt ?? "") * 4 + base);
  return Math.max(3, Math.round(words / 220));
}

export function HomePage() {
  const [searchParams] = useSearchParams();
  const categoryParam = searchParams.get("category");
  const qParam = searchParams.get("q")?.trim() ?? "";
  const [posts, setPosts] = useState<PostSummary[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [page, setPage] = useState(0);
  const [hasNext, setHasNext] = useState(false);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    categoryApi.getCategories().then(setCategories).catch(() => {});
  }, []);

  const categoryName = useCallback(
    (categoryId: number) => {
      return categories.find((c) => c.id === categoryId)?.name ?? "etc";
    },
    [categories],
  );

  const loadPage = useCallback(
    async (targetPage: number, append: boolean) => {
      try {
        if (append) setLoadingMore(true);
        else setLoading(true);
        setError(null);
        const catId = categoryParam ? Number(categoryParam) : undefined;
        const data = qParam
          ? await postApi.searchPosts(qParam, catId, targetPage, PAGINATION.POSTS_PER_PAGE)
          : catId
            ? await postApi.getPostsByCategory(catId, targetPage, PAGINATION.POSTS_PER_PAGE)
            : await postApi.getPosts(targetPage, PAGINATION.POSTS_PER_PAGE);
        setPosts((prev) => (append ? [...prev, ...(data.content ?? [])] : data.content ?? []));
        setHasNext(data.hasNext ?? false);
        setPage(targetPage);
      } catch {
        setError("Failed to load posts.");
      } finally {
        setLoading(false);
        setLoadingMore(false);
      }
    },
    [categoryParam, qParam],
  );

  useEffect(() => {
    setPosts([]);
    setPage(0);
    void loadPage(0, false);
  }, [loadPage]);

  const isSearching = Boolean(qParam);
  const activeCategory = useMemo(() => {
    if (!categoryParam) return null;
    return categories.find((c) => c.id === Number(categoryParam)) ?? null;
  }, [categoryParam, categories]);

  const pageTitle = isSearching
    ? `Search: "${qParam}"`
    : activeCategory
      ? activeCategory.name
      : "SEEEEEEONG.LOG";

  const showFilteredBreadcrumb = isSearching || Boolean(activeCategory);

  return (
    <div className="px-6 md:px-10 py-7 md:py-8">
      {/* Breadcrumbs (only for filtered views) */}
      {showFilteredBreadcrumb && (
        <div className="flex items-center gap-1.5 text-[12.5px] text-muted mb-5">
          <Link to="/" className="hover:text-ink transition-colors">
            seeeeeeong.log
          </Link>
          <span className="text-faint">/</span>
          <span className="text-ink font-medium">
            {isSearching ? "search" : activeCategory?.name}
          </span>
        </div>
      )}

      {/* Page header */}
      <div className="pb-5 border-b border-rule mb-6">
        <h1 className={`text-[28px] md:text-[30px] font-bold leading-tight text-ink mb-1.5 ${!activeCategory && !isSearching ? "tracking-[0.04em]" : "tracking-[-0.02em]"}`}>
          {pageTitle}
        </h1>
        <div className="flex items-center gap-3 mt-3 text-[12px] text-muted">
          <span className="inline-flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-success" />
            {posts.length} posts
          </span>
          <span className="text-faint">·</span>
          <span>updated recently</span>
        </div>
      </div>

      {/* Filter bar */}
      <div className="flex items-center gap-2 mb-5 px-3 py-2 bg-paper-2 border border-rule rounded-md flex-wrap">
        <FilterChip to="/" active={!categoryParam && !isSearching}>
          All
        </FilterChip>
        {categories.slice(0, 6).map((cat) => (
          <FilterChip
            key={cat.id}
            to={`/?category=${cat.id}`}
            active={categoryParam === String(cat.id)}
          >
            {cat.name}
          </FilterChip>
        ))}
        <span className="ml-auto text-[12px] text-muted flex items-center gap-1.5">
          Sort: <span className="font-semibold text-ink">Updated ↓</span>
        </span>
      </div>

      {/* Content */}
      {loading && posts.length === 0 ? (
        <div className="py-24 flex justify-center">
          <Spinner />
        </div>
      ) : error ? (
        <div className="py-20 text-center">
          <p className="text-danger text-[13.5px] mb-4">{error}</p>
          <button
            onClick={() => loadPage(0, false)}
            className="h-8 px-3 border border-rule rounded-md font-meta text-[11.5px] text-muted hover:border-ink hover:text-ink transition-colors"
          >
            retry
          </button>
        </div>
      ) : posts.length === 0 ? (
        <div className="py-24 text-center text-[14px] text-muted">
          No matching entries{isSearching && ` for "${qParam}"`}.
        </div>
      ) : (
        <>
          <div className="rounded-md border border-rule overflow-hidden">
            <table className="w-full text-left text-[14px]">
              <thead className="bg-paper-2">
                <tr>
                  <Th className="w-[44%]">Title</Th>
                  <Th className="w-[14%] hidden md:table-cell">Category</Th>
                  <Th className="w-[12%] hidden md:table-cell">Status</Th>
                  <Th className="w-[16%]">Updated</Th>
                </tr>
              </thead>
              <tbody>
                {posts.map((post) => (
                  <PostRow
                    key={post.id}
                    post={post}
                    categoryName={categoryName(post.categoryId)}
                  />
                ))}
              </tbody>
            </table>
          </div>

          {hasNext && (
            <div className="mt-6 flex items-center justify-between text-[12.5px] text-muted">
              <span>Page {page + 1}</span>
              <button
                onClick={() => loadPage(page + 1, true)}
                disabled={loadingMore}
                className="h-8 px-3 border border-rule rounded-md hover:border-ink hover:text-ink transition-colors disabled:opacity-40"
              >
                {loadingMore ? "loading…" : "Load more →"}
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}

function Th({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <th
      className={`text-left px-3 py-2 text-[11.5px] font-semibold text-faint uppercase tracking-[0.06em] border-b border-rule ${className ?? ""}`}
    >
      {children}
    </th>
  );
}

function FilterChip({
  to,
  active,
  children,
}: {
  to: string;
  active: boolean;
  children: React.ReactNode;
}) {
  return (
    <Link
      to={to}
      className={`px-2.5 py-1 rounded-full text-[12.5px] border transition-colors ${
        active
          ? "bg-paper text-ink border-rule font-medium"
          : "text-muted border-transparent hover:bg-paper hover:text-ink hover:border-rule"
      }`}
    >
      {children}
    </Link>
  );
}

function PostRow({
  post,
  categoryName,
}: {
  post: PostSummary;
  categoryName: string;
}) {
  const isDraft = post.status === "DRAFT";
  const readTime = readMinutes(post.excerpt, post.title);
  return (
    <tr className="border-b border-rule last:border-b-0 hover:bg-paper-2 transition-colors">
      <td className="px-3 py-3 align-top">
        <Link to={`/posts/${post.id}`} className="block group">
          <div className="flex items-start gap-2">
            <span className="text-faint text-[13px] pt-[2px]">📄</span>
            <div className="min-w-0">
              <div className={`text-[14.5px] font-medium leading-snug group-hover:text-accent transition-colors ${isDraft ? "text-muted" : "text-ink"}`}>
                {post.title}
              </div>
              {post.excerpt && (
                <div className="text-[13px] text-muted mt-1 line-clamp-2">
                  {post.excerpt}
                </div>
              )}
              <div className="mt-1.5 font-meta text-[10.5px] text-faint">
                {readTime} min read
              </div>
            </div>
          </div>
        </Link>
      </td>
      <td className="px-3 py-3 align-top hidden md:table-cell">
        <span className="font-meta text-[12px] text-muted">{categoryName}</span>
      </td>
      <td className="px-3 py-3 align-top hidden md:table-cell">
        <span className={`status-chip ${isDraft ? "draft" : "published"}`}>
          <span className="dot" />
          {isDraft ? "Draft" : "Published"}
        </span>
      </td>
      <td className="px-3 py-3 align-top font-meta text-[12px] text-muted">
        {formatDateShort(post.updatedAt ?? post.createdAt)}
      </td>
    </tr>
  );
}
