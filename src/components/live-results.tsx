"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  ArrowLeft,
  ArrowUpRight,
  Download,
  Loader2,
  Lock,
  MessageSquare,
  Radio,
  Settings2,
  Trophy,
  Unlock,
  Users,
} from "lucide-react";
import { ShareButton } from "./share-dialog";
import { TallyBoard } from "./tally-board";
import { CalendarLinks } from "./calendar-links";
import { DeadlineCountdown } from "./deadline-countdown";
import { AvatarStack, StatusPill } from "./ui";
import { deadlineState, formatDateTime, isPast, relativeTime, timeZoneLabel } from "@/lib/format";
import type { ActivityDetail, ActivitySnapshot } from "@/lib/types";

type Connection = "connecting" | "live" | "offline";

export function LiveResults({
  initialSnapshot,
  initialActivity,
  isOwner,
}: {
  initialSnapshot: ActivitySnapshot;
  initialActivity: ActivityDetail;
  isOwner: boolean;
}) {
  const [snapshot, setSnapshot] = useState(initialSnapshot);
  const [connection, setConnection] = useState<Connection>("connecting");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [, setTick] = useState(0);
  const [shareUrl] = useState(() =>
    typeof window === "undefined"
      ? `/a/${initialSnapshot.activity.shareCode}/results`
      : `${window.location.origin}/a/${initialSnapshot.activity.shareCode}/results`
  );

  const code = snapshot.activity.shareCode;

  useEffect(() => {
    const timer = setInterval(() => setTick((value) => value + 1), 30000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const source = new EventSource(`/api/activities/${code}/stream`);

    const onSnapshot = (event: MessageEvent) => {
      try {
        const next = JSON.parse(event.data) as ActivitySnapshot;
        setSnapshot(next);
        setConnection("live");
      } catch {
        // Ignore malformed frames; the next one will recover.
      }
    };

    source.addEventListener("snapshot", onSnapshot as EventListener);
    source.onopen = () => setConnection("live");
    source.onerror = () => setConnection("offline");

    return () => {
      source.removeEventListener("snapshot", onSnapshot as EventListener);
      source.close();
    };
  }, [code]);

  const deadlineExpired = isPast(snapshot.activity.deadline);
  const closed = snapshot.activity.status !== "open" || deadlineExpired;
  const state = deadlineState(snapshot.activity.deadline, snapshot.activity.status);

  const voters = snapshot.participants.length;
  const leading = useMemo(() => {
    const sorted = [...snapshot.options].sort((a, b) => b.votes - a.votes);
    return sorted[0] && sorted[0].votes > 0 ? sorted[0] : null;
  }, [snapshot.options]);

  const suggestions = useMemo(
    () =>
      [...snapshot.suggestions].sort(
        (a, b) => b.votes - a.votes || +new Date(b.createdAt) - +new Date(a.createdAt)
      ),
    [snapshot.suggestions]
  );

  async function toggleStatus() {
    setBusy(true);
    setError(null);
    const next = snapshot.activity.status === "open" ? "closed" : "open";
    try {
      const response = await fetch(`/api/activities/${code}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: next }),
      });
      const data = await response.json();
      if (!response.ok) {
        setError(data.error ?? "操作失败");
        return;
      }
      setSnapshot((current) => ({
        ...current,
        activity: { ...current.activity, status: next },
      }));
    } catch {
      setError("网络出了点问题，请重试");
    } finally {
      setBusy(false);
    }
  }

  const connectionLabel =
    connection === "live" ? "实时连接" : connection === "connecting" ? "正在连接" : "正在重连";

  return (
    <div className="min-h-screen bg-paper">
      <section className="relative overflow-hidden bg-ink text-paper">
        <div className="dotted-grid absolute inset-0 opacity-70" aria-hidden="true" />
        <div className="container-page relative py-7 md:py-10">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-paper/15 pb-4">
            <div className="flex flex-wrap items-center gap-3">
              <Link
                href={`/a/${code}`}
                className="flex items-center gap-1.5 text-[11px] text-white/60 transition-colors hover:text-white"
              >
                <ArrowLeft size={12} />
                返回决策页
              </Link>
            </div>

            <div className="flex items-center gap-3">
              <span
                className={`flex items-center gap-1.5 text-[11px] ${
                  connection === "live" ? "text-[#a9bcff]" : "text-white/45"
                }`}
              >
                <Radio size={11} />
                {connectionLabel}
              </span>
              <ShareButton
                url={shareUrl}
                title={`${snapshot.activity.title} · 实时结果`}
                label="分享结果"
                className="btn btn-sm border-white/25 bg-transparent text-white hover:border-white/50 hover:bg-white/10"
                compact
              />
            </div>
          </div>

          <div className="mt-7 grid gap-8 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-end">
            <div>
              <div className="mb-4 flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center gap-1.5 rounded-full border border-white/20 bg-white/[0.06] px-2.5 py-1 text-[10.5px] font-medium text-white/80">
                  {snapshot.activity.shareCode}
                </span>
                <span className="inline-flex items-center gap-1.5 rounded-full border border-white/20 bg-white/[0.06] px-2.5 py-1 text-[10.5px] text-white/70">
                  {closed ? "已结束" : "进行中"}
                </span>
                {snapshot.activity.deadline && (
                  <span className="inline-flex items-center gap-1.5 rounded-full border border-white/20 bg-white/[0.06] px-2.5 py-1 text-[10.5px] text-white/70">
                    {formatDateTime(snapshot.activity.deadline, snapshot.activity.timeZone)} 截止
                  </span>
                )}
                <span className="inline-flex items-center gap-1.5 rounded-full border border-white/20 bg-white/[0.06] px-2.5 py-1 text-[10.5px] text-white/70">
                  {timeZoneLabel(snapshot.activity.timeZone)}
                </span>
              </div>

              <h1 className="font-display text-[clamp(2.3rem,5.6vw,4.8rem)] leading-[0.96] tracking-[-0.035em]">
                {snapshot.activity.title}
              </h1>
              <p className="mt-4 max-w-[560px] text-[13px] leading-6 text-paper/55">
                {initialActivity.description || "实时投票结果。有新票时此页面会自动更新。"}
              </p>
              <p className="mt-4 flex flex-wrap items-center gap-2 text-[11px] text-paper/40">
                <span>发起人 {initialActivity.organizer.name}</span>
                <span>·</span>
                <span>{state.label}</span>
                {snapshot.activity.deadline && (
                  <>
                    <span>·</span>
                    <DeadlineCountdown
                      deadline={snapshot.activity.deadline}
                      status={snapshot.activity.status}
                    />
                  </>
                )}
                <span>·</span>
                <span>更新于 {relativeTime(snapshot.updatedAt)}</span>
              </p>
            </div>

            <div className="flex flex-wrap gap-x-8 gap-y-5 border-t border-paper/15 pt-6 lg:border-0 lg:pt-0">
              <BigStat value={snapshot.counts.votes} label="总票数" />
              <BigStat value={voters} label="参与人数" />
              <BigStat value={snapshot.counts.suggestions} label="提议" />
            </div>
          </div>

          {closed && (
            <div className="mt-7 flex flex-wrap items-center gap-2.5 rounded-lg border border-[#a9bcff]/30 bg-[#a9bcff]/10 px-3.5 py-2.5 text-[11px] text-[#a9bcff]">
              <Lock size={13} />
              投票已结束，以下为最终结果。
            </div>
          )}
        </div>
      </section>

      <div className="container-page grid gap-8 py-9 lg:grid-cols-[minmax(0,1fr)_320px] lg:items-start lg:py-12">
        <div>
          <div className="mb-5 flex flex-wrap items-end justify-between gap-3 border-b border-line pb-4">
            <div>
              <h2 className="font-display text-[30px] leading-tight">
                {leading ? (
                  <>
                    目前领先：<span className="serif-italic">{leading.label}</span>
                  </>
                ) : (
                  "暂无投票"
                )}
              </h2>
            </div>
            <div className="text-right">
              <p className="text-[11px] text-muted">
                {voters > 0 ? `${voters} 人已投，共 ${snapshot.counts.votes} 票` : "暂无投票"}
              </p>
            </div>
          </div>

          <TallyBoard
            options={snapshot.options}
            voters={voters}
            emptyHint="暂无投票。分享链接后，结果会实时显示在这里。"
          />

          <section className="mt-10 border-t border-line pt-8">
            <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
              <div>
                <h2 className="font-display text-[26px] leading-tight">提议排行</h2>
              </div>
              <Link
                href={`/a/${code}`}
                className="flex items-center gap-1.5 text-[12px] text-muted transition-colors hover:text-ink"
              >
                添加提议
                <ArrowUpRight size={13} />
              </Link>
            </div>

            {suggestions.length === 0 ? (
              <div className="rounded-xl border border-dashed border-line-strong bg-surface px-5 py-10 text-center">
                <MessageSquare size={18} className="mx-auto text-muted" />
                <p className="mt-2 text-lg font-semibold tracking-[-0.02em]">暂无提议</p>
                <p className="mt-1 text-[11px] text-muted">
                  可回到决策页添加时间或地点。
                </p>
              </div>
            ) : (
              <div className="overflow-hidden rounded-xl border border-line bg-surface shadow-[var(--shadow-soft)]">
                {suggestions.map((suggestion, index) => (
                  <div
                    key={suggestion.id}
                    className="flex items-start gap-4 border-b border-line px-4 py-3.5 last:border-b-0"
                  >
                    <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-md border border-line bg-paper text-[10px] text-muted">
                      {index + 1}
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="text-[13px] leading-5">{suggestion.content}</p>
                      <p className="mt-1.5 text-[11px] text-muted">
                        {suggestion.authorName} · {relativeTime(suggestion.createdAt)} ·{" "}
                        {suggestion.kind === "time"
                          ? "时间"
                          : suggestion.kind === "place"
                            ? "地点"
                            : "其他"}
                      </p>
                    </div>
                    <div className="flex shrink-0 items-center gap-1.5 rounded-lg border border-line bg-paper px-2 py-1.5">
                      <Trophy size={11} className={index === 0 ? "text-brand" : "text-muted"} />
                      <span className="text-[10px] tabular-nums">{suggestion.votes}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>

        <aside className="space-y-4 lg:sticky lg:top-[86px]">
          {isOwner && (
            <div className="rounded-xl border border-line bg-surface shadow-[var(--shadow-soft)]">
              <div className="flex items-center justify-between border-b border-line px-4 py-3">
                <p className="text-[12px] font-medium">组织者</p>
                <Settings2 size={12} className="text-muted" />
              </div>
              <div className="space-y-3 p-4">
                <p className="text-[11px] leading-5 text-muted">
                  你可以关闭投票、导出数据或进入控制台。
                </p>
                <button
                  type="button"
                  onClick={() => void toggleStatus()}
                  disabled={busy}
                  className="btn btn-dark btn-sm w-full"
                >
                  {busy ? (
                    <Loader2 size={12} className="animate-spin" />
                  ) : closed ? (
                    <Unlock size={12} />
                  ) : (
                    <Lock size={12} />
                  )}
                  {closed ? "重新开放投票" : "关闭投票"}
                </button>
                {error && <p className="text-[10px] text-coral">{error}</p>}
                <div className="grid grid-cols-2 gap-2">
                  <Link href={`/app/${code}`} className="btn btn-ghost btn-sm">
                    控制台
                  </Link>
                  <a href={`/api/activities/${code}/export`} className="btn btn-ghost btn-sm">
                    <Download size={12} />
                    导出
                  </a>
                </div>
                <p className="border-t border-line pt-3 text-[10px] text-muted">
                  已确认支付 {snapshot.counts.paid} / {voters} 人
                </p>
              </div>
            </div>
          )}

          <div className="rounded-xl border border-line bg-surface p-4 shadow-[var(--shadow-soft)]">
            <div className="flex items-center justify-between border-b border-line pb-3">
              <p className="text-[12px] font-medium">分享</p>
              <span className="live-dot" />
            </div>
            <p className="mt-3 text-[12px] leading-5 text-muted">
              参与者无需注册，打开链接即可投票。
            </p>
            <div className="mt-3 flex items-stretch overflow-hidden rounded-lg border border-line-strong bg-paper">
              <span className="flex flex-1 items-center select-all px-2.5 py-2 text-[11px] text-ink-2">
                /a/{code}
              </span>
              <ShareButton
                url={shareUrl}
                title={snapshot.activity.title}
                label="分享"
                className="flex shrink-0 items-center gap-1.5 border-l border-line px-3 text-xs text-brand transition-colors hover:bg-brand-soft"
                compact
              />
            </div>
            <Link
              href={`/a/${code}`}
              className="mt-3 flex items-center justify-between rounded-lg border border-line bg-paper px-3 py-2 text-[11px] transition-colors hover:border-line-strong"
            >
              打开参与页
              <ArrowUpRight size={12} />
            </Link>
          </div>

          {snapshot.options.some((option) => option.kind === "time" && option.startsAt) && (
            <div className="rounded-xl border border-line bg-surface p-4 shadow-[var(--shadow-soft)]">
              <div className="mb-3 flex items-center justify-between">
                <p className="text-[12px] font-medium">日程</p>
                <span className="text-[11px] text-muted">{timeZoneLabel(snapshot.activity.timeZone)}</span>
              </div>
              <CalendarLinks
                code={code}
                title={snapshot.activity.title}
                description={initialActivity.description}
                location={initialActivity.location?.address || initialActivity.location?.name}
                options={snapshot.options}
                compact
              />
            </div>
          )}

          <div className="rounded-xl border border-line bg-surface p-4 shadow-[var(--shadow-soft)]">
            <div className="mb-3 flex items-center justify-between">
              <p className="text-[12px] font-medium">已参与</p>
              <span className="text-[11px] text-muted">{voters}</span>
            </div>
            {voters === 0 ? (
              <p className="text-[11px] leading-5 text-muted">暂无参与者。分享链接后，名单会显示在这里。</p>
            ) : (
              <>
                <AvatarStack names={snapshot.participants.map((participant) => participant.name)} max={8} />
                <div className="mt-3 flex flex-wrap gap-1.5">
                  {snapshot.participants.slice(0, 10).map((participant) => (
                    <span
                      key={participant.id}
                      className="border border-line bg-paper px-2 py-0.5 text-[10px] text-ink-2"
                    >
                      {participant.name}
                    </span>
                  ))}
                  {voters > 10 && (
                    <span className="px-1 py-0.5 text-[10px] text-muted">
                      +{voters - 10}
                    </span>
                  )}
                </div>
              </>
            )}
          </div>

          <div className="rounded-xl border border-line bg-paper-deep/60 p-4">
            <div className="flex items-center gap-2">
              <Users size={12} className="text-muted" />
              <p className="text-[12px] font-medium">投票规则</p>
            </div>
            <p className="mt-2.5 text-[11px] leading-5 text-muted">
              参与者提交后才会看到票数，避免从众。新票通常在数秒内同步。
            </p>
          </div>
        </aside>
      </div>

      <section className="border-t border-line">
        <div className="container-page flex flex-col items-start justify-between gap-4 py-8 sm:flex-row sm:items-center">
          <div className="flex items-center gap-3">
            <span className="text-xl font-semibold tracking-[-0.03em]">Quorum</span>
            <StatusPill status={snapshot.activity.status} deadline={snapshot.activity.deadline} />
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Link href={`/a/${code}`} className="btn btn-ghost btn-sm">
              回到决策卡
              <ArrowUpRight size={12} />
            </Link>
            <Link href="/" className="btn btn-primary btn-sm">
              创建决策页
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}

function BigStat({ value, label }: { value: number; label: string }) {
  return (
    <div>
      <p className="font-display text-[clamp(2rem,3.4vw,3rem)] leading-none">{value}</p>
      <p className="mt-1.5 text-[11px] text-white/45">{label}</p>
    </div>
  );
}
