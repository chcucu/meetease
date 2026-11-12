"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  AlertCircle,
  ArrowUp,
  Check,
  CheckCircle2,
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
import { Avatar, AvatarStack, StatusPill } from "./ui";
import { deadlineState, formatDateTime, isPast, relativeTime } from "@/lib/format";
import type { ActivityDetail, ActivitySnapshot, PublicField, PublicOption } from "@/lib/types";

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
        }),
      });
      const data = await response.json();
      if (!response.ok) {
        setError(data.error ?? "提交失败，请重试");
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
      setNotice("你的选择已经记录。截止前都可以回来修改。");
    } catch {
      setError("网络出了点问题，请重试");
    } finally {
      setSubmitting(false);
    }
  }

  async function addSuggestion() {
    if (!suggestionText.trim()) {
      setNotice("写点什么再提交。");
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
        }),
      });
      const data = await response.json();
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
      setNotice("先提交你的选择，就可以附议别人的提议了。");
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
        <div className="flex items-center gap-2 text-[11px] text-muted">
          <Link href="/" className="hover:text-ink">
            Quorum
          </Link>
          <ChevronRight size={12} />
          <span className="font-mono tracking-wide">PUBLIC / {activity.shareCode}</span>
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
          organizer={activity.organizer.name}
          fee={activity.fee?.amount ?? null}
          shareCode={activity.shareCode}
          status={activity.status}
        />
      </div>

      <div className="grid gap-px border-x border-b border-line bg-line sm:grid-cols-2 lg:grid-cols-4">
        <MetaCell
          icon={<Clock3 size={14} />}
          label="截止"
          value={activity.deadline ? formatDateTime(activity.deadline) : "未设置"}
          note={state.label}
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
          note={activity.location?.address ?? "地点在卡片里投票"}
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
            <div className="border border-line bg-surface">
              <div className="flex flex-wrap items-start justify-between gap-3 border-b border-line px-5 py-5 md:px-6">
                <div>
                  <p className="label mb-1.5 text-[9px]">YOUR RESPONSE / 你的选择</p>
                  <h2 className="font-display text-2xl leading-tight">
                    {hasResponded ? "修改你的选择" : "投一票，把事定下来"}
                  </h2>
                  <p className="mt-1.5 text-[11px] text-muted">
                    {hasResponded
                      ? "截止之前都可以更新。改完记得再提交一次。"
                      : "不用注册。填个名字，选好时间地点，提交即可。"}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-display text-3xl leading-none">{activity.counts.participants}</p>
                  <p className="label mt-1 text-[8px]">人已参与</p>
                </div>
              </div>

              <div className="px-5 py-5 md:px-6">
                {justSubmitted && (
                  <div className="ticker-in mb-5 flex items-start gap-2.5 border border-ink bg-acid px-3.5 py-3">
                    <CheckCircle2 size={16} className="mt-0.5 shrink-0" />
                    <div className="flex-1">
                      <p className="text-[12px] font-medium">你的选择已经记录。</p>
                      <p className="mt-0.5 text-[11px] text-ink/70">
                        截止前可以随时回来修改。现在可以去看看实时结果。
                      </p>
                    </div>
                    <Link
                      href={`/a/${activity.shareCode}/results`}
                      className="hidden shrink-0 items-center gap-1 border border-ink bg-paper px-2 py-1 text-[10px] sm:flex"
                    >
                      看结果 <ChevronRight size={11} />
                    </Link>
                  </div>
                )}

                {hasResponded && !justSubmitted && (
                  <div className="mb-5 flex items-center justify-between gap-3 border border-line bg-paper px-3.5 py-2.5">
                    <p className="flex items-center gap-2 text-[11px] text-muted">
                      <Pencil size={12} />
                      你已参与，当前选择「{selectedNames().join(" · ") || "未选择"}」
                    </p>
                    <span className="font-mono text-[9px] text-muted">可修改</span>
                  </div>
                )}

                {notice && (
                  <div className="mb-4 border border-line bg-acid-soft px-3 py-2 text-[11px]">
                    {notice}
                  </div>
                )}

                {restoring && !hasResponded && (
                  <p className="mb-4 font-mono text-[10px] text-muted">正在检查你之前的参与记录…</p>
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
                  <OptionGroup
                    title="时间"
                    hint={activity.voteType === "single" ? "选一个时间" : "可以选择多个时间"}
                    options={timeOptions}
                    selected={selected}
                    showCounts={showCounts}
                    totalVotes={activity.counts.participants}
                    onToggle={toggleOption}
                  />
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
                      <p className="label mb-1.5 text-[9px]">A FEW MORE THINGS</p>
                      <h3 className="font-display text-xl">还有几个小问题</h3>
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
                      ? "截止之前都可以更新，票数会实时同步给所有人。"
                      : "投票后会显示每个选项的票数，避免先到先得的影响。"}
                  </p>
                </div>
              </div>
            </div>
          )}

          {activity.allowSuggestions && (
            <section className="mt-8 border-t border-line pt-8">
              <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
                <div>
                  <p className="label mb-1.5 text-[9px]">SUGGESTIONS / 提议</p>
                  <h2 className="font-display text-[28px] leading-tight">还有别的可能？</h2>
                  <p className="mt-1.5 text-[12px] text-muted">
                    提一个时间或地点，或者附议你认同的那条。
                  </p>
                </div>
                <span className="chip">{activity.counts.suggestions} 条提议</span>
              </div>

              <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_300px] lg:items-start">
                <div className="space-y-2.5">
                  {suggestions.length === 0 ? (
                    <div className="border border-dashed border-line-strong bg-surface/50 px-5 py-10 text-center">
                      <MessageSquare size={20} className="mx-auto text-muted" />
                      <p className="mt-2 font-display text-xl">还没有人提议</p>
                      <p className="mt-1 text-[11px] text-muted">第一个说话的人，往往改变结果。</p>
                    </div>
                  ) : (
                    suggestions.map((suggestion) => (
                      <article
                        key={suggestion.id}
                        className={`flex gap-3 border p-3.5 transition-colors ${
                          suggestion.upvoted ? "border-ink bg-acid-soft/50" : "border-line bg-surface"
                        }`}
                      >
                        <button
                          type="button"
                          onClick={() => void toggleSuggestion(suggestion.id)}
                          disabled={locked}
                          aria-pressed={suggestion.upvoted}
                          className={`flex h-12 w-11 shrink-0 flex-col items-center justify-center border transition-colors ${
                            suggestion.upvoted
                              ? "border-ink bg-acid"
                              : "border-line-strong bg-paper hover:border-ink"
                          } ${locked ? "cursor-not-allowed opacity-50" : ""}`}
                          title={hasResponded ? "附议这条提议" : "提交选择后可附议"}
                        >
                          <ArrowUp size={13} />
                          <span className="font-mono text-[10px]">{suggestion.votes}</span>
                        </button>
                        <div className="min-w-0 flex-1">
                          <p className="text-[13px] leading-5">{suggestion.content}</p>
                          <div className="mt-2 flex flex-wrap items-center gap-2 font-mono text-[9px] tracking-wide text-muted">
                            <span>{suggestion.authorName}</span>
                            <span>·</span>
                            <span>{relativeTime(suggestion.createdAt)}</span>
                            <span className="chip ml-auto text-[8px]">
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

                <div className="border border-line bg-surface p-4">
                  {locked ? (
                    <div className="text-[12px] text-muted">
                      <p className="flex items-center gap-1.5 font-medium text-ink">
                        <Lock size={13} /> 提议已关闭
                      </p>
                      <p className="mt-1.5 leading-5">投票已经结束，这条决策卡不再接受新的提议。</p>
                    </div>
                  ) : (
                    <>
                      <p className="label mb-2 text-[9px]">MAKE A SUGGESTION</p>
                      <textarea
                        value={suggestionText}
                        onChange={(event) => setSuggestionText(event.target.value)}
                        maxLength={300}
                        className="field min-h-[84px] text-[12px]"
                        placeholder="比如：周五晚上也可以，或者换一家更近的。"
                      />
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
                        提交你的选择之后，就可以附议别人的提议。
                      </p>
                    </>
                  )}
                </div>
              </div>
            </section>
          )}
        </div>

        <aside className="space-y-4 lg:sticky lg:top-[88px]">
          <div className="border border-line bg-surface p-5">
            <div className="flex items-center justify-between border-b border-line pb-3">
              <p className="label text-[9px]">ABOUT THIS CARD</p>
              <span className="live-dot" />
            </div>
            <dl className="mt-3 space-y-3 text-[11px]">
              <div className="flex items-start justify-between gap-3">
                <dt className="flex items-center gap-1.5 text-muted">
                  <Clock3 size={11} /> 截止时间
                </dt>
                <dd className="text-right">{activity.deadline ? formatDateTime(activity.deadline) : "未设置"}</dd>
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
                className="mt-4 flex items-center gap-1.5 border border-line bg-paper px-3 py-2 text-[11px] transition-colors hover:border-ink"
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
                className="mt-4 flex items-center gap-1.5 border border-line bg-paper px-3 py-2 text-[11px] transition-colors hover:border-ink"
              >
                <MapPin size={12} />
                搜索这个地点
                <ExternalLink size={10} className="ml-auto text-muted" />
              </a>
            ))}
          </div>

          <div className="border border-line bg-surface p-5">
            <p className="label mb-3 text-[9px]">HOSTED BY</p>
            <div className="flex items-center gap-3">
              <Avatar name={activity.organizer.name} size="md" />
              <div>
                <p className="text-[13px] font-medium">{activity.organizer.name}</p>
                <p className="font-mono text-[9px] text-muted">发起人</p>
              </div>
            </div>
          </div>

          <div className="border border-ink bg-ink p-5 text-paper">
            <div className="flex items-center justify-between">
              <p className="label text-[9px] text-paper/50">LIVE RESULT</p>
              <span className="live-dot" />
            </div>
            <p className="mt-3 font-display text-2xl leading-tight">结果正在发生。</p>
            <p className="mt-1.5 text-[11px] leading-5 text-paper/55">
              每一票都会实时进入结果页。看看现在最多人选什么。
            </p>
            <Link
              href={`/a/${activity.shareCode}/results`}
              className="mt-4 flex items-center justify-between border border-paper/30 px-3 py-2 text-[11px] transition-colors hover:border-acid hover:text-acid"
            >
              查看实时结果
              <ChevronRight size={12} />
            </Link>
          </div>

          {activity.participants.length > 0 && (
            <div className="border border-line bg-surface p-5">
              <div className="mb-3 flex items-center justify-between">
                <p className="label text-[9px]">WHO&apos;S IN</p>
                <span className="font-mono text-[9px] text-muted">{activity.counts.participants}</span>
              </div>
              <AvatarStack names={activity.participants.map((participant) => participant.name)} max={7} />
              <p className="mt-3 text-[10px] leading-5 text-muted">
                包括你认识的和不认识的。名单只在结果页和主控台显示。
              </p>
            </div>
          )}
        </aside>
      </div>
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
  note: string;
}) {
  return (
    <div className="bg-surface px-4 py-3.5">
      <p className="label flex items-center gap-1.5 text-[8px]">
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
  options,
  selected,
  showCounts,
  totalVotes,
  onToggle,
}: {
  title: string;
  hint: string;
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
        <p className="font-mono text-[9px] text-muted">{hint}</p>
      </div>
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
              className={`relative w-full overflow-hidden border px-3.5 py-3 text-left transition-all duration-200 ${
                isSelected
                  ? "border-ink bg-acid-soft shadow-[2px_2px_0_#171714]"
                  : "border-line-strong bg-paper/40 hover:border-ink hover:bg-paper"
              }`}
            >
              <div className="relative flex items-center justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  <span
                    className={`flex h-4 w-4 shrink-0 items-center justify-center rounded-full border ${
                      isSelected ? "border-ink bg-ink text-acid" : "border-line-strong bg-surface"
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
                    <p className="font-mono text-[8px] text-muted">{percentage}%</p>
                  </div>
                )}
              </div>
              {showCounts && (
                <div className="absolute inset-x-0 bottom-0 h-[3px] bg-line/40">
                  <div
                    className={`vote-bar h-full ${isSelected ? "bg-ink" : "bg-ink/30"}`}
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

  return (
    <div>
      <label className="field-label">
        {field.label} {field.required && <span className="text-coral">*</span>}
      </label>
      {field.type === "textarea" && (
        <textarea
          value={stringValue}
          onChange={(event) => onChange(event.target.value)}
          className="field min-h-[84px]"
          placeholder={field.placeholder ?? ""}
          maxLength={500}
        />
      )}
      {field.type === "text" && (
        <input
          value={stringValue}
          onChange={(event) => onChange(event.target.value)}
          className="field"
          placeholder={field.placeholder ?? ""}
          maxLength={200}
        />
      )}
      {field.type === "number" && (
        <input
          value={stringValue}
          onChange={(event) => onChange(event.target.value)}
          inputMode="decimal"
          className="field"
          placeholder={field.placeholder ?? ""}
        />
      )}
      {field.type === "select" && (
        <select
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
        <div className="flex flex-wrap gap-2">
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
                className={`flex items-center gap-1.5 border px-2.5 py-1.5 text-[11px] transition-colors ${
                  active
                    ? "border-ink bg-ink text-paper"
                    : "border-line-strong bg-paper hover:border-ink"
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
    <div className="border border-line bg-surface">
      <div className="border-b border-line px-5 py-5 md:px-6">
        <div className="flex items-start gap-3">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center border border-ink bg-paper">
            <Lock size={15} />
          </span>
          <div>
            <p className="label mb-1 text-[9px]">CLOSED / 已结束</p>
            <h2 className="font-display text-2xl leading-tight">这次决定已经收口。</h2>
            <p className="mt-1.5 text-[11px] text-muted">
              不再接受新的投票，但结果仍然可以查看。
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
        <p className="label mb-3 text-[9px]">FINAL TALLY</p>
        <div className="space-y-3">
          {activity.options.map((option) => {
            const percentage = totalVotes > 0 ? Math.round((option.votes / totalVotes) * 100) : 0;
            return (
              <div key={option.id}>
                <div className="mb-1 flex items-center justify-between gap-3 text-[12px]">
                  <span>
                    {option.label}
                    <span className="ml-2 font-mono text-[8px] text-muted">
                      {option.kind === "time" ? "TIME" : "PLACE"}
                    </span>
                  </span>
                  <span className="shrink-0 font-mono text-[10px] text-muted">
                    {option.votes} 票 · {percentage}%
                  </span>
                </div>
                <div className="h-2.5 bg-paper-deep">
                  <div className="vote-bar h-full bg-ink/70" style={{ width: `${percentage}%` }} />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
