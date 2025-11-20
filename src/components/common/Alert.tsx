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

  const alertStyles = {
    success: {
      border: "border-l-4 border-l-gray-900",
      icon: "text-gray-900",
      bg: "bg-gray-50",
    },
    error: {
      border: "border-l-4 border-l-red-500",
      icon: "text-red-500",
      bg: "bg-red-50",
    },
    warning: {
      border: "border-l-4 border-l-amber-500",
      icon: "text-amber-500",
      bg: "bg-amber-50",
    },
    info: {
      border: "border-l-4 border-l-blue-500",
      icon: "text-blue-500",
      bg: "bg-blue-50",
    },
    confirm: {
      border: "border-l-4 border-l-gray-900",
      icon: "text-gray-900",
      bg: "bg-white",
    },
  };

  const style = alertStyles[type];

  if (type === "confirm") {
    return (
      <div
        className={`${style.bg} ${style.border} rounded shadow-xl animate-fade-in w-full max-w-md`}
        role="alert"
      >
        <div className="p-6">
          <p className="text-gray-900 text-base mb-6 leading-relaxed">
            {message}
          </p>
          
          <div className="flex justify-end gap-3">
            <button
              onClick={onClose}
              className="px-5 py-2.5 text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded transition-all"
            >
              취소
            </button>
            <button
              onClick={() => {
                onConfirm?.();
                onClose();
              }}
              className="px-5 py-2.5 text-sm font-medium bg-gray-900 text-white rounded hover:bg-gray-800 transition-all"
            >
              확인
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`${style.bg} ${style.border} rounded shadow-lg animate-slide-in w-full max-w-md backdrop-blur-sm`}
      role="alert"
    >
      <div className="px-5 py-4">
        <div className="flex items-center gap-3">
          <p className="flex-1 text-gray-900 text-sm leading-relaxed font-medium">
            {message}
          </p>

          {showCloseButton && (
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors flex-shrink-0 p-1"
              aria-label="닫기"
            >
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}