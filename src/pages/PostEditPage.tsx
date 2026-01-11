import { useState, useEffect } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { postApi } from "../api/post";
import { categoryApi } from "../api/category";
import type { Category } from "../types";
import { useAlert } from "../contexts/AlertContext";
import TipTapEditor from "../components/editor/TipTapEditor";
import PageLayout from "../components/common/PageLayout";
import Spinner from "../components/common/Spinner";

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
    } catch {
      showError("Failed to load categories.");
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
    } catch {
      showError("Post not found.");
      setLoadError(true);
    } finally {
      setInitialLoading(false);
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
      await postApi.updatePost(Number(postId), {
        categoryId,
        title: title.trim(),
        content: content.trim(),
        isDraft,
      });

      showSuccess(isDraft ? "Saved as draft." : "Post updated successfully.");
      navigate(isDraft ? "/admin/posts" : `/posts/${postId}`);
    } catch {
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
      <div className="flex justify-center items-center min-h-screen">
        <Spinner />
      </div>
    );
  }

  if (loadError) {
    return (
      <PageLayout title="Error">
        <div className="text-center py-20">
          <p className="text-lg font-mono text-secondary mb-8 uppercase tracking-wide">
            Could not load post or you do not have permission to edit.
          </p>
          <Link
            to="/"
            className="btn-interactive px-6 py-3 bg-primary text-white font-mono text-sm hover:bg-accent-green hover:text-primary transition-all-smooth inline-block border border-primary shadow-[1px_1px_0_#232324] hover:shadow-[2px_2px_0_#232324] hover:-translate-y-0.5 uppercase tracking-wide"
          >
            Back to home
          </Link>
        </div>
      </PageLayout>
    );
  }

  return (
    <PageLayout title="Edit Post">
      <div className="max-w-5xl mx-auto">
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
                className="block text-sm font-mono font-semibold text-primary mb-2 uppercase tracking-wide"
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
                className="block w-full border-b border-primary bg-transparent py-3 text-primary placeholder:text-tertiary focus:border-primary focus:ring-2 focus:ring-primary text-base font-mono transition-all-smooth"
                placeholder="Enter a captivating title"
              />
            </div>

            <div className="sm:col-span-2">
              <label
                htmlFor="category"
                className="block text-sm font-mono font-semibold text-primary mb-2 uppercase tracking-wide"
              >
                Category
              </label>
              <div className="relative">
                <select
                  id="category"
                  value={categoryId}
                  onChange={(e) => setCategoryId(Number(e.target.value))}
                  className="block w-full appearance-none border-b border-primary bg-transparent py-3 pr-8 text-primary focus:border-primary focus:ring-2 focus:ring-primary text-base font-mono transition-all-smooth uppercase"
                >
                  {categories.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2 text-secondary">
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
            className="px-6 py-2.5 text-sm font-mono text-tertiary hover:text-primary transition-all-smooth uppercase tracking-wide relative after:absolute after:bottom-0 after:left-0 after:w-0 after:h-0.5 after:bg-primary after:transition-all hover:after:w-full"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={() => handleSubmit(true)}
            disabled={loading}
            className="btn-interactive px-6 py-2.5 text-sm font-mono text-primary border border-primary hover:bg-primary hover:text-white disabled:opacity-50 transition-all-smooth shadow-[1px_1px_0_#232324] hover:shadow-[2px_2px_0_#232324] hover:-translate-y-0.5 active:translate-y-0 uppercase tracking-wide"
          >
            {loading ? "Saving..." : "Save Draft"}
          </button>
          <button
            type="submit"
            disabled={loading}
            className="btn-interactive px-6 py-2.5 text-sm font-mono text-white bg-primary hover:bg-accent-green hover:text-primary disabled:opacity-50 transition-all-smooth border border-primary shadow-[1px_1px_0_#232324] hover:shadow-[2px_2px_0_#232324] hover:-translate-y-0.5 active:translate-y-0 uppercase tracking-wide"
          >
            {loading ? "Updating..." : "Update Post"}
          </button>
        </div>
        </form>
      </div>
    </PageLayout>
  );
}