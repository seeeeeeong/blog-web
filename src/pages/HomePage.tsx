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
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadCategories();
    loadPopularPosts();
  }, []);

  useEffect(() => {
    setCurrentPage(0);
  }, [selectedCategory, searchKeyword]);

  useEffect(() => {
    loadPosts();
  }, [selectedCategory, searchKeyword, currentPage]);

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
      setLoading(true);
      setError(null);

      let data;
      if (searchKeyword.trim()) {
        data = await postApi.searchPosts(searchKeyword, selectedCategory || undefined, currentPage, 10);
      } else if (selectedCategory) {
        data = await postApi.getPostsByCategory(selectedCategory, currentPage, 10);
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
      setLoading(false);
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
    loadPosts();
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <div className="w-8 h-8 border-2 border-gray-300 border-t-gray-900 rounded-full animate-spin"></div>
      </div>
    );
  }

  if (error) {
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
    <div className="min-h-screen bg-gray-100 w-full">
      <div className="container mx-auto px-4 sm:px-8 py-8 max-w-7xl">
        {/* Hero Section */}
        <div className="mb-16 flex flex-col items-center justify-center">
          <div className="relative mb-8">
            <img
              src="https://media.giphy.com/media/JIX9t2j0ZTN9S/giphy.gif"
              alt="귀여운 고양이"
              className="hero-cat-image w-40 h-40 object-contain rounded-full shadow-sm"
              style={{ border: 'none', margin: '0' }}
            />
          </div>

          {/* Search Bar */}
          <form onSubmit={handleSearch} className="w-full max-w-2xl">
            <div className="flex gap-2">
              <input
                type="text"
                value={searchKeyword}
                onChange={(e) => setSearchKeyword(e.target.value)}
                placeholder="게시글 검색..."
                className="flex-1 px-4 py-2 border-2 border-gray-900 font-mono text-sm focus:outline-none focus:ring-2 focus:ring-gray-900"
              />
              <button
                type="submit"
                className="px-6 py-2 bg-gray-900 text-white font-mono text-sm hover:bg-gray-800 transition-colors"
              >
                검색
              </button>
              {searchKeyword && (
                <button
                  type="button"
                  onClick={() => {
                    setSearchKeyword("");
                    setSelectedCategory(null);
                  }}
                  className="px-4 py-2 border-2 border-gray-900 font-mono text-sm hover:bg-gray-900 hover:text-white transition-colors"
                >
                  초기화
                </button>
              )}
            </div>
          </form>
        </div>

        {/* Popular Posts Section */}
        {popularPosts.length > 0 && !searchKeyword && (
          <div className="mb-12">
            <h2 className="text-2xl font-bold font-mono text-gray-900 mb-6 border-b-2 border-gray-900 pb-2">
              인기 게시글
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {popularPosts.map((post) => (
                <Link
                  key={post.id}
                  to={`/posts/${post.id}`}
                  className="block border-2 border-gray-900 p-4 hover:bg-gray-900 hover:text-white transition-colors"
                >
                  <h3 className="font-mono font-bold text-sm mb-2 truncate">
                    {post.title}
                  </h3>
                  <div className="flex items-center gap-3 text-xs font-mono opacity-70">
                    <span>조회 {post.viewCount}회</span>
                    <span>
                      {new Date(post.createdAt).toLocaleDateString("ko-KR", {
                        month: "2-digit",
                        day: "2-digit",
                      })}
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Category Filter */}
        {categories.length > 0 && (
          <div className="mb-8">
            <h3 className="text-sm font-mono text-gray-600 mb-3">카테고리 필터</h3>
            <div className="flex items-center gap-3 flex-wrap">
              <button
                onClick={() => setSelectedCategory(null)}
                className={`px-4 py-2 text-sm font-mono border transition-colors ${
                  selectedCategory === null
                    ? "bg-gray-900 text-white border-gray-900"
                    : "bg-white text-gray-900 border-gray-900 hover:bg-gray-900 hover:text-white"
                }`}
              >
                ALL
              </button>
              {categories.map((category) => (
                <button
                  key={category.id}
                  onClick={() => setSelectedCategory(category.id)}
                  className={`px-4 py-2 text-sm font-mono border transition-colors ${
                    selectedCategory === category.id
                      ? "bg-gray-900 text-white border-gray-900"
                      : "bg-white text-gray-900 border-gray-900 hover:bg-gray-900 hover:text-white"
                  }`}
                >
                  {category.name.toUpperCase()}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Posts List */}
        <div className="space-y-8">
          <h2 className="text-2xl font-bold font-mono text-gray-900 border-b-2 border-gray-900 pb-2">
            {searchKeyword ? `검색 결과: "${searchKeyword}"` : selectedCategory ? categories.find(c => c.id === selectedCategory)?.name : "최근 게시글"}
          </h2>

          {posts.length === 0 ? (
            <div className="border-t border-gray-900 pt-8">
              <p className="text-sm font-mono text-gray-900">
                {searchKeyword ? "검색 결과가 없습니다" : "아직 게시글이 없습니다"}
              </p>
            </div>
          ) : (
            posts.map((post) => (
              <Link
                key={post.id}
                to={`/posts/${post.id}`}
                className="block border-t border-gray-900 pt-8 hover:bg-gray-200 transition-colors -mx-4 sm:-mx-8 px-4 sm:px-8"
              >
                <article className="min-h-40">
                  <div className="grid lg:grid-cols-[1fr_3fr] gap-4 lg:gap-8">
                    {/* Left: Date & Meta */}
                    <div className="space-y-1.5">
                      <time className="text-xs font-mono text-gray-900 block">
                        {new Date(post.createdAt).toLocaleDateString("ko-KR", {
                          year: "numeric",
                          month: "2-digit",
                          day: "2-digit",
                        })}
                      </time>
                      <span className="text-xs font-mono text-gray-600 block">
                        조회 {post.viewCount}회
                      </span>
                    </div>

                    {/* Right: Content */}
                    <div className="space-y-3">
                      <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 font-mono leading-tight hover:underline">
                        {post.title}
                      </h2>
                      <p className="text-sm font-mono text-gray-700 leading-relaxed line-clamp-3">
                        {post.content
                          .replace(/[#*`>\-\[\]]/g, '')
                          .substring(0, 150)}
                        {post.content.length > 150 && '...'}
                      </p>
                    </div>
                  </div>
                </article>
              </Link>
            ))
          )}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-center items-center gap-4 mt-12 pb-12 text-sm font-mono">
            <button
              onClick={() => setCurrentPage((prev) => Math.max(0, prev - 1))}
              disabled={currentPage === 0}
              className="text-gray-900 hover:underline disabled:opacity-50 disabled:cursor-not-allowed"
            >
              ← PREV
            </button>

            <span className="text-gray-900">
              {currentPage + 1} / {totalPages}
            </span>

            <button
              onClick={() => setCurrentPage((prev) => Math.min(totalPages - 1, prev + 1))}
              disabled={currentPage >= totalPages - 1}
              className="text-gray-900 hover:underline disabled:opacity-50 disabled:cursor-not-allowed"
            >
              NEXT →
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
