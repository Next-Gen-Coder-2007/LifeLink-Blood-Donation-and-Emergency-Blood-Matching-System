import {
  createContext,
  useCallback,
  useContext,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { AnimatePresence, motion } from "framer-motion";
import { CheckCircle2, Info, XCircle } from "lucide-react";
import type { ToastMessage } from "@/types";

interface ToastContextValue {
  showToast: (message: string, type?: ToastMessage["type"]) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

export function useToast(): ToastContextValue {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within a ToastProvider");
  }
  return context;
}

const ICONS = {
  success: CheckCircle2,
  error: XCircle,
  info: Info,
};

const STYLES = {
  success: {
    border: "border-emerald-200",
    icon: "text-emerald-500",
  },
  error: {
    border: "border-red-200",
    icon: "text-red-500",
  },
  info: {
    border: "border-blue-200",
    icon: "text-primary",
  },
};

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const counter = useRef(0);

  const dismiss = useCallback((id: number) => {
    setToasts((current) => current.filter((toast) => toast.id !== id));
  }, []);

  const showToast = useCallback(
    (message: string, type: ToastMessage["type"] = "success") => {
      counter.current += 1;
      const id = counter.current;
      setToasts((current) => [...current, { id, message, type }]);
      window.setTimeout(() => dismiss(id), 3500);
    },
    [dismiss],
  );

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <div
        aria-live="polite"
        className="pointer-events-none fixed inset-x-0 bottom-4 z-[100] flex flex-col items-center gap-2 px-4"
      >
        <AnimatePresence>
          {toasts.map((toast) => {
            const Icon = ICONS[toast.type];
            const style = STYLES[toast.type];
            return (
              <motion.div
                key={toast.id}
                initial={{ opacity: 0, y: 16, scale: 0.97 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 16, scale: 0.97 }}
                transition={{ duration: 0.18 }}
                className={`pointer-events-auto flex w-full max-w-sm items-start gap-3 rounded-xl border ${style.border} bg-white px-4 py-3 shadow-card`}
                role="status"
              >
                <Icon className={`mt-0.5 h-5 w-5 shrink-0 ${style.icon}`} />
                <p className="text-sm font-medium text-foreground">
                  {toast.message}
                </p>
                <button
                  type="button"
                  onClick={() => dismiss(toast.id)}
                  aria-label="Dismiss notification"
                  className="ml-auto text-muted transition-colors hover:text-foreground"
                >
                  <XCircle className="h-4 w-4" />
                </button>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
}
