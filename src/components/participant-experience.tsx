"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  AlertCircle,
  ArrowUp,
  Check,
  ChevronRight,
  Clock3,
  ExternalLink,
  Loader2,
  Lock,
  MapPin,
  MessageSquare,
  Pencil,
  Users,
  Wallet,
} from "lucide-react";
import { CoverPoster } from "./cover-poster";
import { ShareButton } from "./share-dialog";
import { CalendarLinks } from "./calendar-links";
import { DeadlineCountdown } from "./deadline-countdown";
import { SuccessOverlay } from "./success-overlay";
import { Turnstile } from "./turnstile";
import { Avatar, AvatarStack, StatusPill } from "./ui";
import { deadlineState, formatDateTime, isPast, relativeTime, timeZoneLabel } from "@/lib/format";
import type { ActivityDetail, ActivitySnapshot, PublicField, PublicOption } from "@/lib/types";

const TURNSTILE_SITE_KEY = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;

function getClientKey(code: string) {
  const storageKey = `quorum:participant:${code}`;
  let key = localStorage.getItem(storageKey);
  if (!key) {
    key =
      typeof crypto !== "undefined" && "randomUUID" in crypto
        ? crypto.randomUUID()
        : `k-${Math.random().toString(36).slice(2)}${Date.now().toString(36)}`;
    localStorage.setItem(storageKey, key);
  }
  return key;
}

function isEmpty(value: string | string[] | undefined) {
  if (value === undefined) return true;
  if (Array.isArray(value)) return value.length === 0;
  return !value.trim();
}

