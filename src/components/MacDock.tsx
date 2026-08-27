"use client";

import Link from "next/link";
import { useAuth } from "@/context/AuthContext";

type DockItem = {
  label: string;
  href: string;
  gradient: string;
  icon: React.ReactNode;
};

const HomeIcon = () => (
  <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
  </svg>
);

const CreateIcon = () => (
  <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
  </svg>
);

const ExploreIcon = () => (
  <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
  </svg>
);

const UserIcon = () => (
  <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
  </svg>
);

const ChartIcon = () => (
  <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
  </svg>
);

export default function MacDock() {
  const { user } = useAuth();

  const dockItems: DockItem[] = [
    { label: "首页", href: "/", gradient: "from-meet-400 to-meet-600", icon: <HomeIcon /> },
    { label: "创建活动", href: "/create", gradient: "from-meet-gold-300 to-meet-gold-500", icon: <CreateIcon /> },
    { label: "探索", href: "/#features", gradient: "from-meet-300 to-meet-500", icon: <ExploreIcon /> },
    {
      label: user ? user.name : "登录",
      href: user ? "/" : "/login",
      gradient: user ? "from-meet-400 to-indigo-500" : "from-meet-gold-200 to-meet-gold-400",
      icon: <UserIcon />,
    },
    { label: "结果", href: "/#how", gradient: "from-meet-400 to-meet-600", icon: <ChartIcon /> },
  ];

  return (
    <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50">
      <div className="mac-dock">
        {dockItems.map((item) => (
          <Link key={item.label} href={item.href} className="dock-item">
            <span className="dock-tooltip">{item.label}</span>
            <div className={`dock-icon bg-gradient-to-br ${item.gradient}`}>
              {item.icon}
            </div>
            <span className="dock-active-indicator" />
          </Link>
        ))}
      </div>
    </div>
  );
}