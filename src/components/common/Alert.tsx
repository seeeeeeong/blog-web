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

const LABEL: Record<AlertType, string> = {
  success: "완료",
  error:   "오류",
  warning: "주의",
  info:    "안내",
  confirm: "확인",
};

const ACCENT: Record<AlertType, string> = {
  success: "border-l-gray-900",
  error:   "border-l-gray-600",
  warning: "border-l-gray-500",
  info:    "border-l-gray-400",
  confirm: "border-l-gray-900",
};

export default function Alert({
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

  const base = `w-72 border border-gray-400 border-l-2 ${ACCENT[type]} bg-[#edeeec] animate-fade-in`;

  if (type === "confirm") {
    return (
      <div className={base} role="alertdialog">
        <div className="px-3.5 py-3">
          <span className="font-mono text-[11px] font-semibold text-gray-500">
            [{LABEL[type]}]
          </span>
          <p className="mt-1.5 font-mono text-[13px] leading-relaxed text-gray-900">
            {message}
          </p>
        </div>
        <div className="flex justify-end gap-3 border-t border-gray-300 px-3.5 py-2">
          <button
            onClick={onClose}
            className="font-mono text-xs text-gray-500 transition-colors hover:text-gray-900"
          >
            취소
          </button>
          <button
            onClick={() => {
              onConfirm?.();
              onClose();
            }}
            className="font-mono text-xs font-semibold text-gray-900 transition-colors hover:text-gray-600"
          >
            확인
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={base} role="alert">
      <div className="flex items-start justify-between gap-3 px-3.5 py-3">
        <div className="flex items-baseline gap-2">
          <span className="flex-shrink-0 font-mono text-[11px] font-semibold text-gray-500">
            [{LABEL[type]}]
          </span>
          <p className="font-mono text-[13px] leading-relaxed text-gray-900">
            {message}
          </p>
        </div>
        {showCloseButton && (
          <button
            onClick={onClose}
            className="flex-shrink-0 font-mono text-base leading-none text-gray-400 transition-colors hover:text-gray-900"
            aria-label="닫기"
          >
            ×
          </button>
        )}
      </div>
    </div>
  );
}
