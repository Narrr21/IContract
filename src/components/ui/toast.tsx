"use client";
import {
  createContext,
  useCallback,
  useContext,
  useState,
  ReactNode,
  useEffect,
} from "react";
import { X, CheckCircle2, AlertTriangle, Info } from "lucide-react";

export type ToastType = "success" | "error" | "info" | "warning";

export interface ToastItem {
  id: string;
  title?: string;
  message: string;
  type?: ToastType;
  duration?: number; // ms
}

interface ToastContextValue {
  push: (toast: Omit<ToastItem, "id">) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used within <ToastProvider />");
  return ctx;
}

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const push = useCallback((toast: Omit<ToastItem, "id">) => {
    setToasts((prev) => [
      ...prev,
      { id: crypto.randomUUID(), duration: 4000, type: "info", ...toast },
    ]);
  }, []);

  useEffect(() => {
    if (toasts.length === 0) return;
    const timers = toasts.map((t) => {
      if (!t.duration || t.duration <= 0) return null;
      return setTimeout(() => {
        setToasts((prev) => prev.filter((p) => p.id !== t.id));
      }, t.duration);
    });
    return () => {
      timers.forEach((t) => t && clearTimeout(t));
    };
  }, [toasts]);

  const remove = (id: string) =>
    setToasts((prev) => prev.filter((t) => t.id !== id));

  return (
    <ToastContext.Provider value={{ push }}>
      {children}
      <div className="fixed z-50 top-4 right-4 flex flex-col gap-2 w-80">
        {toasts.map((t) => (
          <div
            key={t.id}
            className={`group border rounded-md bg-white dark:bg-gray-900 shadow-sm p-3 pr-4 flex gap-3 items-start animate-in fade-in slide-in-from-top-2 border-l-4
            ${t.type === "success" ? "border-green-500" : ""}
            ${t.type === "error" ? "border-red-500" : ""}
            ${t.type === "info" ? "border-blue-500" : ""}
            ${t.type === "warning" ? "border-yellow-500" : ""}
          `}
          >
            <div className="mt-0.5">
              {t.type === "success" && (
                <CheckCircle2 className="h-5 w-5 text-green-500" />
              )}
              {t.type === "error" && (
                <AlertTriangle className="h-5 w-5 text-red-500" />
              )}
              {t.type === "info" && <Info className="h-5 w-5 text-blue-500" />}
              {t.type === "warning" && (
                <AlertTriangle className="h-5 w-5 text-yellow-500" />
              )}
            </div>
            <div className="flex-1 text-sm">
              {t.title && <div className="font-semibold mb-0.5">{t.title}</div>}
              <div className="leading-snug whitespace-pre-wrap break-words">
                {t.message}
              </div>
            </div>
            <button
              onClick={() => remove(t.id)}
              className="opacity-0 group-hover:opacity-100 transition"
              aria-label="Close"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export const toast = {
  success(
    push: ToastContextValue["push"],
    message: string,
    title = "Berhasil"
  ) {
    push({ type: "success", message, title });
  },
  error(push: ToastContextValue["push"], message: string, title = "Error") {
    push({ type: "error", message, title, duration: 6000 });
  },
  info(push: ToastContextValue["push"], message: string, title = "Info") {
    push({ type: "info", message, title });
  },
  warning(
    push: ToastContextValue["push"],
    message: string,
    title = "Peringatan"
  ) {
    push({ type: "warning", message, title });
  },
};
