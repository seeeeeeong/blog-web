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
  "h-7 px-2.5 rounded-md border border-border-dim hover:border-border-mid text-[11px] text-muted hover:text-ink transition-colors";

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
    <div className="flex flex-wrap items-center gap-2 border-b border-border-dim bg-raised px-3 py-2">
      {showInsertForm && (
        <>
          <span className="text-[12px] font-medium text-ink">Table</span>
          <label className="flex items-center gap-1.5 text-[11px] text-muted">
            rows
            <input
              type="number"
              min={TABLE_DEFAULTS.MIN}
              max={TABLE_DEFAULTS.MAX}
              value={tableRows}
              onChange={(e) => onRowsChange(e.target.value)}
              className="h-7 w-14 rounded-md border border-border-dim bg-bg px-2 text-[12px] text-ink focus:border-border-mid focus:outline-none"
            />
          </label>
          <label className="flex items-center gap-1.5 text-[11px] text-muted">
            cols
            <input
              type="number"
              min={TABLE_DEFAULTS.MIN}
              max={TABLE_DEFAULTS.MAX}
              value={tableCols}
              onChange={(e) => onColsChange(e.target.value)}
              className="h-7 w-14 rounded-md border border-border-dim bg-bg px-2 text-[12px] text-ink focus:border-border-mid focus:outline-none"
            />
          </label>
          <button
            type="button"
            onClick={onInsert}
            className="h-7 px-3 rounded-md bg-white text-black text-[11px] font-medium hover:bg-gray-100 transition-colors"
          >
            Insert
          </button>
          <button
            type="button"
            onClick={onCancel}
            className="h-7 px-3 rounded-md border border-border-dim hover:border-border-mid text-[11px] text-muted hover:text-ink transition-colors"
          >
            Cancel
          </button>
        </>
      )}

      {isInTable && (
        <>
          <div className="h-4 w-px bg-border-dim" />
          <button type="button" onClick={() => editor.chain().focus().addRowBefore().run()} className={tableButtonClass}>row+</button>
          <button type="button" onClick={() => editor.chain().focus().deleteRow().run()} className={tableButtonClass}>row-</button>
          <button type="button" onClick={() => editor.chain().focus().addColumnBefore().run()} className={tableButtonClass}>col+</button>
          <button type="button" onClick={() => editor.chain().focus().deleteColumn().run()} className={tableButtonClass}>col-</button>
          <button
            type="button"
            onClick={() => editor.chain().focus().deleteTable().run()}
            className="h-7 px-2.5 rounded-md border border-border-dim hover:border-danger text-[11px] text-muted hover:text-danger transition-colors"
          >
            rm table
          </button>
        </>
      )}
    </div>
  );
}
