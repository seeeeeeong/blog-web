import { createContext } from "react";
import type { AlertType } from "../../api/components/common/Alert";

interface AlertConfig {
  id: number;
  type: AlertType;
  message: string;
  duration?: number;
  showCloseButton?: boolean;
  onConfirm?: () => void;
  onCancel?: () => void;
}

export interface AlertContextType {
  showAlert: (config: Omit<AlertConfig, "id">) => void;
  showSuccess: (message: string, duration?: number) => void;
  showError: (message: string, duration?: number) => void;
  showWarning: (message: string, duration?: number) => void;
  showInfo: (message: string, duration?: number) => void;
  showConfirm: (message: string) => Promise<boolean>;
}

export const AlertContext = createContext<AlertContextType | undefined>(undefined);
