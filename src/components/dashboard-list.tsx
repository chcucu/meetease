"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { ArrowUpRight, MessageSquare, Search, Users } from "lucide-react";
import { CoverPoster } from "./cover-poster";
import { ShareButton } from "./share-dialog";
import { EmptyState } from "./ui";
import { relativeTime } from "@/lib/format";
import type { ActivitySummary } from "@/lib/types";

const TABS = [
  { value: "all", label: "全部" },
  { value: "open", label: "进行中" },
  { value: "closed", label: "已结束" },
] as const;

type Tab = (typeof TABS)[number]["value"];

export function DashboardList({ activities }: { activities: ActivitySummary[] }) {
  const [tab, setTab] = useState<Tab>("all");
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    return activities.filter((activity) => {
      if (tab === "open" && activity.status !== "open") return false;
      if (tab === "closed" && activity.status !== "closed") return false;
      if (query.trim()) {
        const needle = query.trim().toLowerCase();
        return (
          activity.title.toLowerCase().includes(needle) ||
          activity.description.toLowerCase().includes(needle) ||
          activity.shareCode.toLowerCase().includes(needle)
        );
      }
      return true;
    });
  }, [activities, tab, query]);

  if (activities.length === 0) {
    return (
      <section className="mt-12">
        <EmptyState
          title="还没有决策卡"
          description="创建一张决策卡，添加时间、地点与问题，然后分享链接。"
          action={{ href: "/new", label: "创建决策卡" }}
        />
      </section>
    );
  }

  return (
    <section className="mt-12">
      <div className="mb-6 flex flex-col justify-between gap-4 border-b border-line pb-4 sm:flex-row sm:items-end">
        <div>
          <h2 className="font-display text-[28px] leading-tight">所有决策</h2>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="relative">
            <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted" />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="搜索标题、描述或分享码"
              className="field h-9 w-full py-0 pl-8 text-xs sm:w-[230px]"
            />
          </div>
          <div className="flex border border-line-strong bg-surface p-0.5">
            {TABS.map((item) => (
              <button
                key={item.value}
                type="button"
                onClick={() => setTab(item.value)}
                className={`px-3 py-1.5 text-[11px] transition-colors ${
                  tab === item.value ? "bg-ink text-paper" : "text-muted hover:text-ink"
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="border border-dashed border-line-strong bg-surface/50 px-6 py-14 text-center">
          <p className="font-display text-2xl">没有符合条件的决策</p>
          <p className="mt-2 text-sm text-muted">换个筛选条件，或者清空搜索关键词。</p>
          <button
            type="button"
            onClick={() => {
              setTab("all");
              setQuery("");
            }}
            className="btn btn-ghost btn-sm mt-5"
          >
            清空筛选
          </button>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2">
          {filtered.map((activity) => (
            <article
              key={activity.id}
              className="group flex flex-col overflow-hidden border border-line bg-surface transition-all duration-200 hover:border-ink hover:shadow-[4px_4px_0_rgba(23,23,20,0.9)]"
            >
              <Link href={`/app/${activity.shareCode}`} className="block">
                <CoverPoster
                  variant="strip"
                  title={activity.title}
                  category={activity.category}
                  theme={activity.coverTheme}
                  coverImage={activity.coverImage}
                  deadline={activity.deadline}
                  status={activity.status}
                  shareCode={activity.shareCode}
                />
              </Link>

              <div className="flex flex-1 flex-col p-5">
                <p className="line-clamp-2 min-h-[40px] text-[13px] leading-5 text-muted">
                  {activity.description || "暂无描述。"}
                </p>

                <div className="mt-4 grid grid-cols-3 gap-2 border-y border-line py-3">
                  <div>
                    <p className="font-display text-xl leading-none">{activity.counts.participants}</p>
                    <p className="mt-1 flex items-center gap-1 text-[10px] text-muted">
                      <Users size={10} /> 参与者
                    </p>
                  </div>
                  <div>
                    <p className="font-display text-xl leading-none">{activity.counts.votes}</p>
                    <p className="mt-1 text-[10px] text-muted">票数</p>
                  </div>
                  <div>
                    <p className="font-display text-xl leading-none">{activity.counts.suggestions}</p>
                    <p className="mt-1 flex items-center gap-1 text-[10px] text-muted">
                      <MessageSquare size={10} /> 提议
                    </p>
                  </div>
                </div>

                <div className="mt-4 flex items-center gap-2">
                  <Link
                    href={`/app/${activity.shareCode}`}
                    className="btn btn-dark btn-sm flex-1"
                  >
                    控制台
                  </Link>
                  <Link
                    href={`/a/${activity.shareCode}/results`}
                    className="btn btn-ghost btn-sm flex-1"
                  >
                    结果
                  </Link>
                  <ShareButton
                    url={typeof window === "undefined" ? `/a/${activity.shareCode}` : `${window.location.origin}/a/${activity.shareCode}`}
                    title={activity.title}
                    label=""
                    compact
                    className="btn btn-ghost btn-sm px-2.5"
                  />
                  <Link
                    href={`/a/${activity.shareCode}`}
                    className="flex h-[34px] w-[34px] items-center justify-center border border-line-strong transition-colors hover:border-ink hover:bg-paper"
                    aria-label="打开参与者页面"
                  >
                    <ArrowUpRight size={14} />
                  </Link>
                </div>

                <p className="mt-3 text-[11px] text-muted">
                  更新于 {relativeTime(activity.updatedAt)}
                </p>
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}
