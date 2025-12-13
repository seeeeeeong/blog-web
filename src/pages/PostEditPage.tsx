import { useState, useEffect } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { postApi } from "../api/post";
import { categoryApi } from "../api/category";
import type { Category } from "../types";
import { useAlert } from "../contexts/AlertContext";
import TipTapEditor from "../components/editor/TipTapEditor";
import PageLayout from "../components/common/PageLayout";

export default function PostEditPage() {
  const { postId } = useParams<{ postId: string }>();
  const navigate = useNavigate();
  const [categories, setCategories] = useState<Category[]>([]);
  const [categoryId, setCategoryId] = useState<number>(0);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);
  const { showSuccess, showError, showWarning } = useAlert();

  useEffect(() => {
    const loadData = async () => {
      await loadCategories();
      await loadPost();
    };
    loadData();
  }, []);

  const loadCategories = async () => {
    try {
      const data = await categoryApi.getCategories();
      setCategories(data);
    } catch (error) {
      console.error("Failed to load categories:", error);
    }
  };

  const loadPost = async () => {
    try {
      const data = await postApi.getPost(Number(postId));
      const userId = localStorage.getItem("userId");
      if (String(data.userId) !== userId) {
        showError("You do not have permission to edit this post.");
        setLoadError(true);
        setInitialLoading(false);
        return;
      }
      setCategoryId(data.categoryId);
      setTitle(data.title);
      setContent(data.content);
    } catch (error) {
      console.error("Failed to load post:", error);
      showError("Post not found.");
      setLoadError(true);
    } finally {
      setInitialLoading(false);
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
      await postApi.updatePost(Number(postId), {
        categoryId,
        title: title.trim(),
        content: content.trim(),
        isDraft,
      });
      showSuccess(isDraft ? "Saved as draft." : "Post updated successfully.");
      if (isDraft) {
        navigate("/admin/posts");
      } else {
        navigate(`/posts/${postId}`);
      }
    } catch (error) {
      console.error("Failed to update post:", error);
      showError("Failed to update post.");
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    if (window.confirm("Are you sure you want to cancel editing?")) {
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

  if (loadError) {
    return (
      <PageLayout title="Error">
        <div className="text-center">
          <p className="text-gray-600 mb-6">
            Could not load post or you do not have permission to edit.
          </p>
          <Link
            to="/"
            className="text-gray-900 hover:text-gray-600 underline"
          >
            Back to home
          </Link>
        </div>
      </PageLayout>
    );
  }

  return (
    <PageLayout title="Edit Post">
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
              {loading ? "Updating..." : "Update Post"}
            </button>
          </div>
        </form>
    </PageLayout>
  );
}