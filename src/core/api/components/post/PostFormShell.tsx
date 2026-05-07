import { Link } from "react-router-dom";
import type { Category } from "../../../domain/category";
import { TipTapEditor } from "../editor/TipTapEditor";

interface PostFormShellProps {
  mode: "create" | "edit";
  categories: Category[];
  categoryId: number;
  setCategoryId: (id: number) => void;
  title: string;
  setTitle: (title: string) => void;
  content: string;
  setContent: (content: string) => void;
  loading: boolean;
  wordCount: number;
  contentCharacters: number;
  titleMaxLength: number;
  onCancel: () => void;
  onSaveDraft: () => void;
  onPublish: () => void;
}

function extractOutline(content: string): string[] {
  const headings = content
    .split("\n")
    .map((line) => line.match(/^#{1,3}\s+(.+)$/)?.[1]?.trim())
    .filter((heading): heading is string => Boolean(heading));

  return headings.slice(0, 5);
}

export function PostFormShell({
  mode,
  categories,
  categoryId,
  setCategoryId,
  title,
  setTitle,
  content,
  setContent,
  loading,
  wordCount,
  contentCharacters,
  titleMaxLength,
  onCancel,
  onSaveDraft,
  onPublish,
}: PostFormShellProps) {
  const outline = extractOutline(content);
  const selectedCategory = categories.find((category) => category.id === categoryId);
  const actionLabel = mode === "create" ? "Publish" : "Update";
  const pageTitle = mode === "create" ? "New entry" : "Revise entry";

  return (
    <div className="px-6 md:px-10 py-7 md:py-8">
      <div className="flex items-center gap-1.5 text-[12.5px] text-muted mb-5">
        <Link to="/" className="hover:text-ink transition-colors">seeeeeeong.log</Link>
        <span className="text-faint">/</span>
        <Link to="/admin/posts" className="hover:text-ink transition-colors">admin · posts</Link>
        <span className="text-faint">/</span>
        <span className="text-ink font-medium">{mode === "create" ? "new" : "edit"}</span>
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          onPublish();
        }}
        className="pb-24"
      >
        <div className="mb-5 flex flex-col gap-3 border-b border-rule pb-5 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="font-meta text-[10.5px] uppercase tracking-[0.08em] text-faint mb-2">
              Writing studio
            </p>
            <h1 className="text-[28px] md:text-[30px] font-bold leading-tight text-ink">
              {pageTitle}
            </h1>
          </div>
          <div className="flex flex-wrap items-center gap-3 font-meta text-[11.5px] text-muted">
            <span>title · {title.length}/{titleMaxLength}</span>
            <span className="text-faint">·</span>
            <span>words · {wordCount}</span>
            <span className="text-faint">·</span>
            <span>chars · {contentCharacters}</span>
          </div>
        </div>

        <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_260px]">
          <section className="min-w-0 rounded-lg border border-rule bg-paper overflow-hidden">
            <div className="border-b border-rule bg-paper-2 px-4 py-3">
              <label htmlFor="title" className="block font-meta text-[10.5px] uppercase tracking-[0.08em] text-faint mb-2">
                Title
              </label>
              <input
                type="text"
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
                maxLength={titleMaxLength}
                className="w-full bg-transparent text-[22px] md:text-[25px] font-bold leading-snug text-ink placeholder:text-faint outline-none"
                placeholder="Write a clear title"
              />
            </div>

            <div className="bg-paper">
              <TipTapEditor value={content} onChange={setContent} />
            </div>
          </section>

          <aside className="xl:sticky xl:top-[72px] xl:self-start">
            <div className="rounded-lg border border-rule bg-paper overflow-hidden">
              <div className="border-b border-rule bg-paper-2 px-4 py-3">
                <div className="flex items-center justify-between gap-3">
                  <span className="text-[12px] font-semibold text-ink">Publish</span>
                  <span className="status-chip draft">
                    <span className="dot" />
                    Draft
                  </span>
                </div>
              </div>

              <div className="space-y-4 p-4">
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

                <div className="grid grid-cols-2 gap-2">
                  <div className="rounded-md border border-rule bg-paper-2 p-3">
                    <div className="font-meta text-[10px] text-faint uppercase tracking-[0.06em]">Words</div>
                    <div className="mt-1 text-[18px] font-semibold text-ink">{wordCount}</div>
                  </div>
                  <div className="rounded-md border border-rule bg-paper-2 p-3">
                    <div className="font-meta text-[10px] text-faint uppercase tracking-[0.06em]">Category</div>
                    <div className="mt-1 truncate text-[13px] font-semibold text-ink">
                      {selectedCategory?.name ?? "—"}
                    </div>
                  </div>
                </div>

                <div>
                  <div className="font-meta text-[10px] text-faint uppercase tracking-[0.08em] mb-2">
                    Outline
                  </div>
                  {outline.length > 0 ? (
                    <div className="space-y-1.5">
                      {outline.map((heading, index) => (
                        <div
                          key={`${heading}-${index}`}
                          className="grid grid-cols-[24px_1fr] gap-2 rounded-md border border-rule-soft bg-paper-2 px-2.5 py-2 text-[12.5px]"
                        >
                          <span className="font-meta text-[10px] text-accent">
                            {String(index + 1).padStart(2, "0")}
                          </span>
                          <span className="truncate text-ink-soft">{heading}</span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="rounded-md border border-dashed border-rule bg-paper-2 px-3 py-3 text-[12.5px] leading-relaxed text-muted">
                      Add headings to build an outline while writing.
                    </p>
                  )}
                </div>
              </div>
            </div>
          </aside>
        </div>

        <div className="sticky bottom-3 z-20 mt-5 rounded-2xl border border-rule bg-[var(--c-surface)]/95 backdrop-blur p-3 shadow-[0_12px_32px_rgba(0,0,0,0.5)]">
          <div className="flex flex-col-reverse items-stretch justify-between gap-3 sm:flex-row sm:items-center">
            <button
              type="button"
              onClick={onCancel}
              className="h-9 px-4 rounded-md border border-rule text-[13px] text-muted hover:border-ink hover:text-ink transition-colors"
            >
              Cancel
            </button>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onSaveDraft}
                disabled={loading}
                className="h-9 px-4 rounded-md border border-rule text-[13px] text-muted hover:border-ink hover:text-ink transition-colors disabled:opacity-40"
              >
                {loading ? "…" : "Save draft"}
              </button>
              <button
                type="submit"
                disabled={loading}
                className="h-9 px-5 rounded-md bg-accent text-[var(--c-on-accent)] text-[13px] font-medium hover:opacity-90 transition-opacity disabled:opacity-40"
              >
                {loading ? "…" : actionLabel}
              </button>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
