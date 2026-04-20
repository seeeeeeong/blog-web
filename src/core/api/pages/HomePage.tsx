import { useCallback, useEffect, useMemo, useState } from "react";
import { postApi } from "../../../storage/post/postApi";
import { categoryApi } from "../../../storage/category/categoryApi";
import type { PostSummary } from "../../domain/post";
import type { Category } from "../../domain/category";
import { Link, useSearchParams } from "react-router-dom";
import { Spinner } from "../components/common/Spinner";
import { PAGINATION } from "../../support/constants";
import { calculateWordCount } from "../../support/converter/format";

const MONTHS_EN = ["JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"];

function parseIsoDate(iso: string) {
  const d = new Date(iso);
  return {
    day: String(d.getDate()).padStart(2, "0"),
    month: MONTHS_EN[d.getMonth()],
    year: d.getFullYear(),
  };
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
  const isFiltered = Boolean(categoryParam) || isSearching;

  const activeCategory = useMemo(() => {
    if (!categoryParam) return null;
    return categories.find((c) => c.id === Number(categoryParam)) ?? null;
  }, [categoryParam, categories]);

  const [featured, ...rest] = posts;

  return (
    <div className="px-6 md:px-10 pt-10 pb-20 animate-fade-in">
      <div className="grid md:grid-cols-[200px_1fr] gap-10 md:gap-14">
        <aside className="hidden md:block">
          <div className="eyebrow mb-4 pb-2.5 border-b border-rule">
            {isSearching ? "Search" : "Categories"}
          </div>
          <div className="flex flex-col gap-0.5 mb-10">
            <CategoryLink
              to="/"
              active={!categoryParam && !isSearching}
              label="All posts"
              count={posts.length}
            />
            {categories.map((cat) => (
              <CategoryLink
                key={cat.id}
                to={`/?category=${cat.id}`}
                active={categoryParam === String(cat.id)}
                label={cat.name}
              />
            ))}
          </div>

          <div className="eyebrow mb-3 pb-2 border-b border-rule-soft">About</div>
          <p className="text-[14px] text-muted leading-[1.6] font-body">
            A slow blog on software, books, and the long interval between them.
            Updated when there's something worth saying.{" "}
            <em className="text-ink-soft not-italic font-body italic">— seeeeeeong</em>
          </p>
        </aside>

        <section className="min-w-0">
          {isSearching && (
            <div className="mb-10 pb-6 border-b border-rule">
              <p className="eyebrow mb-2">Search results</p>
              <h1 className="font-display text-[32px] md:text-[40px] font-medium tracking-[-0.025em] leading-[1.05] text-ink">
                “{qParam}”
              </h1>
              <p className="font-meta text-[11px] text-muted mt-3 tracking-[0.08em] uppercase">
                {posts.length} {posts.length === 1 ? "result" : "results"}
              </p>
            </div>
          )}

          {activeCategory && !isSearching && (
            <div className="mb-10 pb-6 border-b border-rule">
              <p className="eyebrow mb-2">Category</p>
              <h1 className="font-display text-[32px] md:text-[40px] font-medium tracking-[-0.025em] leading-[1.05] text-ink">
                {activeCategory.name}
              </h1>
            </div>
          )}

          {loading && posts.length === 0 ? (
            <div className="py-24 flex justify-center">
              <Spinner />
            </div>
          ) : error ? (
            <div className="py-24 text-center">
              <p className="text-danger text-[14px] mb-4">{error}</p>
              <button
                onClick={() => loadPage(0, false)}
                className="h-8 px-3 border border-rule rounded-sm font-meta text-[11px] text-muted hover:border-ink hover:text-ink transition-colors"
              >
                :retry
              </button>
            </div>
          ) : posts.length === 0 ? (
            <div className="py-24 text-center font-body text-[15px] text-muted italic">
              No matching entries{isSearching && ` for "${qParam}"`}.
            </div>
          ) : (
            <>
              {!isFiltered && featured && (
                <FeaturedArticle
                  post={featured}
                  categoryName={categoryName(featured.categoryId)}
                />
              )}

              <div>
                {(isFiltered ? posts : rest).map((post) => (
                  <PostRow
                    key={post.id}
                    post={post}
                    categoryName={categoryName(post.categoryId)}
                  />
                ))}
              </div>

              {hasNext && (
                <div className="mt-14 pt-7 border-t-2 border-ink flex items-center justify-between font-meta text-[11px] uppercase tracking-[0.1em]">
                  <span className="text-muted">
                    Page {page + 1}
                  </span>
                  <button
                    onClick={() => loadPage(page + 1, true)}
                    disabled={loadingMore}
                    className="text-muted hover:text-ink transition-colors disabled:opacity-50"
                  >
                    {loadingMore ? "loading…" : "Older →"}
                  </button>
                </div>
              )}

              {!hasNext && posts.length > 3 && (
                <div className="mt-16 text-center font-display text-rule text-[22px] tracking-[1em] pl-[1em]">
                  ❦❦❦
                </div>
              )}
            </>
          )}
        </section>
      </div>
    </div>
  );
}

