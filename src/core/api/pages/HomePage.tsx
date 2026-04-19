import { useCallback, useEffect, useState } from "react";
import { postApi } from "../../../storage/post/postApi";
import { categoryApi } from "../../../storage/category/categoryApi";
import type { PostSummary } from "../../domain/post";
import type { Category } from "../../domain/category";
import { Link, useSearchParams } from "react-router-dom";
import { Spinner } from "../components/common/Spinner";
import { CatTag } from "../components/common/CatTag";
import { formatDateShort, formatDateLong } from "../../support/converter/format";
import { PAGINATION } from "../../support/constants";

const LATEST_COUNT = 3;

function handleShine(e: React.MouseEvent<HTMLElement>) {
  const rect = e.currentTarget.getBoundingClientRect();
  e.currentTarget.style.setProperty("--x", `${e.clientX - rect.left}px`);
  e.currentTarget.style.setProperty("--y", `${e.clientY - rect.top}px`);
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

  const categorySlug = useCallback(
    (categoryId: number) => {
      const name = categories.find((c) => c.id === categoryId)?.name ?? "etc";
      return name.toLowerCase();
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
  const isFiltered = Boolean(categoryParam) || isSearching;
  const latest = !isFiltered ? posts.slice(0, LATEST_COUNT) : [];
  const rest = isFiltered ? posts : posts.slice(LATEST_COUNT);

  return (
    <div className="animate-fade-in">
      {/* Hero */}
      {!isFiltered && (
        <section className="hero-noise border-b border-border-dim">
          <div className="max-w-[1100px] mx-auto px-6 py-20 md:py-24 relative">
            <h1 className="text-[52px] md:text-[84px] font-semibold leading-[0.95] tracking-tightest-plus mb-8 grad-text">
              Build. Break.
              <br />
              Write it down.
            </h1>
            <div className="flex items-center gap-3">
              {latest[0] && (
                <Link
                  to={`/posts/${latest[0].id}`}
                  className="h-10 px-5 rounded-md bg-white text-black text-[14px] font-medium flex items-center gap-2 hover:bg-gray-100 transition-colors"
                >
                  Read latest <span>→</span>
                </Link>
              )}
              <a
                href="#all"
                className="h-10 px-5 rounded-md border border-border-dim hover:border-border-mid text-[14px] text-ink flex items-center gap-2 font-mono transition-colors"
              >
                <span className="text-faint">$</span> browse
              </a>
            </div>
          </div>
        </section>
      )}

      <div className="max-w-[1100px] mx-auto px-6">
        {/* Search banner */}
        {isSearching && (
          <div className="pt-10 pb-2 flex items-baseline gap-3">
            <h2 className="text-[15px] font-medium text-ink">
              Results for <span className="font-mono text-muted">"{qParam}"</span>
            </h2>
            <Link
              to="/"
              className="text-[13px] text-muted hover:text-ink transition-colors"
            >
              Clear
            </Link>
          </div>
        )}

        {loading && posts.length === 0 ? (
          <div className="py-24 flex justify-center">
            <Spinner />
          </div>
        ) : error ? (
          <div className="py-24 text-center">
            <p className="text-danger text-sm mb-4">{error}</p>
            <button
              onClick={() => loadPage(0, false)}
              className="h-9 px-4 rounded-md border border-border-dim text-sm text-muted hover:text-ink"
            >
              Retry
            </button>
          </div>
        ) : posts.length === 0 ? (
          <div className="py-24 text-center text-sm text-faint">
            {isSearching ? `No posts match "${qParam}".` : "No posts yet."}
          </div>
        ) : (
          <>
            {/* Latest */}
            {latest.length > 0 && (
              <section className="py-16 border-b border-border-dim">
                <div className="flex items-baseline justify-between mb-8">
                  <h2 className="text-[15px] font-medium text-ink">Latest</h2>
                  <a href="#all" className="text-[13px] text-muted hover:text-ink transition-colors">
                    View all →
                  </a>
                </div>

                <Link
                  to={`/posts/${latest[0].id}`}
                  onMouseMove={handleShine}
                  className="shine block border border-border-dim rounded-xl p-6 md:p-8 mb-4 hover:border-border-mid transition-colors"
                >
                  <div className="flex items-center gap-3 mb-5">
                    <CatTag name={categorySlug(latest[0].categoryId)} />
                    <span className="font-mono text-[11px] text-faint">
                      {formatDateLong(latest[0].createdAt)}
                    </span>
                  </div>
                  <h3 className="text-[24px] md:text-[32px] font-semibold tracking-tighter-plus leading-tight mb-3 text-ink">
                    {latest[0].title}
                  </h3>
                  {latest[0].excerpt && (
                    <p className="text-[15px] text-muted leading-relaxed max-w-2xl">
                      {latest[0].excerpt}
                    </p>
                  )}
                </Link>

                {latest.length > 1 && (
                  <div className="grid md:grid-cols-2 gap-4">
                    {latest.slice(1).map((post) => (
                      <Link
                        key={post.id}
                        to={`/posts/${post.id}`}
                        onMouseMove={handleShine}
                        className="shine block border border-border-dim rounded-xl p-6 hover:border-border-mid transition-colors"
                      >
                        <div className="flex items-center gap-3 mb-4">
                          <CatTag name={categorySlug(post.categoryId)} />
                          <span className="font-mono text-[11px] text-faint">
                            {formatDateShort(post.createdAt)}
                          </span>
                        </div>
                        <h3 className="text-[20px] font-semibold tracking-tight leading-snug mb-2 text-ink">
                          {post.title}
                        </h3>
                        {post.excerpt && (
                          <p className="text-[13px] text-muted leading-relaxed line-clamp-2">
                            {post.excerpt}
                          </p>
                        )}
                      </Link>
                    ))}
                  </div>
                )}
              </section>
            )}

            {/* All posts changelog */}
            {rest.length > 0 && (
              <section id="all" className={isSearching ? "pb-16 pt-4" : "py-16"}>
                {!isSearching && (
                  <div className="flex flex-wrap items-baseline justify-between gap-4 mb-8">
                    <h2 className="text-[15px] font-medium text-ink">
                      {categoryParam ? "Posts" : "All posts"}
                    </h2>
                    <div className="flex items-center gap-1 flex-wrap">
                      <Link
                        to="/"
                        className={`h-7 px-3 rounded-md text-[12px] font-mono transition-colors ${
                          !categoryParam
                            ? "bg-raised border border-border-dim text-ink"
                            : "text-muted hover:text-ink"
                        }`}
                      >
                        all
                      </Link>
                      {categories.map((cat) => {
                        const active = categoryParam === String(cat.id);
                        return (
                          <Link
                            key={cat.id}
                            to={`/?category=${cat.id}`}
                            className={`h-7 px-3 rounded-md text-[12px] font-mono transition-colors ${
                              active
                                ? "bg-raised border border-border-dim text-ink"
                                : "text-muted hover:text-ink"
                            }`}
                          >
                            {cat.name.toLowerCase()}
                          </Link>
                        );
                      })}
                    </div>
                  </div>
                )}

                <div className="relative">
                  <div className="absolute left-[80px] md:left-[110px] top-0 bottom-0 w-px bg-border-dim" />
                  {rest.map((post, idx) => (
                    <article
                      key={post.id}
                      className={`grid grid-cols-[80px_1fr] md:grid-cols-[110px_1fr] gap-6 md:gap-8 py-6 relative ${
                        idx < rest.length - 1 ? "border-b border-border-dim" : ""
                      }`}
                    >
                      <div className="font-mono text-[12px] text-faint pt-1">
                        {formatDateShort(post.createdAt)}
                      </div>
                      <div>
                        <div className="flex items-center gap-2 mb-2">
                          <CatTag name={categorySlug(post.categoryId)} />
                        </div>
                        <Link to={`/posts/${post.id}`} className="group block">
                          <h3 className="text-[18px] md:text-[20px] font-semibold tracking-tight mb-1.5 text-ink group-hover:text-muted transition-colors">
                            {post.title}
                          </h3>
                          {post.excerpt && (
                            <p className="text-[13px] text-muted leading-relaxed line-clamp-2">
                              {post.excerpt}
                            </p>
                          )}
                        </Link>
                      </div>
                    </article>
                  ))}
                </div>

                {hasNext && (
                  <div className="flex justify-center mt-12">
                    <button
                      onClick={() => loadPage(page + 1, true)}
                      disabled={loadingMore}
                      className="h-10 px-5 rounded-md border border-border-dim hover:border-border-mid text-[13px] text-muted hover:text-ink font-mono transition-colors disabled:opacity-50"
                    >
                      {loadingMore ? "Loading…" : "Load more"}
                    </button>
                  </div>
                )}
              </section>
            )}
          </>
        )}
      </div>
    </div>
  );
}
