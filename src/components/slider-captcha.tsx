"use client";

import { useEffect, useRef, useState } from "react";
import type { KeyboardEvent, PointerEvent } from "react";

const TRACK_WIDTH = 320;
const HANDLE_WIDTH = 34;
const TOLERANCE = 8;

type Challenge = { token: string; target: number };
type Status = "loading" | "idle" | "success" | "error" | "unavailable";

type SliderCaptchaProps = {
  onVerified: (result: { token: string; x: number }) => void;
  resetSignal?: number;
  disabled?: boolean;
};

function clampLogical(value: number, barWidth: number) {
  const half = ((HANDLE_WIDTH / 2) / barWidth) * TRACK_WIDTH;
  return Math.min(TRACK_WIDTH - half, Math.max(half, value));
}

function readChallenge(payload: unknown): Challenge | null {
  if (!payload || typeof payload !== "object") return null;
  const record = payload as Record<string, unknown>;
  if (record.ok !== true) return null;
  if (typeof record.token !== "string" || typeof record.target !== "number") return null;
  return { token: record.token, target: record.target };
}

const STATUS_TEXT: Record<Status, string> = {
  loading: "正在准备验证",
  idle: "拖动滑块对齐缺口",
  success: "验证通过",
  error: "没对准，再试一次",
  unavailable: "验证加载失败，请稍后重试",
};

