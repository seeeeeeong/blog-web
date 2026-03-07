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
        placeholder: '본문을 입력해 주세요...',
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
        class: 'tiptap-editor focus:outline-none min-h-[440px] p-5 text-gray-900 font-sans text-base leading-relaxed sm:min-h-[560px] sm:p-8',
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
      className={`inline-flex h-8 w-8 items-center justify-center rounded-md border text-text transition-all ${
        isActive
          ? 'border-accent bg-accent text-white shadow-sm'
          : 'border-transparent bg-white text-gray-600 hover:border-gray-300 hover:bg-gray-100 hover:text-gray-900'
      }`}
      type="button"
      title={title}
      aria-label={title}
    >
      {children}
    </button>
  );

  return (
    <div className="overflow-hidden rounded-2xl border border-gray-300 bg-white shadow-sm">
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileSelect}
        accept="image/*"
        style={{ display: 'none' }}
      />
      <div className="flex items-center justify-between border-b border-gray-200 bg-gray-50 px-4 py-2.5">
        <span className="text-sm font-semibold text-gray-700">마크다운 에디터</span>
        <span className="hidden text-xs text-gray-500 sm:block">
          단축키: Ctrl+B, Ctrl+I
        </span>
      </div>

      <div className="overflow-x-auto border-b border-gray-200 bg-white">
        <div className="flex min-w-max items-center gap-1 px-3 py-2.5 sm:px-4">
        <MenuButton
          onClick={() => editor.chain().focus().toggleBold().run()}
          isActive={editor.isActive('bold')}
          title="Bold (Ctrl+B)"
        >
          <Bold size={16} />
        </MenuButton>

        <MenuButton
          onClick={() => editor.chain().focus().toggleItalic().run()}
          isActive={editor.isActive('italic')}
          title="Italic (Ctrl+I)"
        >
          <Italic size={16} />
        </MenuButton>

        <MenuButton
          onClick={() => editor.chain().focus().toggleUnderline().run()}
          isActive={editor.isActive('underline')}
          title="Underline (Ctrl+U)"
        >
          <UnderlineIcon size={16} />
        </MenuButton>

        <MenuButton
          onClick={() => editor.chain().focus().toggleStrike().run()}
          isActive={editor.isActive('strike')}
          title="Strikethrough"
        >
          <Strikethrough size={16} />
        </MenuButton>

        <MenuButton
          onClick={() => editor.chain().focus().toggleHighlight().run()}
          isActive={editor.isActive('highlight')}
          title="Highlight"
        >
          <Highlighter size={16} />
        </MenuButton>

        <div className="mx-1.5 h-6 w-px bg-gray-200" />

        <MenuButton
          onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
          isActive={editor.isActive('heading', { level: 1 })}
          title="Heading 1"
        >
          <Heading1 size={16} />
        </MenuButton>

        <MenuButton
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
          isActive={editor.isActive('heading', { level: 2 })}
          title="Heading 2"
        >
          <Heading2 size={16} />
        </MenuButton>

        <MenuButton
          onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
          isActive={editor.isActive('heading', { level: 3 })}
          title="Heading 3"
        >
          <Heading3 size={16} />
        </MenuButton>

        <div className="mx-1.5 h-6 w-px bg-gray-200" />

        <MenuButton
          onClick={() => editor.chain().focus().setTextAlign('left').run()}
          isActive={editor.isActive({ textAlign: 'left' })}
          title="Align left"
        >
          <AlignLeft size={16} />
        </MenuButton>

        <MenuButton
          onClick={() => editor.chain().focus().setTextAlign('center').run()}
          isActive={editor.isActive({ textAlign: 'center' })}
          title="Align center"
        >
          <AlignCenter size={16} />
        </MenuButton>

        <MenuButton
          onClick={() => editor.chain().focus().setTextAlign('right').run()}
          isActive={editor.isActive({ textAlign: 'right' })}
          title="Align right"
        >
          <AlignRight size={16} />
        </MenuButton>

        <div className="mx-1.5 h-6 w-px bg-gray-200" />

        <MenuButton
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          isActive={editor.isActive('bulletList')}
          title="Bullet list"
        >
          <List size={16} />
        </MenuButton>

        <MenuButton
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          isActive={editor.isActive('orderedList')}
          title="Numbered list"
        >
          <ListOrdered size={16} />
        </MenuButton>

        <MenuButton
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
          isActive={editor.isActive('blockquote')}
          title="Blockquote"
        >
          <Quote size={16} />
        </MenuButton>

        <MenuButton
          onClick={() => editor.chain().focus().toggleCodeBlock().run()}
          isActive={editor.isActive('codeBlock')}
          title="Code block"
        >
          <Code size={16} />
        </MenuButton>

        <div className="mx-1.5 h-6 w-px bg-gray-200" />

        <MenuButton onClick={setLink} isActive={editor.isActive('link')} title="Insert link">
          <LinkIcon size={16} />
        </MenuButton>

        <MenuButton onClick={addImage} title="Insert image">
          <ImageIcon size={16} />
        </MenuButton>

        <MenuButton
          onClick={() => editor.chain().focus().setHorizontalRule().run()}
          title="Horizontal rule"
        >
          <Minus size={16} />
        </MenuButton>

        <MenuButton
          onClick={openTableInput}
          isActive={editor.isActive('table')}
          title="Insert table"
        >
          <TableIcon size={16} />
        </MenuButton>

        <div className="mx-1.5 h-6 w-px bg-gray-200" />

        <MenuButton
          onClick={() => editor.chain().focus().undo().run()}
          title="Undo (Ctrl+Z)"
        >
          <Undo size={16} />
        </MenuButton>

        <MenuButton
          onClick={() => editor.chain().focus().redo().run()}
          title="Redo (Ctrl+Y)"
        >
          <Redo size={16} />
        </MenuButton>
        </div>
      </div>

      {showLinkInput && (
        <div className="flex flex-wrap items-center gap-2 border-b border-gray-200 bg-gray-50 px-3 py-2.5 sm:px-4">
          <input
            type="url"
            value={linkUrl}
            onChange={(e) => setLinkUrl(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") { e.preventDefault(); applyLink(); }
              if (e.key === "Escape") { setShowLinkInput(false); setLinkUrl(""); }
            }}
            placeholder="https://..."
            className="h-9 min-w-[14rem] flex-1 rounded-lg border border-gray-300 bg-white px-3 text-sm text-gray-900 placeholder:text-gray-400 focus:border-accent/80 focus:outline-none"
            autoFocus
          />
          <button
            type="button"
            onClick={applyLink}
            className="inline-flex h-9 items-center justify-center rounded-lg border border-accent bg-accent px-3 text-sm font-medium text-white transition-colors hover:bg-accent/90"
          >
            적용
          </button>
          <button
            type="button"
            onClick={() => { setShowLinkInput(false); setLinkUrl(""); }}
            className="inline-flex h-9 items-center justify-center rounded-lg border border-gray-300 bg-white px-3 text-sm font-medium text-gray-600 transition-colors hover:bg-gray-100 hover:text-gray-900"
          >
            취소
          </button>
        </div>
      )}

      {(showTableInput || editor.isActive('table')) && (
        <div className="flex flex-wrap items-center gap-2 border-b border-gray-200 bg-gray-50 px-3 py-2.5 sm:px-4">
          {showTableInput && (
            <>
              <span className="text-sm font-medium text-gray-600">표</span>
              <label className="flex items-center gap-1 text-xs text-gray-600">
                행
                <input
                  type="number"
                  min={1}
                  max={20}
                  value={tableRows}
                  onChange={(e) => setTableRows(e.target.value)}
                  className="h-8 w-16 rounded-md border border-gray-300 px-2 text-sm focus:border-accent/80 focus:outline-none"
                />
              </label>
              <label className="flex items-center gap-1 text-xs text-gray-600">
                열
                <input
                  type="number"
                  min={1}
                  max={20}
                  value={tableCols}
                  onChange={(e) => setTableCols(e.target.value)}
                  className="h-8 w-16 rounded-md border border-gray-300 px-2 text-sm focus:border-accent/80 focus:outline-none"
                />
              </label>
              <button
                type="button"
                onClick={insertTable}
                className="inline-flex h-8 items-center justify-center rounded-md border border-accent bg-accent px-3 text-xs font-medium text-white transition-colors hover:bg-accent/90"
              >
                삽입
              </button>
              <button
                type="button"
                onClick={() => setShowTableInput(false)}
                className="inline-flex h-8 items-center justify-center rounded-md border border-gray-300 bg-white px-3 text-xs font-medium text-gray-600 transition-colors hover:bg-gray-100 hover:text-gray-900"
              >
                취소
              </button>
            </>
          )}

          {editor.isActive('table') && (
            <>
              <div className="h-5 w-px bg-gray-300" />
              <button
                type="button"
                onClick={() => editor.chain().focus().addRowBefore().run()}
                className="inline-flex h-8 items-center justify-center rounded-md border border-gray-300 bg-white px-2.5 text-xs font-medium text-gray-600 transition-colors hover:bg-gray-100 hover:text-gray-900"
              >
                행 +
              </button>
              <button
                type="button"
                onClick={() => editor.chain().focus().deleteRow().run()}
                className="inline-flex h-8 items-center justify-center rounded-md border border-gray-300 bg-white px-2.5 text-xs font-medium text-gray-600 transition-colors hover:bg-gray-100 hover:text-gray-900"
              >
                행 -
              </button>
              <button
                type="button"
                onClick={() => editor.chain().focus().addColumnBefore().run()}
                className="inline-flex h-8 items-center justify-center rounded-md border border-gray-300 bg-white px-2.5 text-xs font-medium text-gray-600 transition-colors hover:bg-gray-100 hover:text-gray-900"
              >
                열 +
              </button>
              <button
                type="button"
                onClick={() => editor.chain().focus().deleteColumn().run()}
                className="inline-flex h-8 items-center justify-center rounded-md border border-gray-300 bg-white px-2.5 text-xs font-medium text-gray-600 transition-colors hover:bg-gray-100 hover:text-gray-900"
              >
                열 -
              </button>
              <button
                type="button"
                onClick={() => editor.chain().focus().deleteTable().run()}
                className="inline-flex h-8 items-center justify-center rounded-md border border-red-300 bg-white px-2.5 text-xs font-medium text-red-500 transition-colors hover:bg-red-50 hover:text-red-600"
              >
                표 삭제
              </button>
            </>
          )}
        </div>
      )}

      <div className="bg-white">
        <EditorContent editor={editor} />
      </div>
    </div>
  );
}
