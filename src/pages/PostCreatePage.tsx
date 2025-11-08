import type React from "react";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { postApi } from "../api/post";
import { categoryApi } from "../api/category";
import type { Category } from "../types";

export default function PostCreatePage() {
  const navigate = useNavigate();
  const [categories, setCategories] = useState<Category[]>([]);
  const [categoryId, setCategoryId] = useState<number>(0);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    try {
      const data = await categoryApi.getCategories();
      setCategories(data);
      if (data.length > 0) {
        setCategoryId(data[0].id);
      }
    } catch (error) {
      console.error("카테고리 로딩 실패:", error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!categoryId) {
      alert("카테고리를 선택해주세요.");
      return;
    }

    setLoading(true);
    try {
      const newPost = await postApi.createPost({
        categoryId,
        title,
        content,
      });

      alert("게시글이 작성되었습니다.");
      navigate(`/posts/${newPost.id}`);
    } catch (error) {
      console.error("작성 실패:", error);
      alert("게시글 작성에 실패했습니다.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-6 max-w-4xl">
          <button
            onClick={() => navigate("/")}
            className="text-muted-foreground hover:text-foreground transition-colors flex items-center gap-2 mb-4 font-semibold"
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
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-12 max-w-4xl">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-foreground">새 게시글 작성</h1>
          <p className="text-muted-foreground mt-2">자신의 생각을 공유하세요</p>
        </div>

        {/* Form */}
        <form
          onSubmit={handleSubmit}
          className="bg-card rounded-xl shadow-lg border border-border p-8"
        >
          <div className="space-y-8">
            {/* Category Select */}
            <div className="space-y-3">
              <label className="block text-sm font-semibold text-foreground">
                카테고리
              </label>
              <select
                value={categoryId}
                onChange={(e) => setCategoryId(Number(e.target.value))}
                className="w-full px-4 py-3 bg-muted border border-border rounded-lg text-foreground focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
              >
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Title Input */}
            <div className="space-y-3">
              <label className="block text-sm font-semibold text-foreground">
                제목
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
                maxLength={200}
                className="w-full px-4 py-3 bg-muted border border-border rounded-lg text-foreground placeholder:text-muted-foreground focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                placeholder="매력적인 제목을 입력하세요"
              />
              <p className="text-xs text-muted-foreground">
                {title.length}/200
              </p>
            </div>

            {/* Content Textarea */}
            <div className="space-y-3">
              <label className="block text-sm font-semibold text-foreground">
                내용
              </label>
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                required
                rows={15}
                className="w-full px-4 py-3 bg-muted border border-border rounded-lg text-foreground placeholder:text-muted-foreground focus:ring-2 focus:ring-primary focus:border-transparent transition-all resize-none"
                placeholder="내용을 입력하세요"
              />
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end gap-3 pt-6 border-t border-border">
              <button
                type="button"
                onClick={() => navigate("/")}
                className="px-6 py-3 border border-border rounded-lg hover:bg-muted text-foreground transition-colors duration-200 font-semibold"
              >
                취소
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary-dark disabled:bg-muted disabled:text-muted-foreground transition-colors duration-200 font-semibold"
              >
                {loading ? "작성 중..." : "작성 완료"}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
