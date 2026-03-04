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
import { uploadImageDirectly } from '../../api/image';
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
    const alt = (node as HTMLImageElement).alt || '';
    const src = (node as HTMLImageElement).src || '';
    const title = (node as HTMLImageElement).title || '';

    if (!src) return '';

    const titlePart = title ? ` "${title}"` : '';
    return `![${alt}](${src}${titlePart})`;
  }
});

export default function TipTapEditor({ value, onChange }: TipTapEditorProps) {
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
        placeholder: 'Enter content...',
      }),
      Typography,
      Underline,
      TextAlign.configure({
        types: ['heading', 'paragraph'],
      }),
      Image.configure({
        HTMLAttributes: {
          class: 'rounded-lg max-w-full h-auto',
        },
        inline: true,
        allowBase64: false,
      }),
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: 'text-blue-600 underline hover:text-blue-800',
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
        class: 'focus:outline-none min-h-[600px] p-8 text-gray-900 font-sans text-base leading-relaxed',
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
              uploadImageDirectly(file)
                .then((imageUrl) => {
                  editor.chain().focus().setImage({ src: imageUrl }).run();
                })
                .catch(() => {
                  showError("이미지 업로드에 실패했습니다.");
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
        const imageUrl = await uploadImageDirectly(file);
        editor.chain().focus().setImage({ src: imageUrl }).run();
      } catch {
        showError("이미지 업로드에 실패했습니다.");
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

  const MenuButton = ({
    onClick,
    isActive = false,
    children,
    title,
  }: {
    onClick: () => void;
    isActive?: boolean;
    children: React.ReactNode;
    title: string;
  }) => (
    <button
      onClick={onClick}
      className={`p-2.5 rounded-lg border border-transparent hover:border-border transition-all ${
        isActive ? 'bg-accent text-white border-accent' : 'text-text hover:bg-hover'
      }`}
      type="button"
      title={title}
    >
      {children}
    </button>
  );

  return (
    <div className="border border-border rounded-lg overflow-hidden bg-white shadow-md">
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileSelect}
        accept="image/*"
        style={{ display: 'none' }}
      />
      <div className="border-b border-border bg-gray-100 p-4 flex flex-wrap gap-2">
        <MenuButton
          onClick={() => editor.chain().focus().toggleBold().run()}
          isActive={editor.isActive('bold')}
          title="Bold (Ctrl+B)"
        >
          <Bold size={18} />
        </MenuButton>

        <MenuButton
          onClick={() => editor.chain().focus().toggleItalic().run()}
          isActive={editor.isActive('italic')}
          title="Italic (Ctrl+I)"
        >
          <Italic size={18} />
        </MenuButton>

        <MenuButton
          onClick={() => editor.chain().focus().toggleUnderline().run()}
          isActive={editor.isActive('underline')}
          title="Underline (Ctrl+U)"
        >
          <UnderlineIcon size={18} />
        </MenuButton>

        <MenuButton
          onClick={() => editor.chain().focus().toggleStrike().run()}
          isActive={editor.isActive('strike')}
          title="Strikethrough"
        >
          <Strikethrough size={18} />
        </MenuButton>

        <MenuButton
          onClick={() => editor.chain().focus().toggleHighlight().run()}
          isActive={editor.isActive('highlight')}
          title="Highlight"
        >
          <Highlighter size={18} />
        </MenuButton>

        <div className="w-px bg-gray-900 mx-1.5" />

        <MenuButton
          onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
          isActive={editor.isActive('heading', { level: 1 })}
          title="Heading 1"
        >
          <Heading1 size={18} />
        </MenuButton>

        <MenuButton
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
          isActive={editor.isActive('heading', { level: 2 })}
          title="Heading 2"
        >
          <Heading2 size={18} />
        </MenuButton>

        <MenuButton
          onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
          isActive={editor.isActive('heading', { level: 3 })}
          title="Heading 3"
        >
          <Heading3 size={18} />
        </MenuButton>

        <div className="w-px bg-gray-900 mx-1.5" />

        <MenuButton
          onClick={() => editor.chain().focus().setTextAlign('left').run()}
          isActive={editor.isActive({ textAlign: 'left' })}
          title="Align left"
        >
          <AlignLeft size={18} />
        </MenuButton>

        <MenuButton
          onClick={() => editor.chain().focus().setTextAlign('center').run()}
          isActive={editor.isActive({ textAlign: 'center' })}
          title="Align center"
        >
          <AlignCenter size={18} />
        </MenuButton>

        <MenuButton
          onClick={() => editor.chain().focus().setTextAlign('right').run()}
          isActive={editor.isActive({ textAlign: 'right' })}
          title="Align right"
        >
          <AlignRight size={18} />
        </MenuButton>

        <div className="w-px bg-gray-900 mx-1.5" />

        <MenuButton
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          isActive={editor.isActive('bulletList')}
          title="Bullet list"
        >
          <List size={18} />
        </MenuButton>

        <MenuButton
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          isActive={editor.isActive('orderedList')}
          title="Numbered list"
        >
          <ListOrdered size={18} />
        </MenuButton>

        <MenuButton
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
          isActive={editor.isActive('blockquote')}
          title="Blockquote"
        >
          <Quote size={18} />
        </MenuButton>

        <MenuButton
          onClick={() => editor.chain().focus().toggleCodeBlock().run()}
          isActive={editor.isActive('codeBlock')}
          title="Code block"
        >
          <Code size={18} />
        </MenuButton>

        <div className="w-px bg-gray-900 mx-1.5" />

        <MenuButton onClick={setLink} isActive={editor.isActive('link')} title="Insert link">
          <LinkIcon size={18} />
        </MenuButton>

        <MenuButton onClick={addImage} title="Insert image">
          <ImageIcon size={18} />
        </MenuButton>

        <MenuButton
          onClick={() => editor.chain().focus().setHorizontalRule().run()}
          title="Horizontal rule"
        >
          <Minus size={18} />
        </MenuButton>

        <MenuButton
          onClick={openTableInput}
          isActive={editor.isActive('table')}
          title="Insert table"
        >
          <TableIcon size={18} />
        </MenuButton>

        <div className="w-px bg-gray-900 mx-1.5" />

        <MenuButton
          onClick={() => editor.chain().focus().undo().run()}
          title="Undo (Ctrl+Z)"
        >
          <Undo size={18} />
        </MenuButton>

        <MenuButton
          onClick={() => editor.chain().focus().redo().run()}
          title="Redo (Ctrl+Y)"
        >
          <Redo size={18} />
        </MenuButton>
      </div>

      {showLinkInput && (
        <div className="border-b border-border bg-white px-4 py-2 flex items-center gap-2">
          <input
            type="url"
            value={linkUrl}
            onChange={(e) => setLinkUrl(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") { e.preventDefault(); applyLink(); }
              if (e.key === "Escape") { setShowLinkInput(false); setLinkUrl(""); }
            }}
            placeholder="https://..."
            className="flex-1 px-2 py-1 border border-border font-mono text-sm focus:outline-none focus:border-text bg-transparent"
            autoFocus
          />
          <button
            type="button"
            onClick={applyLink}
            className="font-mono text-xs px-3 py-1 bg-text text-white hover:bg-gray-800"
          >
            Apply
          </button>
          <button
            type="button"
            onClick={() => { setShowLinkInput(false); setLinkUrl(""); }}
            className="font-mono text-xs px-3 py-1 border border-gray-300 text-muted hover:text-text"
          >
            Cancel
          </button>
        </div>
      )}

      {(showTableInput || editor.isActive('table')) && (
        <div className="border-b border-border bg-white px-4 py-2 flex flex-wrap items-center gap-2">
          {showTableInput && (
            <>
              <span className="font-mono text-xs text-muted">Table</span>
              <label className="font-mono text-xs text-muted flex items-center gap-1">
                rows
                <input
                  type="number"
                  min={1}
                  max={20}
                  value={tableRows}
                  onChange={(e) => setTableRows(e.target.value)}
                  className="w-16 px-2 py-1 border border-border text-sm focus:outline-none focus:border-text"
                />
              </label>
              <label className="font-mono text-xs text-muted flex items-center gap-1">
                cols
                <input
                  type="number"
                  min={1}
                  max={20}
                  value={tableCols}
                  onChange={(e) => setTableCols(e.target.value)}
                  className="w-16 px-2 py-1 border border-border text-sm focus:outline-none focus:border-text"
                />
              </label>
              <button
                type="button"
                onClick={insertTable}
                className="font-mono text-xs px-3 py-1 bg-text text-white hover:bg-gray-800"
              >
                Insert
              </button>
              <button
                type="button"
                onClick={() => setShowTableInput(false)}
                className="font-mono text-xs px-3 py-1 border border-gray-300 text-muted hover:text-text"
              >
                Cancel
              </button>
            </>
          )}

          {editor.isActive('table') && (
            <>
              <div className="w-px h-5 bg-gray-200" />
              <button
                type="button"
                onClick={() => editor.chain().focus().addRowBefore().run()}
                className="font-mono text-xs px-2 py-1 border border-gray-300 text-muted hover:text-text"
              >
                +Row
              </button>
              <button
                type="button"
                onClick={() => editor.chain().focus().deleteRow().run()}
                className="font-mono text-xs px-2 py-1 border border-gray-300 text-muted hover:text-text"
              >
                -Row
              </button>
              <button
                type="button"
                onClick={() => editor.chain().focus().addColumnBefore().run()}
                className="font-mono text-xs px-2 py-1 border border-gray-300 text-muted hover:text-text"
              >
                +Col
              </button>
              <button
                type="button"
                onClick={() => editor.chain().focus().deleteColumn().run()}
                className="font-mono text-xs px-2 py-1 border border-gray-300 text-muted hover:text-text"
              >
                -Col
              </button>
              <button
                type="button"
                onClick={() => editor.chain().focus().deleteTable().run()}
                className="font-mono text-xs px-2 py-1 border border-red-300 text-red-600 hover:text-red-700"
              >
                Delete Table
              </button>
            </>
          )}
        </div>
      )}

      <EditorContent editor={editor} />
    </div>
  );
}
