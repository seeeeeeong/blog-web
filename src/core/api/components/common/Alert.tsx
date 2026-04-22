import { useEffect } from "react";

export type AlertType = "success" | "error" | "warning" | "info" | "confirm";

interface AlertProps {
  type: AlertType;
  message: string;
  onClose: () => void;
  onConfirm?: () => void;
  duration?: number;
  showCloseButton?: boolean;
}

const DOT_COLOR: Record<AlertType, string> = {
  success: "bg-success",
  error: "bg-danger",
  warning: "bg-warning",
  info: "bg-accent",
  confirm: "bg-accent",
};

export function Alert({
  type,
  message,
  onClose,
  onConfirm,
  duration,
  showCloseButton = true,
}: AlertProps) {
  useEffect(() => {
    if (type !== "confirm" && duration && duration > 0) {
      const timer = setTimeout(onClose, duration);
      return () => clearTimeout(timer);
    }
  }, [duration, onClose, type]);

  const base =
    "w-80 rounded-md border border-rule bg-paper shadow-[0_8px_24px_rgba(0,0,0,0.08)] animate-fade-in";

  if (type === "confirm") {
    return (
      <div className={base} role="alertdialog">
        <div className="flex items-start gap-3 px-4 py-4">
          <span className={`mt-1.5 h-1.5 w-1.5 rounded-full ${DOT_COLOR[type]} shrink-0`} />
          <p className="font-body text-[14px] text-ink leading-relaxed">{message}</p>
        </div>
        <div className="flex justify-end gap-2 border-t border-rule px-3 py-2">
          <button
            onClick={onClose}
            className="h-7 px-3 font-meta text-[11px] uppercase tracking-[0.08em] text-muted hover:text-ink transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={() => {
              onConfirm?.();
              onClose();
            }}
            className="h-7 px-3 rounded-md bg-accent text-paper text-[12px] font-medium hover:opacity-90 transition-opacity"
          >
            Confirm
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={base} role="alert">
      <div className="flex items-start gap-3 px-4 py-3">
        <span className={`mt-1.5 h-1.5 w-1.5 rounded-full ${DOT_COLOR[type]} shrink-0`} />
        <p className="flex-1 font-body text-[14px] text-ink leading-relaxed">{message}</p>
        {showCloseButton && (
          <button
            onClick={onClose}
            className="shrink-0 text-muted hover:text-ink transition-colors text-[16px] leading-none"
            aria-label="close"
          >
            ×
          </button>
        )}
      </div>
    </div>
  );
}
