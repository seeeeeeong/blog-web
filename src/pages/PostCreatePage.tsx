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
      showError("Failed to load categories.");
    }
  }, [showError]);

  useEffect(() => {
    void loadCategories();
  }, [loadCategories]);

  const validateForm = (): boolean => {
    if (!categoryId) {
      showWarning("Please select a category.");
      return false;
    }
    if (!title.trim()) {
      showWarning("Please enter a title.");
      return false;
    }
    if (!content.trim()) {
      showWarning("Please enter the content.");
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
      showError("Failed to create post.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="animate-fade-in">
      <div className="text-xs text-ink-faint mb-1">
        <span className="text-term-blue">~/blog</span> <span className="text-term-green">$</span> <span className="text-term-white">new post</span>
      </div>
      <h2 className="text-sm font-bold text-term-white mb-1">New Post</h2>
      <div className="flex flex-wrap items-center gap-4 text-[11px] text-ink-faint mb-6">
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
              className="h-9 w-full rounded border border-ink-ghost bg-surface px-3 text-xs text-term-white placeholder:text-ink-faint transition-colors focus:border-term-green focus:outline-none"
              placeholder="Enter title"
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
              className="h-9 w-full rounded border border-ink-ghost bg-surface px-3 text-xs text-term-white transition-colors focus:border-term-green focus:outline-none"
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
              Add images by pasting or using the upload button
            </span>
          </div>
          <TipTapEditor value={content} onChange={setContent} />
        </div>

        {/* Action Bar */}
        <div className="sticky bottom-3 z-20 rounded border border-ink-ghost bg-surface p-3">
          <div className="flex flex-col-reverse items-stretch justify-between gap-3 sm:flex-row sm:items-center">
            <button
              type="button"
              onClick={() => navigate("/")}
              className="inline-flex h-8 items-center justify-center rounded border border-ink-ghost px-4 text-[11px] text-ink-faint transition-colors hover:text-term-white hover:border-ink-faint"
            >
              cancel
            </button>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => handleSubmit(true)}
                disabled={loading}
                className="inline-flex h-8 items-center justify-center rounded border border-ink-ghost px-4 text-[11px] font-medium text-term-amber transition-colors hover:border-term-amber disabled:cursor-not-allowed disabled:opacity-30"
              >
                {loading ? "..." : "save draft"}
              </button>
              <button
                type="submit"
                disabled={loading}
                className="inline-flex h-8 items-center justify-center rounded bg-term-green px-4 text-[11px] font-medium text-panel transition-opacity hover:opacity-80 disabled:cursor-not-allowed disabled:opacity-30"
              >
                {loading ? "..." : "publish"}
              </button>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