export function ParticipantExperience({
  initialActivity,
  isOwner,
}: {
  initialActivity: ActivityDetail;
  isOwner: boolean;
}) {
  const [activity, setActivity] = useState(initialActivity);
  const [clientKey] = useState<string | null>(() =>
    typeof window === "undefined" ? null : getClientKey(initialActivity.shareCode)
  );
  const [you, setYou] = useState(initialActivity.you);
  const [name, setName] = useState(initialActivity.you?.name ?? "");
  const [selected, setSelected] = useState<string[]>(initialActivity.you?.optionIds ?? []);
  const [answers, setAnswers] = useState<Record<string, string | string[]>>(
    initialActivity.you?.answers ?? {}
  );
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [justSubmitted, setJustSubmitted] = useState(false);
  const [restoring, setRestoring] = useState(true);
  const [suggestionText, setSuggestionText] = useState("");
  const [suggestionKind, setSuggestionKind] = useState<"time" | "place" | "other">("other");
  const [suggestionSending, setSuggestionSending] = useState(false);
  const [turnstileToken, setTurnstileToken] = useState("");
  const [turnstileReset, setTurnstileReset] = useState(0);
  const [suggestionToken, setSuggestionToken] = useState("");
  const [suggestionReset, setSuggestionReset] = useState(0);
  const [shareUrl] = useState(() =>
    typeof window === "undefined"
      ? `/a/${initialActivity.shareCode}`
      : `${window.location.origin}/a/${initialActivity.shareCode}`
  );

  useEffect(() => {
    if (!clientKey) return;

    let active = true;
    fetch(`/api/activities/${initialActivity.shareCode}?key=${encodeURIComponent(clientKey)}`, {
      cache: "no-store",
    })
      .then((response) => response.json())
      .then((data) => {
        if (!active || !data.ok) return;
        setActivity(data.activity);
        if (data.activity.you) {
          setYou(data.activity.you);
          setName(data.activity.you.name);
          setSelected(data.activity.you.optionIds);
          setAnswers(data.activity.you.answers);
        }
      })
      .catch(() => {})
      .finally(() => {
        if (active) setRestoring(false);
      });

    return () => {
      active = false;
    };
  }, [clientKey, initialActivity.shareCode]);

  useEffect(() => {
    if (!notice) return;
    const timer = setTimeout(() => setNotice(null), 3500);
    return () => clearTimeout(timer);
  }, [notice]);

  const timeOptions = useMemo(
    () => activity.options.filter((option) => option.kind === "time"),
    [activity.options]
  );
  const placeOptions = useMemo(
    () => activity.options.filter((option) => option.kind === "place"),
    [activity.options]
  );
  const hasResponded = Boolean(you);
  const deadlineExpired = isPast(activity.deadline);
  const locked = activity.status !== "open" || deadlineExpired;
  const showCounts = hasResponded || locked;
  const state = deadlineState(activity.deadline, activity.status);

  const suggestions = useMemo(
    () =>
      [...activity.suggestions].sort(
        (a, b) => b.votes - a.votes || +new Date(b.createdAt) - +new Date(a.createdAt)
      ),
    [activity.suggestions]
  );

  function toggleOption(option: PublicOption) {
    if (locked) return;
    setError(null);
    setSelected((current) => {
      if (current.includes(option.id)) return current.filter((id) => id !== option.id);
      if (activity.voteType === "single") {
        const sameKind = new Set(
          activity.options.filter((item) => item.kind === option.kind).map((item) => item.id)
        );
        return [...current.filter((id) => !sameKind.has(id)), option.id];
      }
      return [...current, option.id];
    });
  }

  function setAnswer(fieldId: string, value: string | string[]) {
    setError(null);
    setAnswers((current) => ({ ...current, [fieldId]: value }));
  }

  function validate() {
    if (!name.trim()) return "请先填写你的称呼。";
    if (activity.options.length > 0 && selected.length === 0) {
      return "至少选择一个时间或地点。";
    }
    for (const field of activity.fields) {
      const value = answers[field.id];
      if (field.required && isEmpty(value)) return `请填写「${field.label}」。`;
      if (field.type === "number" && value && !Array.isArray(value) && Number.isNaN(Number(value))) {
        return `「${field.label}」需要填写数字。`;
      }
    }
    return null;
  }

  async function submit() {
    const message = validate();
    if (message) {
      setError(message);
      return;
    }
    if (!clientKey) return;

    setSubmitting(true);
    setError(null);
    try {
      const response = await fetch(`/api/activities/${activity.shareCode}/respond`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          clientKey,
          name: name.trim(),
          optionIds: selected,
          answers,
          turnstileToken: turnstileToken || undefined,
        }),
      });
      const data = await response.json();
      if (!response.ok) {
        setError(data.error ?? "提交失败，请重试");
        if (response.status === 403) {
          setTurnstileToken("");
          setTurnstileReset((value) => value + 1);
        }
        return;
      }

      setYou(data.participant);
      setAnswers(data.participant.answers);
      const snapshot = data.snapshot as ActivitySnapshot;
      setActivity((current) => ({
        ...current,
        options: snapshot.options,
        suggestions: snapshot.suggestions,
        participants: snapshot.participants,
        counts: snapshot.counts,
        status: snapshot.activity.status,
        deadline: snapshot.activity.deadline,
      }));
      setJustSubmitted(true);
      setNotice(null);
      setTurnstileToken("");
      setTurnstileReset((value) => value + 1);
    } catch {
      setError("网络出了点问题，请重试");
    } finally {
      setSubmitting(false);
    }
  }

  async function addSuggestion() {
    if (!suggestionText.trim()) {
      setNotice("请输入内容后再提交。");
      return;
    }
    setSuggestionSending(true);
    try {
      const response = await fetch(`/api/activities/${activity.shareCode}/suggestions`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          content: suggestionText.trim(),
          authorName: name.trim() || you?.name || "匿名",
          kind: suggestionKind,
          clientKey: clientKey ?? undefined,
          turnstileToken: suggestionToken || undefined,
        }),
      });
      const data = await response.json();
      setSuggestionToken("");
      setSuggestionReset((value) => value + 1);
      if (!response.ok) {
        setNotice(data.error ?? "提交失败");
        return;
      }
      setActivity((current) => ({
        ...current,
        suggestions: [data.suggestion, ...current.suggestions],
        counts: { ...current.counts, suggestions: current.counts.suggestions + 1 },
      }));
      setSuggestionText("");
      setNotice("提议已发布。");
    } catch {
      setNotice("网络出了点问题，请重试");
    } finally {
      setSuggestionSending(false);
    }
  }

  async function toggleSuggestion(id: string) {
    if (!hasResponded || !clientKey) {
      setNotice("先提交你的选择，即可附议他人的提议。");
      return;
    }
    if (locked) return;

    const before = activity.suggestions;
    setActivity((current) => ({
      ...current,
      suggestions: current.suggestions.map((suggestion) =>
        suggestion.id === id
          ? {
              ...suggestion,
              upvoted: !suggestion.upvoted,
              votes: suggestion.votes + (suggestion.upvoted ? -1 : 1),
            }
          : suggestion
      ),
    }));

    try {
      const response = await fetch(
        `/api/activities/${activity.shareCode}/suggestions/${id}/vote`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ clientKey }),
        }
      );
      const data = await response.json();
      if (!response.ok) {
        setActivity((current) => ({ ...current, suggestions: before }));
        setNotice(data.error ?? "操作失败");
        return;
      }
      setActivity((current) => ({
        ...current,
        suggestions: current.suggestions.map((suggestion) =>
          suggestion.id === id
            ? { ...suggestion, upvoted: data.upvoted, votes: data.votes }
            : suggestion
        ),
      }));
    } catch {
      setActivity((current) => ({ ...current, suggestions: before }));
      setNotice("网络出了点问题");
    }
  }

  function selectedNames() {
    return selected
      .map((id) => activity.options.find((option) => option.id === id)?.label)
      .filter(Boolean) as string[];
  }

  return (
    <div className="container-page pb-16 pt-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-[12px] text-muted">
          <Link href="/" className="hover:text-ink">
            Quorum
          </Link>
          <ChevronRight size={12} />
          <span className="font-medium text-ink-2">{activity.shareCode}</span>
        </div>
        <div className="flex items-center gap-2">
          <StatusPill status={activity.status} deadline={activity.deadline} />
          <ShareButton
            url={shareUrl}
            title={activity.title}
            className="btn btn-ghost btn-sm"
            compact
          />
          {isOwner && (
            <Link href={`/app/${activity.shareCode}`} className="btn btn-ghost btn-sm">
              控制台
              <ChevronRight size={13} />
            </Link>
          )}
        </div>
      </div>

      <div className="mt-4">
        <CoverPoster
          variant="hero"
          title={activity.title}
          category={activity.category}
          theme={activity.coverTheme}
          coverImage={activity.coverImage}
          deadline={activity.deadline}
          timeZone={activity.timeZone}
          organizer={activity.organizer.name}
          fee={activity.fee?.amount ?? null}
          shareCode={activity.shareCode}
          status={activity.status}
        />
      </div>

      <div className="mt-4 grid gap-px overflow-hidden rounded-xl border border-line bg-line sm:grid-cols-2 lg:grid-cols-4">
        <MetaCell
          icon={<Clock3 size={14} />}
          label="截止"
          value={
            activity.deadline
              ? formatDateTime(activity.deadline, activity.timeZone)
              : "未设置"
          }
          note={
            activity.deadline ? (
              <span className="flex flex-wrap items-center gap-1">
                <span>{timeZoneLabel(activity.timeZone)}</span>
                <span>·</span>
                <DeadlineCountdown
                  deadline={activity.deadline}
                  status={activity.status}
                />
              </span>
            ) : (
              state.label
            )
          }
        />
        <MetaCell
          icon={<Users size={14} />}
          label="已参与"
          value={`${activity.counts.participants} 人`}
          note={activity.voteType === "single" ? "每类单选" : "可以多选"}
        />
        <MetaCell
          icon={<Wallet size={14} />}
          label="人均费用"
          value={activity.fee ? `¥${activity.fee.amount}` : "免费"}
          note={activity.fee?.note ?? "无需支付"}
        />
        <MetaCell
          icon={<MapPin size={14} />}
          label="集合点"
          value={activity.location?.name || activity.location?.address || "待定"}
          note={activity.location?.address ?? "见地点选项"}
        />
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px] lg:items-start">
        <div>
          {locked ? (
            <LockedPanel
              activity={activity}
              you={you}
              selectedNames={selectedNames()}
              totalVotes={activity.counts.votes}
            />
          ) : (
            <div className="rounded-xl border border-line bg-surface shadow-[var(--shadow-soft)]">
              <div className="flex flex-wrap items-start justify-between gap-3 border-b border-line px-5 py-5 md:px-6">
                <div>
                  <h2 className="font-display text-2xl leading-tight">
                    {hasResponded ? "修改你的选择" : "提交你的选择"}
                  </h2>
                  <p className="mt-1.5 text-[12px] text-muted">
                    {hasResponded
                      ? "截止前可随时更新，提交后立即生效。"
                      : "无需注册。填写姓名并选择时间与地点后提交。"}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-display text-3xl leading-none">{activity.counts.participants}</p>
                  <p className="mt-1 text-[11px] text-muted">人已参与</p>
                </div>
              </div>

              <div className="px-5 py-5 md:px-6">
                {hasResponded && (
                  <div className="mb-5 flex items-center justify-between gap-3 rounded-lg border border-line bg-paper px-3.5 py-2.5">
                    <p className="flex items-center gap-2 text-[11px] text-muted">
                      <Pencil size={12} />
                      你已参与，当前选择「{selectedNames().join(" · ") || "未选择"}」
                    </p>
                    <span className="text-[11px] text-muted">可修改</span>
                  </div>
                )}

                {notice && (
                  <div className="ticker-in mb-4 rounded-lg border border-line bg-brand-soft px-3 py-2 text-[11px] text-ink-2">
                    {notice}
                  </div>
                )}

                {restoring && !hasResponded && (
                  <p className="mb-4 text-[11px] text-muted">正在读取你之前的参与记录…</p>
                )}

                <div className="mb-6">
                  <label htmlFor="participant-name" className="field-label">
                    你的称呼 <span className="text-coral">*</span>
                  </label>
                  <input
                    id="participant-name"
                    value={name}
                    onChange={(event) => {
                      setName(event.target.value);
                      setError(null);
                    }}
                    maxLength={30}
                    className="field max-w-[280px]"
                    placeholder="朋友怎么称呼你"
                  />
                </div>

                {timeOptions.length > 0 && (
                  <>
                    <OptionGroup
                      title="时间"
                      hint={activity.voteType === "single" ? "选一个时间" : "可以选择多个时间"}
                      footnote={`时间均为 ${timeZoneLabel(activity.timeZone)}`}
                      options={timeOptions}
                      selected={selected}
                      showCounts={showCounts}
                      totalVotes={activity.counts.participants}
                      onToggle={toggleOption}
                    />
                    <div className="mt-3">
                      <p className="mb-2 text-[11px] text-muted">加入日历</p>
                      <CalendarLinks
                        code={activity.shareCode}
                        title={activity.title}
                        description={activity.description}
                        location={activity.location?.address || activity.location?.name}
                        options={timeOptions}
                        compact
                      />
                    </div>
                  </>
                )}

                {placeOptions.length > 0 && (
                  <OptionGroup
                    title="地点"
                    hint={activity.voteType === "single" ? "选一个地点" : "可以选择多个地点"}
                    options={placeOptions}
                    selected={selected}
                    showCounts={showCounts}
                    totalVotes={activity.counts.participants}
                    onToggle={toggleOption}
                  />
                )}

                {activity.fields.length > 0 && (
                  <div className="mt-7 border-t border-line pt-6">
                    <div className="mb-4">
                      <h3 className="font-display text-xl">补充信息</h3>
                    </div>
                    <div className="space-y-4">
                      {activity.fields.map((field) => (
                        <FieldInput
                          key={field.id}
                          field={field}
                          value={answers[field.id]}
                          onChange={(value) => setAnswer(field.id, value)}
                        />
                      ))}
                    </div>
                  </div>
                )}

                {error && (
                  <div
                    role="alert"
                    className="mt-5 flex items-start gap-2 border border-coral bg-coral-soft px-3 py-2.5 text-[12px]"
                  >
                    <AlertCircle size={14} className="mt-0.5 shrink-0 text-coral" />
                    {error}
                  </div>
                )}

                <div className="mt-6 border-t border-line pt-5">
                  {TURNSTILE_SITE_KEY && (
                    <div className="mb-3">
                      <p className="mb-2 text-[11px] text-muted">人机验证</p>
                      <Turnstile
                        onVerify={setTurnstileToken}
                        resetSignal={turnstileReset}
                        className="min-h-[65px]"
                      />
                    </div>
                  )}
                  <button
                    type="button"
                    onClick={() => void submit()}
                    disabled={submitting}
                    className="btn btn-primary w-full py-3"
                  >
                    {submitting ? <Loader2 size={15} className="animate-spin" /> : <Check size={15} />}
                    {submitting ? "正在提交…" : hasResponded ? "更新我的选择" : "提交我的选择"}
                  </button>
                  <p className="mt-2 text-center text-[10px] text-muted">
                    {hasResponded
                      ? "截止前可随时更新，票数会实时同步。"
                      : "提交后显示实时票数；截止前可随时修改。"}
                  </p>
                </div>
              </div>
            </div>
          )}

          {activity.allowSuggestions && (
            <section className="mt-8 border-t border-line pt-8">
              <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
                <div>
                  <h2 className="font-display text-[28px] leading-tight">其他提议</h2>
                  <p className="mt-1.5 text-[12px] text-muted">
                    添加一个时间或地点，或附议你认同的提议。
                  </p>
                </div>
                <span className="chip">{activity.counts.suggestions} 条提议</span>
              </div>

              <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_300px] lg:items-start">
                <div className="space-y-2.5">
                  {suggestions.length === 0 ? (
                    <div className="rounded-xl border border-dashed border-line-strong bg-surface px-5 py-10 text-center">
                      <MessageSquare size={20} className="mx-auto text-muted" />
                      <p className="mt-2 text-lg font-semibold tracking-[-0.02em]">暂无提议</p>
                      <p className="mt-1 text-[11px] text-muted">你可以添加一个时间或地点。</p>
                    </div>
                  ) : (
                    suggestions.map((suggestion) => (
                      <article
                        key={suggestion.id}
                        className={`flex gap-3 rounded-xl border p-3.5 transition-colors ${
                          suggestion.upvoted
                            ? "border-brand/40 bg-brand-soft/50"
                            : "border-line bg-surface"
                        }`}
                      >
                        <button
                          type="button"
                          onClick={() => void toggleSuggestion(suggestion.id)}
                          disabled={locked}
                          aria-pressed={suggestion.upvoted}
                          className={`flex h-12 w-11 shrink-0 flex-col items-center justify-center rounded-lg border transition-colors ${
                            suggestion.upvoted
                              ? "border-brand bg-brand text-white"
                              : "border-line-strong bg-paper hover:border-brand/50"
                          } ${locked ? "cursor-not-allowed opacity-50" : ""}`}
                          title={hasResponded ? "附议这条提议" : "提交选择后可附议"}
                        >
                          <ArrowUp size={13} />
                          <span className="text-[10px] tabular-nums">{suggestion.votes}</span>
                        </button>
                        <div className="min-w-0 flex-1">
                          <p className="text-[13px] leading-5">{suggestion.content}</p>
                          <div className="mt-2 flex flex-wrap items-center gap-2 text-[11px] text-muted">
                            <span>{suggestion.authorName}</span>
                            <span>·</span>
                            <span>{relativeTime(suggestion.createdAt)}</span>
                            <span className="chip ml-auto text-[10px]">
                              {suggestion.kind === "time"
                                ? "时间"
                                : suggestion.kind === "place"
                                  ? "地点"
                                  : "其他"}
                            </span>
                          </div>
                        </div>
                      </article>
                    ))
                  )}
                </div>

                <div className="rounded-xl border border-line bg-surface p-4 shadow-[var(--shadow-soft)]">
                  {locked ? (
                    <div className="text-[12px] text-muted">
                      <p className="flex items-center gap-1.5 font-medium text-ink">
                        <Lock size={13} /> 提议已关闭
                      </p>
                      <p className="mt-1.5 leading-5">投票已经结束，这条决策卡不再接受新的提议。</p>
                    </div>
                  ) : (
                    <>
                      <p className="mb-2 text-[12px] text-muted">添加提议</p>
                      <textarea
                        value={suggestionText}
                        onChange={(event) => setSuggestionText(event.target.value)}
                        maxLength={300}
                        className="field min-h-[84px] text-[12px]"
                        placeholder="例如：周五 19:00，或更近的地点。"
                      />
                      {TURNSTILE_SITE_KEY && (
                        <div className="mt-2">
                          <Turnstile
                            onVerify={setSuggestionToken}
                            resetSignal={suggestionReset}
                            className="min-h-[65px]"
                          />
                        </div>
                      )}
                      <div className="mt-2 flex gap-2">
                        <select
                          value={suggestionKind}
                          onChange={(event) =>
                            setSuggestionKind(event.target.value as "time" | "place" | "other")
                          }
                          className="field h-9 flex-1 py-0 text-[11px]"
                          aria-label="提议类型"
                        >
                          <option value="other">其他</option>
                          <option value="time">时间</option>
                          <option value="place">地点</option>
                        </select>
                        <button
                          type="button"
                          onClick={() => void addSuggestion()}
                          disabled={suggestionSending}
                          className="btn btn-dark btn-sm h-9"
                        >
                          {suggestionSending ? (
                            <Loader2 size={12} className="animate-spin" />
                          ) : (
                            <MessageSquare size={12} />
                          )}
                          发布
                        </button>
                      </div>
                      <p className="mt-2 text-[10px] leading-5 text-muted">
                        提交选择后即可附议他人的提议。
                      </p>
                    </>
                  )}
                </div>
              </div>
            </section>
          )}
        </div>

        <aside className="space-y-4 lg:sticky lg:top-[88px]">
          <div className="rounded-xl border border-line bg-surface p-5 shadow-[var(--shadow-soft)]">
            <div className="flex items-center justify-between border-b border-line pb-3">
              <p className="text-[12px] font-medium">决策信息</p>
            </div>
            <dl className="mt-3 space-y-3 text-[11px]">
              <div className="flex items-start justify-between gap-3">
                <dt className="flex items-center gap-1.5 text-muted">
                  <Clock3 size={11} /> 截止时间
                </dt>
                <dd className="text-right">
                  {activity.deadline
                    ? formatDateTime(activity.deadline, activity.timeZone)
                    : "未设置"}
                </dd>
              </div>
              <div className="flex items-start justify-between gap-3">
                <dt className="flex items-center gap-1.5 text-muted">
                  <Clock3 size={11} /> 时区
                </dt>
                <dd>{timeZoneLabel(activity.timeZone)}</dd>
              </div>
              <div className="flex items-start justify-between gap-3">
                <dt className="flex items-center gap-1.5 text-muted">
                  <Users size={11} /> 参与者
                </dt>
                <dd>{activity.counts.participants} 人</dd>
              </div>
              <div className="flex items-start justify-between gap-3">
                <dt className="flex items-center gap-1.5 text-muted">
                  <Wallet size={11} /> 费用
                </dt>
                <dd className="max-w-[60%] text-right">
                  {activity.fee ? `¥${activity.fee.amount} / 人` : "免费"}
                </dd>
              </div>
              <div className="flex items-start justify-between gap-3">
                <dt className="flex items-center gap-1.5 text-muted">
                  <MapPin size={11} /> 集合点
                </dt>
                <dd className="max-w-[60%] text-right">
                  {activity.location?.name || activity.location?.address || "待定"}
                </dd>
              </div>
            </dl>

            {activity.location && (activity.location.lat && activity.location.lng ? (
              <a
                href={`https://www.openstreetmap.org/?mlat=${activity.location.lat}&mlon=${activity.location.lng}#map=15/${activity.location.lat}/${activity.location.lng}`}
                target="_blank"
                rel="noreferrer"
                className="mt-4 flex items-center gap-1.5 rounded-lg border border-line bg-paper px-3 py-2 text-[11px] transition-colors hover:border-line-strong"
              >
                <MapPin size={12} />
                在地图中打开
                <ExternalLink size={10} className="ml-auto text-muted" />
              </a>
            ) : (
              <a
                href={`https://www.openstreetmap.org/search?query=${encodeURIComponent(
                  activity.location.address || activity.location.name || ""
                )}`}
                target="_blank"
                rel="noreferrer"
                className="mt-4 flex items-center gap-1.5 rounded-lg border border-line bg-paper px-3 py-2 text-[11px] transition-colors hover:border-line-strong"
              >
                <MapPin size={12} />
                搜索这个地点
                <ExternalLink size={10} className="ml-auto text-muted" />
              </a>
            ))}
          </div>

          <div className="rounded-xl border border-line bg-surface p-5 shadow-[var(--shadow-soft)]">
            <p className="mb-3 text-[12px] font-medium">发起人</p>
            <div className="flex items-center gap-3">
              <Avatar name={activity.organizer.name} size="md" />
              <div>
                <p className="text-[13px] font-medium">{activity.organizer.name}</p>
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-brand/20 bg-gradient-to-br from-brand-soft to-surface p-5">
            <div className="flex items-center justify-between">
              <p className="text-[12px] font-medium text-brand">实时结果</p>
              <span className="live-dot" />
            </div>
            <p className="mt-3 text-xl font-semibold leading-tight tracking-[-0.02em]">
              结果持续更新。
            </p>
            <p className="mt-1.5 text-[11px] leading-5 text-muted">
              每一票都会实时进入结果页。
            </p>
            <Link
              href={`/a/${activity.shareCode}/results`}
              className="mt-4 flex items-center justify-between rounded-lg border border-brand/20 bg-surface px-3 py-2 text-[11px] text-brand transition-colors hover:border-brand/40"
            >
              查看实时结果
              <ChevronRight size={12} />
            </Link>
          </div>

          {activity.participants.length > 0 && (
            <div className="rounded-xl border border-line bg-surface p-5 shadow-[var(--shadow-soft)]">
              <div className="mb-3 flex items-center justify-between">
                <p className="text-[12px] font-medium">已参与</p>
                <span className="text-[11px] text-muted">{activity.counts.participants}</span>
              </div>
              <AvatarStack names={activity.participants.map((participant) => participant.name)} max={7} />
              <p className="mt-3 text-[10px] leading-5 text-muted">
                名单仅在结果页与控制台显示。
              </p>
            </div>
          )}
        </aside>
      </div>

      <SuccessOverlay
        open={justSubmitted}
        onClose={() => setJustSubmitted(false)}
        description="你的选择已记录，结果页会实时更新。截止前可随时修改。"
      />
    </div>
  );
}

