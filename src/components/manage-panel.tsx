"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  AlertCircle,
  ArrowUpRight,
  Check,
  CheckCircle2,
  Circle,
  Copy,
  Download,
  Loader2,
  Lock,
  MessageSquare,
  Plus,
  Radio,
  ThumbsDown,
  Trash2,
  Trophy,
  Unlock,
  Users,
  Wallet,
  X,
} from "lucide-react";
import { ShareButton } from "./share-dialog";
import { TallyBoard } from "./tally-board";
import { DeadlineCountdown } from "./deadline-countdown";
import { Avatar, StatusPill } from "./ui";
import { coverPalette } from "@/lib/cover";
import {
  formatDateTime,
  formatOptionTime,
  isPast,
  relativeTime,
  timeZoneLabel,
  toZonedInputValue,
  zonedInputToISO,
} from "@/lib/format";
import {
  categoryLabel,
  type ActivityDetail,
  type PublicOption,
  type PublicParticipant,
} from "@/lib/types";

type Tab = "overview" | "people" | "suggestions" | "settings";

const TABS: { value: Tab; label: string }[] = [
  { value: "overview", label: "概览" },
  { value: "people", label: "参与者" },
  { value: "suggestions", label: "提议" },
  { value: "settings", label: "设置" },
];

export function ManagePanel({
  initialActivity,
  created,
}: {
  initialActivity: ActivityDetail;
  created: boolean;
}) {
  const router = useRouter();
  const code = initialActivity.shareCode;

  const [activity, setActivity] = useState(initialActivity);
  const [tab, setTab] = useState<Tab>("overview");
  const [notice, setNotice] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState<string | null>(null);
  const [paidBusy, setPaidBusy] = useState<string | null>(null);
  const [weightBusy, setWeightBusy] = useState<string | null>(null);
  const [confirmRunoff, setConfirmRunoff] = useState(false);
  const [deadlineInput, setDeadlineInput] = useState(
    toZonedInputValue(initialActivity.deadline, initialActivity.timeZone)
  );
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [showCreated, setShowCreated] = useState(created);
  const [live, setLive] = useState(false);
  const [newOptionKind, setNewOptionKind] = useState<"time" | "place">("time");
  const [newOptionLabel, setNewOptionLabel] = useState("");
  const [newOptionNote, setNewOptionNote] = useState("");
  const [newOptionStart, setNewOptionStart] = useState("");
  const [newOptionEnd, setNewOptionEnd] = useState("");
  const [shareUrl] = useState(() =>
    typeof window === "undefined" ? `/a/${code}` : `${window.location.origin}/a/${code}`
  );
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!notice) return;
    const timer = setTimeout(() => setNotice(null), 3200);
    return () => clearTimeout(timer);
  }, [notice]);

  const refresh = useCallback(async () => {
    try {
      const response = await fetch(`/api/activities/${code}`, { cache: "no-store" });
      const data = await response.json();
      if (response.ok && data.ok) setActivity(data.activity as ActivityDetail);
    } catch {
      // Keep the current view when the network blips.
    }
  }, [code]);

  const refreshTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => {
    const source = new EventSource(`/api/activities/${code}/stream`);
    const onSnapshot = () => {
      if (refreshTimer.current) clearTimeout(refreshTimer.current);
      refreshTimer.current = setTimeout(() => void refresh(), 400);
    };
    source.addEventListener("snapshot", onSnapshot as EventListener);
    source.onopen = () => setLive(true);
    source.onerror = () => setLive(false);
    return () => {
      source.removeEventListener("snapshot", onSnapshot as EventListener);
      source.close();
      if (refreshTimer.current) clearTimeout(refreshTimer.current);
    };
  }, [code, refresh]);

  const palette = coverPalette(activity.coverTheme);
  const participants = activity.participants;
  const paidCount = participants.filter((participant) => participant.paid).length;
  const paidPercent = participants.length ? Math.round((paidCount / participants.length) * 100) : 0;

  const suggestions = useMemo(
    () =>
      [...activity.suggestions].sort(
        (a, b) => b.votes - a.votes || +new Date(b.createdAt) - +new Date(a.createdAt)
      ),
    [activity.suggestions]
  );

  const optionLabels = useMemo(() => {
    const map = new Map(activity.options.map((option) => [option.id, option.label]));
    return (optionIds: string[]) =>
      optionIds.map((id) => map.get(id)).filter(Boolean) as string[];
  }, [activity.options]);

  const tieGroups = useMemo(() => {
    const groups: { kind: "time" | "place"; options: PublicOption[] }[] = [];
    for (const kind of ["time", "place"] as const) {
      const items = activity.options.filter((option) => option.kind === kind);
      if (items.length < 2) continue;
      const max = Math.max(...items.map((option) => option.score));
      if (max <= 0) continue;
      const tied = items.filter((option) => option.score === max);
      if (tied.length >= 2) groups.push({ kind, options: tied });
    }
    return groups;
  }, [activity.options]);

  const tieBreakActive = Boolean(
    activity.tieBreak && (!activity.tieBreak.until || !isPast(activity.tieBreak.until))
  );

  async function patchActivity(body: Record<string, unknown>, key: string, message: string) {
    setBusy(key);
    setError(null);
    try {
      const response = await fetch(`/api/activities/${code}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await response.json();
      if (!response.ok) {
        setError(data.error ?? "操作失败");
        return false;
      }
      setActivity((current) => ({
        ...current,
        ...(body.status ? { status: body.status as "open" | "closed" } : {}),
        ...(body.deadline !== undefined
          ? { deadline: data.activity?.deadline ?? null }
          : {}),
        ...(body.allowSuggestions !== undefined
          ? { allowSuggestions: body.allowSuggestions as boolean }
          : {}),
      }));
      setNotice(message);
      return true;
    } catch {
      setError("网络出了点问题，请重试");
      return false;
    } finally {
      setBusy(null);
    }
  }

  async function toggleStatus() {
    const next = activity.status === "open" ? "closed" : "open";
    await patchActivity(
      { status: next },
      "status",
      next === "closed" ? "投票已关闭，结果将保持最终状态。" : "投票已重新开放。"
    );
  }

  async function toggleSuggestions() {
    await patchActivity(
      { allowSuggestions: !activity.allowSuggestions },
      "suggestions",
      activity.allowSuggestions ? "已停止接受新提议。" : "已重新开放提议。"
    );
  }

  async function saveDeadline() {
    if (!deadlineInput) {
      await patchActivity({ deadline: null }, "deadline", "已清除截止时间。");
      return;
    }
    const iso = zonedInputToISO(deadlineInput, activity.timeZone);
    if (!iso) {
      setError("截止时间格式不正确");
      return;
    }
    await patchActivity({ deadline: iso }, "deadline", "截止时间已更新。");
  }

  async function togglePaid(participant: PublicParticipant) {
    setPaidBusy(participant.id);
    setError(null);
    try {
      const response = await fetch(
        `/api/activities/${code}/participants/${participant.id}`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ paid: !participant.paid }),
        }
      );
      const data = await response.json();
      if (!response.ok) {
        setError(data.error ?? "操作失败");
        return;
      }
      setActivity((current) => ({
        ...current,
        participants: current.participants.map((item) =>
          item.id === participant.id
            ? { ...item, paid: data.paid, paidAt: data.paid ? new Date().toISOString() : null }
            : item
        ),
        counts: {
          ...current.counts,
          paid: current.counts.paid + (data.paid ? 1 : -1),
        },
      }));
      setNotice(data.paid ? `已把 ${participant.name} 标记为已支付。` : `已取消 ${participant.name} 的支付标记。`);
    } catch {
      setError("网络出了点问题，请重试");
    } finally {
      setPaidBusy(null);
    }
  }

  async function startRunoff() {
    setBusy("runoff");
    setError(null);
    try {
      const response = await fetch(`/api/activities/${code}/runoff`, { method: "POST" });
      const data = await response.json();
      if (!response.ok) {
        setError(data.error ?? "发起决胜轮失败");
        return;
      }
      setConfirmRunoff(false);
      const fallbackUntil = new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString();
      setActivity((current) => ({
        ...current,
        tieBreak: {
          optionIds: Array.isArray(data.tieBreak?.optionIds)
            ? (data.tieBreak.optionIds as string[])
            : tieGroups.flatMap((group) => group.options.map((option) => option.id)),
          until:
            typeof data.tieBreak?.until === "string" ? data.tieBreak.until : fallbackUntil,
        },
        ...(Array.isArray(data.options) ? { options: data.options } : {}),
        ...(typeof data.deadline === "string" ? { deadline: data.deadline } : {}),
      }));
      router.refresh();
      setNotice("决胜轮已开启：2 小时内只保留平票选项。");
    } catch {
      setError("网络出了点问题，请重试");
    } finally {
      setBusy(null);
    }
  }

  async function setWeight(participant: PublicParticipant, weight: number) {
    setWeightBusy(participant.id);
    setError(null);
    try {
      const response = await fetch(
        `/api/activities/${code}/participants/${participant.id}`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ weight }),
        }
      );
      const data = await response.json();
      if (!response.ok) {
        setError(data.error ?? "操作失败");
        return;
      }
      const nextWeight = typeof data.weight === "number" ? data.weight : weight;
      setActivity((current) => ({
        ...current,
        participants: current.participants.map((item) =>
          item.id === participant.id ? { ...item, weight: nextWeight } : item
        ),
      }));
      setNotice(`已把 ${participant.name} 的权重设为 ${nextWeight}。`);
    } catch {
      setError("网络出了点问题，请重试");
    } finally {
      setWeightBusy(null);
    }
  }

  async function duplicateActivity() {
    setBusy("duplicate");
    setError(null);
    try {
      const response = await fetch(`/api/activities/${code}/duplicate`, { method: "POST" });
      const data = await response.json();
      if (!response.ok) {
        setError(data.error ?? "复制失败");
        return;
      }
      router.push(`/app/${data.code}`);
      router.refresh();
    } catch {
      setError("网络出了点问题，请重试");
    } finally {
      setBusy(null);
    }
  }

  async function addOption() {
    setBusy("add-option");
    setError(null);

    const startsAt =
      newOptionKind === "time"
        ? zonedInputToISO(newOptionStart, activity.timeZone)
        : null;
    const endsAt =
      newOptionKind === "time" && newOptionEnd
        ? zonedInputToISO(newOptionEnd, activity.timeZone)
        : null;

    if (newOptionKind === "time" && !startsAt) {
      setError("请选择开始时间");
      setBusy(null);
      return;
    }
    if (newOptionKind === "place" && !newOptionLabel.trim()) {
      setError("请填写地点名称");
      setBusy(null);
      return;
    }

    const label =
      newOptionKind === "time"
        ? formatOptionTime(startsAt, endsAt, activity.timeZone)
        : newOptionLabel.trim();

    try {
      const response = await fetch(`/api/activities/${code}/options`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          kind: newOptionKind,
          label,
          note: newOptionNote.trim() || null,
          startsAt,
          endsAt,
          lat: null,
          lng: null,
        }),
      });
      const data = await response.json();
      if (!response.ok) {
        setError(data.error ?? "添加失败");
        return;
      }
      setNewOptionLabel("");
      setNewOptionNote("");
      setNewOptionStart("");
      setNewOptionEnd("");
      await refresh();
      setNotice("新选项已添加，参与者可立即看到。");
    } catch {
      setError("网络出了点问题，请重试");
    } finally {
      setBusy(null);
    }
  }

  async function removeActivity() {
    setBusy("delete");
    setError(null);
    try {
      const response = await fetch(`/api/activities/${code}`, { method: "DELETE" });
      const data = await response.json();
      if (!response.ok) {
        setError(data.error ?? "删除失败");
        return;
      }
      router.push("/app");
      router.refresh();
    } catch {
      setError("网络出了点问题，请重试");
    } finally {
      setBusy(null);
    }
  }

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(shareUrl);
    } catch {
      const input = document.createElement("textarea");
      input.value = shareUrl;
      document.body.appendChild(input);
      input.select();
      document.execCommand("copy");
      input.remove();
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  }

  return (
    <div className="min-h-screen bg-paper pb-20">
      <div className="border-b border-line bg-surface">
        <div className="container-page py-6 md:py-8">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2 text-[11px] text-muted">
              <Link href="/app" className="transition-colors hover:text-ink">
                工作台
              </Link>
              <span>/</span>
              <span className="font-mono text-ink">{code}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className={`live-dot ${live ? "" : "opacity-30"}`} />
              <span className="text-[11px] text-muted">
                {live ? "实时同步" : "连接已断开"}
              </span>
            </div>
          </div>

          <div className="mt-4 flex flex-col justify-between gap-6 lg:flex-row lg:items-end">
            <div className="flex min-w-0 items-start gap-4">
              <span
                className="mt-1 hidden h-[62px] w-1.5 shrink-0 sm:block"
                style={{ background: palette.background }}
                aria-hidden="true"
              />
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <StatusPill status={activity.status} deadline={activity.deadline} />
                  <span className="chip">{categoryLabel(activity.category)}</span>
                  <span className="chip">分享码 {code}</span>
                </div>
                <h1 className="mt-2.5 font-display text-[clamp(1.9rem,4.2vw,3.1rem)] leading-[1.02] tracking-[-0.03em]">
                  {activity.title}
                </h1>
                <p className="mt-2 flex flex-wrap items-center gap-x-2 gap-y-1 text-[11px] text-muted">
                  <span>创建于 {formatDateTime(activity.createdAt, activity.timeZone)}</span>
                  <span>·</span>
                  <span>更新于 {relativeTime(activity.updatedAt)}</span>
                  <span>·</span>
                  <span>{participants.length} 人参与</span>
                  <span>·</span>
                  <span>{timeZoneLabel(activity.timeZone)}</span>
                  {activity.deadline && (
                    <>
                      <span>·</span>
                      <DeadlineCountdown
                        deadline={activity.deadline}
                        status={activity.status}
                      />
                    </>
                  )}
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <ShareButton url={shareUrl} title={activity.title} label="分享链接" />
              <Link href={`/a/${code}`} className="btn btn-ghost btn-sm">
                参与者页
                <ArrowUpRight size={13} />
              </Link>
              <Link href={`/a/${code}/results`} className="btn btn-dark btn-sm">
                <Radio size={13} />
                实时结果
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="container-page">
        {showCreated && (
          <div className="ticker-in mt-6 border border-ink bg-acid p-4 md:p-5">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div className="flex items-start gap-3">
                <CheckCircle2 size={18} className="mt-0.5 shrink-0" />
                <div>
                  <p className="text-[13px] font-medium">决策页已发布。</p>
                  <p className="mt-0.5 text-[11px] text-ink/65">
                    分享链接或分享码 {code}，参与者无需注册即可投票。
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <ShareButton
                  url={shareUrl}
                  title={activity.title}
                  label="分享链接"
                  className="btn btn-sm border-ink bg-paper"
                />
                <Link href={`/a/${code}`} className="btn btn-sm border-ink bg-transparent">
                  打开参与页
                </Link>
                <button
                  type="button"
                  onClick={() => setShowCreated(false)}
                  className="flex h-8 w-8 items-center justify-center border border-ink/30 transition-colors hover:bg-ink hover:text-acid"
                  aria-label="关闭提示"
                >
                  <X size={14} />
                </button>
              </div>
            </div>
          </div>
        )}

        <div className="mt-6 grid grid-cols-2 gap-px overflow-hidden border border-line bg-line md:grid-cols-4">
          <Stat label="参与者" value={participants.length} />
          <Stat label="总票数" value={activity.counts.votes} />
          <Stat label="提议" value={activity.counts.suggestions} />
          <Stat label="已支付" value={paidCount} />
        </div>

        <div className="mt-8 flex items-end justify-between gap-4 border-b border-line">
          <div className="-mb-px flex min-w-0 overflow-x-auto">
            {TABS.map((item) => {
              const count =
                item.value === "people"
                  ? participants.length
                  : item.value === "suggestions"
                    ? suggestions.length
                    : null;
              return (
                <button
                  key={item.value}
                  type="button"
                  onClick={() => setTab(item.value)}
                  className={`flex shrink-0 items-center gap-2 border-b-2 px-4 py-3 text-[13px] transition-colors ${
                    tab === item.value
                      ? "border-ink text-ink"
                      : "border-transparent text-muted hover:text-ink"
                  }`}
                >
                  {item.label}
                  {count !== null && (
                    <span className="text-[11px] text-muted">{count}</span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        <div className="mt-6">
          {tab === "overview" && (
            <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_310px] lg:items-start">
              <section>
                <SectionHead
                  title="投票结果"
                  note="点击任意一行可以展开投票人。"
                />

                {tieGroups.length > 0 && (
                  <div className="mb-4 border border-ink bg-surface p-4 shadow-[3px_3px_0_rgba(23,23,20,0.9)]">
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div className="flex items-start gap-3">
                        <Trophy size={16} className="mt-0.5 shrink-0 text-coral" />
                        <div>
                          <p className="text-[13px] font-medium">出现平票</p>
                          <p className="mt-1 text-[11px] leading-5 text-muted">
                            {tieGroups
                              .map(
                                (group) =>
                                  `${group.kind === "time" ? "时间" : "地点"}：${group.options
                                    .map((option) => option.label)
                                    .join(" · ")}`
                              )
                              .join("；")}
                          </p>
                          <p className="mt-1 text-[10px] text-muted">2 小时，只保留平票选项。</p>
                        </div>
                      </div>
                      {tieBreakActive ? (
                        <span className="chip border-coral text-coral">决胜轮进行中</span>
                      ) : confirmRunoff ? (
                        <div className="flex flex-wrap items-center gap-2">
                          <button
                            type="button"
                            onClick={() => void startRunoff()}
                            disabled={busy === "runoff"}
                            className="btn btn-sm border-ink bg-coral"
                          >
                            {busy === "runoff" && (
                              <Loader2 size={12} className="animate-spin" />
                            )}
                            确认发起
                          </button>
                          <button
                            type="button"
                            onClick={() => setConfirmRunoff(false)}
                            className="btn btn-sm border-line-strong bg-transparent"
                          >
                            取消
                          </button>
                        </div>
                      ) : (
                        <button
                          type="button"
                          onClick={() => setConfirmRunoff(true)}
                          className="btn btn-dark btn-sm"
                        >
                          <Trophy size={12} />
                          发起决胜轮
                        </button>
                      )}
                    </div>
                  </div>
                )}

                <TallyBoard
                  options={activity.options}
                  voters={participants.length}
                  compact
                  emptyHint="暂无选项。"
                />
              </section>

              <aside className="space-y-4">
                <div className="border border-line bg-surface p-4">
                  <div className="flex items-center justify-between border-b border-line pb-2.5">
                    <p className="text-[12px] font-medium">最新参与</p>
                    <Users size={12} className="text-muted" />
                  </div>
                  {participants.length === 0 ? (
                    <p className="mt-3 text-[11px] leading-5 text-muted">
                      暂无参与者。
                    </p>
                  ) : (
                    <div className="mt-3 space-y-2.5">
                      {[...participants]
                        .reverse()
                        .slice(0, 6)
                        .map((participant) => (
                          <div key={participant.id} className="flex items-center gap-2.5">
                            <Avatar name={participant.name} size="xs" />
                            <div className="min-w-0 flex-1">
                              <p className="truncate text-[11px] font-medium">{participant.name}</p>
                              <p className="text-[10px] text-muted">
                                {relativeTime(participant.createdAt)}
                              </p>
                            </div>
                            {participant.paid && (
                              <CheckCircle2 size={12} className="shrink-0 text-coral" />
                            )}
                          </div>
                        ))}
                    </div>
                  )}
                </div>

                <div className="border border-ink bg-ink p-4 text-paper">
                  <div className="flex items-center justify-between">
                    <p className="text-[12px] font-medium text-paper/60">费用</p>
                    <Wallet size={12} className="text-paper/45" />
                  </div>
                  <p className="mt-3 font-display text-2xl leading-none">
                    {activity.fee ? `¥${activity.fee.amount} / 人` : "免费活动"}
                  </p>
                  <p className="mt-1.5 text-[10px] text-paper/45">
                    {activity.fee?.note ?? "没有设置人均费用"}
                  </p>
                  <div className="mt-3 h-1.5 bg-paper/15">
                    <div className="h-full bg-acid transition-all" style={{ width: `${paidPercent}%` }} />
                  </div>
                  <p className="mt-2 text-[10px] text-paper/55">
                    {paidCount} / {participants.length} 人已支付
                  </p>
                </div>

                <div className="border border-line bg-surface p-4">
                  <div className="flex items-center justify-between border-b border-line pb-2.5">
                    <p className="text-[12px] font-medium">自定义问题</p>
                    <span className="text-[10px] text-muted">{activity.fields.length}</span>
                  </div>
                  {activity.fields.length === 0 ? (
                    <p className="mt-3 text-[11px] leading-5 text-muted">
                      暂无自定义问题。
                    </p>
                  ) : (
                    <div className="mt-3 space-y-2">
                      {activity.fields.map((field) => {
                        const answered = participants.filter((participant) => {
                          const value = participant.answers?.[field.id];
                          return value !== undefined && value !== "" && (!Array.isArray(value) || value.length > 0);
                        }).length;
                        return (
                          <div key={field.id} className="flex items-start justify-between gap-3">
                            <p className="min-w-0 truncate text-[11px]">{field.label}</p>
                            <span className="shrink-0 text-[10px] text-muted">
                              {answered} 份
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </aside>
            </div>
          )}

          {tab === "people" && (
            <section>
              <SectionHead
                title="参与者"
                note="支付状态仅组织者可见。"
              />

              <div className="mb-5 border border-line bg-surface px-4 py-3.5">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <p className="text-[12px] font-medium">支付进度</p>
                  <p className="font-mono text-[10px] text-muted">
                    {paidCount} / {participants.length} 人 · {paidPercent}%
                  </p>
                </div>
                <div className="mt-2.5 h-2 bg-paper-deep">
                  <div
                    className="h-full bg-coral transition-all"
                    style={{ width: `${paidPercent}%` }}
                  />
                </div>
              </div>

              {participants.length === 0 ? (
                <div className="border border-dashed border-line-strong bg-surface/60 px-5 py-12 text-center">
                  <Users size={20} className="mx-auto text-muted" />
                  <p className="mt-2 font-display text-2xl">暂无参与者</p>
                  <p className="mt-1 text-[11px] text-muted">分享链接，朋友打开就能投票。</p>
                  <ShareButton
                    url={shareUrl}
                    title={activity.title}
                    label="分享链接"
                    className="btn btn-primary btn-sm mt-4"
                  />
                </div>
              ) : (
                <div className="space-y-3">
                  {participants.map((participant) => (
                    <ParticipantRow
                      key={participant.id}
                      participant={participant}
                      labels={optionLabels(participant.optionIds ?? [])}
                      vetoLabels={optionLabels(participant.vetoOptionIds ?? [])}
                      conditionOptionLabel={
                        participant.conditionOptionId
                          ? optionLabels([participant.conditionOptionId])[0] ?? null
                          : null
                      }
                      fields={activity.fields}
                      busy={paidBusy === participant.id}
                      weightBusy={weightBusy === participant.id}
                      onTogglePaid={() => void togglePaid(participant)}
                      onSetWeight={(weight) => void setWeight(participant, weight)}
                    />
                  ))}
                </div>
              )}
            </section>
          )}

          {tab === "suggestions" && (
            <section>
              <SectionHead
                title="提议排行"
                note="按附议数排序。可在「设置」中关闭提议。"
              />
              {suggestions.length === 0 ? (
                <div className="border border-dashed border-line-strong bg-surface/60 px-5 py-12 text-center">
                  <MessageSquare size={20} className="mx-auto text-muted" />
                  <p className="mt-2 font-display text-2xl">暂无提议</p>
                  <p className="mt-1 text-[11px] text-muted">
                    开放提议时，参与者可以在公开页补充时间或地点。
                  </p>
                </div>
              ) : (
                <div className="space-y-2.5">
                  {suggestions.map((suggestion, index) => (
                    <article
                      key={suggestion.id}
                      className={`flex gap-4 border p-4 ${
                        index === 0 ? "border-ink bg-surface" : "border-line bg-surface"
                      }`}
                    >
                      <span className="flex h-9 w-9 shrink-0 items-center justify-center border border-line-strong bg-paper font-display text-lg">
                        {index + 1}
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className="text-[13px] leading-5">{suggestion.content}</p>
                        <p className="mt-2 flex flex-wrap items-center gap-2 text-[11px] text-muted">
                          <span>{suggestion.authorName}</span>
                          <span>·</span>
                          <span>{relativeTime(suggestion.createdAt)}</span>
                          <span className="chip text-[10px]">
                            {suggestion.kind === "time"
                              ? "时间"
                              : suggestion.kind === "place"
                                ? "地点"
                                : "其他"}
                          </span>
                        </p>
                      </div>
                      <div className="shrink-0 text-right">
                        <p className="font-display text-2xl leading-none">{suggestion.votes}</p>
                        <p className="mt-1 text-[10px] text-muted">
                          附议
                        </p>
                      </div>
                    </article>
                  ))}
                </div>
              )}
            </section>
          )}

          {tab === "settings" && (
            <section>
              <SectionHead
                title="设置"
                note="关闭投票不会删除数据，结果会保留为最终状态。"
              />

              <div className="grid gap-5 lg:grid-cols-2">
                <SettingsCard title="投票与提议" hint="状态与截止时间">
                  <div className="flex items-center justify-between gap-4 border-b border-line py-3 first:pt-0">
                    <div>
                      <p className="text-[12px] font-medium">投票状态</p>
                      <p className="mt-0.5 text-[10px] text-muted">
                        {activity.status === "open" ? "当前接受新的投票。" : "当前已停止接受投票。"}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => void toggleStatus()}
                      disabled={busy === "status"}
                      className={`btn btn-sm ${activity.status === "open" ? "btn-ghost" : "btn-primary"}`}
                    >
                      {busy === "status" ? (
                        <Loader2 size={12} className="animate-spin" />
                      ) : activity.status === "open" ? (
                        <Lock size={12} />
                      ) : (
                        <Unlock size={12} />
                      )}
                      {activity.status === "open" ? "关闭" : "重新开放"}
                    </button>
                  </div>

                  <div className="flex items-center justify-between gap-4 border-b border-line py-3">
                    <div>
                      <p className="text-[12px] font-medium">允许新提议</p>
                      <p className="mt-0.5 text-[10px] text-muted">
                        关闭后，参与者仍可投票，但不能新增提议。
                      </p>
                    </div>
                    <Toggle
                      label="允许新提议"
                      checked={activity.allowSuggestions}
                      disabled={busy === "suggestions"}
                      onChange={() => void toggleSuggestions()}
                    />
                  </div>

                  <div className="pt-3">
                    <label htmlFor="deadline" className="field-label">
                      截止时间
                      <span className="ml-1.5 font-normal text-muted">
                        {timeZoneLabel(activity.timeZone)}
                      </span>
                    </label>
                    <div className="flex flex-col gap-2 sm:flex-row">
                      <input
                        id="deadline"
                        type="datetime-local"
                        value={deadlineInput}
                        onChange={(event) => setDeadlineInput(event.target.value)}
                        className="field flex-1 text-[12px]"
                      />
                      <button
                        type="button"
                        onClick={() => void saveDeadline()}
                        disabled={busy === "deadline"}
                        className="btn btn-dark btn-sm shrink-0"
                      >
                        {busy === "deadline" ? (
                          <Loader2 size={12} className="animate-spin" />
                        ) : (
                          <Check size={12} />
                        )}
                        保存
                      </button>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setDeadlineInput("");
                        void patchActivity({ deadline: null }, "deadline", "已清除截止时间。");
                      }}
                      className="mt-2 text-[11px] text-muted underline-offset-2 hover:text-ink hover:underline"
                    >
                      清除截止时间
                    </button>
                  </div>
                </SettingsCard>

                <SettingsCard title="分享与数据" hint="链接、二维码与导出">
                  <div className="flex items-stretch border border-line-strong bg-paper">
                    <span className="flex min-w-0 flex-1 items-center select-all truncate px-2.5 py-2 font-mono text-[10px] text-ink-2">
                      {shareUrl}
                    </span>
                    <button
                      type="button"
                      onClick={() => void copyLink()}
                      className="flex shrink-0 items-center gap-1.5 border-l border-line-strong px-3 text-[11px] transition-colors hover:bg-acid-soft"
                    >
                      {copied ? <Check size={12} /> : <Copy size={12} />}
                      {copied ? "已复制" : "复制"}
                    </button>
                  </div>

                  <div className="mt-3 grid grid-cols-2 gap-2">
                    <ShareButton
                      url={shareUrl}
                      title={activity.title}
                      label="二维码分享"
                      className="btn btn-ghost btn-sm"
                    />
                    <a href={`/api/activities/${code}/export`} className="btn btn-ghost btn-sm">
                      <Download size={12} />
                      导出 CSV
                    </a>
                    <Link href={`/a/${code}`} className="btn btn-ghost btn-sm">
                      参与者页
                      <ArrowUpRight size={12} />
                    </Link>
                    <Link href={`/a/${code}/results`} className="btn btn-ghost btn-sm">
                      实时结果
                      <ArrowUpRight size={12} />
                    </Link>
                    <button
                      type="button"
                      onClick={() => void duplicateActivity()}
                      disabled={busy === "duplicate"}
                      className="btn btn-ghost btn-sm"
                    >
                      {busy === "duplicate" ? (
                        <Loader2 size={12} className="animate-spin" />
                      ) : (
                        <Copy size={12} />
                      )}
                      复制为新的决策
                    </button>
                  </div>

                  <p className="mt-3 border-t border-line pt-3 text-[10px] leading-5 text-muted">
                    CSV 包含姓名、支付状态、时间与地点选择、自定义回答和附议内容。仅组织者可下载。复制会保留选项与问题，不包含参与者和投票。
                  </p>
                </SettingsCard>

                <SettingsCard title="追加选项" hint="发布后补充时间或地点">
                  <div className="flex border border-line-strong bg-paper p-0.5">
                    {(["time", "place"] as const).map((kind) => (
                      <button
                        key={kind}
                        type="button"
                        onClick={() => setNewOptionKind(kind)}
                        className={`flex-1 px-3 py-1.5 text-[11px] transition-colors ${
                          newOptionKind === kind
                            ? "bg-ink text-paper"
                            : "text-muted hover:text-ink"
                        }`}
                      >
                        {kind === "time" ? "时间" : "地点"}
                      </button>
                    ))}
                  </div>

                  <div className="mt-3 space-y-2.5">
                    {newOptionKind === "time" ? (
                      <>
                        <div>
                          <label className="field-label" htmlFor="option-start">
                            开始
                          </label>
                          <input
                            id="option-start"
                            type="datetime-local"
                            value={newOptionStart}
                            onChange={(event) => setNewOptionStart(event.target.value)}
                            className="field text-[12px]"
                          />
                        </div>
                        <div>
                          <label className="field-label" htmlFor="option-end">
                            结束
                          </label>
                          <input
                            id="option-end"
                            type="datetime-local"
                            value={newOptionEnd}
                            onChange={(event) => setNewOptionEnd(event.target.value)}
                            className="field text-[12px]"
                          />
                        </div>
                      </>
                    ) : (
                      <div>
                        <label className="field-label" htmlFor="option-label">
                          地点名称
                        </label>
                        <input
                          id="option-label"
                          value={newOptionLabel}
                          onChange={(event) => setNewOptionLabel(event.target.value)}
                          maxLength={80}
                          className="field text-[12px]"
                          placeholder="例如：梧桐小院"
                        />
                      </div>
                    )}

                    <div>
                      <label className="field-label" htmlFor="option-note">
                        备注
                      </label>
                      <input
                        id="option-note"
                        value={newOptionNote}
                        onChange={(event) => setNewOptionNote(event.target.value)}
                        maxLength={120}
                        className="field text-[12px]"
                        placeholder="可选"
                      />
                    </div>

                    <button
                      type="button"
                      onClick={() => void addOption()}
                      disabled={busy === "add-option"}
                      className="btn btn-dark btn-sm w-full"
                    >
                      {busy === "add-option" ? (
                        <Loader2 size={12} className="animate-spin" />
                      ) : (
                        <Plus size={12} />
                      )}
                      添加选项
                    </button>
                    <p className="text-[10px] leading-5 text-muted">
                      时间按 {timeZoneLabel(activity.timeZone)} 填写。新增选项会立即出现在公开页，并保留已有投票。
                    </p>
                  </div>
                </SettingsCard>

                <div className="border border-coral bg-coral-soft p-5 lg:col-span-2">
                  <div className="flex flex-wrap items-start justify-between gap-4">
                    <div className="flex items-start gap-3">
                      <Trash2 size={16} className="mt-0.5 shrink-0 text-coral" />
                      <div>
                        <p className="text-[13px] font-medium">删除这张决策卡</p>
                        <p className="mt-1 max-w-lg text-[11px] leading-5 text-ink/65">
                          所有投票、提议、参与者与支付记录都会一并删除，链接立即失效，无法恢复。
                        </p>
                      </div>
                    </div>
                    {!confirmDelete ? (
                      <button
                        type="button"
                        onClick={() => setConfirmDelete(true)}
                        className="btn btn-sm border-coral bg-transparent text-coral hover:bg-coral hover:text-surface"
                      >
                        删除
                      </button>
                    ) : (
                      <div className="flex flex-wrap items-center gap-2">
                        <button
                          type="button"
                          onClick={() => void removeActivity()}
                          disabled={busy === "delete"}
                          className="btn btn-sm border-ink bg-coral"
                        >
                          {busy === "delete" && <Loader2 size={12} className="animate-spin" />}
                          确认删除
                        </button>
                        <button
                          type="button"
                          onClick={() => setConfirmDelete(false)}
                          className="btn btn-sm border-line-strong bg-transparent"
                        >
                          取消
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </section>
          )}
        </div>
      </div>

      {(notice || error) && (
        <div className="fixed bottom-5 left-1/2 z-[95] w-[calc(100%-2rem)] max-w-sm -translate-x-1/2">
          <div
            className={`ticker-in flex items-start gap-2 border px-3.5 py-2.5 text-[11px] shadow-[3px_3px_0_rgba(23,23,20,0.9)] ${
              error ? "border-coral bg-coral-soft" : "border-ink bg-acid"
            }`}
          >
            {error ? (
              <AlertCircle size={14} className="mt-0.5 shrink-0 text-coral" />
            ) : (
              <CheckCircle2 size={14} className="mt-0.5 shrink-0" />
            )}
            <p className="flex-1">{error ?? notice}</p>
            <button
              type="button"
              onClick={() => {
                setError(null);
                setNotice(null);
              }}
              aria-label="关闭提示"
            >
              <X size={13} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function ParticipantRow({
  participant,
  labels,
  vetoLabels,
  conditionOptionLabel,
  fields,
  busy,
  weightBusy,
  onTogglePaid,
  onSetWeight,
}: {
  participant: PublicParticipant;
  labels: string[];
  vetoLabels: string[];
  conditionOptionLabel: string | null;
  fields: ActivityDetail["fields"];
  busy: boolean;
  weightBusy: boolean;
  onTogglePaid: () => void;
  onSetWeight: (weight: number) => void;
}) {
  const answerMap = participant.answers ?? {};
  const answers = fields
    .map((field) => {
      const value = answerMap[field.id];
      if (value === undefined || value === "" || (Array.isArray(value) && value.length === 0)) {
        return null;
      }
      return {
        label: field.label,
        value: Array.isArray(value) ? value.join("、") : value,
      };
    })
    .filter((entry): entry is { label: string; value: string } => Boolean(entry));

  return (
    <div className="border border-line bg-surface">
      <div className="flex flex-wrap items-center gap-3 border-b border-line px-4 py-3">
        <Avatar name={participant.name} size="sm" />
        <div className="min-w-0 flex-1">
          <p className="truncate text-[13px] font-medium">{participant.name}</p>
          <p className="text-[10px] text-muted">
            {relativeTime(participant.createdAt)}参与
          </p>
        </div>
        <label className="flex items-center gap-1.5 text-[10px] text-muted">
          权重
          <select
            value={participant.weight ?? 1}
            onChange={(event) => onSetWeight(Number(event.target.value))}
            disabled={busy || weightBusy}
            aria-label={`${participant.name} 的权重`}
            className="field h-7 w-14 px-1.5 py-0 text-[11px]"
          >
            {[1, 2, 3, 4, 5].map((value) => (
              <option key={value} value={value}>
                {value}
              </option>
            ))}
          </select>
          {weightBusy && <Loader2 size={11} className="animate-spin" />}
        </label>
        <button
          type="button"
          onClick={onTogglePaid}
          disabled={busy}
          className={`btn btn-sm ${participant.paid ? "border-ink bg-acid" : "btn-ghost"}`}
        >
          {busy ? (
            <Loader2 size={12} className="animate-spin" />
          ) : participant.paid ? (
            <CheckCircle2 size={12} />
          ) : (
            <Circle size={12} />
          )}
          {participant.paid ? "已支付" : "标记已付"}
        </button>
      </div>

      {(participant.condition || conditionOptionLabel) && (
        <div className="flex flex-wrap items-center gap-2 border-b border-line bg-paper/60 px-4 py-2 text-[10px]">
          <span className="text-muted">参加条件</span>
          {participant.condition && <span>{participant.condition}</span>}
          {conditionOptionLabel && (
            <span className="border border-line-strong bg-surface px-1.5 py-0.5">
              {conditionOptionLabel}
            </span>
          )}
        </div>
      )}

      <div className="grid gap-4 px-4 py-3 md:grid-cols-3">
        <div>
          <p className="mb-1.5 text-[11px] text-muted">选择的选项</p>
          <div className="flex flex-wrap gap-1.5">
            {labels.length === 0 ? (
              <span className="text-[10px] text-muted">未选择</span>
            ) : (
              labels.map((label) => (
                <span key={label} className="border border-line-strong bg-paper px-2 py-0.5 text-[10px]">
                  {label}
                </span>
              ))
            )}
          </div>
        </div>
        <div>
          <p className="mb-1.5 flex items-center gap-1 text-[11px] text-muted">
            <ThumbsDown size={10} /> 否决
          </p>
          <div className="flex flex-wrap gap-1.5">
            {vetoLabels.length === 0 ? (
              <span className="text-[10px] text-muted">无</span>
            ) : (
              vetoLabels.map((label) => (
                <span
                  key={label}
                  className="border border-coral bg-coral-soft px-2 py-0.5 text-[10px] text-coral"
                >
                  {label}
                </span>
              ))
            )}
          </div>
        </div>
        <div>
          <p className="mb-1.5 text-[11px] text-muted">自定义回答</p>
          {answers.length === 0 ? (
            <span className="text-[10px] text-muted">没有填写</span>
          ) : (
            <dl className="space-y-1">
              {answers.map((entry) => (
                <div key={entry.label} className="flex gap-2 text-[10px] leading-4">
                  <dt className="shrink-0 text-muted">{entry.label}</dt>
                  <dd className="min-w-0 break-words">{entry.value}</dd>
                </div>
              ))}
            </dl>
          )}
        </div>
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="bg-surface p-4 md:p-5">
      <p className="font-display text-[32px] leading-none">{value}</p>
      <p className="mt-2 text-[11px] text-muted">{label}</p>
    </div>
  );
}

function SectionHead({ title, note }: { title: string; note: string }) {
  return (
    <div className="mb-5 flex flex-wrap items-end justify-between gap-3 border-b border-line pb-4">
      <h2 className="font-display text-[26px] leading-tight">{title}</h2>
      <p className="max-w-[300px] text-[11px] leading-5 text-muted">{note}</p>
    </div>
  );
}

function SettingsCard({
  title,
  hint,
  children,
}: {
  title: string;
  hint: string;
  children: React.ReactNode;
}) {
  return (
    <div className="border border-line bg-surface p-5">
      <div className="mb-3 flex items-center justify-between border-b border-line pb-3">
        <p className="text-[13px] font-medium">{title}</p>
        <p className="text-[11px] text-muted">{hint}</p>
      </div>
      {children}
    </div>
  );
}

function Toggle({
  checked,
  onChange,
  disabled,
  label,
}: {
  checked: boolean;
  onChange: () => void;
  disabled?: boolean;
  label: string;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      onClick={onChange}
      disabled={disabled}
      className={`relative h-[26px] w-[46px] shrink-0 border transition-colors ${
        checked ? "border-ink bg-ink" : "border-line-strong bg-paper-deep"
      } ${disabled ? "opacity-50" : ""}`}
    >
      <span
        className={`absolute top-[3px] h-4 w-4 transition-all ${
          checked ? "left-[25px] bg-acid" : "left-[3px] bg-surface"
        }`}
      />
    </button>
  );
}
