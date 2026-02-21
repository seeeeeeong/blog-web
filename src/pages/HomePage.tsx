import { useEffect, useState } from "react";
import { postApi } from "../api/post";
import { categoryApi } from "../api/category";
import type { Post, Category } from "../types";
import { Link } from "react-router-dom";
import Spinner from "../components/common/Spinner";
import { formatDate } from "../utils/format";
import { PAGINATION } from "../constants/pagination";

export default function HomePage() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
  const [searchKeyword, setSearchKeyword] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(0);
  const [hasNext, setHasNext] = useState(false);
  const [postsLoading, setPostsLoading] = useState(true);
  const [initialLoading, setInitialLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const init = async () => {
      await loadCategories();
      setInitialLoading(false);
    };
    init();
  }, []);

  useEffect(() => {
    setCurrentPage(0);
  }, [selectedCategory, searchQuery]);

  useEffect(() => {
    loadPosts();
  }, [selectedCategory, searchQuery, currentPage]);

  const loadCategories = async () => {
    try {
      const data = await categoryApi.getCategories();
      setCategories(data || []);
    } catch {
      setError("Failed to load categories.");
    }
  };

  const loadPosts = async () => {
    try {
      setPostsLoading(true);
      setError(null);

      const data = searchQuery.trim()
        ? await postApi.searchPosts(searchQuery, selectedCategory || undefined, currentPage, PAGINATION.POSTS_PER_PAGE)
        : selectedCategory
          ? await postApi.getPostsByCategory(selectedCategory, currentPage, PAGINATION.POSTS_PER_PAGE)
          : await postApi.getPosts(currentPage, PAGINATION.POSTS_PER_PAGE);

      setPosts(data.content || []);
      setHasNext(data.hasNext || false);
    } catch {
      setError("Failed to load posts.");
    } finally {
      setPostsLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setSearchQuery(searchKeyword.trim());
  };

  const handleCategoryClick = (categoryId: number | null) => {
    setSelectedCategory(categoryId);
    setSearchKeyword("");
    setSearchQuery("");
  };

  if (initialLoading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <Spinner />
      </div>
    );
  }

  if (error && posts.length === 0) {
    return (
      <div className="w-full lg:px-8 px-4 py-20 text-center">
        <p className="text-sm font-mono text-red-600 mb-6">{error}</p>
        <button
          onClick={loadPosts}
          className="font-mono text-sm text-muted hover:text-text transition-colors"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full w-full lg:px-8 px-4 py-8">
      {/* Header */}
      <div className="mb-6">
        <h2 className="text-text lg:text-[5rem] text-[3rem] leading-[1.1] tracking-tighter font-bold">
          Feed
        </h2>
      </div>

      {/* Search */}
      <form onSubmit={handleSearch} className="mb-8">
        <div className="flex gap-3 items-center border-b border-gray-400 pb-2">
          <svg className="w-4 h-4 text-muted shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            value={searchKeyword}
            onChange={(e) => setSearchKeyword(e.target.value)}
            placeholder="Search posts..."
            className="w-full bg-transparent font-mono text-sm text-text placeholder:text-gray-400 focus:outline-none"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => {
                setSearchKeyword("");
                setSearchQuery("");
              }}
              className="font-mono text-xs text-muted hover:text-text transition-colors shrink-0"
            >
              Clear
            </button>
          )}
        </div>
      </form>

      {/* Content */}
      <div className="flex lg:flex-row flex-col lg:gap-x-10 gap-y-6">
        {/* Category Filter (Sidebar) */}
        {categories.length > 0 && (
          <div className="flex flex-col lg:w-44 w-full shrink-0">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-mono text-muted uppercase tracking-wide">Filter</span>
              {selectedCategory !== null && (
                <button
                  type="button"
                  className="text-xs font-mono text-muted hover:text-text transition-colors"
                  onClick={() => handleCategoryClick(null)}
                >
                  Clear
                </button>
              )}
            </div>
            <div className="flex flex-col gap-y-0.5">
              <button
                type="button"
                className={`text-left font-mono text-sm py-1 transition-colors ${
                  selectedCategory === null
                    ? "text-text font-semibold"
                    : "text-muted hover:text-text"
                }`}
                onClick={() => handleCategoryClick(null)}
              >
                {selectedCategory === null && <span className="mr-1.5">&bull;</span>}
                All
              </button>
              {categories.map((category) => (
                <button
                  key={category.id}
                  type="button"
                  className={`text-left font-mono text-sm py-1 transition-colors ${
                    selectedCategory === category.id
                      ? "text-text font-semibold"
                      : "text-muted hover:text-text"
                  }`}
                  onClick={() => handleCategoryClick(category.id)}
                >
                  {selectedCategory === category.id && <span className="mr-1.5">&bull;</span>}
                  {category.name}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Post List */}
        <div className="flex flex-col lg:w-0 flex-grow pb-16">
          {/* Column Headers */}
          <div className="w-full flex h-8 text-xs font-mono text-muted uppercase tracking-wide border-b border-gray-400">
            <span className="w-28 shrink-0">Date</span>
            <span className="flex-1">Title</span>
            <span className="w-16 text-right hidden sm:block">Views</span>
          </div>

          {/* Post Rows */}
          <div className="flex flex-col w-full">
            {postsLoading ? (
              <div className="flex justify-center py-16">
                <Spinner />
              </div>
            ) : error ? (
              <div className="py-12 text-center">
                <p className="text-sm font-mono text-red-600">{error}</p>
              </div>
            ) : posts.length === 0 ? (
              <div className="py-12 text-center">
                <p className="text-sm font-mono text-muted">
                  {searchQuery ? "No search results found." : "No posts yet."}
                </p>
              </div>
            ) : (
              <>
                {posts.map((post) => (
                  <Link
                    key={post.id}
                    to={`/posts/${post.id}`}
                    className="flex items-center w-full py-3 border-b border-gray-300 hover:bg-hover/40 transition-colors group"
                  >
                    <span className="text-xs font-mono w-28 shrink-0 text-muted">
                      {formatDate(post.createdAt)}
                    </span>
                    <span className="flex-1 lg:text-lg text-base tracking-tight font-medium truncate group-hover:text-muted transition-colors">
                      {post.title}
                    </span>
                    <span className="w-16 text-right text-xs font-mono text-muted hidden sm:block">
                      {post.viewCount}
                    </span>
                  </Link>
                ))}

                {/* Pagination */}
                {(currentPage > 0 || hasNext) && (
                  <div className="flex justify-center items-center gap-8 mt-10 pt-6 font-mono text-xs">
                    <button
                      onClick={() => setCurrentPage((prev) => Math.max(0, prev - 1))}
                      disabled={currentPage === 0}
                      className="text-muted hover:text-text transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                    >
                      &larr; Prev
                    </button>
                    <span className="text-muted">
                      {currentPage + 1}
                    </span>
                    <button
                      onClick={() => setCurrentPage((prev) => prev + 1)}
                      disabled={!hasNext}
                      className="text-muted hover:text-text transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                    >
                      Next &rarr;
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
