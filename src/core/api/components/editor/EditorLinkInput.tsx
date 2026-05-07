interface EditorLinkInputProps {
  linkUrl: string;
  onUrlChange: (url: string) => void;
  onApply: () => void;
  onCancel: () => void;
}

export function EditorLinkInput({ linkUrl, onUrlChange, onApply, onCancel }: EditorLinkInputProps) {
  return (
    <div className="flex flex-wrap items-center gap-2 border-b border-border-dim bg-raised px-3 py-2">
      <input
        type="url"
        value={linkUrl}
        onChange={(e) => onUrlChange(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter") { e.preventDefault(); onApply(); }
          if (e.key === "Escape") onCancel();
        }}
        placeholder="https://..."
        className="h-8 min-w-[14rem] flex-1 rounded-md border border-border-dim bg-bg px-2.5 text-[13px] text-ink placeholder:text-faint focus:border-border-mid focus:outline-none transition-colors"
        autoFocus
      />
      <button
        type="button"
        onClick={onApply}
        className="h-8 px-3 rounded-md bg-accent text-[var(--c-on-accent)] text-[12px] font-medium hover:opacity-90 transition-opacity"
      >
        Apply
      </button>
      <button
        type="button"
        onClick={onCancel}
        className="h-8 px-3 rounded-md border border-border-dim hover:border-border-mid text-[12px] text-muted hover:text-ink transition-colors"
      >
        Cancel
      </button>
    </div>
  );
}
