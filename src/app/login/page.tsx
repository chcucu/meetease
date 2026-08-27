"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import MeetEaseLogo from "@/components/MeetEaseLogo";
import MacWindow from "@/components/MacWindow";

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!email || !password) {
      setError("请填写邮箱和密码");
      return;
    }
    setLoading(true);
    const result = await login(email, password);
    setLoading(false);
    if (result.success) {
      router.push("/");
    } else {
      setError(result.error || "登录失败");
    }
  };

  return (
    <div className="min-h-screen relative flex items-center justify-center py-12">
      {/* 背景 */}
      <div className="fixed inset-0 bg-gradient-to-b from-meet-50 to-white -z-10" aria-hidden="true" />

      <div className="w-full max-w-md px-4">
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <MeetEaseLogo size="lg" />
          </div>
          <h1 className="font-display text-3xl art-title">欢迎回来</h1>
          <p className="mt-2 text-sm text-meet-700/60">登录你的 MeetEase 账号</p>
        </div>

        <MacWindow title="登录" className="anim-pop">
          <form onSubmit={handleSubmit} className="p-6 sm:p-8 space-y-5">
            {error && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm flex items-center gap-2">
                <svg className="w-5 h-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                {error}
              </div>
            )}

            <div>
              <label className="block text-sm font-semibold text-meet-800 mb-1.5">邮箱</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mac-input w-full px-4 py-3"
                placeholder="your@email.com"
                autoComplete="email"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-meet-800 mb-1.5">密码</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="mac-input w-full px-4 py-3"
                placeholder="••••••••"
                autoComplete="current-password"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full btn-sky text-white font-bold py-3.5 rounded-2xl text-lg disabled:opacity-60 flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  登录中…
                </>
              ) : (
                "登录"
              )}
            </button>

            <p className="text-center text-sm text-meet-700/60">
              还没有账号？{" "}
              <Link href="/register" className="text-meet-600 font-semibold hover:text-meet-800 underline underline-offset-2">
                立即注册
              </Link>
            </p>
          </form>
        </MacWindow>
      </div>
    </div>
  );
}