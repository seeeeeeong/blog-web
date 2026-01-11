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
        className="bg-white border border-gray-900 shadow-lg animate-fade-in w-full max-w-md"
        role="alert"
      >
        <div className="p-6">
          <p className="text-gray-900 text-base font-sans mb-8 leading-relaxed">
            {message}
          </p>

          <div className="flex justify-end gap-4">
            <button
              onClick={onClose}
              className="px-6 py-2.5 text-sm font-sans text-gray-700 hover:text-gray-900 border border-gray-300 hover:border-gray-900 transition-all"
            >
              Cancel
            </button>
            <button
              onClick={() => {
                onConfirm?.();
                onClose();
              }}
              className="px-6 py-2.5 text-sm font-sans bg-gray-900 text-white hover:bg-gray-800 transition-all"
            >
              Confirm
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className="bg-white border border-gray-900 shadow-lg animate-slide-in w-full max-w-md"
      role="alert"
    >
      <div className="flex items-stretch">
        <div className={`w-2 flex-shrink-0 ${style.accent}`} />

        <div className="flex-1 px-5 py-4">
          <div className="flex items-center gap-4">
            <p className={`flex-1 ${style.text} text-sm font-sans leading-relaxed`}>
              {message}
            </p>

            {showCloseButton && (
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-900 transition-colors flex-shrink-0 p-1"
                aria-label="Close"
              >
                <svg
                  className="w-5 h-5"
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