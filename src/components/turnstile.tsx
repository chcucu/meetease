"use client";

import { useEffect, useRef, useState } from "react";

type TurnstileApi = {
  render: (
    container: HTMLElement,
    options: {
      sitekey: string;
      theme?: "light" | "dark" | "auto";
      size?: "normal" | "compact" | "flexible";
      callback?: (token: string) => void;
      "expired-callback"?: () => void;
      "error-callback"?: () => void;
    }
  ) => string;
  reset: (widgetId: string) => void;
  remove: (widgetId: string) => void;
};

declare global {
  interface Window {
    turnstile?: TurnstileApi;
  }
}

const SITE_KEY = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;

let scriptPromise: Promise<void> | null = null;

function loadScript() {
  if (typeof window === "undefined" || window.turnstile) return Promise.resolve();
  if (scriptPromise) return scriptPromise;

  scriptPromise = new Promise<void>((resolve, reject) => {
    const script = document.createElement("script");
    script.src = "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit";
    script.async = true;
    script.defer = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error("turnstile-load-failed"));
    document.head.appendChild(script);
  });

  return scriptPromise;
}

export function Turnstile({
  onVerify,
  resetSignal = 0,
  className = "",
}: {
  onVerify: (token: string) => void;
  resetSignal?: number;
  className?: string;
}) {
  const container = useRef<HTMLDivElement>(null);
  const widgetId = useRef<string | null>(null);
  const verifyRef = useRef(onVerify);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    verifyRef.current = onVerify;
  }, [onVerify]);

  useEffect(() => {
    if (!SITE_KEY) return;
    let cancelled = false;

    loadScript()
      .then(() => {
        if (cancelled || !container.current || !window.turnstile) return;
        if (widgetId.current) {
          window.turnstile.remove(widgetId.current);
          widgetId.current = null;
        }

        widgetId.current = window.turnstile.render(container.current, {
          sitekey: SITE_KEY,
          theme: "light",
          size: "flexible",
          callback: (token) => {
            setFailed(false);
            verifyRef.current(token);
          },
          "expired-callback": () => verifyRef.current(""),
          "error-callback": () => {
            setFailed(true);
            verifyRef.current("");
          },
        });
      })
      .catch(() => {});

    return () => {
      cancelled = true;
      if (widgetId.current && window.turnstile) {
        window.turnstile.remove(widgetId.current);
        widgetId.current = null;
      }
    };
  }, []);

  useEffect(() => {
    if (!resetSignal || !widgetId.current || !window.turnstile) return;
    window.turnstile.reset(widgetId.current);
  }, [resetSignal]);

  if (!SITE_KEY) return null;

  return (
    <div>
      <div ref={container} className={className} aria-label="人机验证" />
      {failed && (
        <button
          type="button"
          onClick={() => {
            setFailed(false);
            if (widgetId.current && window.turnstile) {
              window.turnstile.reset(widgetId.current);
            }
          }}
          className="mt-1 text-[11px] text-muted underline underline-offset-2 hover:text-ink"
          aria-live="polite"
        >
          验证未能加载，点击重试
        </button>
      )}
    </div>
  );
}
