import { useEffect, useState } from "react";
import { postApi } from "../api/post";
import { categoryApi } from "../api/category";
import type { Post, Category } from "../types";
import { Link } from "react-router-dom";

export default function HomePage() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [popularPosts, setPopularPosts] = useState<Post[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
  const [searchKeyword, setSearchKeyword] = useState<string>("");
  const [searchQuery, setSearchQuery] = useState<string>("");
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
      console.error("카테고리 로딩 실패:", error);
    }
  };

  const loadPosts = async () => {
    try {
      setPostsLoading(true);
      setError(null);

      let data;
      if (searchQuery.trim()) {
        data = await postApi.searchPosts(
          searchQuery,
          selectedCategory || undefined,
          currentPage,
          10
        );
      } else if (selectedCategory) {
        data = await postApi.getPostsByCategory(
          selectedCategory,
          currentPage,
          10
        );
      } else {
        data = await postApi.getPosts(currentPage, 10);
      }

      console.log("Loaded posts:", data);
      setPosts(data.posts || []);
      setTotalPages(data.totalPages || 0);
    } catch (error) {
      console.error("게시글 로딩 실패:", error);
      setError("게시글을 불러오는데 실패했습니다.");
    } finally {
      setPostsLoading(false);
    }
  };

  const loadPopularPosts = async () => {
    try {
      const data = await postApi.getPopularPosts(5);
      setPopularPosts(data || []);
    } catch (error) {
      console.error("인기 게시글 로딩 실패:", error);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchKeyword.trim() === "") {
      setSearchQuery("");
    } else {
      setSearchQuery(searchKeyword);
    }
  };

  const handleCategoryClick = (categoryId: number | null) => {
    setSelectedCategory(categoryId);
    setSearchKeyword("");
    setSearchQuery("");
  };

  if (initialLoading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <div className="w-8 h-8 border-2 border-gray-300 border-t-gray-900 rounded-full animate-spin"></div>
      </div>
    );
  }

  if (error && posts.length === 0) {
    return (
      <div className="container mx-auto px-6 py-16 max-w-5xl text-center">
        <p className="text-red-600 mb-4">{error}</p>
        <button
          onClick={loadPosts}
          className="text-gray-900 hover:text-gray-600 underline"
        >
          다시 시도
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white w-full">
      {/* Header Section */}
      <div className="bg-gray-900 text-white py-12 mb-8">
        <div className="container mx-auto px-4 sm:px-8 max-w-5xl">
          <div className="flex items-center gap-6 mb-6">
            <img
              src="https://media.giphy.com/media/JIX9t2j0ZTN9S/giphy.gif"
              alt="귀여운 고양이"
              className="w-20 h-20 object-contain rounded-full"
            />
            <div>
              <h1 className="text-3xl font-bold font-mono">seeeeeeong.log</h1>
            </div>
          </div>

          {/* Search Bar */}
          <form onSubmit={handleSearch} className="w-full">
            <div className="relative flex items-center">
              <span className="absolute left-4">
                <svg
                  className="w-4 h-4 text-gray-500"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  ></path>
                </svg>
              </span>
              <input
                type="text"
                value={searchKeyword}
                onChange={(e) => setSearchKeyword(e.target.value)}
                placeholder="검색어를 입력하세요..."
                className="w-full pl-10 pr-4 py-2.5 bg-gray-800 text-white border border-gray-700 font-mono text-sm focus:outline-none focus:border-gray-500 placeholder-gray-500"
              />
              <button
                type="submit"
                className="absolute right-0 top-0 bottom-0 px-4 bg-white text-gray-900 hover:bg-gray-100 transition-colors border-l border-gray-700"
              >
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  ></path>
                </svg>
              </button>
            </div>
          </form>
        </div>
      </div>

      <div className="container mx-auto px-4 sm:px-8 max-w-5xl">
        {/* Category Filter */}
        {categories.length > 0 && (
          <div className="mb-8">
            <div className="flex items-center gap-2 flex-wrap">
              <button
                onClick={() => handleCategoryClick(null)}
                className={`px-4 py-1.5 text-xs font-mono border transition-colors ${
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
                  className={`px-4 py-1.5 text-xs font-mono border transition-colors ${
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

        {/* Main Content Grid */}
        <div className="grid lg:grid-cols-[1fr_300px] gap-8">
          {/* Posts List */}
          <div className="relative">
            {postsLoading ? (
              <div className="absolute inset-0 flex justify-center items-center bg-white bg-opacity-75 z-10">
                <div className="w-8 h-8 border-2 border-gray-300 border-t-gray-900 rounded-full animate-spin"></div>
              </div>
            ) : error ? (
              <div className="py-12 text-center">
                <p className="text-sm font-mono text-red-500">{error}</p>
              </div>
            ) : posts.length === 0 ? (
              <div className="py-12 text-center">
                <p className="text-sm font-mono text-gray-500">
                  {searchQuery
                    ? "검색 결과가 없습니다"
                    : "아직 게시글이 없습니다"}
                </p>
              </div>
            ) : (
              <>
                <div className="space-y-6">
                  {posts.map((post) => (
                    <Link
                      key={post.id}
                      to={`/posts/${post.id}`}
                      className="block border-b border-gray-200 pb-6 hover:opacity-70 transition-opacity"
                    >
                      <article>
                        <h3 className="text-xl font-bold text-gray-900 font-mono mb-2 hover:underline">
                          {post.title}
                        </h3>
                        <p className="text-sm font-mono text-gray-600 mb-3 line-clamp-2">
                          {post.content
                            .replace(/[#*`>\-\[\]]/g, "")
                            .substring(0, 120)}
                          {post.content.length > 120 && "..."}
                        </p>
                        <div className="flex items-center gap-3 text-xs font-mono text-gray-500">
                          <time>
                            {new Date(post.createdAt).toLocaleDateString(
                              "ko-KR",
                              {
                                year: "numeric",
                                month: "long",
                                day: "numeric",
                              }
                            )}
                          </time>
                          <span>·</span>
                          <span>조회 {post.viewCount}</span>
                        </div>
                      </article>
                    </Link>
                  ))}
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex justify-center items-center gap-4 mt-8 pt-8 border-t border-gray-200 text-sm font-mono">
                    <button
                      onClick={() =>
                        setCurrentPage((prev) => Math.max(0, prev - 1))
                      }
                      disabled={currentPage === 0}
                      className="text-gray-900 hover:underline disabled:opacity-30 disabled:cursor-not-allowed"
                    >
                      ← 이전
                    </button>

                    <span className="text-gray-600">
                      {currentPage + 1} / {totalPages}
                    </span>

                    <button
                      onClick={() =>
                        setCurrentPage((prev) =>
                          Math.min(totalPages - 1, prev + 1)
                        )
                      }
                      disabled={currentPage >= totalPages - 1}
                      className="text-gray-900 hover:underline disabled:opacity-30 disabled:cursor-not-allowed"
                    >
                      다음 →
                    </button>
                  </div>
                )}
              </>
            )}
          </div>

          {/* Sidebar - Popular Posts */}
          {popularPosts.length > 0 && !searchQuery && (
            <aside className="hidden lg:block">
              <div className="sticky top-8">
                <h3 className="text-sm font-bold font-mono text-gray-900 mb-4 pb-2 border-b border-gray-900">
                  인기 게시글
                </h3>
                <div className="space-y-4">
                  {popularPosts.map((post, index) => (
                    <Link
                      key={post.id}
                      to={`/posts/${post.id}`}
                      className="block group"
                    >
                      <div className="flex gap-3">
                        <span className="text-xl font-bold font-mono text-gray-300 group-hover:text-gray-900 transition-colors flex-shrink-0">
                          {index + 1}
                        </span>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-mono text-xs font-medium text-gray-900 mb-1 line-clamp-2 group-hover:underline">
                            {post.title}
                          </h4>
                          <div className="flex items-center gap-2 text-[10px] font-mono text-gray-500">
                            <span>조회 {post.viewCount}</span>
                            <span>·</span>
                            <span>
                              {new Date(post.createdAt).toLocaleDateString(
                                "ko-KR",
                                {
                                  month: "long",
                                  day: "numeric",
                                }
                              )}
                            </span>
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
