"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import MeetEaseLogo from "@/components/MeetEaseLogo";
import MacWindow from "@/components/MacWindow";

export default function RegisterPage() {
  const router = useRouter();
  const { register } = useAuth();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!name || !email || !password) {
      setError("请填写所有必填字段");
      return;
    }
    if (password.length < 6) {
      setError("密码至少 6 个字符");
      return;
    }
    if (password !== confirmPassword) {
      setError("两次密码不一致");
      return;
    }
    setLoading(true);
    const result = await register(email, name, password);
    setLoading(false);
    if (result.success) {
      router.push("/");
    } else {
      setError(result.error || "注册失败");
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
          <h1 className="font-display text-3xl art-title-warm">创建账号</h1>
          <p className="mt-2 text-sm text-meet-700/60">加入 MeetEase，开始组织聚会</p>
        </div>

        <MacWindow title="注册" className="anim-pop">
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
              <label className="block text-sm font-semibold text-meet-800 mb-1.5">昵称</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="mac-input w-full px-4 py-3"
                placeholder="你的名字"
                autoComplete="name"
              />
            </div>

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
                placeholder="至少 6 个字符"
                autoComplete="new-password"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-meet-800 mb-1.5">确认密码</label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="mac-input w-full px-4 py-3"
                placeholder="再次输入密码"
                autoComplete="new-password"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full btn-sun text-white font-bold py-3.5 rounded-2xl text-lg disabled:opacity-60 flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  注册中…
                </>
              ) : (
                "创建账号"
              )}
            </button>

            <p className="text-center text-sm text-meet-700/60">
              已有账号？{" "}
              <Link href="/login" className="text-meet-600 font-semibold hover:text-meet-800 underline underline-offset-2">
                立即登录
              </Link>
            </p>
          </form>
        </MacWindow>
      </div>
    </div>
  );
}