function MetaCell({
  icon,
  label,
  value,
  note,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  note: React.ReactNode;
}) {
  return (
    <div className="bg-surface px-4 py-3.5">
      <p className="flex items-center gap-1.5 text-[11px] text-muted">
        {icon}
        {label}
      </p>
      <p className="mt-1.5 truncate text-[12px] font-medium">{value}</p>
      <p className="mt-0.5 truncate text-[10px] text-muted">{note}</p>
    </div>
  );
}

function OptionGroup({
  title,
  hint,
  footnote,
  options,
  selected,
  showCounts,
  totalVotes,
  onToggle,
}: {
  title: string;
  hint: string;
  footnote?: string;
  options: PublicOption[];
  selected: string[];
  showCounts: boolean;
  totalVotes: number;
  onToggle: (option: PublicOption) => void;
}) {
  return (
    <section className="mt-6">
      <div className="mb-2.5 flex items-center justify-between">
        <p className="field-label mb-0">{title}</p>
        <p className="text-[11px] text-muted">{hint}</p>
      </div>
      {footnote && <p className="mb-2 text-[10px] text-muted">{footnote}</p>}
      <div className="space-y-2">
        {options.map((option) => {
          const isSelected = selected.includes(option.id);
          const percentage =
            totalVotes > 0 ? Math.round((option.votes / totalVotes) * 100) : 0;
          return (
            <button
              key={option.id}
              type="button"
              onClick={() => onToggle(option)}
              aria-pressed={isSelected}
              className={`relative w-full overflow-hidden rounded-lg border px-3.5 py-3 text-left transition-all duration-200 ${
                isSelected
                  ? "border-brand/45 bg-brand-soft/60"
                  : "border-line bg-surface hover:border-line-strong hover:bg-paper/60"
              }`}
            >
              <div className="relative flex items-center justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  <span
                    className={`flex h-4 w-4 shrink-0 items-center justify-center rounded-full border ${
                      isSelected ? "border-brand bg-brand text-white" : "border-line-strong bg-surface"
                    }`}
                  >
                    {isSelected && <Check size={10} strokeWidth={3} />}
                  </span>
                  <span>
                    <span className="block text-[13px] font-medium">{option.label}</span>
                    {option.note && (
                      <span className="mt-0.5 block text-[10px] text-muted">{option.note}</span>
                    )}
                  </span>
                </div>
                {showCounts && (
                  <div className="shrink-0 text-right">
                    <p className="font-display text-lg leading-none">{option.votes}</p>
                    <p className="text-[10px] text-muted">{percentage}%</p>
                  </div>
                )}
              </div>
              {showCounts && (
                <div className="absolute inset-x-0 bottom-0 h-[3px] bg-line/50">
                  <div
                    className={`vote-bar h-full ${isSelected ? "bg-brand" : "bg-brand/25"}`}
                    style={{ width: `${percentage}%` }}
                  />
                </div>
              )}
            </button>
          );
        })}
      </div>
    </section>
  );
}

