"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { LayoutGrid, LogOut, Plus } from "lucide-react";
import type { AuthUser } from "./auth-provider";
import { useAuth } from "./auth-provider";
import { Logo } from "./logo";

const LINKS = [
  { href: "/app", label: "概览", icon: LayoutGrid },
  { href: "/new", label: "新建", icon: Plus },
];

export function AppShell({ user, children }: { user: AuthUser; children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { logout } = useAuth();
  const [open, setOpen] = useState(false);

  async function handleLogout() {
    await logout();
    router.push("/");
    router.refresh();
  }

  return (
    <div className="min-h-screen bg-paper">
      <header className="sticky top-0 z-50 border-b border-line bg-paper/90 backdrop-blur-md">
        <div className="container-page flex h-[64px] items-center justify-between gap-6">
          <div className="flex items-center gap-5">
            <Logo />
          </div>

          <nav className="hidden items-center gap-1 md:flex" aria-label="工作台导航">
            {LINKS.map((link) => {
              const active =
                link.href === "/app" ? pathname === "/app" || pathname.startsWith("/app/") : pathname === "/new";
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`flex items-center gap-1.5 rounded-sm px-3 py-1.5 text-[13px] transition-colors ${
                    active ? "bg-ink text-paper" : "text-ink-2 hover:bg-paper-deep"
                  }`}
                >
                  <link.icon size={13} />
                  {link.label}
                </Link>
              );
            })}
            <Link
              href="/a/DINNER"
              className="ml-2 px-3 py-1.5 text-[13px] text-muted transition-colors hover:text-ink"
            >
              示例
            </Link>
          </nav>

          <div className="flex items-center gap-2.5">
            <Link href="/new" className="btn btn-primary btn-sm hidden sm:inline-flex">
              <Plus size={13} />
              新建决策
            </Link>
            <button
              type="button"
              onClick={() => setOpen((value) => !value)}
              className="flex items-center gap-2 rounded-full border border-line-strong bg-surface py-1 pl-1 pr-2.5 transition-colors hover:border-ink"
              aria-expanded={open}
              aria-label="账号菜单"
            >
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-ink font-mono text-[10px] text-paper">
                {user.name.slice(0, 1)}
              </span>
              <span className="max-w-[72px] truncate text-xs">{user.name}</span>
            </button>
          </div>
        </div>

        {open && (
          <div className="absolute right-4 top-[calc(100%+6px)] w-60 border border-line bg-surface p-2 shadow-[4px_4px_0_rgba(23,23,20,0.9)] sm:right-[max(1rem,calc((100%-1280px)/2+3.25rem))]">
            <p className="px-2 pb-1.5 pt-1 text-[11px] text-muted">
              {user.email}
            </p>
            <Link href="/app" className="block rounded-sm px-2 py-2 text-sm hover:bg-acid-soft">
              工作台
            </Link>
            <Link href="/new" className="block rounded-sm px-2 py-2 text-sm hover:bg-acid-soft">
              新建决策
            </Link>
            <button
              type="button"
              onClick={() => void handleLogout()}
              className="mt-1 flex w-full items-center gap-2 border-t border-line px-2 py-2 text-left text-sm text-muted hover:text-coral"
            >
              <LogOut size={13} />
              退出登录
            </button>
          </div>
        )}
      </header>

      <main>{children}</main>
    </div>
  );
}
