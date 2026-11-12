"use client";

import { useEffect, useRef, useSyncExternalStore } from "react";
import { Download, Share2, X } from "lucide-react";

const DISPLAY_FONT = '"Instrument Serif", Georgia, serif';
const SANS_FONT =
  'system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif';

const PAPER = "#f2efe6";
const INK = "#171714";
const MUTED = "#736f63";
const ACID = "#d9ff43";
const CORAL = "#ff5c35";

type ChoiceCardProps = {
  open: boolean;
  title: string;
  code: string;
  name: string;
  timeLabel: string | null;
  placeLabel: string | null;
  participantCount: number;
  condition?: string | null;
  onClose: () => void;
};

function wrapLines(
  ctx: CanvasRenderingContext2D,
  text: string,
  maxWidth: number,
  maxLines: number
) {
  const chars = Array.from(text);
  const lines: string[] = [];
  let index = 0;

  while (index < chars.length && lines.length < maxLines) {
    let line = "";
    while (index < chars.length) {
      const next = line + chars[index];
      if (line && ctx.measureText(next).width > maxWidth) break;
      line = next;
      index += 1;
    }
    lines.push(line);
  }

  if (index < chars.length && lines.length > 0) {
    let last = lines[lines.length - 1];
    while (last && ctx.measureText(`${last}…`).width > maxWidth) {
      last = last.slice(0, -1);
    }
    lines[lines.length - 1] = `${last}…`;
  }

  return lines;
}

function fitLine(ctx: CanvasRenderingContext2D, text: string, maxWidth: number) {
  let value = text;
  if (ctx.measureText(value).width <= maxWidth) return value;
  while (value && ctx.measureText(`${value}…`).width > maxWidth) {
    value = value.slice(0, -1);
  }
  return `${value}…`;
}

const subscribeNoop = () => () => {};

let cachedCanShare: boolean | null = null;

function canNativeShare(): boolean {
  if (cachedCanShare !== null) return cachedCanShare;
  let result = false;
  try {
    if (typeof navigator === "undefined" || typeof navigator.share !== "function") {
      result = false;
    } else if (typeof navigator.canShare !== "function") {
      result = true;
    } else {
      const probe = new File([new Blob([], { type: "image/png" })], "quorum.png", {
        type: "image/png",
      });
      result = navigator.canShare({ files: [probe] });
    }
  } catch {
    result = false;
  }
  cachedCanShare = result;
  return result;
}

function drawCard(
  canvas: HTMLCanvasElement,
  data: Omit<ChoiceCardProps, "open" | "onClose">
) {
  const ctx = canvas.getContext("2d");
  if (!ctx) return;

  const width = 1080;
  const height = 1350;
  canvas.width = width;
  canvas.height = height;

  ctx.fillStyle = PAPER;
  ctx.fillRect(0, 0, width, height);

  ctx.strokeStyle = INK;
  ctx.lineWidth = 3;
  ctx.strokeRect(48, 48, width - 96, height - 96);

  ctx.fillStyle = ACID;
  ctx.fillRect(824, 96, 176, 176);
  ctx.strokeRect(824, 96, 176, 176);

  ctx.beginPath();
  ctx.arc(1000, 272, 34, 0, Math.PI * 2);
  ctx.fillStyle = CORAL;
  ctx.fill();
  ctx.lineWidth = 3;
  ctx.stroke();

  ctx.fillStyle = INK;
  ctx.font = `400 32px ${DISPLAY_FONT}`;
  ctx.fillText("QUORUM", 96, 152);

  ctx.fillStyle = MUTED;
  ctx.font = `500 20px ${SANS_FONT}`;
  ctx.fillText("PERSONAL CHOICE", 96, 188);

  ctx.fillStyle = MUTED;
  ctx.font = `500 28px ${SANS_FONT}`;
  ctx.fillText(fitLine(ctx, `你好，${data.name || "参与者"}`, 660), 96, 320);

  ctx.fillStyle = INK;
  ctx.font = `400 92px ${DISPLAY_FONT}`;
  const titleLines = wrapLines(ctx, data.title || "未命名决策", 860, 3);
  let titleY = 420;
  for (const line of titleLines) {
    ctx.fillText(line, 96, titleY);
    titleY += 98;
  }

  ctx.strokeStyle = INK;
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(96, 690);
  ctx.lineTo(984, 690);
  ctx.stroke();

  ctx.fillStyle = MUTED;
  ctx.font = `500 24px ${SANS_FONT}`;
  ctx.fillText("你的时间", 96, 760);

  ctx.fillStyle = INK;
  ctx.font = `500 48px ${SANS_FONT}`;
  ctx.fillText(fitLine(ctx, data.timeLabel || "待定", 880), 96, 820);

  ctx.fillStyle = MUTED;
  ctx.font = `500 24px ${SANS_FONT}`;
  ctx.fillText("你的地点", 96, 930);

  ctx.fillStyle = INK;
  ctx.font = `500 48px ${SANS_FONT}`;
  ctx.fillText(fitLine(ctx, data.placeLabel || "待定", 880), 96, 990);

  if (data.condition && data.condition.trim()) {
    ctx.fillStyle = MUTED;
    ctx.font = `500 24px ${SANS_FONT}`;
    ctx.fillText("附加条件", 96, 1080);

    ctx.fillStyle = INK;
    ctx.font = `400 34px ${SANS_FONT}`;
    ctx.fillText(fitLine(ctx, data.condition.trim(), 880), 96, 1128);
  }

  ctx.fillStyle = MUTED;
  ctx.font = `500 24px ${SANS_FONT}`;
  ctx.fillText(`${data.participantCount} 人已参与`, 96, 1175);

  ctx.strokeStyle = INK;
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(96, 1210);
  ctx.lineTo(984, 1210);
  ctx.stroke();

  ctx.fillStyle = MUTED;
  ctx.font = `500 20px ${SANS_FONT}`;
  ctx.fillText("SHARE CODE", 96, 1248);

  ctx.fillStyle = INK;
  ctx.font = `500 36px ${SANS_FONT}`;
  ctx.fillText((data.code || "----").toUpperCase(), 96, 1290);

  ctx.font = `400 48px ${DISPLAY_FONT}`;
  ctx.textAlign = "right";
  ctx.fillText("quorum", 984, 1290);
  ctx.textAlign = "left";
}

