interface MenuButtonProps {
  onClick: () => void;
  isActive?: boolean;
  children: React.ReactNode;
  title: string;
}

export function MenuButton({
  onClick,
  isActive = false,
  children,
  title,
}: MenuButtonProps) {
  return (
    <button
      onClick={onClick}
      className={`inline-flex h-7 w-7 items-center justify-center rounded-md transition-colors ${
        isActive
          ? "bg-raised-hover text-ink"
          : "text-muted hover:text-ink hover:bg-raised"
      }`}
      type="button"
      title={title}
      aria-label={title}
    >
      {children}
    </button>
  );
}
