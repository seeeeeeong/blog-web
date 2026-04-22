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
      <div className="max-w-[760px] px-6 md:px-10 py-24 text-center">
        <p className="font-meta text-[11px] text-danger uppercase tracking-[0.08em] mb-3">
          Not found
        </p>
        <p className="text-[14.5px] text-muted mb-6">
          Could not load the post or you do not have permission to edit.
        </p>
        <Link
          to="/"
          className="inline-flex h-9 px-4 items-center rounded-md bg-accent text-paper text-[13px] font-medium hover:opacity-90 transition-opacity"
        >
          ← Back to home
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-[920px] px-6 md:px-10 py-7 md:py-8">
      <div className="flex items-center gap-1.5 text-[12.5px] text-muted mb-5">
        <Link to="/" className="hover:text-ink transition-colors">seeeeeeong.log</Link>
        <span className="text-faint">/</span>
        <Link to="/admin/posts" className="hover:text-ink transition-colors">admin · posts</Link>
        <span className="text-faint">/</span>
        <span className="text-ink font-medium">edit</span>
      </div>

      <div className="pb-5 border-b border-rule mb-6">
        <h1 className="text-[28px] md:text-[30px] font-bold tracking-[-0.02em] leading-tight text-ink mb-1.5">
          Revise entry
        </h1>
        <div className="flex flex-wrap items-center gap-3 font-meta text-[11.5px] text-muted">
          <span>title · {title.length}/{titleMaxLength}</span>
          <span className="text-faint">·</span>
          <span>words · {wordCount}</span>
          <span className="text-faint">·</span>
          <span>chars · {contentCharacters}</span>
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
            <label htmlFor="title" className="block text-[12px] font-semibold text-ink mb-1.5">
              Title
            </label>
            <input
              type="text"
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              maxLength={titleMaxLength}
              className="h-10 w-full rounded-md border border-rule bg-paper px-3 text-[15px] font-medium text-ink placeholder:text-faint focus:border-accent focus:outline-none transition-colors"
              placeholder="Title"
            />
          </div>

          <div>
            <label htmlFor="category" className="block text-[12px] font-semibold text-ink mb-1.5">
              Category
            </label>
            <select
              id="category"
              value={categoryId}
              onChange={(e) => setCategoryId(Number(e.target.value))}
              className="h-10 w-full rounded-md border border-rule bg-paper px-3 text-[13.5px] text-ink focus:border-accent focus:outline-none transition-colors"
            >
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="block text-[12px] font-semibold text-ink">Body</label>
            <span className="font-meta text-[10.5px] text-faint">
              Paste or upload images directly
            </span>
          </div>
          <div className="rounded-md border border-rule bg-paper overflow-hidden">
            <TipTapEditor value={content} onChange={setContent} />
          </div>
        </div>

        <div className="sticky bottom-3 z-20 rounded-md border border-rule bg-paper/95 backdrop-blur p-3 shadow-[0_4px_16px_rgba(0,0,0,0.04)]">
          <div className="flex flex-col-reverse items-stretch justify-between gap-3 sm:flex-row sm:items-center">
            <button
              type="button"
              onClick={() => navigate(`/posts/${postId}`)}
              className="h-9 px-4 rounded-md border border-rule text-[13px] text-muted hover:border-ink hover:text-ink transition-colors"
            >
              Cancel
            </button>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => handleSubmit(true)}
                disabled={loading}
                className="h-9 px-4 rounded-md border border-rule text-[13px] text-muted hover:border-ink hover:text-ink transition-colors disabled:opacity-40"
              >
                {loading ? "…" : "Save draft"}
              </button>
              <button
                type="submit"
                disabled={loading}
                className="h-9 px-5 rounded-md bg-accent text-paper text-[13px] font-medium hover:opacity-90 transition-opacity disabled:opacity-40"
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
