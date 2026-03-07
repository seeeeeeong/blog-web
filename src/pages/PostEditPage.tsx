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

  const handleSubmit = async (isDraft = false) => {
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

  if (initialLoading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Spinner />
      </div>
    );
  }

  if (loadError) {
    return (
      <PageLayout title="Edit Post">
        <div className="opl-card rounded-2xl p-10 text-center">
          <p className="mb-5 text-sm text-muted">Could not load post or you do not have permission to edit.</p>
          <Link to="/" className="ui-btn ui-btn-ghost">
            Home
          </Link>
        </div>
      </PageLayout>
    );
  }

  return (
    <PageLayout title="Edit Post">
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
                placeholder="Update title"
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
            <button type="button" onClick={() => navigate(`/posts/${postId}`)} className="ui-btn ui-btn-ghost">
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
                {loading ? "Updating..." : "Update Post"}
              </button>
            </div>
          </div>
        </form>
      </div>
    </PageLayout>
  );
}
