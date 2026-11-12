"use client";

import { useEffect } from "react";

export function SuccessOverlay({
  open,
  title = "提交成功",
  description = "你的选择已记录，结果页会实时更新。",
  onClose,
  duration = 2400,
}: {
  open: boolean;
  title?: string;
  description?: string;
  onClose: () => void;
  duration?: number;
}) {
  useEffect(() => {
    if (!open) return;

    const timer = window.setTimeout(onClose, duration);
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);

    return () => {
      window.clearTimeout(timer);
      window.removeEventListener("keydown", onKey);
    };
  }, [open, duration, onClose]);

  if (!open) return null;

  return (
    <div
      className="overlay-fade fixed inset-0 z-[90] flex items-center justify-center bg-[rgba(242,239,230,0.72)] px-6 backdrop-blur-[2px]"
      onClick={onClose}
      role="presentation"
    >
      <div
        role="status"
        aria-live="polite"
        onClick={(event) => event.stopPropagation()}
        className="success-pop w-full max-w-[320px] rounded-[var(--radius-card)] border border-ink bg-surface px-7 py-8 text-center shadow-[6px_6px_0_#171714]"
      >
        <span className="relative mx-auto flex h-14 w-14 items-center justify-center">
          <span className="success-ring absolute inset-0 rounded-full border-2 border-ink/30" />
          <span className="flex h-14 w-14 items-center justify-center rounded-full border border-ink bg-acid text-ink">
            <svg width="28" height="28" viewBox="0 0 28 28" fill="none" aria-hidden="true">
              <path
                className="success-check"
                d="m8 14.4 4.2 4.2L20.5 10"
                stroke="currentColor"
                strokeWidth="2.6"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </span>
        </span>

        <p className="mt-5 font-display text-2xl leading-tight">{title}</p>
        <p className="mt-1.5 text-[12px] leading-6 text-muted">{description}</p>

        <button
          type="button"
          autoFocus
          onClick={onClose}
          className="btn btn-dark btn-sm mt-5 w-full"
        >
          知道了
        </button>
      </div>
    </div>
  );
}
