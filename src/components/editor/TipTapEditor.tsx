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
} from 'lucide-react';
import { useEffect, useRef } from 'react';
import TurndownService from 'turndown';
import { marked } from 'marked';
import { uploadImageDirectly } from '../../api/image';
import { useAlert } from '../../contexts/AlertContext';

interface TipTapEditorProps {
  value: string;
  onChange: (value: string) => void;
}

// Turndown service instance (HTML → Markdown conversion)
const turndownService = new TurndownService({
  headingStyle: 'atx',
  codeBlockStyle: 'fenced',
  bulletListMarker: '-',
});

// 이미지 변환 규칙 커스터마이징
turndownService.addRule('images', {
  filter: 'img',
  replacement: (content, node) => {
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
    ],
    content: '',
    editorProps: {
      attributes: {
        class: 'focus:outline-none min-h-[600px] p-8 text-gray-900 font-mono text-base leading-relaxed',
      },
      handlePaste: async (view, event) => {
        const items = event.clipboardData?.items;
        if (!items) return false;

        for (let i = 0; i < items.length; i++) {
          const item = items[i];

          // 이미지 처리
          if (item.type.indexOf('image') !== -1) {
            event.preventDefault();
            const file = item.getAsFile();
            if (file && editor) {
              try {
                const imageUrl = await uploadImageDirectly(file);
                editor.chain().focus().setImage({ src: imageUrl }).run();
              } catch (error) {
                console.error('이미지 업로드 실패:', error);
                showError('이미지 업로드에 실패했습니다.');
              }
            }
            return true;
          }
        }
        return false;
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
      } catch (error) {
        console.error('이미지 업로드 실패:', error);
        showError('이미지 업로드에 실패했습니다.');
      }
    }
    // Reset input
    event.target.value = '';
  };

  const setLink = () => {
    const previousUrl = editor.getAttributes('link').href;
    const url = window.prompt('Enter URL for link:', previousUrl);

    if (url === null) {
      return;
    }

    if (url === '') {
      editor.chain().focus().extendMarkRange('link').unsetLink().run();
      return;
    }

    editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run();
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
      className={`p-2.5 border border-transparent hover:border-gray-900 transition-all ${
        isActive ? 'bg-gray-900 text-gray-100 border-gray-900' : 'text-gray-900 hover:bg-gray-100'
      }`}
      type="button"
      title={title}
    >
      {children}
    </button>
  );

  return (
    <div className="border-2 border-gray-900 overflow-hidden bg-white shadow-lg">
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileSelect}
        accept="image/*"
        style={{ display: 'none' }}
      />
      {/* Toolbar */}
      <div className="border-b-2 border-gray-900 bg-gray-100 p-3 flex flex-wrap gap-1.5">
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

      {/* Editor */}
      <div className="bg-white">
        <EditorContent editor={editor} />
      </div>
    </div>
  );
}
