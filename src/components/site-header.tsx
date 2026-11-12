"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { Menu, X, ArrowUpRight } from "lucide-react";
import { useAuth } from "./auth-provider";
import { Logo } from "./logo";

const NAV = [
  { href: "/#how", index: "01", label: "工作原理" },
  { href: "/#features", index: "02", label: "能力" },
  { href: "/#live", index: "03", label: "实时结果" },
  { href: "/a/DINNER", index: "04", label: "打开实例" },
];

export function SiteHeader() {
  const { user, loading, logout } = useAuth();
  const [openPath, setOpenPath] = useState<string | null>(null);
  const pathname = usePathname();
  const open = openPath === pathname;

  return (
    <header className="sticky top-0 z-50 border-b border-line bg-paper/88 backdrop-blur-md">
      <div className="container-page flex h-[66px] items-center justify-between gap-6">
        <div className="flex items-center gap-10">
          <Logo />
          <nav className="hidden items-center gap-7 lg:flex" aria-label="主导航">
            {NAV.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="group flex items-center gap-1.5 text-[13px] text-ink-2 transition-colors hover:text-ink"
              >
                <span className="font-mono text-[9px] text-muted/70">{item.index}</span>
                <span>{item.label}</span>
              </Link>
            ))}
          </nav>
        </div>

        <div className="hidden items-center gap-3 md:flex">
          {loading ? (
            <div className="h-8 w-24 animate-pulse rounded-sm bg-paper-deep" />
          ) : user ? (
            <>
              <Link href="/app" className="btn btn-ghost btn-sm">
                工作台
              </Link>
              <details className="group relative">
                <summary className="flex cursor-pointer list-none items-center gap-2 rounded-full border border-line-strong bg-surface py-1 pl-1 pr-2.5 transition-colors hover:border-ink [&::-webkit-details-marker]:hidden">
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-ink font-mono text-[10px] text-paper">
                    {user.name.slice(0, 1)}
                  </span>
                  <span className="max-w-[80px] truncate text-xs">{user.name}</span>
                </summary>
                <div className="absolute right-0 top-[calc(100%+8px)] w-52 border border-line bg-surface p-2 shadow-[4px_4px_0_rgba(23,23,20,0.9)]">
                  <p className="px-2 pb-2 pt-1 font-mono text-[10px] tracking-wide text-muted">
                    {user.email}
                  </p>
                  <Link
                    href="/app"
                    className="block rounded-sm px-2 py-2 text-sm transition-colors hover:bg-acid-soft"
                  >
                    我的工作台
                  </Link>
                  <Link
                    href="/new"
                    className="block rounded-sm px-2 py-2 text-sm transition-colors hover:bg-acid-soft"
                  >
                    发起新决策
                  </Link>
                  <button
                    type="button"
                    onClick={() => void logout()}
                    className="mt-1 block w-full border-t border-line px-2 py-2 text-left text-sm text-muted transition-colors hover:text-coral"
                  >
                    退出登录
                  </button>
                </div>
              </details>
            </>
          ) : (
            <>
              <Link href="/login" className="text-[13px] text-ink-2 transition-colors hover:text-ink">
                登录
              </Link>
              <Link href="/register" className="btn btn-primary btn-sm">
                创建一次决策
                <ArrowUpRight size={14} strokeWidth={2} />
              </Link>
            </>
          )}
        </div>

        <button
          type="button"
          className="flex h-9 w-9 items-center justify-center border border-line-strong bg-surface md:hidden"
          onClick={() => setOpenPath(open ? null : pathname)}
          aria-expanded={open}
          aria-label="打开菜单"
        >
          {open ? <X size={17} /> : <Menu size={17} />}
        </button>
      </div>

      {open && (
        <div className="border-t border-line bg-paper px-5 py-5 md:hidden">
          <nav className="flex flex-col gap-1" aria-label="移动端导航">
            {NAV.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="flex items-center justify-between border-b border-line/70 py-3 text-sm"
              >
                <span>{item.label}</span>
                <span className="font-mono text-[10px] text-muted">{item.index}</span>
              </Link>
            ))}
          </nav>
          <div className="mt-4 flex items-center gap-3">
            {user ? (
              <>
                <Link href="/app" className="btn btn-ghost flex-1">
                  工作台
                </Link>
                <button
                  type="button"
                  onClick={() => void logout()}
                  className="btn btn-ghost"
                >
                  退出
                </button>
              </>
            ) : (
              <>
                <Link href="/login" className="btn btn-ghost flex-1">
                  登录
                </Link>
                <Link href="/register" className="btn btn-primary flex-1">
                  创建决策
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
