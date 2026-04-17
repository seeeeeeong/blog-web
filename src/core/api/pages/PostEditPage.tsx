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
      <div className="animate-fade-in">
        <p className="text-danger text-xs mb-4">[ERR] Post not found</p>
        <p className="mb-4 text-xs text-ink-faint">Could not load the post or you do not have permission to edit.</p>
        <Link to="/" className="text-xs text-ink-faint hover:text-term-green transition-colors">
          $ cd ~/blog
        </Link>
      </div>
    );
  }

  return (
    <div className="animate-fade-in">
      <div className="text-xs text-ink-faint mb-1">
        <span className="text-term-blue">~/blog</span> <span className="text-term-green">$</span> <span className="text-term-white">edit post</span>
      </div>
      <h2 className="text-sm font-bold text-term-white mb-1">Edit Post</h2>
      <div className="flex flex-wrap items-center gap-4 text-[11px] text-ink-faint mb-6">
        <span>title {title.length}/{titleMaxLength}</span>
        <span>words {wordCount}</span>
        <span>chars {contentCharacters}</span>
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSubmit(false);
        }}
        className="space-y-5 pb-20"
      >
        {/* Title & Category */}
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <div className="md:col-span-2">
            <label htmlFor="title" className="mb-1.5 block text-xs font-medium text-ink-light">
              Title
            </label>
            <input
              type="text"
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              maxLength={titleMaxLength}
              className="h-9 w-full rounded border border-ink-ghost bg-surface px-3 text-xs text-term-white placeholder:text-ink-faint transition-colors focus:border-term-green focus:outline-none"
              placeholder="Enter title"
            />
          </div>

          <div className="md:col-span-1">
            <label htmlFor="category" className="mb-1.5 block text-xs font-medium text-ink-light">
              Category
            </label>
            <select
              id="category"
              value={categoryId}
              onChange={(e) => setCategoryId(Number(e.target.value))}
              className="h-9 w-full rounded border border-ink-ghost bg-surface px-3 text-xs text-term-white transition-colors focus:border-term-green focus:outline-none"
            >
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Editor */}
        <div className="space-y-1.5">
          <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
            <label className="text-xs font-medium text-ink-light">Content</label>
            <span className="text-[10px] text-ink-faint">
              Add images by pasting or using the upload button
            </span>
          </div>
          <TipTapEditor value={content} onChange={setContent} />
        </div>

        {/* Action Bar */}
        <div className="sticky bottom-3 z-20 rounded border border-ink-ghost bg-surface p-3">
          <div className="flex flex-col-reverse items-stretch justify-between gap-3 sm:flex-row sm:items-center">
            <button
              type="button"
              onClick={() => navigate(`/posts/${postId}`)}
              className="inline-flex h-8 items-center justify-center rounded border border-ink-ghost px-4 text-[11px] text-ink-faint transition-colors hover:text-term-white hover:border-ink-faint"
            >
              cancel
            </button>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => handleSubmit(true)}
                disabled={loading}
                className="inline-flex h-8 items-center justify-center rounded border border-ink-ghost px-4 text-[11px] font-medium text-term-amber transition-colors hover:border-term-amber disabled:cursor-not-allowed disabled:opacity-30"
              >
                {loading ? "..." : "save draft"}
              </button>
              <button
                type="submit"
                disabled={loading}
                className="inline-flex h-8 items-center justify-center rounded bg-term-green px-4 text-[11px] font-medium text-panel transition-opacity hover:opacity-80 disabled:cursor-not-allowed disabled:opacity-30"
              >
                {loading ? "..." : "update"}
              </button>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
