import { useCallback, useEffect, useState } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { postApi } from "../../../storage/post/postApi";
import { usePostForm } from "../../support/hooks/usePostForm";
import { TipTapEditor } from "../components/editor/TipTapEditor";
import { Spinner } from "../components/common/Spinner";

export function PostEditPage() {
  const { postId } = useParams<{ postId: string }>();
  const navigate = useNavigate();
  const [initialLoading, setInitialLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);

  const {
    categories, categoryId, setCategoryId,
    title, setTitle, content, setContent,
    loading, setLoading, wordCount, contentCharacters,
    titleMaxLength, validateForm, showError,
  } = usePostForm();

  const loadPost = useCallback(async () => {
    try {
      const data = await postApi.getPostForAdmin(Number(postId));
      setCategoryId(data.categoryId);
      setTitle(data.title);
      setContent(data.content);
    } catch {
      showError("Post not found.");
      setLoadError(true);
    } finally {
      setInitialLoading(false);
    }
  }, [postId, showError, setCategoryId, setTitle, setContent]);

  useEffect(() => {
    void loadPost();
  }, [loadPost]);

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
      showError("Failed to update post.");
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
      <div className="max-w-[760px] mx-auto px-6 py-24 text-center animate-fade-in">
        <p className="text-danger text-sm mb-3">Post not found.</p>
        <p className="mb-6 text-[13px] text-muted">
          Could not load the post or you do not have permission to edit.
        </p>
        <Link
          to="/"
          className="inline-flex h-9 px-4 items-center rounded-md border border-border-dim hover:border-border-mid text-[13px] text-muted hover:text-ink transition-colors"
        >
          Back to home
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-[900px] mx-auto px-6 py-10 animate-fade-in">
      <div className="mb-8">
        <h1 className="text-[22px] font-semibold tracking-tighter-plus text-ink mb-2">
          Edit post
        </h1>
        <div className="flex flex-wrap items-center gap-4 text-[12px] text-faint font-mono">
          <span>title {title.length}/{titleMaxLength}</span>
          <span>words {wordCount}</span>
          <span>chars {contentCharacters}</span>
        </div>
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSubmit(false);
        }}
        className="space-y-5 pb-24"
      >
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <div className="md:col-span-2">
            <label htmlFor="title" className="mb-1.5 block text-[12px] font-medium text-muted">
              Title
            </label>
            <input
              type="text"
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              maxLength={titleMaxLength}
              className="h-9 w-full rounded-md border border-border-dim bg-raised px-3 text-[14px] text-ink placeholder:text-faint transition-colors focus:border-border-mid focus:outline-none"
              placeholder="Enter title"
            />
          </div>

          <div className="md:col-span-1">
            <label htmlFor="category" className="mb-1.5 block text-[12px] font-medium text-muted">
              Category
            </label>
            <select
              id="category"
              value={categoryId}
              onChange={(e) => setCategoryId(Number(e.target.value))}
              className="h-9 w-full rounded-md border border-border-dim bg-raised px-3 text-[14px] text-ink transition-colors focus:border-border-mid focus:outline-none"
            >
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="space-y-1.5">
          <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
            <label className="text-[12px] font-medium text-muted">Content</label>
            <span className="text-[11px] text-faint">
              Paste or upload images directly
            </span>
          </div>
          <TipTapEditor value={content} onChange={setContent} />
        </div>

        <div className="sticky bottom-3 z-20 rounded-lg border border-border-dim bg-raised/95 backdrop-blur p-3">
          <div className="flex flex-col-reverse items-stretch justify-between gap-3 sm:flex-row sm:items-center">
            <button
              type="button"
              onClick={() => navigate(`/posts/${postId}`)}
              className="h-8 px-4 rounded-md border border-border-dim hover:border-border-mid text-[13px] text-muted hover:text-ink transition-colors"
            >
              Cancel
            </button>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => handleSubmit(true)}
                disabled={loading}
                className="h-8 px-4 rounded-md border border-border-dim hover:border-border-mid text-[13px] font-medium text-muted hover:text-ink transition-colors disabled:opacity-30"
              >
                {loading ? "…" : "Save draft"}
              </button>
              <button
                type="submit"
                disabled={loading}
                className="h-8 px-4 rounded-md bg-white text-black text-[13px] font-medium hover:bg-gray-100 transition-colors disabled:opacity-30"
              >
                {loading ? "…" : "Update"}
              </button>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
