import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';
import Typography from '@tiptap/extension-typography';
import Underline from '@tiptap/extension-underline';
import TextAlign from '@tiptap/extension-text-align';
import Image from '@tiptap/extension-image';
import Link from '@tiptap/extension-link';
import { TextStyle } from '@tiptap/extension-text-style';
import Color from '@tiptap/extension-color';
import Highlight from '@tiptap/extension-highlight';
import { Table } from '@tiptap/extension-table';
import TableRow from '@tiptap/extension-table-row';
import TableHeader from '@tiptap/extension-table-header';
import TableCell from '@tiptap/extension-table-cell';
import {
  Bold,
  Italic,
  Underline as UnderlineIcon,
  Strikethrough,
  Code,
  Heading1,
  Heading2,
  Heading3,
  List,
  ListOrdered,
  Quote,
  Undo,
  Redo,
  AlignLeft,
  AlignCenter,
  AlignRight,
  ImageIcon,
  LinkIcon,
  Highlighter,
  Minus,
  Table as TableIcon,
} from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import TurndownService from 'turndown';
import { gfm } from 'turndown-plugin-gfm';
import { marked } from 'marked';
import { imageApi } from '../../api/image';
import { useAlert } from '../../contexts/useAlert';

interface TipTapEditorProps {
  value: string;
  onChange: (value: string) => void;
}

const turndownService = new TurndownService({
  headingStyle: 'atx',
  codeBlockStyle: 'fenced',
  bulletListMarker: '-',
});
turndownService.use(gfm);

turndownService.addRule('images', {
  filter: 'img',
  replacement: (_content, node) => {
    // Turndown의 filter: 'img'가 HTMLImageElement만 전달하므로 단언 안전
    const imgNode = node as HTMLImageElement;
    const alt = imgNode.alt || '';
    const src = imgNode.src || '';
    const title = imgNode.title || '';

    if (!src) return '';

    const titlePart = title ? ` "${title}"` : '';
    return `![${alt}](${src}${titlePart})`;
  }
});

interface MenuButtonProps {
  onClick: () => void;
  isActive?: boolean;
  children: React.ReactNode;
  title: string;
}

function MenuButton({
  onClick,
  isActive = false,
  children,
  title,
}: MenuButtonProps) {
  return (
    <button
      onClick={onClick}
      className={`inline-flex h-7 w-7 items-center justify-center rounded transition-all ${
        isActive
          ? 'bg-term-green text-panel'
          : 'text-ink-faint hover:text-term-green hover:bg-surface-alt'
      }`}
      type="button"
      title={title}
      aria-label={title}
    >
      {children}
    </button>
  );
}

