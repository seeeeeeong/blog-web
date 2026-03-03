import { useCallback, useState, useEffect } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { postApi } from "../api/post";
import { categoryApi } from "../api/category";
import type { Category } from "../types";
import { useAlert } from "../contexts/useAlert";
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
  const { showError, showWarning } = useAlert();

  const loadCategories = useCallback(async () => {
    try {
      const data = await categoryApi.getCategories();
      setCategories(data);
    } catch {
      showError("카테고리를 불러오지 못했습니다.");
    }
  }, [showError]);

  const loadPost = useCallback(async () => {
    try {
      const data = await postApi.getPostForAdmin(Number(postId));

      setCategoryId(data.categoryId);
      setTitle(data.title);
      setContent(data.content);
    } catch {
      showError("게시글을 찾을 수 없습니다.");
      setLoadError(true);
    } finally {
      setInitialLoading(false);
    }
  }, [postId, showError]);

  useEffect(() => {
    const loadData = async () => {
      await loadCategories();
      await loadPost();
    };
    void loadData();
  }, [loadCategories, loadPost]);

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

      navigate(isDraft ? "/admin/posts" : `/posts/${postId}`);
    } catch {
      showError("게시글 수정에 실패했습니다.");
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    navigate(`/posts/${postId}`);
  };

  if (initialLoading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <Spinner />
      </div>
    );
  }

  if (loadError) {
    return (
      <PageLayout title="Error">
        <div className="text-center py-20">
          <p className="text-sm font-mono text-muted mb-6">
            Could not load post or you do not have permission to edit.
          </p>
          <Link
            to="/"
            className="font-mono text-sm text-gray-800 underline hover:text-text"
          >
            Home
          </Link>
        </div>
      </PageLayout>
    );
  }

  return (
    <PageLayout title="Edit Post">
      <div className="max-w-3xl mx-auto">
        <h2 className="text-2xl font-bold text-text tracking-tight mb-8">
          Edit Post
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
                {loading ? "Updating..." : "Update Post"}
              </button>
            </div>
          </div>
        </form>
      </div>
    </PageLayout>
  );
}
