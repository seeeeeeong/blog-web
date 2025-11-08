import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { postApi } from "../api/post";
import type { Post } from "../types";

export default function PostDetailPage() {
  const { postId } = useParams<{ postId: string }>();
  const navigate = useNavigate();
  const [post, setPost] = useState<Post | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAuthor, setIsAuthor] = useState(false);

  useEffect(() => {
    loadPost();
  }, [postId]);

  const loadPost = async () => {
    try {
      const data = await postApi.getPost(Number(postId));
      setPost(data);

      // 작성자인지 확인
      const userId = localStorage.getItem("userId");
      setIsAuthor(userId === String(data.userId));
    } catch (error) {
      console.error("게시글 로딩 실패:", error);
      alert("게시글을 찾을 수 없습니다.");
      navigate("/");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm("정말 삭제하시겠습니까?")) return;

    try {
      await postApi.deletePost(Number(postId));
      alert("삭제되었습니다.");
      navigate("/");
    } catch (error) {
      console.error("삭제 실패:", error);
      alert("삭제에 실패했습니다.");
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">로딩중...</div>
    );
  }

  if (!post) {
    return (
      <div className="container mx-auto px-4 py-8">
        게시글을 찾을 수 없습니다.
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      {/* 상단 버튼 */}
      <div className="flex justify-between mb-6">
        <Link to="/" className="text-gray-600 hover:text-gray-800">
          ← 목록으로
        </Link>

        {isAuthor && (
          <div className="flex gap-2">
            <button
              onClick={handleDelete}
              className="text-red-600 hover:text-red-800"
            >
              삭제
            </button>
          </div>
        )}
      </div>

      {/* 게시글 내용 */}
      <article className="bg-white rounded-lg shadow-md p-8">
        <h1 className="text-3xl font-bold mb-4">{post.title}</h1>

        <div className="flex items-center gap-4 text-sm text-gray-500 mb-8 pb-8 border-b">
          <span>조회 {post.viewCount}</span>
          <span>|</span>
          <span>{new Date(post.createdAt).toLocaleDateString()}</span>
        </div>

        <div className="prose max-w-none">
          <p className="whitespace-pre-wrap text-gray-700 leading-relaxed">
            {post.content}
          </p>
        </div>
      </article>

      {/* 댓글 영역 (나중에 추가) */}
      <div className="mt-8">
        <h3 className="text-xl font-bold mb-4">댓글</h3>
        <p className="text-gray-500">댓글 기능은 곧 추가됩니다.</p>
      </div>
    </div>
  );
}
