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
      accent: "bg-gray-900",
      text: "text-gray-900",
    },
    error: {
      accent: "bg-red-600",
      text: "text-gray-900",
    },
    warning: {
      accent: "bg-amber-500",
      text: "text-gray-900",
    },
    info: {
      accent: "bg-blue-600",
      text: "text-gray-900",
    },
    confirm: {
      accent: "bg-gray-900",
      text: "text-gray-900",
    },
  };

  const style = alertStyles[type];

  if (type === "confirm") {
    return (
      <div
        className="bg-white border-2 border-gray-900 shadow-sm animate-fade-in w-full max-w-md"
        role="alert"
      >
        <div className="p-6">
          <p className="text-gray-900 text-sm font-mono mb-6 leading-relaxed">
            {message}
          </p>

          <div className="flex justify-end gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 text-sm font-mono text-gray-700 hover:text-gray-900 border border-gray-300 hover:border-gray-900 transition-all"
            >
              취소
            </button>
            <button
              onClick={() => {
                onConfirm?.();
                onClose();
              }}
              className="px-4 py-2 text-sm font-mono bg-gray-900 text-white hover:bg-gray-800 transition-all"
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
      className="bg-white border-2 border-gray-900 shadow-sm animate-slide-in w-full max-w-md"
      role="alert"
    >
      <div className="flex items-stretch">
        <div className={`w-1.5 flex-shrink-0 ${style.accent}`}></div>

        <div className="flex-1 px-4 py-3">
          <div className="flex items-center gap-3">
            <p className={`flex-1 ${style.text} text-sm font-mono leading-relaxed`}>
              {message}
            </p>

            {showCloseButton && (
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-900 transition-colors flex-shrink-0 p-1"
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
    </div>
  );
}