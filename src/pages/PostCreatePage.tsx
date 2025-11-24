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

  const handleSubmit = async (isDraft: boolean = false) => {
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
        isDraft,
      });

      showSuccess(isDraft ? "임시저장되었습니다." : "게시글이 작성되었습니다.");
      
      if (isDraft) {
        navigate("/admin/posts");
      } else {
        navigate(`/posts/${newPost.id}`);
      }
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
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <div className="border-b border-gray-900 bg-gray-100">
        <div className="container mx-auto px-4 sm:px-8 py-4 max-w-7xl">
          <div className="flex justify-between items-center">
            <button
              onClick={handleCancel}
              className="text-sm font-mono text-gray-900 hover:underline"
            >
              ← CANCEL
            </button>

            <div className="flex items-center gap-4 text-sm font-mono">
              <button
                onClick={() => handleSubmit(true)}
                disabled={loading}
                className="text-gray-900 hover:underline disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? "SAVING..." : "SAVE DRAFT"}
              </button>

              <button
                onClick={() => handleSubmit(false)}
                disabled={loading}
                className="px-4 py-2 border border-gray-900 text-gray-900 hover:bg-gray-900 hover:text-gray-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? "PUBLISHING..." : "PUBLISH"}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Form */}
      <div className="container mx-auto px-4 sm:px-8 py-12 max-w-7xl">
        <form onSubmit={(e) => { e.preventDefault(); handleSubmit(false); }} className="space-y-8">
          {/* Category */}
          <div>
            <label className="block text-xs font-mono text-gray-900 mb-2">
              CATEGORY
            </label>
            <select
              value={categoryId}
              onChange={(e) => setCategoryId(Number(e.target.value))}
              className="w-full px-4 py-3 bg-gray-100 border border-gray-900 font-mono text-sm text-gray-900 focus:outline-none focus:bg-white transition-all"
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
              className="w-full text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 placeholder:text-gray-400 bg-gray-100 border-none outline-none focus:ring-0 px-0 font-mono"
              placeholder="제목을 입력하세요"
            />
            <p className="text-xs font-mono text-gray-600 mt-2 text-right">
              {title.length}/200
            </p>
          </div>

          {/* MarkdownEditor */}
          <div>
            <MarkdownEditor value={content} onChange={setContent} />
          </div>
        </form>
      </div>
    </div>
  );
}