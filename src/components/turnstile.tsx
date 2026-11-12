"use client";

import { useEffect, useRef } from "react";

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
          callback: (token) => verifyRef.current(token),
          "expired-callback": () => verifyRef.current(""),
          "error-callback": () => verifyRef.current(""),
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

  return <div ref={container} className={className} aria-label="人机验证" />;
}
