"use client";

import { useEffect, useState } from "react";
import { QRCodeSVG } from "qrcode.react";
import { Check, Copy, Share2, X } from "lucide-react";

export function ShareButton({
  url,
  title,
  label = "分享链接",
  className = "btn btn-ghost btn-sm",
  compact = false,
}: {
  url: string;
  title: string;
  label?: string;
  className?: string;
  compact?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", onKey);
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = previous;
    };
  }, [open]);

  async function copy() {
    try {
      await navigator.clipboard.writeText(url);
    } catch {
      const input = document.createElement("textarea");
      input.value = url;
      document.body.appendChild(input);
      input.select();
      document.execCommand("copy");
      input.remove();
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  }

  async function nativeShare() {
    if (navigator.share) {
      try {
        await navigator.share({ title, url });
        return;
      } catch {
        // User cancelled or unsupported; fall back to copying.
      }
    }
    await copy();
  }

  return (
    <>
      <button type="button" className={className} onClick={() => setOpen(true)}>
        <Share2 size={compact ? 13 : 14} />
        {label}
      </button>

      {open && (
        <div
          className="fixed inset-0 z-[90] flex items-end justify-center bg-ink/45 p-0 backdrop-blur-[3px] sm:items-center sm:p-6"
          role="dialog"
          aria-modal="true"
          aria-label="分享活动"
          onClick={() => setOpen(false)}
        >
          <div
            className="w-full max-w-lg border border-ink bg-surface shadow-[6px_6px_0_#171714]"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex items-start justify-between border-b border-line px-5 py-4">
              <div>
                <h3 className="font-display text-2xl leading-tight">分享决策页</h3>
              </div>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="flex h-8 w-8 items-center justify-center border border-line-strong transition-colors hover:bg-paper-deep"
                aria-label="关闭"
              >
                <X size={15} />
              </button>
            </div>

            <div className="grid gap-5 p-5 sm:grid-cols-[172px_1fr]">
              <div className="mx-auto border border-line bg-paper p-3">
                <QRCodeSVG value={url} size={148} bgColor="#f2efe6" fgColor="#171714" level="M" />
              </div>
              <div className="min-w-0">
                <p className="text-sm font-medium">{title}</p>
                <p className="mt-1.5 text-xs leading-5 text-muted">
                  参与者无需注册。扫码或打开链接，填写姓名即可投票。
                </p>
                <div className="mt-4 flex items-stretch border border-line-strong bg-paper">
                  <input
                    readOnly
                    value={url}
                    className="min-w-0 flex-1 bg-transparent px-2.5 py-2 font-mono text-[11px] text-ink-2 outline-none"
                    onFocus={(event) => event.currentTarget.select()}
                  />
                  <button
                    type="button"
                    onClick={() => void copy()}
                    className="flex shrink-0 items-center gap-1.5 border-l border-line-strong px-3 text-xs transition-colors hover:bg-acid-soft"
                  >
                    {copied ? <Check size={13} /> : <Copy size={13} />}
                    {copied ? "已复制" : "复制"}
                  </button>
                </div>
                <button type="button" onClick={() => void nativeShare()} className="btn btn-dark btn-sm mt-3 w-full">
                  <Share2 size={13} />
                  系统分享
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between border-t border-line bg-paper/60 px-5 py-3">
              <p className="text-[11px] text-muted">
                分享码 {url.split("/").pop()?.toUpperCase()}
              </p>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="text-[11px] text-muted transition-colors hover:text-ink"
              >
                关闭
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
