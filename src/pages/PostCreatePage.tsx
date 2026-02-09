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
      <div className="max-w-3xl mx-auto">
        <h2 className="text-2xl font-bold text-text tracking-tight mb-8">
          New Post
        </h2>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSubmit(false);
          }}
          className="space-y-6"
        >
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
            <div className="sm:col-span-2">
              <label
                htmlFor="title"
                className="block text-sm font-mono text-muted mb-2"
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
                className="block w-full px-3 py-2 border-b border-gray-500 bg-transparent text-text font-mono placeholder:text-gray-400 focus:outline-none focus:border-text text-base transition-colors"
                placeholder="Enter title..."
              />
            </div>

            <div className="sm:col-span-1">
              <label
                htmlFor="category"
                className="block text-sm font-mono text-muted mb-2"
              >
                Category
              </label>
              <select
                id="category"
                value={categoryId}
                onChange={(e) => setCategoryId(Number(e.target.value))}
                className="block w-full px-3 py-2 border-b border-gray-500 bg-transparent text-text font-mono focus:outline-none focus:border-text text-base transition-colors cursor-pointer"
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
            <label className="block text-sm font-mono text-muted mb-3">
              Content
            </label>
            <TipTapEditor value={content} onChange={setContent} />
          </div>

          <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-3 pt-6 border-t border-gray-300">
            <button
              type="button"
              onClick={handleCancel}
              className="font-mono text-sm text-muted hover:text-text underline"
            >
              Cancel
            </button>
            <div className="flex gap-4">
              <button
                type="button"
                onClick={() => handleSubmit(true)}
                disabled={loading}
                className="font-mono text-sm text-gray-800 hover:text-text underline disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? "Saving..." : "Save Draft"}
              </button>
              <button
                type="submit"
                disabled={loading}
                className="font-mono text-sm px-6 py-2 bg-text text-white hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
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
