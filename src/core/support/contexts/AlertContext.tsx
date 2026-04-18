import {
  useState,
  useCallback,
  useRef,
  type ReactNode,
} from "react";
import { Alert } from "../../api/components/common/Alert";
import { AlertContext } from "./alertContextDef";
import { ALERT_DURATION } from "../constants";

interface AlertConfig {
  id: number;
  type: "success" | "error" | "warning" | "info" | "confirm";
  message: string;
  duration?: number;
  showCloseButton?: boolean;
  onConfirm?: () => void;
  onCancel?: () => void;
}

export function AlertProvider({ children }: { children: ReactNode }) {
  const [alerts, setAlerts] = useState<AlertConfig[]>([]);
  const confirmResolvers = useRef<Map<number, (value: boolean) => void>>(
    new Map()
  );

  const closeAlert = useCallback((id: number) => {
    const resolver = confirmResolvers.current.get(id);
    if (resolver) {
      resolver(false);
      confirmResolvers.current.delete(id);
    }
    setAlerts((prev) => prev.filter((a) => a.id !== id));
  }, []);

  const showAlert = useCallback((config: Omit<AlertConfig, "id">) => {
    const id = Date.now();
    setAlerts([{ ...config, id }]);
  }, []);

  const showSuccess = useCallback(
    (message: string, duration: number = ALERT_DURATION.SUCCESS) =>
      showAlert({ type: "success", message, duration }),
    [showAlert]
  );

  const showError = useCallback(
    (message: string, duration: number = ALERT_DURATION.ERROR) =>
      showAlert({ type: "error", message, duration }),
    [showAlert]
  );

  const showWarning = useCallback(
    (message: string, duration: number = ALERT_DURATION.WARNING) =>
      showAlert({ type: "warning", message, duration }),
    [showAlert]
  );

  const showInfo = useCallback(
    (message: string, duration: number = ALERT_DURATION.INFO) =>
      showAlert({ type: "info", message, duration }),
    [showAlert]
  );

  const showConfirm = useCallback((message: string): Promise<boolean> => {
    return new Promise((resolve) => {
      const id = Date.now();

      confirmResolvers.current.set(id, resolve);

      const handleConfirm = () => {
        resolve(true);
        confirmResolvers.current.delete(id);
        setAlerts((prev) => prev.filter((a) => a.id !== id));
      };

      const handleCancel = () => {
        resolve(false);
        confirmResolvers.current.delete(id);
        setAlerts((prev) => prev.filter((a) => a.id !== id));
      };

      setAlerts((prev) => [
        ...prev,
        {
          id,
          type: "confirm",
          message,
          onConfirm: handleConfirm,
          onCancel: handleCancel,
          showCloseButton: false,
          duration: 0,
        },
      ]);
    });
  }, []);

  return (
    <AlertContext.Provider
      value={{
        showAlert,
        showSuccess,
        showError,
        showWarning,
        showInfo,
        showConfirm,
      }}
    >
      {children}
      <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 pointer-events-none sm:bottom-6 sm:right-6">
        {alerts.map((alert) => (
          <div key={alert.id} className="pointer-events-auto">
            <Alert
              type={alert.type}
              message={alert.message}
              duration={alert.duration}
              showCloseButton={alert.showCloseButton}
              onConfirm={alert.onConfirm}
              onClose={() => closeAlert(alert.id)}
            />
          </div>
        ))}
      </div>
    </AlertContext.Provider>
  );
}
