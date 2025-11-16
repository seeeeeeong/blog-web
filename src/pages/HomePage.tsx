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
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="border-b border-gray-200 bg-gradient-to-b from-gray-50 to-white">
        <div className="container mx-auto px-6 py-20 max-w-5xl">
          <div className="space-y-8">
            <div className="flex justify-center pt-8">
              <img
                src="https://media.giphy.com/media/JIX9t2j0ZTN9S/giphy.gif"
                alt="귀여운 고양이"
                className="w-40 h-40 object-contain rounded-full"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Posts List */}
      <section className="container mx-auto px-6 py-16 max-w-5xl">
        {posts.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-gray-600 text-lg">아직 게시글이 없습니다</p>
          </div>
        ) : (
          <div className="space-y-16">
            {posts.map((post) => (
              <Link
                key={post.id}
                to={`/posts/${post.id}`}
                className="block group"
              >
                <article className="space-y-4">
                  {/* 날짜 */}
                  <time className="text-sm text-gray-500 font-mono">
                    {new Date(post.createdAt).toLocaleDateString("ko-KR", {
                      year: "numeric",
                      month: "2-digit",
                      day: "2-digit",
                    })}
                  </time>

                  {/* 제목 */}
                  <h2 className="text-3xl font-bold text-gray-900 group-hover:text-gray-600 transition-colors leading-tight">
                    {post.title}
                  </h2>

                  {/* 내용 미리보기 */}
                  <p className="text-gray-600 leading-relaxed line-clamp-3">
                    {post.content.substring(0, 200)}...
                  </p>

                  {/* 메타 정보 */}
                  <div className="flex items-center gap-4 text-sm text-gray-500">
                    <span>조회 {post.viewCount}</span>
                  </div>
                </article>
              </Link>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}