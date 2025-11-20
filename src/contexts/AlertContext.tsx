import {
  createContext,
  useContext,
  useState,
  useCallback,
  useRef,
  type ReactNode,
} from "react";
import Alert, { type AlertType } from "../components/common/Alert";

interface AlertConfig {
  id: number;
  type: AlertType;
  message: string;
  duration?: number;
  showCloseButton?: boolean;
  onConfirm?: () => void;
  onCancel?: () => void;
}

interface AlertContextType {
  showAlert: (config: Omit<AlertConfig, "id">) => void;
  showSuccess: (message: string, duration?: number) => void;
  showError: (message: string, duration?: number) => void;
  showWarning: (message: string, duration?: number) => void;
  showInfo: (message: string, duration?: number) => void;
  showConfirm: (message: string) => Promise<boolean>;
}

const AlertContext = createContext<AlertContextType | undefined>(undefined);

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
    setAlerts((prev) => {
      const newAlerts = [...prev, { ...config, id }];
      return newAlerts.slice(-3);
    });
  }, []);

const showSuccess = useCallback(
  (message: string, duration: number = 3000) =>  
    showAlert({ type: "success", message, duration }),
  [showAlert]
);

const showError = useCallback(
  (message: string, duration: number = 5000) =>  
    showAlert({ type: "error", message, duration }),
  [showAlert]
);

const showWarning = useCallback(
  (message: string, duration: number = 4000) =>  
    showAlert({ type: "warning", message, duration }),
  [showAlert]
);

const showInfo = useCallback(
  (message: string, duration: number = 3000) =>  
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

    <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-3 pointer-events-none">
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

export function useAlert() {
  const context = useContext(AlertContext);
  if (!context) {
    throw new Error("useAlert must be used within AlertProvider");
  }
  return context;
}
