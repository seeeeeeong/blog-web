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
