"use client";

import Link from "next/link";
import { useEffect } from "react";
import { Home, RotateCcw } from "lucide-react";

export default function Error({
  error,
  retry,
}: {
  error: Error & { digest?: string };
  retry: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <main className="relative flex min-h-screen items-center overflow-hidden bg-paper">
      <div
        className="paper-grid pointer-events-none absolute inset-0 opacity-60"
        aria-hidden="true"
      />
      <div className="container-page relative py-20">
        <div className="grid gap-10 lg:grid-cols-[auto_1fr] lg:items-center">
          <p className="font-display text-[clamp(6rem,18vw,14rem)] leading-[0.8] tracking-[-0.06em]">
            5<span className="serif-italic text-coral">0</span>0
          </p>

          <div className="max-w-lg border border-ink bg-surface p-7 shadow-[6px_6px_0_#171714]">
            <p className="label">Quorum · 系统提示</p>
            <h1 className="mt-4 font-display text-[clamp(2rem,4.4vw,3.4rem)] leading-[1.02] tracking-[-0.03em]">
              这一页出了点问题
            </h1>
            <p className="mt-4 text-[13px] leading-6 text-muted">
              页面在加载时遇到了意外错误。可以重试一次，或回到首页重新开始。
            </p>

            {error.digest ? (
              <p className="mt-4 inline-block border border-line-strong bg-paper px-2 py-1 font-mono text-[10px] uppercase tracking-[0.08em] text-muted">
                Digest · {error.digest}
              </p>
            ) : null}

            <div className="mt-7 flex flex-wrap items-center gap-2">
              <button type="button" onClick={() => retry()} className="btn btn-primary">
                <RotateCcw size={14} />
                重试
              </button>
              <Link href="/" className="btn btn-ghost">
                <Home size={14} />
                回到首页
              </Link>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
