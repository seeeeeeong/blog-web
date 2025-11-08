"use client";

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
      <div className="flex justify-center items-center h-screen">
        <div className="text-center space-y-4">
          <div className="inline-block w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
          <p className="text-muted-foreground">로딩 중...</p>
        </div>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="container mx-auto px-4 py-8">
        <p className="text-center text-muted-foreground">
          게시글을 찾을 수 없습니다.
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 max-w-4xl">
          <div className="flex justify-between items-center">
            <Link
              to="/"
              className="text-muted-foreground hover:text-foreground transition-colors flex items-center gap-2 font-semibold"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 19l-7-7 7-7"
                />
              </svg>
              돌아가기
            </Link>

            {isAuthor && (
              <button
                onClick={handleDelete}
                className="text-red-600 hover:bg-red-50 px-4 py-2 rounded-lg transition-colors duration-200 font-semibold text-sm"
              >
                삭제
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-12 max-w-4xl">
        <article className="bg-card rounded-xl shadow-lg border border-border p-10 space-y-8">
          {/* Title Section */}
          <div className="space-y-4">
            <h1 className="text-4xl font-bold text-foreground leading-tight">
              {post.title}
            </h1>
            <div className="flex items-center gap-4 text-sm text-muted-foreground flex-wrap pt-4 border-t border-border">
              <span className="inline-flex items-center gap-1.5">
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                  />
                </svg>
                {post.viewCount}
              </span>
              <span>•</span>
              <span>
                {new Date(post.createdAt).toLocaleDateString("ko-KR", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </span>
            </div>
          </div>

          {/* Content */}
          <div className="prose prose-lg max-w-none">
            <p className="whitespace-pre-wrap text-foreground leading-relaxed text-base">
              {post.content}
            </p>
          </div>
        </article>

        {/* Comments Section */}
        <div className="mt-12 bg-card rounded-xl shadow-lg border border-border p-8">
          <h3 className="text-2xl font-bold text-foreground mb-4">댓글</h3>
          <p className="text-muted-foreground">댓글 기능은 곧 추가됩니다.</p>
        </div>
      </div>
    </div>
  );
}
