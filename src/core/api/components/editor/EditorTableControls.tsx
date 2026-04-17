import type { Editor } from '@tiptap/react';
import { TABLE_DEFAULTS } from '../../../support/constants';

interface EditorTableControlsProps {
  editor: Editor;
  showInsertForm: boolean;
  tableRows: string;
  tableCols: string;
  onRowsChange: (value: string) => void;
  onColsChange: (value: string) => void;
  onInsert: () => void;
  onCancel: () => void;
}

const tableButtonClass =
  "inline-flex h-7 items-center justify-center rounded border-[1.5px] border-ink-ghost px-2 text-[10px] text-ink-light transition-colors hover:text-ink hover:bg-surface-alt";

export function EditorTableControls({
  editor,
  showInsertForm,
  tableRows,
  tableCols,
  onRowsChange,
  onColsChange,
  onInsert,
  onCancel,
}: EditorTableControlsProps) {
  const isInTable = editor.isActive('table');
  if (!showInsertForm && !isInTable) return null;

  return (
    <div className="flex flex-wrap items-center gap-2 border-b border-ink-ghost px-3 py-2">
      {showInsertForm && (
        <>
          <span className="text-xs font-medium text-ink">Table</span>
          <label className="flex items-center gap-1 text-[10px] text-ink-light">
            rows
            <input
              type="number"
              min={TABLE_DEFAULTS.MIN}
              max={TABLE_DEFAULTS.MAX}
              value={tableRows}
              onChange={(e) => onRowsChange(e.target.value)}
              className="h-7 w-14 rounded border border-ink-ghost bg-surface px-2 text-xs text-term-white focus:border-term-green focus:outline-none"
            />
          </label>
          <label className="flex items-center gap-1 text-[10px] text-ink-light">
            cols
            <input
              type="number"
              min={TABLE_DEFAULTS.MIN}
              max={TABLE_DEFAULTS.MAX}
              value={tableCols}
              onChange={(e) => onColsChange(e.target.value)}
              className="h-7 w-14 rounded border border-ink-ghost bg-surface px-2 text-xs text-term-white focus:border-term-green focus:outline-none"
            />
          </label>
          <button type="button" onClick={onInsert} className="inline-flex h-7 items-center justify-center rounded bg-accent px-2 text-[10px] font-medium text-accent-text transition-opacity hover:opacity-80">
            Insert
          </button>
          <button type="button" onClick={onCancel} className="inline-flex h-7 items-center justify-center rounded border-[1.5px] border-ink-ghost px-2 text-[10px] text-ink-light transition-colors hover:text-ink">
            Cancel
          </button>
        </>
      )}

      {isInTable && (
        <>
          <div className="h-4 w-px bg-ink-ghost" />
          <button type="button" onClick={() => editor.chain().focus().addRowBefore().run()} className={tableButtonClass}>row+</button>
          <button type="button" onClick={() => editor.chain().focus().deleteRow().run()} className={tableButtonClass}>row-</button>
          <button type="button" onClick={() => editor.chain().focus().addColumnBefore().run()} className={tableButtonClass}>col+</button>
          <button type="button" onClick={() => editor.chain().focus().deleteColumn().run()} className={tableButtonClass}>col-</button>
          <button
            type="button"
            onClick={() => editor.chain().focus().deleteTable().run()}
            className="inline-flex h-7 items-center justify-center rounded border-[1.5px] border-danger/30 px-2 text-[10px] text-danger transition-colors hover:bg-red-50"
          >
            rm table
          </button>
        </>
      )}
    </div>
  );
}
