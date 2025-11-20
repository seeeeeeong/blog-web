import type React from "react";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { postApi } from "../api/post";
import { categoryApi } from "../api/category";
import type { Category } from "../types";
import { useAlert } from "../contexts/AlertContext";
import MarkdownEditor from "../components/editor/MarkdownEditor";

export default function PostCreatePage() {
  const navigate = useNavigate();
  const [categories, setCategories] = useState<Category[]>([]);
  const [categoryId, setCategoryId] = useState<number>(0);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(false);
  const { showSuccess, showError, showWarning } = useAlert();

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
      showWarning("카테고리를 선택해주세요.");
      return;
    }

    if (!title.trim()) {
      showWarning("제목을 입력해주세요.");
      return;
    }

    if (!content.trim()) {
      showWarning("내용을 입력해주세요.");
      return;
    }

    setLoading(true);
    try {
      const newPost = await postApi.createPost({
        categoryId,
        title: title.trim(),
        content: content.trim(),
      });

      showSuccess("게시글이 작성되었습니다.");
      navigate(`/posts/${newPost.id}`);
    } catch (error) {
      console.error("작성 실패:", error);
      showError("게시글 작성에 실패했습니다.");
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    if (title || content) {
      if (window.confirm("작성 중인 내용이 있습니다. 정말 나가시겠습니까?")) {
        navigate("/");
      }
    } else {
      navigate("/");
    }
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="border-b border-gray-200 sticky top-16 bg-white/80 backdrop-blur-sm z-10">
        <div className="container mx-auto px-6 py-4 max-w-4xl">
          <div className="flex justify-between items-center">
            <button
              onClick={handleCancel}
              className="text-sm text-gray-600 hover:text-gray-900 transition-colors flex items-center gap-2"
            >
              <span>←</span>
              <span>Cancel</span>
            </button>

            <button
              onClick={handleSubmit}
              disabled={loading}
              className="px-6 py-2 bg-gray-900 text-white text-sm rounded hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Publishing..." : "Publish"}
            </button>
          </div>
        </div>
      </div>

      {/* Form */}
      <div className="container mx-auto px-6 py-12 max-w-4xl">
        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Category */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Category
            </label>
            <select
              value={categoryId}
              onChange={(e) => setCategoryId(Number(e.target.value))}
              className="w-full px-4 py-3 bg-white border border-gray-300 rounded text-gray-900 focus:outline-none focus:border-gray-900 focus:ring-1 focus:ring-gray-900 transition-all"
            >
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
          </div>

          {/* Title */}
          <div>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              maxLength={200}
              className="w-full text-4xl md:text-5xl font-bold text-gray-900 placeholder:text-gray-300 border-none outline-none focus:ring-0 px-0"
              placeholder="제목을 입력하세요"
            />
          </div>

          {/* Content */}
          {/* Content - 마크다운 에디터 */}
          <div>
            <MarkdownEditor
              value={content}
              onChange={setContent}
            />
          </div>
        </form>
      </div>
    </div>
  );
}