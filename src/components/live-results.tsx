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
import { AvatarStack, StatusPill } from "./ui";
import { deadlineState, formatDateTime, isPast, relativeTime } from "@/lib/format";
import { categoryLabel } from "@/lib/types";
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
                className="flex items-center gap-1.5 font-mono text-[10px] tracking-[0.12em] text-paper/55 transition-colors hover:text-acid"
              >
                <ArrowLeft size={12} />
                BACK TO CARD
              </Link>
              <span className="h-3 w-px bg-paper/20" />
              <span className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.2em]">
                <span className="live-dot" />
                Live tally
              </span>
              <span className="hidden font-mono text-[10px] tracking-wide text-paper/40 sm:inline">
                / {categoryLabel(initialActivity.category)}
              </span>
            </div>

            <div className="flex items-center gap-3">
              <span
                className={`flex items-center gap-1.5 font-mono text-[9px] uppercase tracking-[0.14em] ${
                  connection === "live" ? "text-acid" : "text-paper/45"
                }`}
              >
                <Radio size={11} />
                {connectionLabel}
              </span>
              <ShareButton
                url={shareUrl}
                title={`${snapshot.activity.title} · 实时结果`}
                label="分享结果"
                className="btn btn-sm border-paper/30 bg-transparent text-paper hover:border-acid hover:text-acid"
                compact
              />
            </div>
          </div>

          <div className="mt-7 grid gap-8 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-end">
            <div>
              <div className="mb-4 flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center gap-1.5 border border-paper/25 px-2 py-1 font-mono text-[9px] uppercase tracking-[0.14em] text-paper/70">
                  {snapshot.activity.shareCode}
                </span>
                <span className="inline-flex items-center gap-1.5 border border-paper/25 px-2 py-1 font-mono text-[9px] uppercase tracking-[0.14em] text-paper/70">
                  {closed ? "FINAL" : "OPEN"}
                </span>
                {snapshot.activity.deadline && (
                  <span className="inline-flex items-center gap-1.5 border border-paper/25 px-2 py-1 font-mono text-[9px] uppercase tracking-[0.14em] text-paper/70">
                    {formatDateTime(snapshot.activity.deadline)} 截止
                  </span>
                )}
              </div>

              <h1 className="font-display text-[clamp(2.3rem,5.6vw,4.8rem)] leading-[0.96] tracking-[-0.035em]">
                {snapshot.activity.title}
              </h1>
              <p className="mt-4 max-w-[560px] text-[13px] leading-6 text-paper/55">
                {initialActivity.description || "答案正在被投票写出来。这一页会实时更新。"}
              </p>
              <p className="mt-4 flex flex-wrap items-center gap-2 font-mono text-[10px] tracking-wide text-paper/40">
                <span>发起人 {initialActivity.organizer.name}</span>
                <span>·</span>
                <span>{state.label}</span>
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
            <div className="mt-7 flex flex-wrap items-center gap-2.5 border border-acid/40 bg-acid/10 px-3.5 py-2.5 text-[11px] text-acid">
              <Lock size={13} />
              这张决策卡已经结束投票，下面是最终结果。
            </div>
          )}
        </div>
      </section>

      <div className="container-page grid gap-8 py-9 lg:grid-cols-[minmax(0,1fr)_320px] lg:items-start lg:py-12">
        <div>
          <div className="mb-5 flex flex-wrap items-end justify-between gap-3 border-b border-line pb-4">
            <div>
              <p className="label mb-1.5">LIVE COUNT / 实时票数</p>
              <h2 className="font-display text-[30px] leading-tight">
                {leading ? (
                  <>
                    目前领先：<span className="serif-italic">{leading.label}</span>
                  </>
                ) : (
                  "等第一票出现"
                )}
              </h2>
            </div>
            <div className="text-right">
              <p className="font-mono text-[9px] uppercase tracking-[0.14em] text-muted">
                {closed ? "FINAL TALLY" : "UPDATES IN REAL TIME"}
              </p>
              <p className="mt-1 text-[11px] text-muted">
                {voters > 0 ? `${voters} 人已投，${snapshot.counts.votes} 张票` : "分享链接，让答案开始"}
              </p>
            </div>
          </div>

          <TallyBoard
            options={snapshot.options}
            voters={voters}
            emptyHint="这张卡还没有人投票。把链接发给朋友，他们会在这里实时出现。"
          />

          <section className="mt-10 border-t border-line pt-8">
            <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
              <div>
                <p className="label mb-1.5">PROPOSALS / 提议</p>
                <h2 className="font-display text-[26px] leading-tight">被附议最多的可能</h2>
              </div>
              <Link
                href={`/a/${code}`}
                className="flex items-center gap-1.5 text-[12px] text-muted transition-colors hover:text-ink"
              >
                去提议
                <ArrowUpRight size={13} />
              </Link>
            </div>

            {suggestions.length === 0 ? (
              <div className="border border-dashed border-line-strong bg-surface/60 px-5 py-10 text-center">
                <MessageSquare size={18} className="mx-auto text-muted" />
                <p className="mt-2 font-display text-xl">还没有提议</p>
                <p className="mt-1 text-[11px] text-muted">
                  有更好的时间或地点？回到决策卡写一条。
                </p>
              </div>
            ) : (
              <div className="border border-line bg-surface">
                {suggestions.map((suggestion, index) => (
                  <div
                    key={suggestion.id}
                    className="flex items-start gap-4 border-b border-line px-4 py-3.5 last:border-b-0"
                  >
                    <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center border border-line-strong bg-paper font-mono text-[9px]">
                      {index + 1}
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="text-[13px] leading-5">{suggestion.content}</p>
                      <p className="mt-1.5 font-mono text-[9px] tracking-wide text-muted">
                        {suggestion.authorName} · {relativeTime(suggestion.createdAt)} ·{" "}
                        {suggestion.kind === "time"
                          ? "时间"
                          : suggestion.kind === "place"
                            ? "地点"
                            : "其他"}
                      </p>
                    </div>
                    <div className="flex shrink-0 items-center gap-1.5 border border-line-strong bg-paper px-2 py-1.5">
                      <Trophy size={11} className={index === 0 ? "text-coral" : "text-muted"} />
                      <span className="font-mono text-[10px]">{suggestion.votes}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>

        <aside className="space-y-4 lg:sticky lg:top-[86px]">
          {isOwner && (
            <div className="border border-ink bg-surface shadow-[4px_4px_0_rgba(23,23,20,0.92)]">
              <div className="flex items-center justify-between border-b border-line px-4 py-3">
                <p className="label text-[9px]">ORGANIZER / 组织者</p>
                <Settings2 size={12} className="text-muted" />
              </div>
              <div className="space-y-3 p-4">
                <p className="text-[11px] leading-5 text-muted">
                  你是这张卡的发起人。可以随时关闭投票、导出数据或进入控制台。
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

          <div className="border border-line bg-surface p-4">
            <div className="flex items-center justify-between border-b border-line pb-3">
              <p className="label text-[9px]">SHARE / 邀请</p>
              <span className="live-dot" />
            </div>
            <p className="mt-3 text-[12px] leading-5 text-muted">
              扫码或打开链接，朋友不用注册就能投票。
            </p>
            <div className="mt-3 flex items-stretch border border-line-strong bg-paper">
              <span className="flex flex-1 items-center select-all px-2.5 py-2 font-mono text-[11px] text-ink-2">
                /a/{code}
              </span>
              <ShareButton
                url={shareUrl}
                title={snapshot.activity.title}
                label="分享"
                className="flex shrink-0 items-center gap-1.5 border-l border-line-strong px-3 text-xs transition-colors hover:bg-acid-soft"
                compact
              />
            </div>
            <Link
              href={`/a/${code}`}
              className="mt-3 flex items-center justify-between border border-line bg-paper px-3 py-2 text-[11px] transition-colors hover:border-ink"
            >
              打开参与页
              <ArrowUpRight size={12} />
            </Link>
          </div>

          <div className="border border-line bg-surface p-4">
            <div className="mb-3 flex items-center justify-between">
              <p className="label text-[9px]">WHO&apos;S IN</p>
              <span className="font-mono text-[9px] text-muted">{voters}</span>
            </div>
            {voters === 0 ? (
              <p className="text-[11px] leading-5 text-muted">还没有人参与。分享链接，等第一个名字出现。</p>
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
                    <span className="px-1 py-0.5 font-mono text-[9px] text-muted">
                      +{voters - 10}
                    </span>
                  )}
                </div>
              </>
            )}
          </div>

          <div className="border border-line bg-paper-deep/60 p-4">
            <div className="flex items-center gap-2">
              <Users size={12} className="text-muted" />
              <p className="label text-[9px]">HOW IT WORKS</p>
            </div>
            <p className="mt-2.5 text-[11px] leading-5 text-muted">
              每位参与者提交后才会看到票数，避免从众。每次投票都会在几秒内出现在这一页。
            </p>
          </div>
        </aside>
      </div>

      <section className="border-t border-line">
        <div className="container-page flex flex-col items-start justify-between gap-4 py-8 sm:flex-row sm:items-center">
          <div className="flex items-center gap-3">
            <span className="font-display text-2xl lowercase">quorum</span>
            <StatusPill status={snapshot.activity.status} deadline={snapshot.activity.deadline} />
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Link href={`/a/${code}`} className="btn btn-ghost btn-sm">
              回到决策卡
              <ArrowUpRight size={12} />
            </Link>
            <Link href="/" className="btn btn-primary btn-sm">
              我也想发起一个
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
      <p className="mt-1.5 font-mono text-[9px] uppercase tracking-[0.16em] text-paper/45">{label}</p>
    </div>
  );
}
