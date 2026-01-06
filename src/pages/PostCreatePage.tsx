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
    } catch (error) {
      console.error("Failed to load categories:", error);
    }
  };

  const handleSubmit = async (isDraft: boolean = false) => {
    if (!categoryId) {
      showWarning("Please select a category.");
      return;
    }

    if (!title.trim()) {
      showWarning("Please enter a title.");
      return;
    }

    if (!content.trim()) {
      showWarning("Please enter content.");
      return;
    }

    setLoading(true);
    try {
      console.log("Creating post...");
      const newPost = await postApi.createPost({
        categoryId,
        title: title.trim(),
        content: content.trim(),
        isDraft,
      });
      console.log("Post created successfully:", newPost);
      console.log("Navigating to post ID:", newPost.id);

      showSuccess(isDraft ? "Saved as draft." : "Post created successfully.");

      if (isDraft) {
        navigate("/admin/posts");
      } else {
        navigate(`/posts/${newPost.id}`);
      }
    } catch (error) {
      console.error("Failed to create post:", error);
      console.error("Error details:", error instanceof Error ? error.message : String(error));
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
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSubmit(false);
        }}
        className="space-y-10"
      >
        <div className="space-y-8">
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-6">
            <div className="sm:col-span-4">
              <label
                htmlFor="title"
                className="block text-sm font-mono font-semibold text-gray-900 mb-2"
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
                className="block w-full border-b-2 border-gray-300 bg-transparent py-3 text-gray-900 placeholder:text-gray-400 focus:border-gray-900 focus:ring-0 text-base font-mono transition-colors"
                placeholder="Enter a captivating title"
              />
            </div>

            <div className="sm:col-span-2">
              <label
                htmlFor="category"
                className="block text-sm font-mono font-semibold text-gray-900 mb-2"
              >
                Category
              </label>
              <div className="relative">
                <select
                  id="category"
                  value={categoryId}
                  onChange={(e) => setCategoryId(Number(e.target.value))}
                  className="block w-full appearance-none border-b-2 border-gray-300 bg-transparent py-3 pr-8 text-gray-900 focus:border-gray-900 focus:ring-0 text-base font-mono transition-colors"
                >
                  {categories.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2 text-gray-700">
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

          <div>
            <TipTapEditor value={content} onChange={setContent} />
          </div>
        </div>

        <div className="flex justify-end gap-4 pt-4">
          <button
            type="button"
            onClick={handleCancel}
            className="px-6 py-2.5 text-sm font-mono text-gray-700 hover:text-gray-900 transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={() => handleSubmit(true)}
            disabled={loading}
            className="px-6 py-2.5 text-sm font-mono text-gray-900 border-2 border-gray-300 hover:border-gray-900 disabled:opacity-50 transition-all"
          >
            {loading ? "Saving..." : "Save Draft"}
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-2.5 text-sm font-mono text-white bg-gray-900 hover:bg-gray-800 disabled:opacity-50 transition-all"
          >
            {loading ? "Publishing..." : "Publish"}
          </button>
        </div>
      </form>
    </PageLayout>
  );
}