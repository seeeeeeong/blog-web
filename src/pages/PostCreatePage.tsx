import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { postApi } from "../api/post";
import { categoryApi } from "../api/category";
import type { Category } from "../types";
import { useAlert } from "../contexts/useAlert";
import TipTapEditor from "../components/editor/TipTapEditor";
import PageLayout from "../components/common/PageLayout";

export default function PostCreatePage() {
  const navigate = useNavigate();
  const [categories, setCategories] = useState<Category[]>([]);
  const [categoryId, setCategoryId] = useState<number>(0);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(false);
  const { showError, showWarning } = useAlert();

  const loadCategories = useCallback(async () => {
    try {
      const data = await categoryApi.getCategories();
      setCategories(data);
      if (data.length > 0) {
        setCategoryId(data[0].id);
      }
    } catch {
      showError("카테고리를 불러오지 못했습니다.");
    }
  }, [showError]);

  useEffect(() => {
    void loadCategories();
  }, [loadCategories]);

  const validateForm = (): boolean => {
    if (!categoryId) {
      showWarning("카테고리를 선택해 주세요.");
      return false;
    }
    if (!title.trim()) {
      showWarning("제목을 입력해 주세요.");
      return false;
    }
    if (!content.trim()) {
      showWarning("본문을 입력해 주세요.");
      return false;
    }
    return true;
  };

  const handleSubmit = async (isDraft = false) => {
    if (!validateForm()) return;

    setLoading(true);
    try {
      const newPost = await postApi.createPost({
        categoryId,
        title: title.trim(),
        content: content.trim(),
        isDraft,
      });

      navigate(isDraft ? "/admin/posts" : `/posts/${newPost.id}`);
    } catch {
      showError("게시글 등록에 실패했습니다.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <PageLayout title="Create Post">
      <div className="opl-card rounded-3xl p-5 sm:p-7">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSubmit(false);
          }}
          className="space-y-6"
        >
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div className="sm:col-span-2">
              <label htmlFor="title" className="mb-2 block font-mono text-xs uppercase tracking-[0.15em] text-muted">
                Title
              </label>
              <input
                type="text"
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
                maxLength={200}
                className="h-12 w-full rounded-xl border border-gray-300 bg-white px-4 text-sm text-text placeholder:text-muted focus:border-accent/80 focus:outline-none"
                placeholder="What are you shipping today?"
              />
            </div>

            <div className="sm:col-span-1">
              <label
                htmlFor="category"
                className="mb-2 block font-mono text-xs uppercase tracking-[0.15em] text-muted"
              >
                Category
              </label>
              <select
                id="category"
                value={categoryId}
                onChange={(e) => setCategoryId(Number(e.target.value))}
                className="h-12 w-full rounded-xl border border-gray-300 bg-white px-4 text-sm text-text focus:border-accent/80 focus:outline-none"
              >
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="mb-3 block font-mono text-xs uppercase tracking-[0.15em] text-muted">Content</label>
            <TipTapEditor value={content} onChange={setContent} />
          </div>

          <div className="flex flex-col-reverse items-stretch justify-between gap-3 border-t border-gray-300 pt-5 sm:flex-row sm:items-center">
            <button type="button" onClick={() => navigate("/")} className="ui-btn ui-btn-ghost">
              Cancel
            </button>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => handleSubmit(true)}
                disabled={loading}
                className="ui-btn ui-btn-ghost disabled:cursor-not-allowed disabled:opacity-50"
              >
                {loading ? "Saving..." : "Save Draft"}
              </button>
              <button
                type="submit"
                disabled={loading}
                className="ui-btn ui-btn-primary disabled:cursor-not-allowed disabled:opacity-50"
              >
                {loading ? "Publishing..." : "Publish"}
              </button>
            </div>
          </div>
        </form>
      </div>
    </PageLayout>
  );
}
