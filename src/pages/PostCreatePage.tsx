import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { postApi } from "../api/post";
import { categoryApi } from "../api/category";
import type { Category } from "../types";
import { useAlert } from "../contexts/useAlert";
import TipTapEditor from "../components/editor/TipTapEditor";

export default function PostCreatePage() {
  const navigate = useNavigate();
  const [categories, setCategories] = useState<Category[]>([]);
  const [categoryId, setCategoryId] = useState<number>(0);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(false);
  const { showError, showWarning } = useAlert();
  const contentCharacters = content.trim().length;
  const wordCount = useMemo(() => {
    const plainText = content
      .replace(/```[\s\S]*?```/g, " ")
      .replace(/`[^`]*`/g, " ")
      .replace(/!\[[^\]]*]\([^)]+\)/g, " ")
      .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
      .replace(/[#>*_~-]/g, " ")
      .replace(/\n/g, " ")
      .replace(/\s+/g, " ")
      .trim();

    return plainText ? plainText.split(" ").length : 0;
  }, [content]);

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
    <div className="animate-fade-in">
      <h2 className="text-xl font-bold mb-1">New Post</h2>
      <div className="flex flex-wrap items-center gap-4 text-xs text-ink-light font-mono mb-6">
        <span>title {title.length}/200</span>
        <span>words {wordCount}</span>
        <span>chars {contentCharacters}</span>
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSubmit(false);
        }}
        className="space-y-5 pb-20"
      >
        {/* Title & Category */}
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <div className="md:col-span-2">
            <label htmlFor="title" className="mb-1.5 block text-xs font-medium text-ink-light">
              Title
            </label>
            <input
              type="text"
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              maxLength={200}
              className="h-10 w-full rounded-md border-[1.5px] border-ink-ghost bg-white px-3 text-sm text-ink placeholder:text-ink-faint transition-colors focus:border-ink focus:outline-none"
              placeholder="제목을 입력하세요"
            />
          </div>

          <div className="md:col-span-1">
            <label htmlFor="category" className="mb-1.5 block text-xs font-medium text-ink-light">
              Category
            </label>
            <select
              id="category"
              value={categoryId}
              onChange={(e) => setCategoryId(Number(e.target.value))}
              className="h-10 w-full rounded-md border-[1.5px] border-ink-ghost bg-white px-3 text-sm text-ink transition-colors focus:border-ink focus:outline-none"
            >
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Editor */}
        <div className="space-y-1.5">
          <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
            <label className="text-xs font-medium text-ink-light">Content</label>
            <span className="text-[10px] text-ink-faint">
              이미지는 붙여넣기 또는 업로드 버튼으로 추가
            </span>
          </div>
          <TipTapEditor value={content} onChange={setContent} />
        </div>

        {/* Action Bar */}
        <div className="sticky bottom-3 z-20 rounded-md border-[1.5px] border-ink-ghost bg-white p-3 shadow-sm">
          <div className="flex flex-col-reverse items-stretch justify-between gap-3 sm:flex-row sm:items-center">
            <button
              type="button"
              onClick={() => navigate("/")}
              className="inline-flex h-9 items-center justify-center rounded-md border-[1.5px] border-ink-ghost px-4 text-xs font-medium text-ink-light transition-colors hover:text-ink hover:border-ink"
            >
              Cancel
            </button>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => handleSubmit(true)}
                disabled={loading}
                className="inline-flex h-9 items-center justify-center rounded-md border-[1.5px] border-ink-ghost px-4 text-xs font-medium text-warning transition-colors hover:bg-yellow-50 disabled:cursor-not-allowed disabled:opacity-30"
              >
                {loading ? "..." : "Save Draft"}
              </button>
              <button
                type="submit"
                disabled={loading}
                className="inline-flex h-9 items-center justify-center rounded-md bg-accent px-4 text-xs font-medium text-accent-text transition-opacity hover:opacity-80 disabled:cursor-not-allowed disabled:opacity-30"
              >
                {loading ? "..." : "Publish"}
              </button>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
