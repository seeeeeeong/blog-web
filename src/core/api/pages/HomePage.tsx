import { useCallback, useEffect, useMemo, useState } from "react";
import { postApi } from "../../../storage/post/postApi";
import { categoryApi } from "../../../storage/category/categoryApi";
import type { PostSummary } from "../../domain/post";
import type { Category } from "../../domain/category";
import { Link, useSearchParams } from "react-router-dom";
import { Spinner } from "../components/common/Spinner";
import { PAGINATION } from "../../support/constants";

const ASCII_LOGO = String.raw`   __                          __
  / /___  __  ___________  ____ _/ /
 / / __ \/ / / / ___/ __ \/ __ \`/ /
/ / /_/ / /_/ / /  / / / / /_/ / /
\___/\____/\__,_/_/  /_/ /_/\__,_/_/   v2.1.0`;

const CAT_COLOR: Record<string, string> = {
  engineering: "text-cat-blue",
  backend: "text-cat-blue",
  cs: "text-cat-blue",
  frontend: "text-cat-purple",
  infra: "text-cat-amber",
  notes: "text-cat-pink",
  spring: "text-cat-green",
  performance: "text-cat-green",
  database: "text-cat-amber",
};

function catClass(name: string): string {
  return CAT_COLOR[name.toLowerCase()] ?? "text-cat-amber";
}

function formatSize(excerpt: string | null | undefined, title: string): string {
  const base = (excerpt ?? "").length + title.length;
  const kb = Math.max(0.5, base / 100);
  return `${kb.toFixed(1)}k`;
}

