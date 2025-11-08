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
      <div className="flex justify-center items-center h-screen">로딩중...</div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">블로그</h1>

      <div className="grid gap-6">
        {posts.map((post) => (
          <Link
            key={post.id}
            to={`/posts/${post.id}`}
            className="border rounded-lg p-6 hover:shadow-lg transition"
          >
            <h2 className="text-xl font-semibold mb-2">{post.title}</h2>
            <p className="text-gray-600 mb-4">
              {post.content.substring(0, 150)}...
            </p>
            <div className="flex justify-between text-sm text-gray-500">
              <span>조회 {post.viewCount}</span>
              <span>{new Date(post.createdAt).toLocaleDateString()}</span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
