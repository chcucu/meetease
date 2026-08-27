"use client";

import Link from "next/link";
import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import MeetEaseLogo from "./MeetEaseLogo";
import Launchpad from "./Launchpad";

export default function MacMenuBar() {
  const [launchpadOpen, setLaunchpadOpen] = useState(false);
  const { user, loading, logout } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <>
      <header className="sticky top-0 z-50 glass-strong">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
          {/* 左侧：红绿灯 + Logo */}
          <div className="flex items-center gap-4">
            <div className="traffic-lights" aria-hidden="true">
              <span className="tl-red" />
              <span className="tl-yellow" />
              <span className="tl-green" />
            </div>
            <Link href="/" className="flex items-center gap-2 group">
              <MeetEaseLogo size="sm" showText={false} />
              <span className="font-display text-lg text-meet-700 tracking-wide">
                MeetEase<span className="text-meet-gold-500"> 聚会</span>
              </span>
            </Link>
          </div>

          {/* 中间：导航 + macOS 菜单 */}
          <nav className="hidden md:flex items-center gap-1 text-sm font-medium text-meet-700/80">
            <Link href="/" className="px-3 py-1.5 rounded-lg hover:bg-white/70 hover:text-meet-600 transition">首页</Link>
            <Link href="/#features" className="px-3 py-1.5 rounded-lg hover:bg-white/70 hover:text-meet-600 transition">功能</Link>
            <Link href="/#how" className="px-3 py-1.5 rounded-lg hover:bg-white/70 hover:text-meet-600 transition">怎么用</Link>
            <Link href="/dashboard" className="px-3 py-1.5 rounded-lg hover:bg-white/70 hover:text-meet-600 transition flex items-center gap-1">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
              我的活动
            </Link>
            <button
              onClick={() => setLaunchpadOpen(true)}
              className="px-3 py-1.5 rounded-lg hover:bg-white/70 hover:text-meet-600 transition flex items-center gap-1"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
              </svg>
              启动台
            </button>
          </nav>

          {/* 右侧：创建活动 + 用户 */}
          <div className="flex items-center gap-2">
            {!loading && user ? (
              <div className="relative">
                <button
                  onClick={() => setMenuOpen(!menuOpen)}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-xl hover:bg-white/70 transition"
                >
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-meet-400 to-meet-600 flex items-center justify-center text-white text-sm font-bold shadow-md">
                    {user.name.charAt(0).toUpperCase()}
                  </div>
                  <span className="text-sm text-meet-700 font-medium hidden sm:block">{user.name}</span>
                </button>
                {menuOpen && (
                  <>
                    <div className="fixed inset-0 z-40" onClick={() => setMenuOpen(false)} />
                    <div className="absolute right-0 top-full mt-2 w-48 z-50 glass-strong rounded-2xl overflow-hidden anim-pop">
                      <div className="p-4 border-b border-meet-100">
                        <p className="text-sm font-semibold text-meet-800">{user.name}</p>
                        <p className="text-xs text-meet-500">{user.email}</p>
                      </div>
                      <div className="p-2">
                        <button
                          onClick={async () => { await logout(); setMenuOpen(false); }}
                          className="w-full text-left px-3 py-2.5 rounded-xl text-sm text-red-500 hover:bg-red-50 transition flex items-center gap-2"
                        >
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                          </svg>
                          退出登录
                        </button>
                      </div>
                    </div>
                  </>
                )}
              </div>
            ) : (
              !loading && (
                <Link
                  href="/login"
                  className="text-sm text-meet-700/70 hover:text-meet-600 px-3 py-2 rounded-xl hover:bg-white/70 transition hidden sm:block"
                >
                  登录
                </Link>
              )
            )}
            <Link
              href="/create"
              className="btn-sun text-white text-sm font-semibold px-5 py-2 rounded-xl flex items-center gap-1.5"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
              </svg>
              <span className="hidden sm:inline">创建活动</span>
              <span className="sm:hidden">创建</span>
            </Link>
          </div>
        </div>
      </header>

      {/* Launchpad */}
      {launchpadOpen && <Launchpad onClose={() => setLaunchpadOpen(false)} />}
    </>
  );
}