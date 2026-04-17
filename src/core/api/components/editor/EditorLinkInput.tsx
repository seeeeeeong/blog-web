interface EditorLinkInputProps {
  linkUrl: string;
  onUrlChange: (url: string) => void;
  onApply: () => void;
  onCancel: () => void;
}

export function EditorLinkInput({ linkUrl, onUrlChange, onApply, onCancel }: EditorLinkInputProps) {
  return (
    <div className="flex flex-wrap items-center gap-2 border-b border-ink-ghost px-3 py-2">
      <input
        type="url"
        value={linkUrl}
        onChange={(e) => onUrlChange(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter") { e.preventDefault(); onApply(); }
          if (e.key === "Escape") onCancel();
        }}
        placeholder="https://..."
        className="h-8 min-w-[14rem] flex-1 rounded border border-ink-ghost bg-surface px-2 text-xs text-term-white placeholder:text-ink-faint focus:border-term-green focus:outline-none"
        autoFocus
      />
      <button
        type="button"
        onClick={onApply}
        className="inline-flex h-8 items-center justify-center rounded-md bg-accent px-3 text-xs font-medium text-accent-text transition-opacity hover:opacity-80"
      >
        Apply
      </button>
      <button
        type="button"
        onClick={onCancel}
        className="inline-flex h-8 items-center justify-center rounded-md border-[1.5px] border-ink-ghost px-3 text-xs text-ink-light transition-colors hover:text-ink"
      >
        Cancel
      </button>
    </div>
  );
}
