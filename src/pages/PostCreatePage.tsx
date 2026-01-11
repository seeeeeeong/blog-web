import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { postApi } from "../api/post";
import { categoryApi } from "../api/category";
import type { Category } from "../types";
import { useAlert } from "../contexts/AlertContext";
import TipTapEditor from "../components/editor/TipTapEditor";
import PageLayout from "../components/common/PageLayout";

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
    } catch {
      showError("Failed to load categories.");
    }
  };

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
      showWarning("Please enter content.");
      return false;
    }

    return true;
  };

  const handleSubmit = async (isDraft: boolean = false) => {
    if (!validateForm()) return;

    setLoading(true);
    try {
      const newPost = await postApi.createPost({
        categoryId,
        title: title.trim(),
        content: content.trim(),
        isDraft,
      });

      showSuccess(isDraft ? "Saved as draft." : "Post created successfully.");
      navigate(isDraft ? "/admin/posts" : `/posts/${newPost.id}`);
    } catch {
      showError("Failed to create post.");
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    if (title || content) {
      if (window.confirm("You have unsaved changes. Are you sure you want to leave?")) {
        navigate("/");
      }
    } else {
      navigate("/");
    }
  };

  return (
    <PageLayout title="Create Post">
      <div className="max-w-4xl mx-auto">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSubmit(false);
          }}
          className="space-y-8"
        >
        <div className="bg-card border border-border rounded-lg p-6 shadow-md space-y-6">
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
            <div className="sm:col-span-2">
              <label
                htmlFor="title"
                className="block text-sm font-sans font-semibold text-text mb-2"
              >
                Title
              </label>
              <input
                type="text"
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
                maxLength={200}
                className="block w-full px-4 py-2.5 border border-border rounded-lg bg-white text-text placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-text focus:border-text text-base font-sans transition-all-smooth"
                placeholder="Enter a captivating title..."
              />
            </div>

            <div className="sm:col-span-1">
              <label
                htmlFor="category"
                className="block text-sm font-sans font-semibold text-text mb-2"
              >
                Category
              </label>
              <div className="relative">
                <select
                  id="category"
                  value={categoryId}
                  onChange={(e) => setCategoryId(Number(e.target.value))}
                  className="block w-full appearance-none px-4 py-2.5 border border-border rounded-lg bg-white pr-10 text-text focus:outline-none focus:ring-2 focus:ring-text focus:border-text text-base font-sans transition-all-smooth cursor-pointer"
                >
                  {categories.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3 text-muted">
                  <svg
                    className="h-5 w-5"
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div>
          <label className="block text-sm font-sans font-semibold text-text mb-3">
            Content
          </label>
          <TipTapEditor value={content} onChange={setContent} />
        </div>

        <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-3 pt-4 border-t border-border">
          <button
            type="button"
            onClick={handleCancel}
            className="px-5 py-2.5 text-sm font-sans font-medium text-muted hover:text-text transition-all-smooth"
          >
            Cancel
          </button>
          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => handleSubmit(true)}
              disabled={loading}
              className="px-6 py-2.5 text-sm font-sans font-semibold text-text bg-white border border-border rounded-lg hover:bg-hover disabled:opacity-50 disabled:cursor-not-allowed transition-all-smooth shadow-sm hover:shadow-md active:scale-[0.98]"
            >
              {loading ? "Saving..." : "Save Draft"}
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2.5 text-sm font-sans font-semibold text-white bg-text hover:bg-text/90 disabled:opacity-50 disabled:cursor-not-allowed transition-all-smooth rounded-lg shadow-md hover:shadow-lg active:scale-[0.98]"
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