"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useRef, useState } from "react";
import { ArrowLeft, ArrowRight, Loader2 } from "lucide-react";
import { Logo } from "@/components/logo";

const CODE_LENGTH = 4;

export default function JoinPage() {
  const router = useRouter();
  const [digits, setDigits] = useState<string[]>(() => Array(CODE_LENGTH).fill(""));
  const [error, setError] = useState<string | null>(null);
  const [attempt, setAttempt] = useState(0);
  const [loading, setLoading] = useState(false);
  const inputs = useRef<Array<HTMLInputElement | null>>([]);

  const code = digits.join("");
  const complete = digits.every((digit) => digit !== "");

  function focusAt(index: number) {
    const target = Math.min(Math.max(index, 0), CODE_LENGTH - 1);
    inputs.current[target]?.focus();
    inputs.current[target]?.select();
  }

  function applyText(raw: string, start: number) {
    const clean = raw.replace(/\D/g, "").slice(0, CODE_LENGTH);
    if (!clean) return;

    const next = [...digits];
    const from = clean.length >= CODE_LENGTH ? 0 : start;
    for (let index = 0; index < clean.length && from + index < CODE_LENGTH; index += 1) {
      next[from + index] = clean[index];
    }
    setDigits(next);
    setError(null);
    focusAt(from + clean.length);
  }

  function handleChange(index: number, value: string) {
    const clean = value.replace(/\D/g, "");
    if (clean.length > 1) {
      applyText(clean, index);
      return;
    }

    const next = [...digits];
    next[index] = clean.slice(0, 1);
    setDigits(next);
    setError(null);
    if (clean) focusAt(index + 1);
  }

  function handleKeyDown(index: number, event: React.KeyboardEvent<HTMLInputElement>) {
    if (event.key === "Backspace" && !digits[index] && index > 0) {
      event.preventDefault();
      const next = [...digits];
      next[index - 1] = "";
      setDigits(next);
      focusAt(index - 1);
      return;
    }

    if (event.key === "ArrowLeft" && index > 0) {
      event.preventDefault();
      focusAt(index - 1);
      return;
    }

    if (event.key === "ArrowRight" && index < CODE_LENGTH - 1) {
      event.preventDefault();
      focusAt(index + 1);
      return;
    }

    if (event.key === "Enter") {
      event.preventDefault();
      if (complete && !loading) void submit();
    }
  }

  function handlePaste(index: number, event: React.ClipboardEvent<HTMLInputElement>) {
    event.preventDefault();
    applyText(event.clipboardData.getData("text"), index);
  }

  async function submit() {
    if (!complete || loading) return;
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/join?code=${encodeURIComponent(code)}`, {
        cache: "no-store",
      });
      const data = (await response.json()) as {
        ok?: boolean;
        shareCode?: string;
        title?: string;
        error?: string;
      };

      if (!response.ok || !data.ok || !data.shareCode) {
        setError(data.error ?? "没有找到这个口令对应的决策");
        setAttempt((value) => value + 1);
        focusAt(0);
        return;
      }

      router.push(`/a/${encodeURIComponent(data.shareCode)}`);
    } catch {
      setError("网络出了点问题，请重试");
      setAttempt((value) => value + 1);
      focusAt(0);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen flex-col">
      <header className="flex items-center justify-between px-6 py-5 sm:px-10">
        <Logo />
        <Link
          href="/"
          className="flex items-center gap-1.5 text-[12px] text-muted transition-colors hover:text-ink"
        >
          <ArrowLeft size={13} />
          回到首页
        </Link>
      </header>

      <main className="flex flex-1 items-center justify-center px-6 py-10">
        <div className="w-full max-w-[440px]">
          <div className="card relative border-ink p-7 shadow-[5px_5px_0_#171714] sm:p-9">
            <span
              className="absolute right-0 top-0 h-16 w-16 border-b border-l border-ink bg-acid"
              aria-hidden="true"
            />
            <p className="label">JOIN WITH CODE</p>
            <h1 className="mt-3 font-display text-[clamp(2.2rem,5vw,3rem)] leading-[1.02] tracking-[-0.03em]">
              输入 4 位口令
            </h1>
            <p className="mt-3 max-w-[300px] text-sm leading-6 text-muted">
              向组织者索取口令，输入后即可进入决策页投票。
            </p>

            <form
              className="mt-7"
              onSubmit={(event) => {
                event.preventDefault();
                void submit();
              }}
            >
              <div className="flex gap-2.5 sm:gap-3">
                {digits.map((digit, index) => (
                  <input
                    key={index}
                    ref={(node) => {
                      inputs.current[index] = node;
                    }}
                    value={digit}
                    onChange={(event) => handleChange(index, event.target.value)}
                    onKeyDown={(event) => handleKeyDown(index, event)}
                    onPaste={(event) => handlePaste(index, event)}
                    onFocus={(event) => event.currentTarget.select()}
                    inputMode="numeric"
                    pattern="[0-9]*"
                    maxLength={1}
                    autoComplete="one-time-code"
                    autoFocus={index === 0}
                    aria-label={`第 ${index + 1} 位口令`}
                    aria-invalid={Boolean(error)}
                    className={`h-[76px] w-full min-w-0 border bg-paper text-center font-display text-[2.4rem] leading-none text-ink outline-none transition-[background-color,border-color,box-shadow] ${
                      error
                        ? "border-coral"
                        : digit
                          ? "border-ink bg-acid-soft"
                          : "border-line-strong"
                    }`}
                    style={digit && !error ? { boxShadow: "3px 3px 0 #171714" } : undefined}
                  />
                ))}
              </div>

              {error && (
                <div
                  key={attempt}
                  role="alert"
                  className="toast-shake mt-4 border border-coral bg-coral-soft px-3.5 py-2.5 text-[13px] text-ink"
                >
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading || !complete}
                className="btn btn-primary mt-5 w-full"
              >
                {loading ? <Loader2 size={15} className="animate-spin" /> : <ArrowRight size={15} />}
                {loading ? "正在查找…" : "加入决策"}
              </button>
            </form>

            <p className="mt-6 text-center text-[13px] text-muted">
              没有口令？
              <Link
                href="/new"
                className="ml-1 text-ink underline decoration-line-strong underline-offset-4 hover:decoration-ink"
              >
                创建决策
              </Link>
            </p>
          </div>

          <p className="mt-6 text-center font-mono text-[10px] tracking-[0.16em] text-muted uppercase">
            参与者无需注册
          </p>
        </div>
      </main>

      <footer className="px-6 py-5 sm:px-10">
        <p className="text-[11px] text-muted">© 2026 Quorum</p>
      </footer>
    </div>
  );
}