function SliderCaptchaInner({ onVerified, disabled = false }: SliderCaptchaProps) {
  const barRef = useRef<HTMLDivElement>(null);
  const dragRef = useRef<{ pointerId: number; startClientX: number; startX: number } | null>(
    null
  );

  const [barWidth, setBarWidth] = useState(TRACK_WIDTH);
  const [challenge, setChallenge] = useState<Challenge | null>(null);
  const [status, setStatus] = useState<Status>("loading");
  const [x, setX] = useState(() => clampLogical(0, TRACK_WIDTH));
  const [dragging, setDragging] = useState(false);
  const [shakeKey, setShakeKey] = useState(0);

  useEffect(() => {
    const controller = new AbortController();

    fetch("/api/captcha", { signal: controller.signal, cache: "no-store" })
      .then((response) => {
        if (!response.ok) throw new Error("captcha-request-failed");
        return response.json() as Promise<unknown>;
      })
      .then((payload) => {
        const next = readChallenge(payload);
        if (!next) throw new Error("captcha-payload-invalid");
        setChallenge(next);
        setStatus("idle");
      })
      .catch((error: unknown) => {
        if (error instanceof DOMException && error.name === "AbortError") return;
        setStatus("unavailable");
      });

    return () => controller.abort();
  }, []);

  useEffect(() => {
    const element = barRef.current;
    if (!element) return;

    const observer = new ResizeObserver((entries) => {
      const width = entries[0]?.contentRect.width;
      if (!width) return;
      setBarWidth((current) => (Math.abs(width - current) > 0.5 ? width : current));
    });

    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  const readOnly = disabled || status === "success" || !challenge;
  const currentX = clampLogical(x, barWidth);
  const handleLeft = (currentX / TRACK_WIDTH) * barWidth - HANDLE_WIDTH / 2;
  const notchLeft = `${(challenge?.target ?? 0) / TRACK_WIDTH * 100}%`;

  const commit = (value: number) => {
    if (!challenge || disabled) return;

    if (Math.abs(value - challenge.target) <= TOLERANCE) {
      setX(value);
      setStatus("success");
      onVerified({ token: challenge.token, x: Math.round(value) });
      return;
    }

    setX(clampLogical(0, barWidth));
    setStatus("error");
    setShakeKey((key) => key + 1);
  };

  const handlePointerDown = (event: PointerEvent<HTMLDivElement>) => {
    if (readOnly) return;
    event.currentTarget.setPointerCapture(event.pointerId);
    dragRef.current = {
      pointerId: event.pointerId,
      startClientX: event.clientX,
      startX: currentX,
    };
    setDragging(true);
    if (status === "error") setStatus("idle");
  };

  const handlePointerMove = (event: PointerEvent<HTMLDivElement>) => {
    const drag = dragRef.current;
    if (!drag || drag.pointerId !== event.pointerId) return;

    const delta = ((event.clientX - drag.startClientX) / barWidth) * TRACK_WIDTH;
    setX(clampLogical(drag.startX + delta, barWidth));
  };

  const handlePointerUp = (event: PointerEvent<HTMLDivElement>) => {
    const drag = dragRef.current;
    if (!drag || drag.pointerId !== event.pointerId) return;

    dragRef.current = null;
    setDragging(false);

    const delta = ((event.clientX - drag.startClientX) / barWidth) * TRACK_WIDTH;
    commit(clampLogical(drag.startX + delta, barWidth));
  };

  const handlePointerCancel = () => {
    dragRef.current = null;
    setDragging(false);
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (readOnly) return;

    if (event.key === "ArrowLeft" || event.key === "ArrowRight") {
      event.preventDefault();
      const step = event.key === "ArrowRight" ? 5 : -5;
      setX((value) => clampLogical(clampLogical(value, barWidth) + step, barWidth));
      if (status === "error") setStatus("idle");
      return;
    }

    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      commit(currentX);
    }
  };

  const statusTone =
    status === "success"
      ? "text-ink"
      : status === "error" || status === "unavailable"
        ? "text-coral"
        : "text-muted";

  return (
    <div className="w-full max-w-[320px]">
      <div className="flex items-baseline justify-between gap-3">
        <span className="label">HUMAN CHECK</span>
        <span
          aria-live="polite"
          className={`font-mono text-[10.5px] tracking-[0.08em] ${statusTone}`}
        >
          {STATUS_TEXT[status]}
        </span>
      </div>

      <div className="mt-2">
        <div key={shakeKey} className={status === "error" ? "toast-shake" : ""}>
          <div
            aria-hidden="true"
            className="relative h-4 w-full overflow-hidden rounded-[2px] border border-line-strong bg-surface"
          >
            {challenge && (
              <div
                className="absolute top-1/2 h-3 -translate-x-1/2 -translate-y-1/2 rounded-[2px] border border-dashed border-ink/45 bg-paper"
                style={{ left: notchLeft, width: HANDLE_WIDTH }}
              />
            )}
          </div>
        </div>

        <div
          ref={barRef}
          className={`relative mt-2 h-11 w-full rounded-[2px] border bg-surface transition-colors ${
            status === "success" ? "border-ink bg-acid-soft" : "border-line-strong"
          } ${disabled ? "opacity-55" : ""}`}
        >
          <div
            role="slider"
            aria-label="拖动滑块完成验证"
            aria-valuemin={0}
            aria-valuemax={TRACK_WIDTH}
            aria-valuenow={Math.round(currentX)}
            aria-disabled={readOnly}
            tabIndex={disabled ? -1 : 0}
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            onPointerCancel={handlePointerCancel}
            onKeyDown={handleKeyDown}
            className={`absolute top-1 flex h-9 w-[34px] touch-none select-none items-center justify-center rounded-[2px] border border-ink bg-acid focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-coral ${
              readOnly ? "cursor-default" : "cursor-grab active:cursor-grabbing"
            } ${
              dragging
                ? "translate-x-[1px] translate-y-[1px] shadow-none"
                : "shadow-[2px_2px_0_rgba(23,23,20,0.9)]"
            }`}
            style={{ left: `${handleLeft}px` }}
          >
            <span aria-hidden="true" className="flex items-center gap-[3px]">
              <span className="h-3 w-px bg-ink/50" />
              <span className="h-3 w-px bg-ink/50" />
              <span className="h-3 w-px bg-ink/50" />
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function SliderCaptcha(props: SliderCaptchaProps) {
  return <SliderCaptchaInner key={props.resetSignal ?? 0} {...props} />;
}
