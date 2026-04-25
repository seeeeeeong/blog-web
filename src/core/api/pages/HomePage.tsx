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

function formatRelative(iso: string): string {
  const d = new Date(iso).getTime();
  const days = Math.floor((Date.now() - d) / 86_400_000);
  if (days <= 0) return "today";
  if (days === 1) return "yesterday";
  if (days < 30) return `${days} days ago`;
  const months = Math.floor(days / 30);
  if (months < 12) return `${months} month${months === 1 ? "" : "s"} ago`;
  const years = Math.floor(months / 12);
  return `${years} year${years === 1 ? "" : "s"} ago`;
}

function readMinutes(excerpt: string | null | undefined, title: string): number {
  const base = (excerpt ?? "").length + title.length;
  const words = Math.max(300, calculateWordCount(excerpt ?? "") * 4 + base);
  return Math.max(3, Math.round(words / 220));
}

function coverInitial(text: string): string {
  const trimmed = text.trim();
  if (!trimmed) return "·";
  return trimmed[0].toUpperCase();
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

  const isHomeFresh = !isSearching && !activeCategory;
  const featured = isHomeFresh && posts.length > 0 ? posts[0] : null;
  const recent = isHomeFresh && featured ? posts.slice(1) : posts;
  const latestUpdate = posts[0]?.updatedAt ?? posts[0]?.createdAt ?? null;

  if (loading && posts.length === 0) {
    return (
      <div className="py-24 flex justify-center">
        <Spinner />
      </div>
    );
  }

  if (error) {
    return (
      <div className="py-20 text-center">
        <p className="text-danger text-[13.5px] mb-4">{error}</p>
        <button
          onClick={() => loadPage(0, false)}
          className="h-8 px-3 border border-rule rounded-md font-meta text-[11.5px] text-muted hover:border-ink hover:text-ink transition-colors"
        >
          retry
        </button>
      </div>
    );
  }

  return (
    <div>
      {isHomeFresh ? (
        <>
          <Hero totalPosts={posts.length} latestUpdate={latestUpdate} />
          {featured && (
            <FeaturedSection post={featured} categoryName={categoryName(featured.categoryId)} />
          )}
          <RecentSection
            posts={recent}
            categories={categories}
            categoryName={categoryName}
            categoryParam={categoryParam}
            isSearching={false}
            qParam={qParam}
            hasNext={hasNext}
            loadingMore={loadingMore}
            page={page}
            onLoadMore={() => loadPage(page + 1, true)}
          />
        </>
      ) : (
        <FilteredView
          posts={posts}
          categories={categories}
          categoryName={categoryName}
          categoryParam={categoryParam}
          isSearching={isSearching}
          qParam={qParam}
          activeCategory={activeCategory}
          hasNext={hasNext}
          loadingMore={loadingMore}
          page={page}
          onLoadMore={() => loadPage(page + 1, true)}
        />
      )}
    </div>
  );
}

function Hero({
  totalPosts,
  latestUpdate,
}: {
  totalPosts: number;
  latestUpdate: string | null;
}) {
  return (
    <section className="px-6 md:px-11 pt-12 md:pt-14 pb-10 border-b border-rule bg-gradient-to-b from-accent-soft to-paper">
      <div className="inline-flex items-center gap-2 pl-1 pr-3 py-1 mb-5 bg-paper border border-rule rounded-full text-[12px] text-muted shadow-[0_1px_2px_rgba(0,0,0,0.03)]">
        <span className="px-2 py-[2px] rounded-full bg-accent text-paper font-meta text-[10px] font-bold tracking-wider">
          NEW
        </span>
        <span>Long-form notes — read the latest essay</span>
      </div>
      <h1 className="text-[28px] md:text-[34px] font-bold leading-[1.18] tracking-[-0.025em] text-ink mb-3 max-w-[600px]">
        Notes from a backend engineer who reads more than they ship.
      </h1>
      <p className="text-[14.5px] md:text-[15.5px] text-muted leading-[1.6] max-w-[560px] mb-5">
        Long-form notes on Spring, Postgres, RAG, and the design decisions that survive contact with production.
      </p>
      <div className="flex items-center gap-3 text-[13px] text-muted flex-wrap">
        <span className="inline-flex items-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-success" />
          <b className="text-ink font-semibold">{totalPosts}</b> posts
        </span>
        <span className="text-faint">·</span>
        <span>
          updated <b className="text-ink font-semibold">{latestUpdate ? formatRelative(latestUpdate) : "—"}</b>
        </span>
      </div>
    </section>
  );
}

