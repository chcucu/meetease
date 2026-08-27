"use client";

import Link from "next/link";
import { useEffect, useCallback } from "react";
import { useAuth } from "@/context/AuthContext";

type AppItem = {
  label: string;
  href: string;
  gradient: string;
  icon: React.ReactNode;
};

const HomeIcon = () => (
  <svg className="w-7 h-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.6}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
  </svg>
);

const CreateIcon = () => (
  <svg className="w-7 h-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.6}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
  </svg>
);

const ExploreIcon = () => (
  <svg className="w-7 h-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.6}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
  </svg>
);

const UserIcon = () => (
  <svg className="w-7 h-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.6}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
  </svg>
);

const ResultsIcon = () => (
  <svg className="w-7 h-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.6}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
  </svg>
);

const ArtIcon = () => (
  <svg className="w-7 h-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.6}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
  </svg>
);

const SunIcon = () => (
  <svg className="w-7 h-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.6}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
  </svg>
);

const FeedbackIcon = () => (
  <svg className="w-7 h-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.6}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
  </svg>
);

export default function Launchpad({ onClose }: { onClose: () => void }) {
  const { user } = useAuth();

  const apps: AppItem[] = [
    { label: "首页", href: "/", gradient: "from-meet-400 to-meet-600", icon: <HomeIcon /> },
    { label: "创建活动", href: "/create", gradient: "from-meet-gold-300 to-meet-gold-500", icon: <CreateIcon /> },
    { label: "探索", href: "/#features", gradient: "from-meet-300 to-meet-600", icon: <ExploreIcon /> },
    {
      label: user ? user.name : "登录",
      href: user ? "/" : "/login",
      gradient: user ? "from-meet-400 to-indigo-500" : "from-meet-gold-200 to-meet-gold-400",
      icon: <UserIcon />,
    },
    { label: "实时结果", href: "/#how", gradient: "from-meet-400 to-meet-600", icon: <ResultsIcon /> },
    { label: "艺术字", href: "/", gradient: "from-meet-gold-300 to-meet-gold-500", icon: <ArtIcon /> },
    { label: "夏日主题", href: "/", gradient: "from-meet-300 to-meet-500", icon: <SunIcon /> },
    { label: "反馈", href: "/", gradient: "from-meet-gold-200 to-meet-gold-400", icon: <FeedbackIcon /> },
  ];

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    },
    [onClose]
  );

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);

  return (
    <div className="launchpad-overlay" onClick={onClose}>
      <div className="mb-8 w-full max-w-md px-4">
        <div className="relative">
          <svg
            className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/50"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            placeholder="搜索应用"
            className="w-full bg-white/10 text-white placeholder-white/40 rounded-2xl py-3.5 pl-12 pr-4 text-sm outline-none ring-1 ring-white/20 focus:ring-2 focus:ring-meet-400/60 transition"
            onClick={(e) => e.stopPropagation()}
            readOnly
          />
        </div>
      </div>

      <div className="launchpad-grid" onClick={(e) => e.stopPropagation()}>
        {apps.map((app) => (
          <Link key={app.label} href={app.href} className="launchpad-item" onClick={onClose}>
            <div className={`launchpad-icon bg-gradient-to-br ${app.gradient}`}>
              {app.icon}
            </div>
            <span className="launchpad-label">{app.label}</span>
          </Link>
        ))}
      </div>
    </div>
  );
}