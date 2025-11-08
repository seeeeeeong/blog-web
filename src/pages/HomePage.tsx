import { useEffect, useState } from "react";
import { postApi } from "../api/post";
import type { Post } from "../types";
import { Link } from "react-router-dom";

export default function HomePage() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadPosts();
  }, []);

  const loadPosts = async () => {
    try {
      const data = await postApi.getPosts(0, 10);
      setPosts(data.posts);
    } catch (error) {
      console.error("게시글 로딩 실패:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="w-8 h-8 border-2 border-gray-300 border-t-gray-900 rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-white border-b border-gray-200">
        <div className="container mx-auto px-4 py-8 max-w-6xl flex justify-center">
          <img
            src="https://media.giphy.com/media/JIX9t2j0ZTN9S/giphy.gif"
            alt="귀여운 고양이"
            className="w-40 h-40 object-contain rounded-full shadow-sm"
          />
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-12 max-w-6xl">
        {posts.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-lg border border-gray-200">
            <p className="text-gray-600 text-lg mb-6">아직 게시글이 없습니다</p>
            <Link
              to="/posts/create"
              className="btn-primary inline-flex items-center gap-2"
            >
              <span>글 작성하기</span>
            </Link>
          </div>
        ) : (
          <div className="space-y-12">
            {/* Posts List */}
            <div className="space-y-8">
              {posts.map((post) => (
                <Link
                  key={post.id}
                  to={`/posts/${post.id}`}
                  className="block bg-white rounded-lg border border-gray-200 p-8 hover:border-gray-300 hover:shadow-sm transition-all duration-200"
                >
                  <article className="space-y-4">
                    {/* Title */}
                    <h2 className="text-2xl font-bold text-gray-900 hover:text-gray-700 transition-colors line-clamp-2">
                      {post.title}
                    </h2>

                    {/* Content Preview */}
                    <p className="text-gray-600 leading-relaxed line-clamp-3">
                      {post.content.substring(0, 200)}...
                    </p>

                    {/* Meta Info */}
                    <div className="flex items-center gap-4 pt-4 text-sm text-gray-500">
                      <time>
                        {new Date(post.createdAt).toLocaleDateString("ko-KR", {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        })}
                      </time>
                      <span>·</span>
                      <span>조회 {post.viewCount}</span>
                    </div>
                  </article>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
