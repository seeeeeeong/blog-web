import { useCallback, useEffect, useState } from "react";
import { postApi } from "../api/post";
import { categoryApi } from "../api/category";
import type { PostSummary, Category } from "../types";
import { Link, useSearchParams } from "react-router-dom";
import Spinner from "../components/common/Spinner";
import { formatDate } from "../utils/format";
import { PAGINATION } from "../constants/pagination";

export default function HomePage() {
  const [searchParams] = useSearchParams();
  const categoryParam = searchParams.get("category");
  const [posts, setPosts] = useState<PostSummary[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [searchKeyword, setSearchKeyword] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(0);
  const [hasNext, setHasNext] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    categoryApi.getCategories().then(setCategories).catch(() => {});
  }, []);

  const categorySlug = (categoryId: number) => {
    const name = categories.find((c) => c.id === categoryId)?.name ?? "etc";
    return name.toLowerCase();
  };

  const loadPosts = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const catId = categoryParam ? Number(categoryParam) : undefined;
      const data = searchQuery.trim()
        ? await postApi.searchPosts(searchQuery, catId, currentPage, PAGINATION.POSTS_PER_PAGE)
        : catId
          ? await postApi.getPostsByCategory(catId, currentPage, PAGINATION.POSTS_PER_PAGE)
          : await postApi.getPosts(currentPage, PAGINATION.POSTS_PER_PAGE);
      setPosts(data.content || []);
      setHasNext(data.hasNext || false);
    } catch {
      setError("Failed to load posts.");
    } finally {
      setLoading(false);
    }
  }, [currentPage, searchQuery, categoryParam]);

  useEffect(() => { setCurrentPage(0); }, [categoryParam, searchQuery]);
  useEffect(() => { void loadPosts(); }, [loadPosts]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setSearchQuery(searchKeyword.trim());
  };

  return (
    <div className="animate-fade-in">
      {/* Prompt */}
      <div className="flex items-baseline gap-2 text-xs mb-1">
        <span className="text-term-blue">~/blog</span>
        <span className="text-term-pink">git:(main)</span>
        <span className="text-term-green">$</span>
        <span className="text-term-white">ls -la posts/</span>
      </div>
      <p className="text-[11px] text-ink-faint mb-4">
        {posts.length > 0 ? `${posts.length}${hasNext ? "+" : ""} articles` : "loading..."}
        {searchQuery && <> matching &ldquo;{searchQuery}&rdquo;</>}
      </p>

      {/* Search (grep style) */}
      <form onSubmit={handleSearch} className="mb-5">
        <div className="flex items-center gap-2">
          <span className="text-term-amber text-xs flex-shrink-0">grep -i</span>
          <div className="relative flex-1">
            <input
              type="text"
              value={searchKeyword}
              onChange={(e) => setSearchKeyword(e.target.value)}
              placeholder="search posts..."
              className="w-full h-9 bg-surface border border-ink-ghost rounded px-3 text-xs text-term-white placeholder:text-ink-faint outline-none transition-colors focus:border-term-green"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => { setSearchKeyword(""); setSearchQuery(""); }}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-ink-faint hover:text-term-green text-[10px]"
              >
                clear
              </button>
            )}
          </div>
        </div>
      </form>

      {/* Posts - file listing */}
      {loading ? (
        <div className="py-12"><Spinner /></div>
      ) : error ? (
        <div className="py-8 text-danger text-xs">{error}</div>
      ) : posts.length === 0 ? (
        <div className="py-8 text-ink-faint text-xs">
          {searchQuery ? "No results found." : "No posts yet."}
        </div>
      ) : (
        <div className="flex flex-col">
          {posts.map((post) => (
            <Link
              key={post.id}
              to={`/posts/${post.id}`}
              className="grid grid-cols-[1fr_auto] sm:grid-cols-[auto_1fr_auto_auto] gap-x-3 items-baseline py-2.5 px-2 border-b border-ink-ghost rounded hover:bg-[rgba(74,222,128,0.08)] transition-colors"
            >
              {/* Permissions + Category (hidden on mobile) */}
              <span className="hidden sm:flex items-center gap-2 text-[11px] text-ink-faint whitespace-nowrap">
                -rw-r--r--
                <CatTag name={categorySlug(post.categoryId)} />
              </span>

              {/* Title + excerpt */}
              <span className="min-w-0">
                <span className="text-xs font-medium text-term-white block truncate">
                  {post.title}
                </span>
                <span className="text-[11px] text-ink-faint block truncate sm:hidden mt-0.5">
                  <CatTag name={categorySlug(post.categoryId)} />
                </span>
              </span>

              {/* Views */}
              <span className="text-[11px] text-term-amber text-right whitespace-nowrap">
                {post.viewCount} views
              </span>

              {/* Date */}
              <span className="hidden sm:block text-[11px] text-ink-faint text-right whitespace-nowrap">
                {formatDate(post.createdAt)}
              </span>
            </Link>
          ))}

          {/* Info + pagination */}
          <div className="flex items-center gap-4 mt-4 text-[11px]">
            <span className="text-ink-faint">
              showing {posts.length} posts · page {currentPage + 1}
            </span>
            {(currentPage > 0 || hasNext) && (
              <div className="flex gap-2 ml-auto">
                <button
                  onClick={() => setCurrentPage((p) => Math.max(0, p - 1))}
                  disabled={currentPage === 0}
                  className="bg-surface border border-ink-ghost rounded px-2.5 py-1 text-ink-faint hover:border-term-green hover:text-term-green disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                >
                  prev
                </button>
                <button
                  onClick={() => setCurrentPage((p) => p + 1)}
                  disabled={!hasNext}
                  className="bg-surface border border-ink-ghost rounded px-2.5 py-1 text-ink-faint hover:border-term-green hover:text-term-green disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                >
                  next
                </button>
              </div>
            )}
          </div>

          {/* Cursor */}
          <div className="flex items-baseline gap-2 text-xs mt-6 mb-4">
            <span className="text-term-blue">~/blog</span>
            <span className="text-term-green">$</span>
            <span className="term-cursor" />
          </div>
        </div>
      )}
    </div>
  );
}

function CatTag({ name }: { name: string }) {
  const colorMap: Record<string, string> = {
    spring: "text-term-green border-term-green-dim",
    infra: "text-term-amber border-[#78350f]",
    cs: "text-term-blue border-[#1e40af]",
  };
  const color = colorMap[name] || "text-ink-faint border-ink-ghost";
  return (
    <span className={`inline-block text-[10px] px-1.5 py-px border rounded ${color}`}>
      {name}
    </span>
  );
}
