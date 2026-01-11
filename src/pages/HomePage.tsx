import { useEffect, useState } from "react";
import { postApi } from "../api/post";
import { categoryApi } from "../api/category";
import type { Post, Category } from "../types";
import { Link } from "react-router-dom";
import Spinner from "../components/common/Spinner";
import { formatDate, extractPreview } from "../utils/format";
import { PAGINATION } from "../constants/pagination";

const SearchIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
  </svg>
);

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
      <div className="flex justify-center items-center min-h-screen">
        <Spinner />
      </div>
    );
  }

  if (error && posts.length === 0) {
    return (
      <div className="container mx-auto px-6 py-24 max-w-4xl text-center">
        <p className="text-red-600 mb-6 text-[11px]">{error}</p>
        <button
          onClick={loadPosts}
          className="px-4 py-2 bg-card text-text font-sans text-[11px] border border-border shadow-md rounded-lg hover:bg-primary hover:text-white transition-all"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen relative">
      <header className="py-16 sm:py-24 mb-12 sm:mb-20 animate-fade-in relative z-10">
        <div className="container mx-auto px-4 sm:px-6 max-w-4xl">
          <div className="flex flex-col items-center text-center mb-10 sm:mb-14">
            <img
              src="https://media.giphy.com/media/JIX9t2j0ZTN9S/giphy.gif"
              alt="Profile"
              className="w-20 h-20 sm:w-24 sm:h-24 object-contain rounded-full border border-border transition-transform-smooth hover:scale-110 hover:rotate-3 mb-6"
            />
            <div>
              <h1 className="text-2xl sm:text-4xl font-sansr text-text mb-2 transition-all-smooth hover:text-accent">SEEEEEEONG.LOG</h1>
              <p className="text-xs sm:text-sm font-sans text-mutedst"></p>
            </div>
          </div>

          <form onSubmit={handleSearch} className="w-full max-w-2xl mx-auto animate-slide-in-up delay-100">
            <div className="flex gap-3">
              <div className="relative flex-1 group">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted transition-all-smooth group-focus-within:text-text">
                  <SearchIcon />
                </span>
                <input
                  type="text"
                  value={searchKeyword}
                  onChange={(e) => setSearchKeyword(e.target.value)}
                  placeholder="Search posts..."
                  className="w-full pl-12 pr-4 py-3 sm:py-4 bg-card text-text border border-border font-sans text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-primary placeholder-tertiary transition-all-smooth shadow-md rounded-lg hover:shadow-lg"
                />
              </div>
              <button
                type="submit"
                className="btn-interactive px-6 sm:px-8 py-3 sm:py-4 bg-primary text-white hover:bg-accent-green hover:text-text transition-all-smooth border border-border flex items-center justify-center text-xs sm:text-smr font-semibold shadow-md rounded-lg hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0 whitespace-nowrap"
              >
                SEARCH
              </button>
            </div>
          </form>
        </div>
      </header>

      <div className="container mx-auto px-4 sm:px-6 max-w-6xl pb-12 sm:pb-20 relative z-10">
        {categories.length > 0 && (
          <div className="mb-12 sm:mb-16 animate-slide-in-up delay-200">
            <div className="flex items-center justify-center gap-3 sm:gap-4 flex-wrap">
              <button
                onClick={() => handleCategoryClick(null)}
                className={`btn-interactive px-4 sm:px-6 py-2.5 sm:py-3 text-xs sm:text-sm font-sans border transition-all-smoothr shadow-md rounded-lg hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0 active:shadow-md rounded-lg ${
                  selectedCategory === null
                    ? "bg-primary text-white border-border"
                    : "bg-card text-secondary border-border hover:bg-primary hover:text-white"
                }`}
              >
                ALL
              </button>
              {categories.map((category, index) => (
                <button
                  key={category.id}
                  onClick={() => handleCategoryClick(category.id)}
                  className={`btn-interactive px-4 sm:px-6 py-2.5 sm:py-3 text-xs sm:text-sm font-sans border transition-all-smoothr shadow-md rounded-lg hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0 active:shadow-md rounded-lg ${
                    selectedCategory === category.id
                      ? "bg-primary text-white border-border"
                      : "bg-card text-secondary border-border hover:bg-primary hover:text-white"
                  }`}
                  style={{ animationDelay: `${(index + 1) * 0.05}s` }}
                >
                  {category.name}
                </button>
              ))}
            </div>
          </div>
        )}

        <div className="max-w-5xl mx-auto">
          <main className="relative min-h-[400px]">
            {postsLoading ? (
              <div className="absolute inset-0 flex justify-center items-center">
                <Spinner />
              </div>
            ) : error ? (
              <div className="py-20 text-center">
                <p className="text-[11px] font-sans text-red-500">{error}</p>
              </div>
            ) : posts.length === 0 ? (
              <div className="py-20 text-center">
                <p className="text-[11px] sm:text-xs font-sans text-muted">
                  {searchQuery ? "No search results found" : "NO POSTS YET"}
                </p>
              </div>
            ) : (
              <>
                <div className="grid gap-6 sm:gap-8">
                  {posts.map((post, index) => (
                    <Link
                      key={post.id}
                      to={`/posts/${post.id}`}
                      className="interactive-card block group bg-card border border-border p-6 sm:p-8 hover:bg-primary hover:text-white transition-all-smooth shadow-md rounded-lg hover:shadow-lg overflow-hidden animate-fade-in"
                      style={{ animationDelay: `${index * 0.1}s` }}
                    >
                      <article>
                        <h2 className="text-base sm:text-lg font-sans text-text mb-3 sm:mb-4 group-hover:text-white transition-all-smooth relative z-10 font-semibold">
                          {post.title}
                        </h2>
                        <p className="text-xs sm:text-sm font-sans text-secondary mb-4 sm:mb-5 line-clamp-2 leading-relaxed group-hover:text-white/80 transition-all-smooth relative z-10">
                          {extractPreview(post.content)}
                          {post.content.length > 150 && "..."}
                        </p>
                        <div className="flex items-center gap-3 sm:gap-4 text-[11px] sm:text-xs font-sans text-mutedr group-hover:text-white/60 transition-all-smooth relative z-10">
                          <time>{formatDate(post.createdAt)}</time>
                          <span>·</span>
                          <span>{post.viewCount} VIEWS</span>
                        </div>
                      </article>
                    </Link>
                  ))}
                </div>

                {(currentPage > 0 || hasNext) && (
                  <div className="flex justify-center items-center gap-6 sm:gap-8 mt-12 sm:mt-16 pt-8 sm:pt-10 border-t border-border text-xs sm:text-sm font-sansr animate-fade-in">
                    <button
                      onClick={() => setCurrentPage((prev) => Math.max(0, prev - 1))}
                      disabled={currentPage === 0}
                      className="btn-interactive px-6 sm:px-8 py-3 bg-card border border-border text-text hover:bg-primary hover:text-white transition-all-smooth disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:bg-card disabled:hover:text-text shadow-md rounded-lg hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0 font-semibold"
                    >
                      ← PREV
                    </button>

                    <span className="text-secondary font-boldst">
                      PAGE {currentPage + 1}
                    </span>

                    <button
                      onClick={() => setCurrentPage((prev) => prev + 1)}
                      disabled={!hasNext}
                      className="btn-interactive px-6 sm:px-8 py-3 bg-card border border-border text-text hover:bg-primary hover:text-white transition-all-smooth disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:bg-card disabled:hover:text-text shadow-md rounded-lg hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0 font-semibold"
                    >
                      NEXT →
                    </button>
                  </div>
                )}
              </>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}