function FeaturedSection({
  post,
  categoryName,
}: {
  post: PostSummary;
  categoryName: string;
}) {
  return (
    <div className="px-6 md:px-11 pt-9">
      <SectionHeader
        title="Featured"
        mark="★"
        right={
          <Link to="/" className="text-[12.5px] text-muted hover:text-accent transition-colors">
            See all featured →
          </Link>
        }
      />
      <Link
        to={`/posts/${post.id}`}
        className="grid grid-cols-[140px_1fr] md:grid-cols-[180px_1fr] gap-6 md:gap-7 items-center p-5 md:p-6 bg-paper border border-rule rounded-xl shadow-[0_1px_3px_rgba(0,0,0,0.02)] hover:-translate-y-[2px] hover:shadow-[0_8px_22px_rgba(0,0,0,0.06)] hover:border-accent transition-all group"
      >
        <div className="aspect-square rounded-[10px] grid place-items-center text-paper font-meta font-semibold text-[28px] md:text-[32px] bg-gradient-to-br from-accent to-[#5b8bff] shadow-[0_8px_22px_rgba(10,102,194,0.22)]">
          {coverInitial(categoryName)}
        </div>
        <div className="min-w-0">
          <div className="flex items-center gap-2.5 text-[11.5px] text-muted uppercase tracking-[0.06em] font-medium mb-2 flex-wrap">
            <span className="text-accent font-semibold">{categoryName}</span>
            <span className="text-faint">·</span>
            <span>{readMinutes(post.excerpt, post.title)} min read</span>
            <span className="text-faint">·</span>
            <span className="font-meta normal-case tracking-normal">
              {formatDateShort(post.updatedAt ?? post.createdAt)}
            </span>
          </div>
          <h3 className="text-[19px] md:text-[22px] font-bold leading-[1.25] tracking-[-0.014em] text-ink mb-2">
            {post.title}
          </h3>
          {post.excerpt && (
            <p className="text-[13.5px] md:text-[14px] text-muted leading-[1.6] mb-3 line-clamp-3">
              {post.excerpt}
            </p>
          )}
          <span className="inline-flex items-center gap-1 text-[12.5px] text-accent font-medium group-hover:underline">
            Read essay →
          </span>
        </div>
      </Link>
    </div>
  );
}

function RecentSection({
  posts,
  categories,
  categoryName,
  categoryParam,
  isSearching,
  qParam,
  hasNext,
  loadingMore,
  page,
  onLoadMore,
}: {
  posts: PostSummary[];
  categories: Category[];
  categoryName: (id: number) => string;
  categoryParam: string | null;
  isSearching: boolean;
  qParam: string;
  hasNext: boolean;
  loadingMore: boolean;
  page: number;
  onLoadMore: () => void;
}) {
  return (
    <div className="px-6 md:px-11 pt-9 pb-14">
      <SectionHeader title="Recent" />
      <FilterBar categories={categories} categoryParam={categoryParam} isSearching={isSearching} />
      {posts.length === 0 ? (
        <div className="py-16 text-center text-[14px] text-muted">
          No matching entries{qParam && ` for "${qParam}"`}.
        </div>
      ) : (
        <PostsTable posts={posts} categoryName={categoryName} />
      )}
      {hasNext && (
        <div className="mt-6 flex items-center justify-between text-[12.5px] text-muted">
          <span>Page {page + 1}</span>
          <button
            onClick={onLoadMore}
            disabled={loadingMore}
            className="h-8 px-3 border border-rule rounded-md hover:border-ink hover:text-ink transition-colors disabled:opacity-40"
          >
            {loadingMore ? "loading…" : "Load more →"}
          </button>
        </div>
      )}
    </div>
  );
}

