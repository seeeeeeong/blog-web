import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { postApi } from "../api/post";
import { categoryApi } from "../api/category";
import type { Category } from "../types";
import { useAlert } from "../contexts/AlertContext";
import MarkdownEditor from "../components/editor/MarkdownEditor";

export default function PostEditPage() {
  const { postId } = useParams<{ postId: string }>();
  const navigate = useNavigate();
  const [categories, setCategories] = useState<Category[]>([]);
  const [categoryId, setCategoryId] = useState<number>(0);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const { showSuccess, showError, showWarning } = useAlert();

  useEffect(() => {
    loadCategories();
    loadPost();
  }, []);

  const loadCategories = async () => {
    try {
      const data = await categoryApi.getCategories();
      setCategories(data);
    } catch (error) {
      console.error("카테고리 로딩 실패:", error);
    }
  };

  const loadPost = async () => {
    try {
      const data = await postApi.getPost(Number(postId));
      
      const userId = localStorage.getItem("userId");
      if (String(data.userId) !== userId) {
        showError("수정 권한이 없습니다.");
        navigate(`/posts/${postId}`);
        return;
      }

      setCategoryId(data.categoryId);
      setTitle(data.title);
      setContent(data.content);
    } catch (error) {
      console.error("게시글 로딩 실패:", error);
      showError("게시글을 찾을 수 없습니다.");
      navigate("/");
    } finally {
      setInitialLoading(false);
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
      await postApi.updatePost(Number(postId), {
        categoryId,
        title: title.trim(),
        content: content.trim(),
        isDraft,
      });

      showSuccess(isDraft ? "임시저장되었습니다." : "게시글이 수정되었습니다.");
      
      if (isDraft) {
        navigate("/admin/posts");
      } else {
        navigate(`/posts/${postId}`);
      }
    } catch (error) {
      console.error("수정 실패:", error);
      showError("게시글 수정에 실패했습니다.");
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    if (window.confirm("수정을 취소하시겠습니까?")) {
      navigate(`/posts/${postId}`);
    }
  };

  if (initialLoading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <div className="w-8 h-8 border-2 border-gray-300 border-t-gray-900 rounded-full animate-spin"></div>
      </div>
    );
  }

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
                {loading ? "UPDATING..." : "UPDATE"}
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