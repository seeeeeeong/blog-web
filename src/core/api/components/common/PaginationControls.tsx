interface PaginationControlsProps {
  currentPage: number;
  hasNext: boolean;
  onPrev: () => void;
  onNext: () => void;
  totalItems: number;
}

const buttonClass =
  "h-8 px-3 rounded-md border border-rule text-[12.5px] text-muted hover:border-ink hover:text-ink disabled:opacity-40 disabled:cursor-not-allowed transition-colors";

export function PaginationControls({
  currentPage,
  hasNext,
  onPrev,
  onNext,
  totalItems,
}: PaginationControlsProps) {
  if (currentPage === 0 && !hasNext) return null;

  return (
    <div className="flex items-center gap-4 mt-6 text-[12.5px] text-muted">
      <span>
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
