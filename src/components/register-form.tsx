"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { ArrowRight, Loader2 } from "lucide-react";
import { useAuth } from "@/components/auth-provider";

export function RegisterForm() {
  const router = useRouter();
  const { setUser } = useAuth();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      });
      const data = await response.json();
      if (!response.ok) {
        setError(data.error ?? "注册失败，请重试");
        return;
      }
      setUser(data.user);
      router.push("/new");
      router.refresh();
    } catch {
      setError("网络出了点问题，请重试");
    } finally {
      setLoading(false);
    }
  }

  const strength = password.length >= 12 ? 3 : password.length >= 8 ? 2 : password.length > 0 ? 1 : 0;

  return (
    <div>
      <div className="mb-8">
        <h1 className="font-display text-[clamp(2.4rem,4vw,3.3rem)] leading-[1.02] tracking-[-0.03em]">
          创建账号
        </h1>
        <p className="mt-3 text-sm leading-6 text-muted">
          参与者无需注册。组织者账号用于创建与管理决策页。
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
          <label htmlFor="name" className="field-label">
            你的名字
          </label>
          <input
            id="name"
            type="text"
            autoComplete="name"
            required
            maxLength={24}
            value={name}
            onChange={(event) => setName(event.target.value)}
            className="field"
            placeholder="朋友怎么称呼你"
          />
        </div>
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
            autoComplete="new-password"
            required
            minLength={8}
            maxLength={72}
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            className="field"
            placeholder="至少 8 位"
          />
          <div className="mt-2 flex items-center gap-2">
            <div className="flex flex-1 gap-1">
              {[1, 2, 3].map((level) => (
                <span
                  key={level}
                  className={`h-1 flex-1 transition-colors ${
                    strength >= level ? "bg-ink" : "bg-line"
                  }`}
                />
              ))}
            </div>
            <span className="text-[11px] text-muted">
              {strength === 0 ? "至少 8 位" : strength === 1 ? "偏短" : strength === 2 ? "可以" : "很好"}
            </span>
          </div>
        </div>

        <button type="submit" disabled={loading} className="btn btn-primary w-full">
          {loading ? <Loader2 size={15} className="animate-spin" /> : <ArrowRight size={15} />}
          {loading ? "正在创建…" : "创建账号"}
        </button>
      </form>

      <div className="mt-6 border border-line bg-surface p-4">
        <p className="text-[12px] font-medium text-ink">账号权限</p>
        <ul className="mt-2 space-y-1.5 text-[12px] leading-5 text-muted">
          <li>创建与分享决策页</li>
          <li>查看投票、参与者与支付状态</li>
          <li>关闭投票并导出 CSV</li>
        </ul>
      </div>

      <p className="mt-6 text-center text-[13px] text-muted">
        已经有账号？
        <Link href="/login" className="ml-1 text-ink underline decoration-line-strong underline-offset-4 hover:decoration-ink">
          登录
        </Link>
      </p>
    </div>
  );
}
