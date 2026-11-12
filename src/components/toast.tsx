"use client";

import { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";
import { AlertCircle, CheckCircle2, Info, X } from "lucide-react";

export type ToastVariant = "success" | "error" | "info";

export type ToastOptions = {
  title: string;
  description?: string;
  variant?: ToastVariant;
  duration?: number;
};

type ToastRecord = ToastOptions & {
  id: number;
  variant: ToastVariant;
  leaving: boolean;
};

type ToastFn = (options: ToastOptions) => void;

const ToastContext = createContext<ToastFn | null>(null);

const noopToast: ToastFn = () => undefined;

const BAR_COLOR: Record<ToastVariant, string> = {
  success: "bg-acid",
  error: "bg-coral",
  info: "bg-ink",
};

export function useToast(): ToastFn {
  return useContext(ToastContext) ?? noopToast;
}

function ToastIcon({ variant }: { variant: ToastVariant }) {
  if (variant === "success") {
    return <CheckCircle2 size={17} strokeWidth={1.9} aria-hidden="true" />;
  }
  if (variant === "error") {
    return <AlertCircle size={17} strokeWidth={1.9} aria-hidden="true" />;
  }
  return <Info size={17} strokeWidth={1.9} aria-hidden="true" />;
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastRecord[]>([]);
  const nextId = useRef(0);
  const timers = useRef(new Map<number, number>());

  const clearTimer = useCallback((id: number) => {
    const timer = timers.current.get(id);
    if (timer !== undefined) {
      window.clearTimeout(timer);
      timers.current.delete(id);
    }
  }, []);

  const dismiss = useCallback(
    (id: number) => {
      clearTimer(id);
      setToasts((current) =>
        current.map((item) => (item.id === id ? { ...item, leaving: true } : item))
      );
    },
    [clearTimer]
  );

  const remove = useCallback(
    (id: number) => {
      clearTimer(id);
      setToasts((current) => current.filter((item) => item.id !== id));
    },
    [clearTimer]
  );

  const toast = useCallback<ToastFn>(
    (options) => {
      const id = nextId.current++;
      const record: ToastRecord = {
        ...options,
        id,
        variant: options.variant ?? "info",
        leaving: false,
      };

      setToasts((current) => [...current, record].slice(-3));

      const timer = window.setTimeout(() => dismiss(id), options.duration ?? 3200);
      timers.current.set(id, timer);
    },
    [dismiss]
  );

  useEffect(() => {
    const pending = timers.current;
    return () => {
      pending.forEach((timer) => window.clearTimeout(timer));
      pending.clear();
    };
  }, []);

  return (
    <ToastContext.Provider value={toast}>
      {children}
      <div className="pointer-events-none fixed inset-x-4 bottom-[max(1rem,env(safe-area-inset-bottom))] z-[100] mx-auto flex w-auto max-w-[420px] flex-col gap-2.5 sm:inset-x-auto sm:bottom-6 sm:left-auto sm:right-6 sm:mx-0 sm:w-[360px] sm:max-w-none">
        {toasts.map((item) => (
          <div
            key={item.id}
            role={item.variant === "error" ? "alert" : "status"}
            onAnimationEnd={(event) => {
              if (item.leaving && event.animationName === "toast-out") remove(item.id);
            }}
            className={[
              "toast-item toast-in pointer-events-auto relative flex w-full items-start gap-3 overflow-hidden border border-ink bg-surface py-3.5 pl-4 pr-3 shadow-[4px_4px_0_#171714]",
              item.variant === "error" ? "toast-shake" : "",
              item.leaving ? "toast-out" : "",
            ].join(" ")}
          >
            <span
              className={`absolute inset-y-0 left-0 w-[3px] ${BAR_COLOR[item.variant]}`}
              aria-hidden="true"
            />
            <span className="mt-0.5 shrink-0 text-ink">
              <ToastIcon variant={item.variant} />
            </span>
            <div className="min-w-0 flex-1">
              <p className="text-[13px] font-medium leading-5">{item.title}</p>
              {item.description ? (
                <p className="mt-0.5 text-[12px] leading-5 text-muted">{item.description}</p>
              ) : null}
            </div>
            <button
              type="button"
              onClick={() => dismiss(item.id)}
              aria-label="关闭提示"
              className="flex h-6 w-6 shrink-0 items-center justify-center border border-line-strong text-muted transition-colors hover:border-ink hover:bg-paper-deep hover:text-ink"
            >
              <X size={12} aria-hidden="true" />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}
