import MDEditor from "@uiw/react-md-editor";

interface MarkdownEditorProps {
  value: string;
  onChange: (value: string) => void;
}

export default function MarkdownEditor({ value, onChange }: MarkdownEditorProps) {
  return (
    <div data-color-mode="light">
      <MDEditor
        value={value}
        onChange={(val) => onChange(val || "")}
        height={600}
        preview="live"
        hideToolbar={false}
        enableScroll={true}
        visibleDragbar={false}
      />
    </div>
  );
}