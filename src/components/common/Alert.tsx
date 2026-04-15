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

const ACCENT: Record<AlertType, string> = {
  success: "border-l-term-green",
  error:   "border-l-danger",
  warning: "border-l-term-amber",
  info:    "border-l-term-blue",
  confirm: "border-l-term-white",
};

const LABEL: Record<AlertType, string> = {
  success: "OK",
  error:   "ERR",
  warning: "WARN",
  info:    "INFO",
  confirm: "CONFIRM",
};

const LABEL_COLOR: Record<AlertType, string> = {
  success: "text-term-green",
  error:   "text-danger",
  warning: "text-term-amber",
  info:    "text-term-blue",
  confirm: "text-term-white",
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

  const base = `w-72 border border-ink-ghost border-l-2 ${ACCENT[type]} bg-surface shadow-sm animate-fade-in rounded`;

  if (type === "confirm") {
    return (
      <div className={base} role="alertdialog">
        <div className="px-3 py-2.5">
          <span className={`text-[10px] font-bold ${LABEL_COLOR[type]}`}>[{LABEL[type]}]</span>
          <p className="mt-1 text-xs text-ink leading-relaxed">{message}</p>
        </div>
        <div className="flex justify-end gap-3 border-t border-ink-ghost px-3 py-2">
          <button onClick={onClose} className="text-[11px] text-ink-faint hover:text-ink transition-colors">
            cancel
          </button>
          <button
            onClick={() => { onConfirm?.(); onClose(); }}
            className="text-[11px] font-medium text-term-green hover:opacity-70 transition-opacity"
          >
            confirm
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={base} role="alert">
      <div className="flex items-start justify-between gap-2 px-3 py-2.5">
        <div className="flex items-baseline gap-2">
          <span className={`text-[10px] font-bold shrink-0 ${LABEL_COLOR[type]}`}>[{LABEL[type]}]</span>
          <p className="text-xs text-ink leading-relaxed">{message}</p>
        </div>
        {showCloseButton && (
          <button
            onClick={onClose}
            className="shrink-0 text-sm text-ink-faint hover:text-ink transition-colors"
            aria-label="close"
          >
            &times;
          </button>
        )}
      </div>
    </div>
  );
}
