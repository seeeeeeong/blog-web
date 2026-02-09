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
        ? await postApi.searchPostsBySimilarity(searchQuery, selectedCategory || undefined, currentPage, PAGINATION.POSTS_PER_PAGE)
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
        <p className="text-sm font-mono text-primary mb-6">{error}</p>
        <button
          onClick={loadPosts}
          className="font-mono text-sm text-gray-800 underline hover:text-text"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full w-full lg:px-8 px-4 py-8">
      {/* Header */}
      <div className="flex items-end justify-between mb-8">
        <h2 className="text-gray-900 lg:text-[6rem] text-[4rem] leading-[1.1] tracking-tighter font-bold">
          Feed
        </h2>
      </div>

      {/* Search */}
      <form onSubmit={handleSearch} className="mb-8">
        <div className="flex gap-3 items-center">
          <div className="flex-1 relative">
            <span className="absolute left-0 top-1/2 -translate-y-1/2 font-mono text-sm text-muted">
              /&nbsp;SEARCH
            </span>
            <input
              type="text"
              value={searchKeyword}
              onChange={(e) => setSearchKeyword(e.target.value)}
              placeholder="Type to search..."
              className="w-full pl-24 pr-4 py-2 bg-transparent border-b border-gray-500 font-mono text-sm text-text placeholder:text-gray-400 focus:outline-none focus:border-text transition-colors"
            />
          </div>
          <button
            type="submit"
            className="font-mono text-sm text-gray-800 hover:text-text underline shrink-0"
          >
            SEARCH
          </button>
          {searchQuery && (
            <button
              type="button"
              onClick={() => {
                setSearchKeyword("");
                setSearchQuery("");
              }}
              className="font-mono text-sm text-muted hover:text-text underline shrink-0"
            >
              CLEAR
            </button>
          )}
        </div>
      </form>

      {/* Content */}
      <div className="flex lg:flex-row flex-col lg:gap-x-12 gap-y-8">
        {/* Category Filter (Sidebar) */}
        {categories.length > 0 && (
          <div className="flex flex-col lg:w-1/5 w-full shrink-0">
            <div className="w-full flex h-8 border-b border-gray-500 justify-between items-start">
              <span className="text-sm font-mono">/ FILTER</span>
              {selectedCategory !== null && (
                <button
                  type="button"
                  className="text-sm font-mono text-gray-800 hover:text-text"
                  onClick={() => handleCategoryClick(null)}
                >
                  CLEAR
                </button>
              )}
            </div>
            <div className="flex flex-col pt-3 gap-y-1">
              <button
                type="button"
                className="relative gap-x-2 flex font-mono text-gray-800 hover:text-text text-sm"
                onClick={() => handleCategoryClick(null)}
              >
                {selectedCategory === null && (
                  <div className="absolute top-1/2 -translate-y-1/2 left-[0.875rem] w-2.5 h-2.5 border-[1.5px] border-gray-800 rounded-full" />
                )}
                <span className="whitespace-pre">{`(   )`}</span>
                <span>All</span>
              </button>
              {categories.map((category) => (
                <button
                  key={category.id}
                  type="button"
                  className="relative gap-x-2 flex font-mono text-gray-800 hover:text-text text-sm"
                  onClick={() => handleCategoryClick(category.id)}
                >
                  {selectedCategory === category.id && (
                    <div className="absolute top-1/2 -translate-y-1/2 left-[0.875rem] w-2.5 h-2.5 border-[1.5px] border-gray-800 rounded-full" />
                  )}
                  <span className="whitespace-pre">{`(   )`}</span>
                  <span>{category.name}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Post List */}
        <div className="flex flex-col lg:w-0 flex-grow pb-20">
          {/* Column Headers */}
          <div className="w-full flex h-8">
            <span className="text-sm font-mono w-32 shrink-0">/ DATE</span>
            <span className="text-sm font-mono">/ TITLE</span>
          </div>

          {/* Post Rows */}
          <div className="flex flex-col w-full border-t border-gray-500">
            {postsLoading ? (
              <div className="flex justify-center py-16">
                <Spinner />
              </div>
            ) : error ? (
              <div className="py-12 text-center">
                <p className="text-sm font-mono text-primary">{error}</p>
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
                    className="flex border-b border-gray-500 items-center w-full lg:h-14 lg:py-0 py-3 hover:bg-hover/50 transition-colors"
                  >
                    <span className="text-sm font-mono w-32 shrink-0 text-muted">
                      {formatDate(post.createdAt)}
                    </span>
                    <span className="lg:text-xl text-base w-0 grow tracking-tight font-medium truncate">
                      {post.title}
                    </span>
                  </Link>
                ))}

                {/* Pagination */}
                {(currentPage > 0 || hasNext) && (
                  <div className="flex justify-center items-center gap-8 mt-10 pt-6 font-mono text-sm">
                    <button
                      onClick={() => setCurrentPage((prev) => Math.max(0, prev - 1))}
                      disabled={currentPage === 0}
                      className="text-gray-800 hover:text-text underline disabled:opacity-30 disabled:no-underline disabled:cursor-not-allowed"
                    >
                      &larr; PREV
                    </button>
                    <span className="text-muted">
                      PAGE {currentPage + 1}
                    </span>
                    <button
                      onClick={() => setCurrentPage((prev) => prev + 1)}
                      disabled={!hasNext}
                      className="text-gray-800 hover:text-text underline disabled:opacity-30 disabled:no-underline disabled:cursor-not-allowed"
                    >
                      NEXT &rarr;
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
