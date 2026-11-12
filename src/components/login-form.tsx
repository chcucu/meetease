"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { ArrowRight, Loader2 } from "lucide-react";
import { useAuth } from "@/components/auth-provider";

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { setUser } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [demoLoading, setDemoLoading] = useState(false);

  const nextParam = searchParams.get("next");
  const next = nextParam && nextParam.startsWith("/") ? nextParam : "/app";

  async function login(emailValue: string, passwordValue: string) {
    setError(null);
    setLoading(true);
    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: emailValue, password: passwordValue }),
      });
      const data = await response.json();
      if (!response.ok) {
        setError(data.error ?? "登录失败，请重试");
        return;
      }
      setUser(data.user);
      router.push(next);
      router.refresh();
    } catch {
      setError("网络出了点问题，请重试");
    } finally {
      setLoading(false);
      setDemoLoading(false);
    }
  }

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    await login(email, password);
  }

  async function demoLogin() {
    setEmail("demo@quorum.app");
    setPassword("quorum123");
    setDemoLoading(true);
    await login("demo@quorum.app", "quorum123");
  }

  return (
    <div>
      <div className="mb-8">
        <p className="label mb-3">MEMBER ACCESS / 登录</p>
        <h1 className="font-display text-[clamp(2.4rem,4vw,3.3rem)] leading-[1.02] tracking-[-0.03em]">
          回来，
          <span className="serif-italic">继续定事</span>。
        </h1>
        <p className="mt-3 text-sm leading-6 text-muted">
          登录后回到工作台，查看谁投了票、谁还没来，把结果收个尾。
        </p>
      </div>

      {error && (
        <div
          role="alert"
          className="mb-5 border border-coral bg-coral-soft px-3.5 py-2.5 text-[13px] text-ink"
        >
          {error}
        </div>
      )}

      <form onSubmit={submit} className="space-y-4">
        <div>
          <label htmlFor="email" className="field-label">
            邮箱
          </label>
          <input
            id="email"
            type="email"
            autoComplete="email"
            required
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            className="field"
            placeholder="you@example.com"
          />
        </div>
        <div>
          <label htmlFor="password" className="field-label">
            密码
          </label>
          <input
            id="password"
            type="password"
            autoComplete="current-password"
            required
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            className="field"
            placeholder="至少 8 位"
          />
        </div>

        <button type="submit" disabled={loading || demoLoading} className="btn btn-primary w-full">
          {loading ? <Loader2 size={15} className="animate-spin" /> : <ArrowRight size={15} />}
          {loading ? "正在登录…" : "登录"}
        </button>
      </form>

      <div className="my-6 flex items-center gap-3">
        <span className="h-px flex-1 bg-line" />
        <span className="font-mono text-[9px] tracking-[0.14em] text-muted">OR</span>
        <span className="h-px flex-1 bg-line" />
      </div>

      <div className="border border-line-strong bg-acid-soft/70 p-4">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-[13px] font-medium">先看看里面长什么样</p>
            <p className="mt-1 font-mono text-[10px] leading-5 text-ink-2">
              demo@quorum.app · quorum123
            </p>
          </div>
          <span className="chip border-ink/20 bg-paper text-[8px]">DEMO</span>
        </div>
        <button
          type="button"
          onClick={() => void demoLogin()}
          disabled={loading || demoLoading}
          className="btn btn-dark btn-sm mt-3 w-full"
        >
          {demoLoading ? <Loader2 size={13} className="animate-spin" /> : null}
          {demoLoading ? "正在进入…" : "用演示账号进入"}
        </button>
      </div>

      <p className="mt-6 text-center text-[13px] text-muted">
        还没有账号？
        <Link href="/register" className="ml-1 text-ink underline decoration-line-strong underline-offset-4 hover:decoration-ink">
          创建一个
        </Link>
      </p>
    </div>
  );
}
