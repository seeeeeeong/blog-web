interface PaginationControlsProps {
  currentPage: number;
  hasNext: boolean;
  onPrev: () => void;
  onNext: () => void;
  totalItems: number;
}

const buttonClass =
  "h-8 px-3 border border-rule font-meta text-[11px] text-muted hover:border-ink hover:text-ink uppercase tracking-[0.1em] disabled:opacity-30 disabled:cursor-not-allowed transition-colors";

export function PaginationControls({
  currentPage,
  hasNext,
  onPrev,
  onNext,
  totalItems,
}: PaginationControlsProps) {
  if (currentPage === 0 && !hasNext) return null;

  return (
    <div className="flex items-center gap-4 mt-8 pt-6 border-t border-rule font-meta text-[11px]">
      <span className="text-muted tracking-[0.08em] uppercase">
        {totalItems} posts · page {currentPage + 1}
      </span>
      <div className="flex gap-2 ml-auto">
        <button onClick={onPrev} disabled={currentPage === 0} className={buttonClass}>
          ← Prev
        </button>
        <button onClick={onNext} disabled={!hasNext} className={buttonClass}>
          Next →
        </button>
      </div>
    </div>
  );
}