function formatIsoDate(iso: string): string {
  const d = new Date(iso);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${dd}`;
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

  const activeCategoryName = useMemo(() => {
    if (!categoryParam) return null;
    return categories.find((c) => c.id === Number(categoryParam))?.name.toLowerCase() ?? null;
  }, [categoryParam, categories]);

  const today = useMemo(() => {
    const d = new Date();
    return `${String(d.getMonth() + 1).padStart(2, "0")}.${String(d.getDate()).padStart(2, "0")}`;
  }, []);

  const listTitle = isSearching
    ? `./posts --grep "${qParam}"`
    : activeCategoryName
      ? `./posts --cat ${activeCategoryName}`
      : "./posts --recent";

  return (
    <div className="animate-fade-in">
      {/* Hero */}
      {!isFiltered && (
        <section className="border-b border-dashed border-border-mid">
          <div className="max-w-[1200px] mx-auto px-6 md:px-8 py-12 md:py-16">
            <pre className="text-cat-green text-[11px] md:text-[12px] leading-[1.2] mb-7 opacity-90 whitespace-pre overflow-x-auto">
{ASCII_LOGO}
            </pre>
            <h1 className="text-[26px] md:text-[32px] font-semibold tracking-tight text-ink-bright mb-4">
              <span className="prompt-green">#</span> Lee Sin Seong — Engineering Notes
              <span className="term-cursor" />
            </h1>
            <p className="text-muted text-[14px] max-w-[640px]">
              백엔드 엔지니어가 남기는 기술 로그. 실무에서 깨진 것들, 고친 과정, 그리고 남은 질문들의 기록.
            </p>
          </div>
        </section>
      )}

      {/* Status grid */}
      {!isFiltered && (
        <section className="border-b border-dashed border-border-mid">
          <div className="max-w-[1200px] mx-auto grid grid-cols-2 md:grid-cols-4">
            <StatusCell label="posts" value={`${posts.length}${hasNext ? "+" : ""}`} />
            <StatusCell label="categories" value={String(categories.length || "—")} />
            <StatusCell label="uptime" value="584d" accent />
            <StatusCell label="last_build" value={today} />
          </div>
        </section>
      )}

      {/* Section head */}
      <div className="max-w-[1200px] mx-auto px-6 md:px-8 pt-10 pb-5 border-b border-dashed border-border-mid flex items-baseline justify-between gap-4">
        <h2 className="text-[13px] text-cat-amber">
          <span className="text-muted">$ ls </span>
          {listTitle}
        </h2>
        <div className="flex items-center gap-3 text-[12px] text-faint">
          {isFiltered && (
            <Link to="/" className="text-muted hover:text-cat-green transition-colors">
              :q
            </Link>
          )}
          <span>
            {posts.length} entr{posts.length === 1 ? "y" : "ies"}
            {hasNext ? " (more)" : ""}
          </span>
        </div>
      </div>

      {/* Category filter strip */}
      {!isSearching && categories.length > 0 && (
        <div className="max-w-[1200px] mx-auto px-6 md:px-8 py-3 border-b border-border-dim flex flex-wrap items-center gap-x-3 gap-y-1 text-[12px]">
          <span className="text-faint">filter:</span>
          <Link
            to="/"
            className={!categoryParam ? "text-cat-amber" : "text-muted hover:text-cat-amber transition-colors"}
          >
            all
          </Link>
          {categories.map((cat) => {
            const active = categoryParam === String(cat.id);
            return (
              <Link
                key={cat.id}
                to={`/?category=${cat.id}`}
                className={active ? "text-cat-amber" : "text-muted hover:text-cat-amber transition-colors"}
              >
                {cat.name.toLowerCase()}
              </Link>
            );
          })}
        </div>
      )}

      {/* Body */}
      <div className="max-w-[1200px] mx-auto">
        {loading && posts.length === 0 ? (
          <div className="py-24 flex justify-center">
            <Spinner />
          </div>
        ) : error ? (
          <div className="py-24 text-center">
            <p className="text-danger text-[13px] mb-4">
              <span className="prompt-pink">!</span> {error}
            </p>
            <button
              onClick={() => loadPage(0, false)}
              className="h-8 px-3 border border-border-mid text-[12px] text-muted hover:text-cat-green hover:border-cat-green transition-colors"
            >
              :retry
            </button>
          </div>
        ) : posts.length === 0 ? (
          <div className="py-24 text-center text-[13px] text-faint">
            <span className="prompt-muted">$</span> ls: no matching entries
            {isSearching && <span> for "{qParam}"</span>}
          </div>
        ) : (
          <div>
            {posts.map((post, idx) => {
              const cat = categorySlug(post.categoryId);
              return (
                <Link
                  key={post.id}
                  to={`/posts/${post.id}`}
                  className="grid grid-cols-[28px_1fr_90px_28px] md:grid-cols-[28px_120px_110px_1fr_70px_110px_28px] gap-x-3 md:gap-x-4 items-center px-6 md:px-8 py-3 border-b border-border-dim hover:bg-raised group transition-colors"
                >
                  <span className="text-faint text-[12px]">{String(idx + 1).padStart(2, "0")}</span>
                  <span className="hidden md:inline text-muted text-[11px]">-rw-r--r--</span>
                  <span className={`hidden md:inline text-[12px] ${catClass(cat)} truncate`}>{cat}</span>
                  <span className="text-ink-bright text-[13px] group-hover:text-cat-green truncate">
                    {post.title}
                  </span>
                  <span className="hidden md:inline text-muted text-[11px] text-right">
                    {formatSize(post.excerpt, post.title)}
                  </span>
                  <span className="text-muted text-[11px] text-right md:text-left truncate">
                    {formatIsoDate(post.createdAt)}
                  </span>
                  <span className="text-faint text-right">❯</span>
                </Link>
              );
            })}

            {hasNext && (
              <div className="flex justify-center py-10">
                <button
                  onClick={() => loadPage(page + 1, true)}
                  disabled={loadingMore}
                  className="h-9 px-4 border border-border-mid text-[12px] text-muted hover:text-cat-green hover:border-cat-green transition-colors disabled:opacity-50"
                >
                  {loadingMore ? (
                    <>
                      <span className="prompt-green">$</span> loading…
                    </>
                  ) : (
                    <>
                      <span className="prompt-green">$</span> ls --more
                    </>
                  )}
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function StatusCell({ label, value, accent }: { label: string; value: string; accent?: boolean }) {
  return (
    <div className="px-6 md:px-8 py-5 border-r border-dashed border-border-mid last:border-r-0 md:[&:nth-child(2)]:border-r md:[&:nth-child(4)]:border-r-0 max-md:[&:nth-child(2n)]:border-r-0">
      <div className="text-[11px] text-muted mb-1.5">
        <span className="prompt-green">▸ </span>
        {label}
      </div>
      <div className="text-[22px] text-ink-bright font-medium">
        {accent ? <span className="text-cat-green">{value}</span> : value}
      </div>
    </div>
  );
}

