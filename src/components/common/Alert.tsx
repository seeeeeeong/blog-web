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
  duration = 3000,
  showCloseButton = true,
}: AlertProps) {
  useEffect(() => {
    if (type !== "confirm" && duration > 0) {
      const timer = setTimeout(onClose, duration);
      return () => clearTimeout(timer);
    }
  }, [duration, onClose, type]);

  const alertStyles = {
    success: {
      container:
        "bg-gradient-to-br from-green-50 to-emerald-50 border-green-300",
      icon: "text-green-600",
      iconPath: "M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z",
      button: "bg-green-600 hover:bg-green-700",
    },
    error: {
      container: "bg-gradient-to-br from-red-50 to-rose-50 border-red-300",
      icon: "text-red-600",
      iconPath:
        "M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z",
      button: "bg-red-600 hover:bg-red-700",
    },
    warning: {
      container:
        "bg-gradient-to-br from-amber-50 to-yellow-50 border-amber-300",
      icon: "text-amber-600",
      iconPath:
        "M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z",
      button: "bg-amber-600 hover:bg-amber-700",
    },
    info: {
      container: "bg-gradient-to-br from-blue-50 to-sky-50 border-blue-300",
      icon: "text-blue-600",
      iconPath: "M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z",
      button: "bg-blue-600 hover:bg-blue-700",
    },
    confirm: {
      container: "bg-gradient-to-br from-white to-gray-50 border-gray-300",
      icon: "text-gray-700",
      iconPath:
        "M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z",
      button: "bg-gray-900 hover:bg-gray-800",
    },
  };

  const style = alertStyles[type];

  return (
    <div
      className={`${style.container} border-2 rounded-2xl shadow-lg backdrop-blur-sm animate-fade-in overflow-hidden`}
      role="alert"
    >
      <div className="p-5">
        <div className="flex items-start gap-4">
          {/* Icon */}
          <div
            className={`${style.icon} bg-white rounded-full p-2 shadow-sm flex-shrink-0`}
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d={style.iconPath}
              />
            </svg>
          </div>

          {/* Content */}
          <div className="flex-1 pt-0.5">
            <p className="text-gray-900 font-medium leading-relaxed">
              {message}
            </p>
          </div>

          {/* Close Button */}
          {showCloseButton && type !== "confirm" && (
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors flex-shrink-0 bg-white rounded-full p-1.5 hover:bg-gray-100"
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

        {/* Confirm Buttons */}
        {type === "confirm" && (
          <div className="flex justify-end gap-3 mt-5 pt-4 border-t border-gray-200">
            <button
              onClick={onClose}
              className="px-5 py-2 text-sm font-medium rounded-lg border-2 border-gray-200 hover:border-gray-300 hover:bg-white transition-all duration-200 text-gray-700"
            >
              취소
            </button>
            <button
              onClick={() => {
                onConfirm?.();
                onClose();
              }}
              className={`px-5 py-2 text-sm font-medium rounded-lg ${style.button} text-white transition-all duration-200 shadow-sm`}
            >
              확인
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
