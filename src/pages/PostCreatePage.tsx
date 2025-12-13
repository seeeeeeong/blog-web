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
      console.error("카테고리 로딩 실패:", error);
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
      const newPost = await postApi.createPost({
        categoryId,
        title: title.trim(),
        content: content.trim(),
        isDraft,
      });

      showSuccess(isDraft ? "Saved as draft." : "Post created successfully.");

      if (isDraft) {
        navigate("/admin/posts");
      } else {
        navigate(`/posts/${newPost.id}`);
      }
    } catch (error) {
      console.error("Failed to create post:", error);
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
          className="space-y-10 p-8 bg-white rounded-lg shadow-lg"
        >
          <div className="space-y-6">
            <div className="grid grid-cols-1 gap-y-6 sm:grid-cols-6 sm:gap-x-6">
              <div className="sm:col-span-4">
                <label
                  htmlFor="title"
                  className="block text-sm font-medium leading-5 text-gray-700 font-mono"
                >
                  Title
                </label>
                <div className="mt-1">
                  <input
                    type="text"
                    id="title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    required
                    maxLength={200}
                    className="block w-full border-b-2 border-gray-300 bg-transparent py-2 text-gray-900 placeholder:text-gray-400 focus:border-gray-900 focus:ring-0 sm:text-sm sm:leading-6 font-mono transition-colors duration-200"
                    placeholder="Enter a captivating title"
                  />
                </div>
                <p className="mt-2 text-xs leading-5 text-gray-500 text-right">
                  </p>
              </div>

              <div className="sm:col-span-2">
                <label
                  htmlFor="category"
                  className="block text-sm font-medium leading-5 text-gray-700 font-mono"
                >
                  Category
                </label>
                <div className="mt-1 relative">
                  <select
                    id="category"
                    value={categoryId}
                    onChange={(e) => setCategoryId(Number(e.target.value))}
                    className="block w-full appearance-none border-b-2 border-gray-300 bg-transparent py-2 pr-8 text-gray-900 focus:border-gray-900 focus:ring-0 sm:text-sm sm:leading-6 font-mono transition-colors duration-200"
                  >
                    {categories.map((category) => (
                      <option key={category.id} value={category.id}>
                        {category.name}
                      </option>
                    ))}
                  </select>
                  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                    <svg
                      className="h-4 w-4"
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                      aria-hidden="true"
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
              <div className="mt-1 border-b-2 border-gray-300 focus-within:border-gray-900 transition-colors duration-200">
                <TipTapEditor value={content} onChange={setContent} />
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-x-4">
            <button
              type="button"
              onClick={handleCancel}
              className="px-4 py-2 text-sm font-semibold text-gray-600 hover:text-gray-900 font-mono transition-colors duration-200"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={() => handleSubmit(true)}
              disabled={loading}
              className="px-4 py-2 text-sm font-semibold text-gray-800 bg-gray-100 rounded-lg shadow-sm hover:bg-gray-200 disabled:opacity-50 font-mono transition-colors duration-200"
            >
              {loading ? "Saving..." : "Save Draft"}
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 text-sm font-semibold text-white bg-gray-900 rounded-lg shadow-md hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:ring-offset-2 disabled:opacity-50 font-mono transition-colors duration-200"
            >
              {loading ? "Publishing..." : "Publish"}
            </button>
          </div>
        </form>
    </PageLayout>
  );
}