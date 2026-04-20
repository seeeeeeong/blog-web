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
    <div className="max-w-[920px] mx-auto px-6 md:px-10 py-10 animate-fade-in">
      <div className="mb-8 pb-6 border-b border-rule">
        <p className="eyebrow mb-2">Editorial</p>
        <h1 className="font-display text-[36px] font-medium tracking-[-0.02em] text-ink leading-none mb-3">
          New entry
        </h1>
        <div className="flex flex-wrap items-center gap-5 font-meta text-[11px] text-muted tracking-[0.08em] uppercase">
          <span>title · {title.length}/{titleMaxLength}</span>
          <span>words · {wordCount}</span>
          <span>chars · {contentCharacters}</span>
        </div>
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSubmit(false);
        }}
        className="space-y-6 pb-24"
      >
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <div className="md:col-span-2">
            <label htmlFor="title" className="mb-1.5 block eyebrow">
              Title
            </label>
            <input
              type="text"
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              maxLength={titleMaxLength}
              className="h-10 w-full border border-rule bg-paper px-3 font-display text-[18px] text-ink placeholder:text-faint placeholder:font-body placeholder:italic focus:border-ink focus:outline-none transition-colors"
              placeholder="An entry needs a title."
            />
          </div>

          <div>
            <label htmlFor="category" className="mb-1.5 block eyebrow">
              Category
            </label>
            <select
              id="category"
              value={categoryId}
              onChange={(e) => setCategoryId(Number(e.target.value))}
              className="h-10 w-full border border-rule bg-paper px-3 font-body text-[14px] text-ink focus:border-ink focus:outline-none transition-colors"
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
            <label className="eyebrow">Body</label>
            <span className="font-meta text-[10px] text-faint">
              Paste or upload images directly
            </span>
          </div>
          <TipTapEditor value={content} onChange={setContent} />
        </div>

        <div className="sticky bottom-3 z-20 border border-rule bg-paper/95 backdrop-blur p-3">
          <div className="flex flex-col-reverse items-stretch justify-between gap-3 sm:flex-row sm:items-center">
            <button
              type="button"
              onClick={() => navigate("/")}
              className="h-9 px-4 border border-rule font-meta text-[11px] uppercase tracking-[0.1em] text-muted hover:border-ink hover:text-ink transition-colors"
            >
              Cancel
            </button>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => handleSubmit(true)}
                disabled={loading}
                className="h-9 px-4 border border-rule font-meta text-[11px] uppercase tracking-[0.1em] text-muted hover:border-ink hover:text-ink transition-colors disabled:opacity-30"
              >
                {loading ? "…" : "Save draft"}
              </button>
              <button
                type="submit"
                disabled={loading}
                className="h-9 px-5 bg-ink text-paper font-meta text-[11px] uppercase tracking-[0.12em] hover:bg-accent transition-colors disabled:opacity-30"
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
