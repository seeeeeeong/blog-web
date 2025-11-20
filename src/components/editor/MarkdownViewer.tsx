import MDEditor from "@uiw/react-md-editor";

interface MarkdownViewerProps {
  content: string;
}

export default function MarkdownViewer({ content }: MarkdownViewerProps) {
  return (
    <div data-color-mode="light" className="markdown-viewer">
      <MDEditor.Markdown 
        source={content} 
        style={{ 
          whiteSpace: 'pre-wrap',
          backgroundColor: 'transparent',
          color: '#374151',
          fontSize: '1.125rem',
          lineHeight: '1.75'
        }} 
      />
    </div>
  );
}