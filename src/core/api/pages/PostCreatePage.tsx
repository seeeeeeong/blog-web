import { useNavigate } from "react-router-dom";
import { postApi } from "../../../storage/post/postApi";
import { usePostForm } from "../../support/hooks/usePostForm";
import { TipTapEditor } from "../components/editor/TipTapEditor";

export function PostCreatePage() {
  const navigate = useNavigate();
  const {
    categories, categoryId, setCategoryId,
    title, setTitle, content, setContent,
    loading, setLoading, wordCount, contentCharacters,
    titleMaxLength, validateForm, showError,
  } = usePostForm();

  const handleSubmit = async (isDraft = false) => {
    if (!validateForm()) return;

    setLoading(true);
    try {
      const newPost = await postApi.createPost({
        categoryId,
        title: title.trim(),
        content: content.trim(),
        isDraft,
      });
      navigate(isDraft ? "/admin/posts" : `/posts/${newPost.id}`);
    } catch {
      showError("Failed to create post.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-[900px] mx-auto px-6 py-10 animate-fade-in">
      <div className="mb-8">
        <h1 className="text-[22px] font-semibold tracking-tighter-plus text-ink mb-2">
          New post
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
              onClick={() => navigate("/")}
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
                {loading ? "…" : "Publish"}
              </button>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
