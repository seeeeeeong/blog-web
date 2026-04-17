interface MarkdownViewerProps {
  contentHtml: string;
}

export function MarkdownViewer({ contentHtml }: MarkdownViewerProps) {
  return (
    <div
      className="markdown-viewer"
      dangerouslySetInnerHTML={{ __html: contentHtml }}
    />
  );
}