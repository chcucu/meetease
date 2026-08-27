"use client";

import { useState, useEffect, use } from "react";
import Link from "next/link";
import MacWindow from "@/components/MacWindow";

type ResultItem = {
  id: string;
  label?: string;
  name?: string;
  address?: string;
  content?: string;
  authorName?: string;
  type?: string;
  _count: { votes: number };
};

type ResultsData = {
  timeOptions: ResultItem[];
  locationOptions: ResultItem[];
  suggestions: ResultItem[];
  participantCount: number;
  feeAmount: number | null;
  feeDescription: string | null;
  paidCount: number;
  unpaidCount: number;
  totalParticipants: number;
  participants: { id: string; name: string; paid: boolean; paidAt: string | null }[];
};

export default function ResultsPage({ params }: { params: Promise<{ code: string }> }) {
  const { code } = use(params);
  const [data, setData] = useState<ResultsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let eventSource: EventSource | null = null;

    const connect = () => {
      eventSource = new EventSource(`/api/activities/${code}/stream`);
      eventSource.onmessage = (event) => {
        try {
          const parsed = JSON.parse(event.data);
          setData({
            timeOptions: parsed.timeOptions || [],
            locationOptions: parsed.locationOptions || [],
            suggestions: parsed.suggestions || [],
            participantCount: parsed.participantCount || 0,
            feeAmount: parsed.feeAmount || null,
            feeDescription: parsed.feeDescription || null,
            paidCount: parsed.paidCount || 0,
            unpaidCount: parsed.unpaidCount || 0,
            totalParticipants: parsed.totalParticipants || 0,
            participants: parsed.participants || [],
          });
          setLoading(false);
        } catch {
          // ignore
        }
      };
      eventSource.onerror = () => {
        eventSource?.close();
        setTimeout(connect, 3000);
      };
    };

    connect();
    return () => eventSource?.close();
  }, [code]);

  const getMaxVotes = (items: ResultItem[]) => Math.max(...items.map((i) => i._count.votes), 1);
  const getPercentage = (votes: number, max: number) => Math.round((votes / max) * 100);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-[3px] border-meet-400 border-t-transparent rounded-full animate-spin" />
          <p className="text-sm text-meet-600 font-medium">正在加载实时结果</p>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <MacWindow title="出错了" className="max-w-md w-full">
          <div className="p-8 text-center">
            <div className="w-16 h-16 bg-meet-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-meet-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h2 className="font-display text-2xl text-meet-800 mb-2">结果加载失败</h2>
            <p className="text-meet-600/70 mb-6">{error || "无法加载结果"}</p>
            <Link href="/" className="btn-sky text-white font-semibold px-6 py-2.5 rounded-xl inline-block">
              返回首页
            </Link>
          </div>
        </MacWindow>
      </div>
    );
  }

  const allItems = [
    ...data.timeOptions.map((t) => ({ ...t, _type: "time" as const, _label: t.label || "" })),
    ...data.locationOptions.map((l) => ({ ...l, _type: "location" as const, _label: l.name || "" })),
  ];
  const maxVotes = getMaxVotes(allItems);
  const bestVotes = Math.max(...allItems.map((i) => i._count.votes), 0);
  const bestItems = allItems.filter((i) => i._count.votes === bestVotes && bestVotes > 0);

  return (
    <div className="min-h-screen relative">
      <div className="fixed inset-0 bg-gradient-to-b from-meet-50 via-white to-white -z-10" aria-hidden="true" />

      <div className="max-w-3xl mx-auto px-4 py-8">
        {/* 头部 */}
        <div className="flex items-center justify-between mb-6 anim-fade-up">
          <h1 className="font-display text-3xl text-meet-800">实时结果</h1>
          <div className="bg-white/70 backdrop-blur-sm rounded-full px-4 py-2 flex items-center gap-2 border border-meet-100">
            <span className="w-2.5 h-2.5 rounded-full bg-green-400 animate-pulse" />
            <span className="text-sm font-medium text-meet-700">直播中</span>
          </div>
        </div>

        {/* 统计 */}
        <div className="bg-white rounded-3xl p-6 mb-6 border border-meet-100 anim-fade-up" style={{ animationDelay: "0.1s" }}>
          <div className="flex items-center gap-4">
            <div className="flex-1 text-center">
              <div className="text-4xl font-bold text-meet-600">{data.participantCount}</div>
              <div className="text-sm text-meet-500/70 mt-1">参与人数</div>
            </div>
            <div className="w-px h-12 bg-meet-100" aria-hidden="true" />
            <div className="flex-1 text-center">
              <div className="text-4xl font-bold text-meet-500">{allItems.length}</div>
              <div className="text-sm text-meet-500/70 mt-1">投票选项</div>
            </div>
            <div className="w-px h-12 bg-meet-100" aria-hidden="true" />
            <div className="flex-1 text-center">
              <div className="text-4xl font-bold text-meet-600">{data.suggestions.length}</div>
              <div className="text-sm text-meet-500/70 mt-1">提议</div>
            </div>
          </div>
        </div>

        {/* 最优选项 */}
        {bestItems.length > 0 && (
          <div className="bg-white rounded-3xl p-6 mb-6 border border-meet-100 anim-pop" style={{ animationDelay: "0.15s" }}>
            <div className="flex items-center gap-2 mb-3">
              <svg className="w-5 h-5 text-meet-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
              </svg>
              <h2 className="font-display text-xl text-meet-800">当前最优{bestItems.length > 1 ? "选项" : ""}</h2>
            </div>
            <div className="flex flex-wrap gap-3">
              {bestItems.map((item) => (
                <div key={item.id} className="flex items-center gap-2 bg-gradient-to-r from-meet-50 to-white border border-meet-200 rounded-2xl px-4 py-3">
                  <div>
                    <div className="font-semibold text-meet-700">{item._label}</div>
                    <div className="text-xs text-meet-500">{item._count.votes} 票</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 费用追踪 */}
        {data.feeAmount && (
          <div className="bg-white rounded-3xl p-6 mb-6 border border-amber-100 anim-fade-up" style={{ animationDelay: "0.18s" }}>
            <div className="flex items-center gap-2 mb-3">
              <svg className="w-5 h-5 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <h2 className="font-display text-xl text-amber-800">费用追踪</h2>
            </div>
            <div className="flex items-baseline gap-2 mb-3">
              <span className="text-2xl font-bold text-amber-600">{data.feeAmount.toFixed(2)}</span>
              <span className="text-amber-500">元/人</span>
              {data.feeDescription && <span className="text-sm text-amber-500/70">- {data.feeDescription}</span>}
            </div>
            <div className="flex gap-4 mb-4">
              <div className="flex-1 bg-amber-50 rounded-xl p-3 text-center">
                <div className="text-lg font-bold text-green-600">{data.paidCount}</div>
                <div className="text-xs text-amber-600/70">已缴费</div>
              </div>
              <div className="flex-1 bg-amber-50 rounded-xl p-3 text-center">
                <div className="text-lg font-bold text-amber-600">{data.unpaidCount}</div>
                <div className="text-xs text-amber-600/70">未缴费</div>
              </div>
              <div className="flex-1 bg-amber-50 rounded-xl p-3 text-center">
                <div className="text-lg font-bold text-amber-800">
                  {(data.paidCount * data.feeAmount).toFixed(0)}
                </div>
                <div className="text-xs text-amber-600/70">已收金额</div>
              </div>
            </div>
            {data.participants.length > 0 && (
              <div className="space-y-1.5">
                {data.participants.map((p) => (
                  <div key={p.id} className="flex items-center justify-between px-3 py-2 bg-white/70 rounded-xl border border-amber-50">
                    <span className="text-sm text-meet-800">{p.name}</span>
                    <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                      p.paid
                        ? "bg-green-100 text-green-700"
                        : "bg-amber-50 text-amber-600"
                    }`}>
                      {p.paid ? "已缴费" : "未缴费"}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* 时间结果 */}
        {data.timeOptions.length > 0 && (
          <MacWindow title="时间选项投票" className="mb-6 anim-fade-up" style={{ animationDelay: "0.2s" }}>
            <div className="p-6 sm:p-8">
              <div className="space-y-4">
                {data.timeOptions.map((opt) => {
                  const pct = getPercentage(opt._count.votes, maxVotes);
                  const isBest = bestVotes > 0 && opt._count.votes === bestVotes;
                  return (
                    <div key={opt.id} className="vote-bar-enter">
                      <div className="flex items-center justify-between mb-1.5">
                        <span className={`text-sm font-medium ${isBest ? "text-meet-600" : "text-meet-800"}`}>
                          {opt.label}
                          {isBest && <span className="ml-1.5 text-meet-400">*</span>}
                        </span>
                        <span className="text-sm text-meet-500 font-medium">{opt._count.votes} 票</span>
                      </div>
                      <div className="w-full h-4 bg-meet-100/70 rounded-full overflow-hidden">
                        <div
                          className={`vote-bar h-full rounded-full transition-all duration-700 ${
                            isBest
                              ? "bg-gradient-to-r from-meet-300 to-meet-500 shadow-md shadow-meet-200/50"
                              : "bg-gradient-to-r from-meet-400 to-meet-500 shadow-md shadow-meet-200/40"
                          }`}
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </MacWindow>
        )}

        {/* 地点结果 */}
        {data.locationOptions.length > 0 && (
          <MacWindow title="地点选项投票" className="mb-6 anim-fade-up" style={{ animationDelay: "0.25s" }}>
            <div className="p-6 sm:p-8">
              <div className="space-y-4">
                {data.locationOptions.map((opt) => {
                  const pct = getPercentage(opt._count.votes, maxVotes);
                  const isBest = bestVotes > 0 && opt._count.votes === bestVotes;
                  return (
                    <div key={opt.id} className="vote-bar-enter">
                      <div className="flex items-center justify-between mb-1.5">
                        <div>
                          <span className={`text-sm font-medium ${isBest ? "text-meet-600" : "text-meet-800"}`}>
                            {opt.name}
                            {isBest && <span className="ml-1.5 text-meet-400">*</span>}
                          </span>
                          {opt.address && <span className="ml-2 text-xs text-meet-400/70">{opt.address}</span>}
                        </div>
                        <span className="text-sm text-meet-500 font-medium">{opt._count.votes} 票</span>
                      </div>
                      <div className="w-full h-4 bg-meet-100/70 rounded-full overflow-hidden">
                        <div
                          className={`vote-bar h-full rounded-full transition-all duration-700 ${
                            isBest
                              ? "bg-gradient-to-r from-meet-300 to-meet-500 shadow-md shadow-meet-200/50"
                              : "bg-gradient-to-r from-meet-400 to-meet-500 shadow-md shadow-meet-200/40"
                          }`}
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </MacWindow>
        )}

        {/* 提议 */}
        {data.suggestions.length > 0 && (
          <MacWindow title="大家的提议" className="mb-6 anim-fade-up" style={{ animationDelay: "0.3s" }}>
            <div className="p-6 sm:p-8">
              <div className="space-y-3">
                {data.suggestions.map((s) => (
                  <div key={s.id} className="p-4 bg-white/70 rounded-2xl border border-meet-100">
                    <p className="text-sm text-meet-800 mb-1">{s.content}</p>
                    <div className="flex items-center gap-3 text-xs text-meet-500">
                      <span>by {s.authorName}</span>
                      <span className="bg-meet-50 px-2 py-0.5 rounded-full">
                        {s.type === "time" ? "时间" : s.type === "location" ? "地点" : "其他"}
                      </span>
                      <span>{s._count.votes} 票</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </MacWindow>
        )}

        {/* 操作 */}
        <div className="flex gap-3 anim-fade-up" style={{ animationDelay: "0.35s" }}>
          <Link href={`/event/${code}`} className="flex-1 btn-sun text-white font-semibold py-3 rounded-2xl text-sm text-center">
            去投票
          </Link>
          <Link href="/" className="flex-1 bg-white/70 backdrop-blur-sm text-meet-700 font-semibold py-3 rounded-2xl text-sm text-center hover:bg-white transition border border-meet-100">
            创建活动
          </Link>
        </div>
      </div>
    </div>
  );
}