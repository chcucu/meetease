"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import MacWindow from "@/components/MacWindow";

type ActivityBrief = {
  id: string;
  title: string;
  shareCode: string;
  status: string;
  category: string;
  createdAt: string;
  deadline: string | null;
  _count: { participants: number; timeOptions: number; suggestions: number };
};

const CATEGORY_LABELS: Record<string, string> = {
  social: "社交",
  dinner: "聚餐",
  sport: "运动",
  travel: "旅行",
  workshop: "工作坊",
  other: "其他",
};

const CATEGORY_COLORS: Record<string, string> = {
  social: "from-meet-400 to-meet-600",
  dinner: "from-meet-gold-300 to-meet-gold-500",
  sport: "from-meet-300 to-meet-500",
  travel: "from-meet-500 to-meet-700",
  workshop: "from-meet-200 to-meet-400",
  other: "from-meet-400 to-meet-600",
};

const STATUS_LABELS: Record<string, string> = {
  open: "进行中",
  closed: "已截止",
  cancelled: "已取消",
};

export default function DashboardPage() {
  const [activities, setActivities] = useState<ActivityBrief[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const codes = JSON.parse(localStorage.getItem("meet_activities") || "[]");
    if (codes.length === 0) {
      setLoading(false);
      return;
    }
    fetch("/api/activities/batch", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ codes }),
    })
      .then((r) => r.json())
      .then((data) => {
        if (data.success) setActivities(data.activities);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const handleExport = (code: string) => {
    window.open(`/api/activities/${code}/export`, "_blank");
  };

  return (
    <div className="min-h-screen relative">
      <div className="fixed inset-0 bg-gradient-to-b from-meet-50 to-white -z-10" aria-hidden="true" />

      <div className="max-w-5xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="font-display text-3xl text-meet-800">我的活动</h1>
            <p className="text-meet-500/70 text-sm mt-1">管理和查看你创建的所有活动</p>
          </div>
          <Link
            href="/create"
            className="btn-sun text-white font-semibold px-6 py-2.5 rounded-2xl inline-flex items-center gap-2 text-sm"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
            </svg>
            创建活动
          </Link>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="w-8 h-8 border-[3px] border-meet-400 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : activities.length === 0 ? (
          <div className="text-center py-20">
            <div className="w-20 h-20 bg-meet-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-10 h-10 text-meet-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
            <h2 className="font-display text-xl text-meet-700 mb-2">还没有活动</h2>
            <p className="text-meet-500/70 mb-6">创建一个活动，开始你的聚会吧</p>
            <Link href="/create" className="btn-sun text-white font-semibold px-8 py-3 rounded-2xl inline-block">
              创建第一个活动
            </Link>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {activities.map((a) => {
              const isOpen = a.status === "open";
              const isExpired = a.deadline && new Date(a.deadline) < new Date();
              return (
                <div key={a.id} className="bg-white rounded-3xl border border-meet-100 overflow-hidden hover:shadow-lg hover:shadow-meet-100/50 transition-all duration-300 anim-fade-up">
                  {/* 头部 */}
                  <div className={`h-2 bg-gradient-to-r ${CATEGORY_COLORS[a.category] || "from-meet-400 to-meet-600"}`} />

                  <div className="p-5">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-[10px] font-semibold text-meet-500 bg-meet-50 px-2 py-0.5 rounded-full">
                        {CATEGORY_LABELS[a.category] || "其他"}
                      </span>
                      <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                        isOpen && !isExpired
                          ? "bg-green-50 text-green-600"
                          : "bg-meet-50 text-meet-500"
                      }`}>
                        {isOpen && !isExpired ? STATUS_LABELS.open : isExpired ? "已过期" : STATUS_LABELS[a.status] || a.status}
                      </span>
                    </div>

                    <h3 className="font-display text-lg text-meet-800 mb-2 truncate">{a.title}</h3>

                    <div className="flex items-center gap-3 text-xs text-meet-500 mb-4">
                      <span>{a._count.participants} 人参与</span>
                      <span>{a._count.timeOptions} 个时间</span>
                      <span>{a._count.suggestions} 条提议</span>
                    </div>

                    <div className="text-xs text-meet-400 mb-4">
                      {new Date(a.createdAt).toLocaleDateString("zh-CN")} 创建
                    </div>

                    <div className="flex gap-2">
                      <Link
                        href={`/event/${a.shareCode}`}
                        className="flex-1 text-center text-sm font-medium text-meet-600 bg-meet-50 hover:bg-meet-100 rounded-xl py-2 transition"
                      >
                        查看
                      </Link>
                      <Link
                        href={`/results/${a.shareCode}`}
                        className="flex-1 text-center text-sm font-medium text-meet-600 bg-meet-50 hover:bg-meet-100 rounded-xl py-2 transition"
                      >
                        结果
                      </Link>
                      <button
                        onClick={() => handleExport(a.shareCode)}
                        className="text-sm text-meet-500 bg-meet-50 hover:bg-meet-100 rounded-xl px-3 py-2 transition"
                        title="导出结果"
                      >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}