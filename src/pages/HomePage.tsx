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

  const categoryName = (categoryId: number) => {
    return categories.find((c) => c.id === categoryId)?.name ?? "Etc";
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
      <h2 className="text-2xl font-bold mb-1">Posts</h2>
      <p className="text-[13px] text-ink-light mb-6">
        {posts.length > 0 ? `${posts.length}${hasNext ? "+" : ""} articles` : "Loading..."}
        {searchQuery && <> matching &ldquo;{searchQuery}&rdquo;</>}
      </p>

      {/* Search */}
      <form onSubmit={handleSearch} className="mb-5">
        <div className="relative">
          <input
            type="text"
            value={searchKeyword}
            onChange={(e) => setSearchKeyword(e.target.value)}
            placeholder="Search..."
            className="w-full h-10 border-[1.5px] border-ink-ghost rounded-md px-3.5 text-[13px] bg-white text-ink placeholder:text-ink-faint outline-none transition-colors focus:border-ink"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => { setSearchKeyword(""); setSearchQuery(""); }}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-light hover:text-ink text-xs"
            >
              clear
            </button>
          )}
        </div>
      </form>

      {/* Posts */}
      {loading ? (
        <div className="py-12"><Spinner /></div>
      ) : error ? (
        <div className="py-8 text-danger text-sm">{error}</div>
      ) : posts.length === 0 ? (
        <div className="py-8 text-ink-light text-sm">
          {searchQuery ? "No results found." : "No posts yet."}
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {posts.map((post) => (
            <Link
              key={post.id}
              to={`/posts/${post.id}`}
              className="block p-5 border-[1.5px] border-ink-ghost rounded-lg hover:border-ink hover:-translate-y-px hover:shadow-sm transition-all"
            >
              <div className="flex justify-between items-center mb-1.5">
                <span className="text-[10px] font-semibold text-accent-text bg-accent px-2 py-0.5 rounded">
                  {categoryName(post.categoryId)}
                </span>
                <span className="text-[11px] text-ink-lighter">{formatDate(post.createdAt)}</span>
              </div>
              <h3 className="text-base font-semibold mb-1 leading-snug">{post.title}</h3>
              <p className="text-[13px] text-ink-light">{post.excerpt}</p>
              <div className="font-mono text-[11px] text-ink-faint mt-2">{post.viewCount} views</div>
            </Link>
          ))}

          <div className="text-ink-light text-xs mt-2">
            {posts.length} posts &middot; Page {currentPage + 1}
          </div>

          {(currentPage > 0 || hasNext) && (
            <div className="flex items-center gap-6 mt-2 text-[13px]">
              <button
                onClick={() => setCurrentPage((p) => Math.max(0, p - 1))}
                disabled={currentPage === 0}
                className="text-ink hover:opacity-60 disabled:text-ink-faint disabled:cursor-not-allowed transition-opacity"
              >
                &larr; Prev
              </button>
              <button
                onClick={() => setCurrentPage((p) => p + 1)}
                disabled={!hasNext}
                className="text-ink hover:opacity-60 disabled:text-ink-faint disabled:cursor-not-allowed transition-opacity"
              >
                Next &rarr;
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