function FilteredView({
  posts,
  categories,
  categoryName,
  categoryParam,
  isSearching,
  qParam,
  activeCategory,
  hasNext,
  loadingMore,
  page,
  onLoadMore,
}: {
  posts: PostSummary[];
  categories: Category[];
  categoryName: (id: number) => string;
  categoryParam: string | null;
  isSearching: boolean;
  qParam: string;
  activeCategory: Category | null;
  hasNext: boolean;
  loadingMore: boolean;
  page: number;
  onLoadMore: () => void;
}) {
  const pageTitle = isSearching ? `Search: "${qParam}"` : activeCategory?.name ?? "";
  return (
    <div className="px-6 md:px-11 py-7 md:py-8">
      <div className="flex items-center gap-1.5 text-[12.5px] text-muted mb-5">
        <Link to="/" className="hover:text-ink transition-colors">
          seeeeeeong.log
        </Link>
        <span className="text-faint">/</span>
        <span className="text-ink font-medium">
          {isSearching ? "search" : activeCategory?.name}
        </span>
      </div>
      <div className="pb-5 border-b border-rule mb-6">
        <h1 className="text-[26px] md:text-[28px] font-bold leading-tight tracking-[-0.02em] text-ink">
          {pageTitle}
        </h1>
        <div className="flex items-center gap-3 mt-3 text-[12px] text-muted">
          <span className="inline-flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-success" />
            {posts.length} {posts.length === 1 ? "post" : "posts"}
          </span>
        </div>
      </div>
      <FilterBar categories={categories} categoryParam={categoryParam} isSearching={isSearching} />
      {posts.length === 0 ? (
        <div className="py-16 text-center text-[14px] text-muted">
          No matching entries{isSearching && ` for "${qParam}"`}.
        </div>
      ) : (
        <PostsTable posts={posts} categoryName={categoryName} />
      )}
      {hasNext && (
        <div className="mt-6 flex items-center justify-between text-[12.5px] text-muted">
          <span>Page {page + 1}</span>
          <button
            onClick={onLoadMore}
            disabled={loadingMore}
            className="h-8 px-3 border border-rule rounded-md hover:border-ink hover:text-ink transition-colors disabled:opacity-40"
          >
            {loadingMore ? "loading…" : "Load more →"}
          </button>
        </div>
      )}
    </div>
  );
}

function SectionHeader({
  title,
  mark,
  right,
}: {
  title: string;
  mark?: string;
  right?: React.ReactNode;
}) {
  return (
    <div className="flex items-baseline justify-between pb-3.5 mb-4 border-b border-rule">
      <h2 className="text-[13px] font-semibold uppercase tracking-[0.06em] text-ink">
        {mark && <span className="text-accent mr-1.5">{mark}</span>}
        {title}
      </h2>
      {right}
    </div>
  );
}

function FilterBar({
  categories,
  categoryParam,
  isSearching,
}: {
  categories: Category[];
  categoryParam: string | null;
  isSearching: boolean;
}) {
  return (
    <div className="flex items-center gap-1 mb-4 p-1 bg-paper-2 border border-rule rounded-md flex-wrap">
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
    </div>
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
      className={`px-3 py-[5px] rounded-[5px] text-[12.5px] transition-colors ${
        active
          ? "bg-paper text-ink font-medium shadow-[0_1px_2px_rgba(0,0,0,0.04)]"
          : "text-muted hover:text-ink"
      }`}
    >
      {children}
    </Link>
  );
}

function PostsTable({
  posts,
  categoryName,
}: {
  posts: PostSummary[];
  categoryName: (id: number) => string;
}) {
  return (
    <div className="rounded-lg border border-rule overflow-hidden">
      {posts.map((post, i) => (
        <PostRow
          key={post.id}
          post={post}
          categoryName={categoryName(post.categoryId)}
          isLast={i === posts.length - 1}
        />
      ))}
    </div>
  );
}

function PostRow({
  post,
  categoryName,
  isLast,
}: {
  post: PostSummary;
  categoryName: string;
  isLast: boolean;
}) {
  const isDraft = post.status === "DRAFT";
  return (
    <Link
      to={`/posts/${post.id}`}
      className={`grid grid-cols-[1fr_90px] md:grid-cols-[1fr_100px_110px_80px] gap-3 md:gap-3.5 items-center px-4 py-3 cursor-pointer hover:bg-paper-2 transition-colors group ${
        isLast ? "" : "border-b border-rule-soft"
      }`}
    >
      <div className="flex items-start gap-2 min-w-0">
        <span className="text-faint text-[13px] pt-[2px] shrink-0">📄</span>
        <div className="min-w-0">
          <div
            className={`text-[14px] font-medium leading-snug group-hover:text-accent transition-colors ${
              isDraft ? "text-muted" : "text-ink"
            }`}
          >
            {post.title}
          </div>
          {post.excerpt && (
            <div className="text-[12.5px] text-muted mt-1 line-clamp-1">
              {post.excerpt}
            </div>
          )}
        </div>
      </div>
      <div className="hidden md:block">
        <span className="tag-chip">{categoryName}</span>
      </div>
      <div className="hidden md:block">
        <span className={`status-chip ${isDraft ? "draft" : "published"}`}>
          <span className="dot" />
          {isDraft ? "Draft" : "Published"}
        </span>
      </div>
      <div className="font-meta text-[11px] text-muted text-right">
        {formatDateShort(post.updatedAt ?? post.createdAt).slice(5)}
      </div>
    </Link>
  );
}