function FieldInput({
  field,
  value,
  onChange,
}: {
  field: PublicField;
  value: string | string[] | undefined;
  onChange: (value: string | string[]) => void;
}) {
  const stringValue = Array.isArray(value) ? "" : (value ?? "");
  const inputId = `field-${field.id}`;

  return (
    <div>
      <label
        id={field.type === "multi" ? `${inputId}-label` : undefined}
        htmlFor={field.type === "multi" ? undefined : inputId}
        className="field-label"
      >
        {field.label} {field.required && <span className="text-coral">*</span>}
      </label>
      {field.type === "textarea" && (
        <textarea
          id={inputId}
          value={stringValue}
          onChange={(event) => onChange(event.target.value)}
          className="field min-h-[84px]"
          placeholder={field.placeholder ?? ""}
          maxLength={500}
        />
      )}
      {field.type === "text" && (
        <input
          id={inputId}
          value={stringValue}
          onChange={(event) => onChange(event.target.value)}
          className="field"
          placeholder={field.placeholder ?? ""}
          maxLength={200}
        />
      )}
      {field.type === "number" && (
        <input
          id={inputId}
          value={stringValue}
          onChange={(event) => onChange(event.target.value)}
          inputMode="decimal"
          className="field"
          placeholder={field.placeholder ?? ""}
        />
      )}
      {field.type === "select" && (
        <select
          id={inputId}
          value={stringValue}
          onChange={(event) => onChange(event.target.value)}
          className="field"
        >
          <option value="">{field.placeholder || "请选择"}</option>
          {field.options.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
      )}
      {field.type === "multi" && (
        <div
          id={inputId}
          role="group"
          aria-labelledby={`${inputId}-label`}
          className="flex flex-wrap gap-2"
        >
          {field.options.map((option) => {
            const values = Array.isArray(value) ? value : [];
            const active = values.includes(option);
            return (
              <button
                key={option}
                type="button"
                onClick={() =>
                  onChange(active ? values.filter((item) => item !== option) : [...values, option])
                }
                className={`flex items-center gap-1.5 rounded-lg border px-2.5 py-1.5 text-[11px] transition-colors ${
                  active
                    ? "border-brand bg-brand text-white"
                    : "border-line-strong bg-surface hover:border-brand/50"
                }`}
              >
                {active && <Check size={10} />}
                {option}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

function LockedPanel({
  activity,
  you,
  selectedNames,
  totalVotes,
}: {
  activity: ActivityDetail;
  you: ActivityDetail["you"];
  selectedNames: string[];
  totalVotes: number;
}) {
  return (
    <div className="rounded-xl border border-line bg-surface shadow-[var(--shadow-soft)]">
      <div className="border-b border-line px-5 py-5 md:px-6">
        <div className="flex items-start gap-3">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-brand-soft text-brand">
            <Lock size={15} />
          </span>
          <div>
            <h2 className="font-display text-2xl leading-tight">投票已结束。</h2>
            <p className="mt-1.5 text-[11px] text-muted">
              不再接受新的投票，结果仍可查看。
              {you ? ` 你当时选了 ${selectedNames.join(" · ") || "未选择"}。` : ""}
            </p>
          </div>
        </div>
        <Link
          href={`/a/${activity.shareCode}/results`}
          className="btn btn-primary btn-sm mt-4"
        >
          查看最终结果
          <ChevronRight size={13} />
        </Link>
      </div>

      <div className="px-5 py-5 md:px-6">
        <p className="mb-3 text-[12px] font-medium">最终结果</p>
        <div className="space-y-3">
          {activity.options.map((option) => {
            const percentage = totalVotes > 0 ? Math.round((option.votes / totalVotes) * 100) : 0;
            return (
              <div key={option.id}>
                <div className="mb-1 flex items-center justify-between gap-3 text-[12px]">
                  <span>
                    {option.label}
                  </span>
                  <span className="shrink-0 text-[10px] text-muted">
                    {option.votes} 票 · {percentage}%
                  </span>
                </div>
                <div className="h-2.5 overflow-hidden rounded-full bg-paper-deep">
                  <div className="vote-bar h-full rounded-full bg-brand" style={{ width: `${percentage}%` }} />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