function CategoryLink({
  to,
  active,
  label,
  count,
}: {
  to: string;
  active: boolean;
  label: string;
  count?: number;
}) {
  return (
    <Link
      to={to}
      className={`flex justify-between items-center py-[7px] pl-2.5 pr-2 text-[15px] transition-colors border-l-2 font-body ${
        active
          ? "text-ink border-accent font-medium"
          : "text-ink-soft border-transparent hover:text-ink hover:bg-paper-2"
      }`}
    >
      <span>{label}</span>
      {count !== undefined && (
        <span className="font-meta text-[11px] text-faint">
          {String(count).padStart(2, "0")}
        </span>
      )}
    </Link>
  );
}

function FeaturedArticle({
  post,
  categoryName,
}: {
  post: PostSummary;
  categoryName: string;
}) {
  const { day, month } = parseIsoDate(post.createdAt);
  const readTime = readMinutes(post.excerpt, post.title);
  return (
    <article className="grid md:grid-cols-[1.1fr_1fr] gap-8 md:gap-10 items-start pb-11 mb-11 border-b border-rule">
      <div>
        <div className="font-meta text-[10px] tracking-[0.3em] uppercase text-accent mb-3.5">
          Featured · {categoryName}
        </div>
        <h1 className="font-display text-[40px] md:text-[48px] font-normal leading-[1.05] tracking-[-0.025em] mb-4 text-balance">
          <Link to={`/posts/${post.id}`} className="text-ink hover:text-accent transition-colors">
            {post.title}
          </Link>
        </h1>
        {post.excerpt && (
          <p className="font-body italic text-[17px] text-ink-soft leading-[1.6] mb-5">
            {post.excerpt}
          </p>
        )}
        <div className="flex flex-wrap items-center gap-5 font-meta text-[11px] tracking-[0.08em] uppercase text-muted">
          <span className="text-accent">{categoryName}</span>
          <span>{month} {day}</span>
          <span>{readTime} min read</span>
        </div>
      </div>
      <Link to={`/posts/${post.id}`} className="block">
        <div className="aspect-[4/3] thumb-hatch flex items-end p-4">
          <span className="font-meta text-[10px] tracking-[0.15em] uppercase text-muted bg-paper px-2 py-[3px] border border-rule">
            cover · 4:3
          </span>
        </div>
      </Link>
    </article>
  );
}

function PostRow({
  post,
  categoryName,
}: {
  post: PostSummary;
  categoryName: string;
}) {
  const { day, month, year } = parseIsoDate(post.createdAt);
  const readTime = readMinutes(post.excerpt, post.title);
  return (
    <Link
      to={`/posts/${post.id}`}
      className="grid grid-cols-[64px_1fr] md:grid-cols-[80px_1fr_110px] gap-6 md:gap-[30px] py-6 rule-dotted-bottom items-start transition-[padding] duration-200 hover:pl-2"
    >
      <div className="font-meta text-[11px] text-muted tracking-[0.05em] leading-[1.5] pt-1">
        <span className="block font-display text-[26px] text-ink font-medium leading-none tracking-[-0.02em] mb-1">
          {day}
        </span>
        {month} {year}
      </div>
      <div className="min-w-0">
        <h2 className="font-display text-[22px] md:text-[24px] font-medium leading-[1.2] tracking-[-0.015em] mb-2 text-balance text-ink">
          {post.title}
        </h2>
        {post.excerpt && (
          <p className="font-body text-[15.5px] text-ink-soft leading-[1.6] mb-3 line-clamp-2">
            {post.excerpt}
          </p>
        )}
        <div className="flex gap-4 font-meta text-[11px] tracking-[0.08em] uppercase text-muted">
          <span className="text-accent">{categoryName}</span>
          <span>{readTime} min</span>
        </div>
      </div>
      <div className="hidden md:block aspect-square thumb-hatch" />
    </Link>
  );
}
