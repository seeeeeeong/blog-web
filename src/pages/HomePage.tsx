import { useEffect, useState } from "react";
import { postApi } from "../api/post";
import type { Post } from "../types";
import { Link } from "react-router-dom";

export default function HomePage() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadPosts();
  }, []);

  const loadPosts = async () => {
    try {
      setError(null);
      const data = await postApi.getPosts(0, 10);
      console.log("Loaded posts:", data); 
      setPosts(data.posts || []);
    } catch (error) {
      console.error("게시글 로딩 실패:", error);
      setError("게시글을 불러오는데 실패했습니다.");
    } finally {
      setLoading(false);
    }
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
        <div className="mb-16">
          <h1 className="text-5xl sm:text-7xl lg:text-[6rem] font-bold text-gray-900 leading-tight font-mono mb-4">
            Blog
          </h1>
          <p className="text-sm font-mono text-gray-900">
            개발, 기술, 그리고 일상에 대한 이야기
          </p>
        </div>

        {/* Posts List */}
        <div className="space-y-8">
          {posts.length === 0 ? (
            <div className="border-t border-gray-900 pt-8">
              <p className="text-sm font-mono text-gray-900">아직 게시글이 없습니다</p>
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
      </div>
    </div>
  );
}