export function TipTapEditor({ value, onChange }: TipTapEditorProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { showError } = useAlert();
  const [showLinkInput, setShowLinkInput] = useState(false);
  const [linkUrl, setLinkUrl] = useState("");
  const [showTableInput, setShowTableInput] = useState(false);
  const [tableRows, setTableRows] = useState("3");
  const [tableCols, setTableCols] = useState("3");

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [1, 2, 3],
        },
      }),
      Placeholder.configure({
        placeholder: 'Start writing...',
      }),
      Typography,
      Underline,
      TextAlign.configure({
        types: ['heading', 'paragraph'],
      }),
      Image.configure({
        HTMLAttributes: {
          class: 'rounded max-w-full h-auto',
        },
        inline: true,
        allowBase64: false,
      }),
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: 'text-info underline hover:opacity-70',
        },
      }),
      TextStyle,
      Color,
      Highlight.configure({
        multicolor: true,
      }),
      Table.configure({
        resizable: false,
        HTMLAttributes: { class: 'editor-table' },
      }),
      TableRow,
      TableHeader,
      TableCell,
    ],
    content: '',
    editorProps: {
      attributes: {
        class: 'tiptap-editor focus:outline-none min-h-[440px] p-4 text-ink text-sm leading-relaxed sm:min-h-[560px] sm:p-6',
      },
      handlePaste: (_view, event) => {
        const items = event.clipboardData?.items;
        if (!items) return false;

        let hasImage = false;
        for (let i = 0; i < items.length; i++) {
          if (items[i].type.indexOf('image') !== -1) {
            hasImage = true;
            break;
          }
        }

        if (!hasImage) return false;

        event.preventDefault();
        for (let i = 0; i < items.length; i++) {
          const item = items[i];

          if (item.type.indexOf('image') !== -1) {
            const file = item.getAsFile();
            if (file && editor) {
              imageApi.upload(file)
                .then((imageUrl) => {
                  editor.chain().focus().setImage({ src: imageUrl }).run();
                })
                .catch(() => {
                  showError("Failed to upload image.");
                });
            }
          }
        }
        return true;
      },
    },
    onUpdate: ({ editor }) => {
      const html = editor.getHTML();
      const markdown = turndownService.turndown(html);
      onChange(markdown);
    },
  });

  useEffect(() => {
    if (editor && value) {
      const html = marked(value) as string;
      const currentHtml = editor.getHTML();
      const currentMarkdown = turndownService.turndown(currentHtml);

      if (value !== currentMarkdown) {
        editor.commands.setContent(html);
      }
    }
  }, [value, editor]);

  if (!editor) {
    return null;
  }

  const addImage = () => {
    fileInputRef.current?.click();
  };

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && editor) {
      try {
        const imageUrl = await imageApi.upload(file);
        editor.chain().focus().setImage({ src: imageUrl }).run();
      } catch {
        showError("Failed to upload image.");
      }
    }
    event.target.value = '';
  };

  const setLink = () => {
    if (showLinkInput) {
      setShowLinkInput(false);
      setLinkUrl("");
      return;
    }
    // TipTap getAttributes('link').href는 항상 string | undefined 반환
    const previousUrl = (editor.getAttributes('link').href as string) || "";
    setLinkUrl(previousUrl);
    setShowLinkInput(true);
  };

  const applyLink = () => {
    if (linkUrl === "") {
      editor.chain().focus().extendMarkRange('link').unsetLink().run();
    } else {
      editor.chain().focus().extendMarkRange('link').setLink({ href: linkUrl }).run();
    }
    setShowLinkInput(false);
    setLinkUrl("");
  };

  const openTableInput = () => {
    setShowTableInput((prev) => !prev);
  };

  const insertTable = () => {
    const rows = Math.max(1, Math.min(20, Number.parseInt(tableRows, 10) || 3));
    const cols = Math.max(1, Math.min(20, Number.parseInt(tableCols, 10) || 3));
    editor.chain().focus().insertTable({ rows, cols, withHeaderRow: true }).run();
    setShowTableInput(false);
  };

  return (
    <div className="overflow-hidden rounded-md border border-ink-ghost bg-panel">
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileSelect}
        accept="image/*"
        className="hidden"
      />
      <div className="flex items-center justify-between border-b border-ink-ghost px-3 py-2">
        <span className="text-[10px] font-medium text-term-green">EDITOR</span>
        <span className="hidden text-[10px] text-ink-faint sm:block">
          Ctrl+B, Ctrl+I
        </span>
      </div>

      <div className="overflow-x-auto border-b border-ink-ghost">
        <div className="flex min-w-max items-center gap-0.5 px-2 py-1.5 sm:px-3">
        <MenuButton
          onClick={() => editor.chain().focus().toggleBold().run()}
          isActive={editor.isActive('bold')}
          title="Bold (Ctrl+B)"
        >
          <Bold size={14} />
        </MenuButton>

        <MenuButton
          onClick={() => editor.chain().focus().toggleItalic().run()}
          isActive={editor.isActive('italic')}
          title="Italic (Ctrl+I)"
        >
          <Italic size={14} />
        </MenuButton>

        <MenuButton
          onClick={() => editor.chain().focus().toggleUnderline().run()}
          isActive={editor.isActive('underline')}
          title="Underline (Ctrl+U)"
        >
          <UnderlineIcon size={14} />
        </MenuButton>

        <MenuButton
          onClick={() => editor.chain().focus().toggleStrike().run()}
          isActive={editor.isActive('strike')}
          title="Strikethrough"
        >
          <Strikethrough size={14} />
        </MenuButton>

        <MenuButton
          onClick={() => editor.chain().focus().toggleHighlight().run()}
          isActive={editor.isActive('highlight')}
          title="Highlight"
        >
          <Highlighter size={14} />
        </MenuButton>

        <div className="mx-1 h-5 w-px bg-ink-ghost" />

        <MenuButton
          onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
          isActive={editor.isActive('heading', { level: 1 })}
          title="Heading 1"
        >
          <Heading1 size={14} />
        </MenuButton>

        <MenuButton
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
          isActive={editor.isActive('heading', { level: 2 })}
          title="Heading 2"
        >
          <Heading2 size={14} />
        </MenuButton>

        <MenuButton
          onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
          isActive={editor.isActive('heading', { level: 3 })}
          title="Heading 3"
        >
          <Heading3 size={14} />
        </MenuButton>

        <div className="mx-1 h-5 w-px bg-ink-ghost" />

        <MenuButton
          onClick={() => editor.chain().focus().setTextAlign('left').run()}
          isActive={editor.isActive({ textAlign: 'left' })}
          title="Align left"
        >
          <AlignLeft size={14} />
        </MenuButton>

        <MenuButton
          onClick={() => editor.chain().focus().setTextAlign('center').run()}
          isActive={editor.isActive({ textAlign: 'center' })}
          title="Align center"
        >
          <AlignCenter size={14} />
        </MenuButton>

        <MenuButton
          onClick={() => editor.chain().focus().setTextAlign('right').run()}
          isActive={editor.isActive({ textAlign: 'right' })}
          title="Align right"
        >
          <AlignRight size={14} />
        </MenuButton>

        <div className="mx-1 h-5 w-px bg-ink-ghost" />

        <MenuButton
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          isActive={editor.isActive('bulletList')}
          title="Bullet list"
        >
          <List size={14} />
        </MenuButton>

        <MenuButton
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          isActive={editor.isActive('orderedList')}
          title="Numbered list"
        >
          <ListOrdered size={14} />
        </MenuButton>

        <MenuButton
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
          isActive={editor.isActive('blockquote')}
          title="Blockquote"
        >
          <Quote size={14} />
        </MenuButton>

        <MenuButton
          onClick={() => editor.chain().focus().toggleCodeBlock().run()}
          isActive={editor.isActive('codeBlock')}
          title="Code block"
        >
          <Code size={14} />
        </MenuButton>

        <div className="mx-1 h-5 w-px bg-ink-ghost" />

        <MenuButton onClick={setLink} isActive={editor.isActive('link')} title="Insert link">
          <LinkIcon size={14} />
        </MenuButton>

        <MenuButton onClick={addImage} title="Insert image">
          <ImageIcon size={14} />
        </MenuButton>

        <MenuButton
          onClick={() => editor.chain().focus().setHorizontalRule().run()}
          title="Horizontal rule"
        >
          <Minus size={14} />
        </MenuButton>

        <MenuButton
          onClick={openTableInput}
          isActive={editor.isActive('table')}
          title="Insert table"
        >
          <TableIcon size={14} />
        </MenuButton>

        <div className="mx-1 h-5 w-px bg-ink-ghost" />

        <MenuButton
          onClick={() => editor.chain().focus().undo().run()}
          title="Undo (Ctrl+Z)"
        >
          <Undo size={14} />
        </MenuButton>

        <MenuButton
          onClick={() => editor.chain().focus().redo().run()}
          title="Redo (Ctrl+Y)"
        >
          <Redo size={14} />
        </MenuButton>
        </div>
      </div>

      {showLinkInput && (
        <div className="flex flex-wrap items-center gap-2 border-b border-ink-ghost px-3 py-2">
          <input
            type="url"
            value={linkUrl}
            onChange={(e) => setLinkUrl(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") { e.preventDefault(); applyLink(); }
              if (e.key === "Escape") { setShowLinkInput(false); setLinkUrl(""); }
            }}
            placeholder="https://..."
            className="h-8 min-w-[14rem] flex-1 rounded border border-ink-ghost bg-surface px-2 text-xs text-term-white placeholder:text-ink-faint focus:border-term-green focus:outline-none"
            autoFocus
          />
          <button
            type="button"
            onClick={applyLink}
            className="inline-flex h-8 items-center justify-center rounded-md bg-accent px-3 text-xs font-medium text-accent-text transition-opacity hover:opacity-80"
          >
            Apply
          </button>
          <button
            type="button"
            onClick={() => { setShowLinkInput(false); setLinkUrl(""); }}
            className="inline-flex h-8 items-center justify-center rounded-md border-[1.5px] border-ink-ghost px-3 text-xs text-ink-light transition-colors hover:text-ink"
          >
            Cancel
          </button>
        </div>
      )}

      {(showTableInput || editor.isActive('table')) && (
        <div className="flex flex-wrap items-center gap-2 border-b border-ink-ghost px-3 py-2">
          {showTableInput && (
            <>
              <span className="text-xs font-medium text-ink">Table</span>
              <label className="flex items-center gap-1 text-[10px] text-ink-light">
                rows
                <input
                  type="number"
                  min={1}
                  max={20}
                  value={tableRows}
                  onChange={(e) => setTableRows(e.target.value)}
                  className="h-7 w-14 rounded border border-ink-ghost bg-surface px-2 text-xs text-term-white focus:border-term-green focus:outline-none"
                />
              </label>
              <label className="flex items-center gap-1 text-[10px] text-ink-light">
                cols
                <input
                  type="number"
                  min={1}
                  max={20}
                  value={tableCols}
                  onChange={(e) => setTableCols(e.target.value)}
                  className="h-7 w-14 rounded border border-ink-ghost bg-surface px-2 text-xs text-term-white focus:border-term-green focus:outline-none"
                />
              </label>
              <button
                type="button"
                onClick={insertTable}
                className="inline-flex h-7 items-center justify-center rounded bg-accent px-2 text-[10px] font-medium text-accent-text transition-opacity hover:opacity-80"
              >
                Insert
              </button>
              <button
                type="button"
                onClick={() => setShowTableInput(false)}
                className="inline-flex h-7 items-center justify-center rounded border-[1.5px] border-ink-ghost px-2 text-[10px] text-ink-light transition-colors hover:text-ink"
              >
                Cancel
              </button>
            </>
          )}

          {editor.isActive('table') && (
            <>
              <div className="h-4 w-px bg-ink-ghost" />
              <button
                type="button"
                onClick={() => editor.chain().focus().addRowBefore().run()}
                className="inline-flex h-7 items-center justify-center rounded border-[1.5px] border-ink-ghost px-2 text-[10px] text-ink-light transition-colors hover:text-ink hover:bg-surface-alt"
              >
                row+
              </button>
              <button
                type="button"
                onClick={() => editor.chain().focus().deleteRow().run()}
                className="inline-flex h-7 items-center justify-center rounded border-[1.5px] border-ink-ghost px-2 text-[10px] text-ink-light transition-colors hover:text-ink hover:bg-surface-alt"
              >
                row-
              </button>
              <button
                type="button"
                onClick={() => editor.chain().focus().addColumnBefore().run()}
                className="inline-flex h-7 items-center justify-center rounded border-[1.5px] border-ink-ghost px-2 text-[10px] text-ink-light transition-colors hover:text-ink hover:bg-surface-alt"
              >
                col+
              </button>
              <button
                type="button"
                onClick={() => editor.chain().focus().deleteColumn().run()}
                className="inline-flex h-7 items-center justify-center rounded border-[1.5px] border-ink-ghost px-2 text-[10px] text-ink-light transition-colors hover:text-ink hover:bg-surface-alt"
              >
                col-
              </button>
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
      )}

      <div className="bg-panel">
        <EditorContent editor={editor} />
      </div>
    </div>
  );
}
