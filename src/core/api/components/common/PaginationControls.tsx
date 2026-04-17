interface PaginationControlsProps {
  currentPage: number;
  hasNext: boolean;
  onPrev: () => void;
  onNext: () => void;
  totalItems: number;
}

const buttonClass =
  "bg-surface border border-ink-ghost rounded px-2.5 py-1 text-[11px] text-ink-faint hover:border-term-green hover:text-term-green disabled:opacity-30 disabled:cursor-not-allowed transition-colors";

export function PaginationControls({
  currentPage,
  hasNext,
  onPrev,
  onNext,
  totalItems,
}: PaginationControlsProps) {
  if (currentPage === 0 && !hasNext) return null;

  return (
    <div className="flex items-center gap-4 mt-4 text-[11px]">
      <span className="text-ink-faint">
        showing {totalItems} posts · page {currentPage + 1}
      </span>
      <div className="flex gap-2 ml-auto">
        <button
          onClick={onPrev}
          disabled={currentPage === 0}
          className={buttonClass}
        >
          prev
        </button>
        <button
          onClick={onNext}
          disabled={!hasNext}
          className={buttonClass}
        >
          next
        </button>
      </div>
    </div>
  );
}