export function ChoiceCard({
  open,
  title,
  code,
  name,
  timeLabel,
  placeLabel,
  participantCount,
  condition,
  onClose,
}: ChoiceCardProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const canShare = useSyncExternalStore(subscribeNoop, canNativeShare, () => false);

  useEffect(() => {
    if (!open) return;
    const canvas = canvasRef.current;
    if (!canvas) return;

    let active = true;
    const paint = () => {
      if (active) {
        drawCard(canvas, { title, code, name, timeLabel, placeLabel, participantCount, condition });
      }
    };

    paint();
    if (typeof document !== "undefined" && document.fonts?.ready) {
      document.fonts.ready.then(paint).catch(() => {});
    }

    return () => {
      active = false;
    };
  }, [open, title, code, name, timeLabel, placeLabel, participantCount, condition]);

  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = previous;
    };
  }, [open, onClose]);

  function getBlob() {
    const canvas = canvasRef.current;
    if (!canvas) return Promise.resolve<Blob | null>(null);
    return new Promise<Blob | null>((resolve) => {
      canvas.toBlob((blob) => resolve(blob), "image/png");
    });
  }

  async function download() {
    const blob = await getBlob();
    if (!blob) return;
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `quorum-${code || "card"}.png`;
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }

  async function share() {
    if (!canShare) return;
    const blob = await getBlob();
    if (!blob) return;
    const file = new File([blob], `quorum-${code || "card"}.png`, { type: "image/png" });
    try {
      await navigator.share({ files: [file], title, text: `我的选择 · ${title}` });
    } catch {
      // User cancelled or the browser refused the share sheet.
    }
  }

  if (!open) return null;

  return (
    <div
      className="overlay-fade fixed inset-0 z-[95] flex items-end justify-center bg-ink/45 p-0 backdrop-blur-[3px] sm:items-center sm:p-6"
      role="dialog"
      aria-modal="true"
      aria-label="你的选择卡"
      onClick={onClose}
    >
      <div
        className="max-h-[94vh] w-full max-w-lg overflow-y-auto border border-ink bg-surface shadow-[6px_6px_0_#171714]"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex items-start justify-between border-b border-line px-5 py-4">
          <div>
            <p className="label">YOUR CHOICE</p>
            <h3 className="mt-1 font-display text-2xl leading-tight">你的选择卡</h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center border border-line-strong transition-colors hover:bg-paper-deep"
            aria-label="关闭"
          >
            <X size={15} />
          </button>
        </div>

        <div className="p-5">
          <canvas
            ref={canvasRef}
            width={1080}
            height={1350}
            className="mx-auto block h-auto w-full max-w-[300px] border border-ink bg-paper shadow-[3px_3px_0_#171714]"
          />

          <div className={`mt-4 grid gap-2 ${canShare ? "grid-cols-2" : "grid-cols-1"}`}>
            <button type="button" onClick={() => void download()} className="btn btn-primary btn-sm">
              <Download size={14} />
              下载 PNG
            </button>
            {canShare && (
              <button type="button" onClick={() => void share()} className="btn btn-dark btn-sm">
                <Share2 size={14} />
                系统分享
              </button>
            )}
          </div>

          <button
            type="button"
            onClick={onClose}
            className="mt-2 w-full py-1 text-center text-[11px] text-muted transition-colors hover:text-ink"
          >
            关闭
          </button>
        </div>
      </div>
    </div>
  );
}

export default ChoiceCard;
