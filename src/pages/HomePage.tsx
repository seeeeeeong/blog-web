import { useEffect, useState } from "react";
import { postApi } from "../api/post";
import { categoryApi } from "../api/category";
import type { Post, Category } from "../types";
import { Link } from "react-router-dom";

const SearchIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
  </svg>
);

const Spinner = () => (
  <div className="w-8 h-8 border-2 border-gray-300 border-t-gray-900 rounded-full animate-spin" />
);

const formatDate = (date: string) =>
  new Date(date).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

const extractPreview = (content: string) =>
  content
    .replace(/!\[.*?\]\(.*?\)/g, "")
    .replace(/[#*`>\-\[\]]/g, "")
    .trim()
    .substring(0, 150);

export default function HomePage() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [popularPosts, setPopularPosts] = useState<Post[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
  const [searchKeyword, setSearchKeyword] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [postsLoading, setPostsLoading] = useState(true);
  const [initialLoading, setInitialLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const init = async () => {
      await Promise.all([loadCategories(), loadPopularPosts()]);
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
    } catch (error) {
      console.error("Failed to load categories:", error);
    }
  };

  const loadPosts = async () => {
    try {
      setPostsLoading(true);
      setError(null);

      let data;
      if (searchQuery.trim()) {
        data = await postApi.searchPosts(searchQuery, selectedCategory || undefined, currentPage, 10);
      } else if (selectedCategory) {
        data = await postApi.getPostsByCategory(selectedCategory, currentPage, 10);
      } else {
        data = await postApi.getPosts(currentPage, 10);
      }

      setPosts(data.posts || []);
      setTotalPages(data.totalPages || 0);
    } catch (error) {
      console.error("Failed to load posts:", error);
      setError("Failed to load posts.");
    } finally {
      setPostsLoading(false);
    }
  };

  const loadPopularPosts = async () => {
    try {
      const data = await postApi.getPopularPosts(5);
      setPopularPosts(data || []);
    } catch (error) {
      console.error("Failed to load popular posts:", error);
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
        <p className="text-red-600 mb-6 text-lg">{error}</p>
        <button
          onClick={loadPosts}
          className="px-6 py-3 bg-gray-900 text-white font-mono text-sm hover:bg-gray-800 transition-colors"
        >
          Try again
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <header className="bg-gray-900 text-white py-16 mb-12">
        <div className="container mx-auto px-6 max-w-4xl">
          <div className="flex items-center gap-6 mb-8">
            <img
              src="https://media.giphy.com/media/JIX9t2j0ZTN9S/giphy.gif"
              alt="Profile"
              className="w-24 h-24 object-contain rounded-full"
            />
            <h1 className="text-4xl font-bold font-mono tracking-tight">seeeeeeong.log</h1>
          </div>

          <form onSubmit={handleSearch} className="w-full max-w-2xl">
            <div className="relative flex items-center">
              <span className="absolute left-4 text-gray-400">
                <SearchIcon />
              </span>
              <input
                type="text"
                value={searchKeyword}
                onChange={(e) => setSearchKeyword(e.target.value)}
                placeholder="Search posts..."
                className="w-full pl-12 pr-20 py-3 bg-gray-800 text-white border border-gray-700 font-mono text-sm focus:outline-none focus:border-gray-500 placeholder-gray-500 transition-colors"
              />
              <button
                type="submit"
                className="absolute right-0 top-0 bottom-0 px-6 bg-white text-gray-900 hover:bg-gray-100 transition-colors border-l border-gray-700 flex items-center gap-2"
              >
                <SearchIcon />
              </button>
            </div>
          </form>
        </div>
      </header>

      <div className="container mx-auto px-6 max-w-4xl pb-20">
        {categories.length > 0 && (
          <div className="mb-12">
            <div className="flex items-center gap-3 flex-wrap">
              <button
                onClick={() => handleCategoryClick(null)}
                className={`px-5 py-2 text-sm font-mono border-2 transition-all ${
                  selectedCategory === null
                    ? "bg-gray-900 text-white border-gray-900"
                    : "bg-white text-gray-900 border-gray-300 hover:border-gray-900"
                }`}
              >
                ALL
              </button>
              {categories.map((category) => (
                <button
                  key={category.id}
                  onClick={() => handleCategoryClick(category.id)}
                  className={`px-5 py-2 text-sm font-mono border-2 transition-all ${
                    selectedCategory === category.id
                      ? "bg-gray-900 text-white border-gray-900"
                      : "bg-white text-gray-900 border-gray-300 hover:border-gray-900"
                  }`}
                >
                  {category.name.toUpperCase()}
                </button>
              ))}
            </div>
          </div>
        )}

        <div className="grid lg:grid-cols-[1fr_280px] gap-12">
          <main className="relative min-h-[400px]">
            {postsLoading ? (
              <div className="absolute inset-0 flex justify-center items-center">
                <Spinner />
              </div>
            ) : error ? (
              <div className="py-20 text-center">
                <p className="text-sm font-mono text-red-500">{error}</p>
              </div>
            ) : posts.length === 0 ? (
              <div className="py-20 text-center">
                <p className="text-base font-mono text-gray-500">
                  {searchQuery ? "No search results found" : "No posts yet"}
                </p>
              </div>
            ) : (
              <>
                <div className="space-y-8">
                  {posts.map((post) => (
                    <Link
                      key={post.id}
                      to={`/posts/${post.id}`}
                      className="block group border-b border-gray-200 pb-8 last:border-0"
                    >
                      <article>
                        <h2 className="text-2xl font-bold text-gray-900 font-mono mb-3 group-hover:text-gray-600 transition-colors">
                          {post.title}
                        </h2>
                        <p className="text-base font-mono text-gray-600 mb-4 line-clamp-2 leading-relaxed">
                          {extractPreview(post.content)}
                          {post.content.length > 150 && "..."}
                        </p>
                        <div className="flex items-center gap-4 text-sm font-mono text-gray-500">
                          <time>{formatDate(post.createdAt)}</time>
                          <span>·</span>
                          <span>{post.viewCount} views</span>
                        </div>
                      </article>
                    </Link>
                  ))}
                </div>

                {totalPages > 1 && (
                  <div className="flex justify-center items-center gap-6 mt-12 pt-8 border-t border-gray-200 text-sm font-mono">
                    <button
                      onClick={() => setCurrentPage((prev) => Math.max(0, prev - 1))}
                      disabled={currentPage === 0}
                      className="px-4 py-2 text-gray-900 hover:text-gray-600 transition-colors disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:text-gray-900"
                    >
                      ← Previous
                    </button>

                    <span className="text-gray-600">
                      {currentPage + 1} / {totalPages}
                    </span>

                    <button
                      onClick={() => setCurrentPage((prev) => Math.min(totalPages - 1, prev + 1))}
                      disabled={currentPage >= totalPages - 1}
                      className="px-4 py-2 text-gray-900 hover:text-gray-600 transition-colors disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:text-gray-900"
                    >
                      Next →
                    </button>
                  </div>
                )}
              </>
            )}
          </main>

          {popularPosts.length > 0 && !searchQuery && (
            <aside className="hidden lg:block">
              <div className="sticky top-8">
                <h3 className="text-sm font-bold font-mono text-gray-900 mb-6 pb-3 border-b-2 border-gray-900">
                  POPULAR POSTS
                </h3>
                <div className="space-y-5">
                  {popularPosts.map((post, index) => (
                    <Link
                      key={post.id}
                      to={`/posts/${post.id}`}
                      className="block group"
                    >
                      <div className="flex gap-4">
                        <span className="text-2xl font-bold font-mono text-gray-200 group-hover:text-gray-900 transition-colors flex-shrink-0">
                          {index + 1}
                        </span>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-mono text-sm font-medium text-gray-900 mb-2 line-clamp-2 group-hover:text-gray-600 transition-colors leading-snug">
                            {post.title}
                          </h4>
                          <div className="flex items-center gap-2 text-xs font-mono text-gray-500">
                            <span>{post.viewCount} views</span>
                            <span>·</span>
                            <time>
                              {new Date(post.createdAt).toLocaleDateString("en-US", {
                                month: "short",
                                day: "numeric",
                              })}
                            </time>
                          </div>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            </aside>
          )}
        </div>
      </div>
    </div>
  );
}
