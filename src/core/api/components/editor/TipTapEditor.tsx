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
import { useEffect, useRef, useState } from 'react';
import TurndownService from 'turndown';
import { gfm } from 'turndown-plugin-gfm';
import { marked } from 'marked';
import { imageApi } from '../../../../storage/image/imageApi';
import { useAlert } from '../../../support/contexts/useAlert';
import { TABLE_DEFAULTS } from '../../../support/constants';
import { EditorToolbar } from './EditorToolbar';
import { EditorLinkInput } from './EditorLinkInput';
import { EditorTableControls } from './EditorTableControls';

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
    const imgNode = node as HTMLImageElement;
    const alt = imgNode.alt || '';
    const src = imgNode.src || '';
    const title = imgNode.title || '';
    if (!src) return '';
    const titlePart = title ? ` "${title}"` : '';
    return `![${alt}](${src}${titlePart})`;
  }
});

const EDITOR_EXTENSIONS = [
  StarterKit.configure({ heading: { levels: [1, 2, 3] } }),
  Placeholder.configure({ placeholder: 'Start writing...' }),
  Typography,
  Underline,
  TextAlign.configure({ types: ['heading', 'paragraph'] }),
  Image.configure({
    HTMLAttributes: { class: 'rounded max-w-full h-auto' },
    inline: true,
    allowBase64: false,
  }),
  Link.configure({
    openOnClick: false,
    HTMLAttributes: { class: 'text-info underline hover:opacity-70' },
  }),
  TextStyle,
  Color,
  Highlight.configure({ multicolor: true }),
  Table.configure({ resizable: false, HTMLAttributes: { class: 'editor-table' } }),
  TableRow,
  TableHeader,
  TableCell,
];

export function TipTapEditor({ value, onChange }: TipTapEditorProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { showError } = useAlert();
  const [showLinkInput, setShowLinkInput] = useState(false);
  const [linkUrl, setLinkUrl] = useState("");
  const [showTableInput, setShowTableInput] = useState(false);
  const [tableRows, setTableRows] = useState(String(TABLE_DEFAULTS.ROWS));
  const [tableCols, setTableCols] = useState(String(TABLE_DEFAULTS.COLS));

  const editor = useEditor({
    extensions: EDITOR_EXTENSIONS,
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

  if (!editor) return null;

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

  const toggleLink = () => {
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

  const cancelLink = () => {
    setShowLinkInput(false);
    setLinkUrl("");
  };

  const insertTable = () => {
    const rows = Math.max(TABLE_DEFAULTS.MIN, Math.min(TABLE_DEFAULTS.MAX, Number.parseInt(tableRows, 10) || TABLE_DEFAULTS.ROWS));
    const cols = Math.max(TABLE_DEFAULTS.MIN, Math.min(TABLE_DEFAULTS.MAX, Number.parseInt(tableCols, 10) || TABLE_DEFAULTS.COLS));
    editor.chain().focus().insertTable({ rows, cols, withHeaderRow: true }).run();
    setShowTableInput(false);
  };

  return (
    <div className="overflow-hidden rounded-lg border border-border-dim bg-bg">
      <input type="file" ref={fileInputRef} onChange={handleFileSelect} accept="image/*" className="hidden" />

      <EditorToolbar
        editor={editor}
        onAddImage={() => fileInputRef.current?.click()}
        onToggleLink={toggleLink}
        onToggleTable={() => setShowTableInput((prev) => !prev)}
      />

      {showLinkInput && (
        <EditorLinkInput
          linkUrl={linkUrl}
          onUrlChange={setLinkUrl}
          onApply={applyLink}
          onCancel={cancelLink}
        />
      )}

      <EditorTableControls
        editor={editor}
        showInsertForm={showTableInput}
        tableRows={tableRows}
        tableCols={tableCols}
        onRowsChange={setTableRows}
        onColsChange={setTableCols}
        onInsert={insertTable}
        onCancel={() => setShowTableInput(false)}
      />

      <div className="bg-bg">
        <EditorContent editor={editor} />
      </div>
    </div>
  );
}
