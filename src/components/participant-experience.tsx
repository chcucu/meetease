"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  AlertCircle,
  ArrowDown,
  ArrowUp,
  Check,
  ChevronDown,
  ChevronRight,
  Clock3,
  ExternalLink,
  Loader2,
  Lock,
  MapPin,
  MessageSquare,
  Pencil,
  ThumbsDown,
  Users,
  Wallet,
  X,
} from "lucide-react";
import { CoverPoster } from "./cover-poster";
import { ShareButton } from "./share-dialog";
import { CalendarLinks } from "./calendar-links";
import { DeadlineCountdown } from "./deadline-countdown";
import { SuccessOverlay } from "./success-overlay";
import SliderCaptcha from "./slider-captcha";
import ChoiceCard from "./choice-card";
import { WeatherBadge } from "./weather-badge";
import { CommutePanel } from "./commute-panel";
import { FairPointCard } from "./fair-point-card";
import { useToast } from "./toast";
import { Avatar, AvatarStack, StatusPill } from "./ui";
import { deadlineState, formatDateTime, isPast, relativeTime, timeZoneLabel } from "@/lib/format";
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
  const toast = useToast();
  const [activity, setActivity] = useState(initialActivity);
  const [clientKey] = useState<string | null>(() =>
    typeof window === "undefined" ? null : getClientKey(initialActivity.shareCode)
  );
  const [you, setYou] = useState(initialActivity.you);
  const [name, setName] = useState(initialActivity.you?.name ?? "");
  const [selected, setSelected] = useState<string[]>(initialActivity.you?.optionIds ?? []);
  const [vetoed, setVetoed] = useState<string[]>(initialActivity.you?.vetoOptionIds ?? []);
  const [ranked, setRanked] = useState<string[]>(initialActivity.you?.rankedOptionIds ?? []);
  const [sortingKind, setSortingKind] = useState<"time" | "place" | null>(null);
  const [condition, setCondition] = useState(initialActivity.you?.condition ?? "");
  const [conditionOptionId, setConditionOptionId] = useState(
    initialActivity.you?.conditionOptionId ?? ""
  );
  const [conditionOpen, setConditionOpen] = useState(false);
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
  const [suggestionSlider, setSuggestionSlider] = useState<{ token: string; x: number } | null>(
    null
  );
  const [suggestionSliderReset, setSuggestionSliderReset] = useState(0);
  const [slider, setSlider] = useState<{ token: string; x: number } | null>(null);
  const [sliderReset, setSliderReset] = useState(0);
  const [choiceOpen, setChoiceOpen] = useState(false);
  const [now, setNow] = useState(() => Date.now());
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
          setVetoed(data.activity.you.vetoOptionIds ?? []);
          setRanked(data.activity.you.rankedOptionIds ?? []);
          setCondition(data.activity.you.condition ?? "");
          setConditionOptionId(data.activity.you.conditionOptionId ?? "");
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

  useEffect(() => {
    if (!activity.tieBreak?.until) return;
    const timer = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(timer);
  }, [activity.tieBreak?.until]);

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

  const tieBreakIds = useMemo(
    () => new Set(activity.tieBreak?.optionIds ?? []),
    [activity.tieBreak]
  );
  const tieBreakActive = Boolean(
    activity.tieBreak && (!activity.tieBreak.until || !isPast(activity.tieBreak.until))
  );
  const tieBreakClock = useMemo(() => {
    const until = activity.tieBreak?.until;
    if (!until) return "进行中";
    const ms = Math.max(0, new Date(until).getTime() - now);
    const minutes = String(Math.floor(ms / 60000)).padStart(2, "0");
    const seconds = String(Math.floor((ms % 60000) / 1000)).padStart(2, "0");
    return `${minutes}:${seconds}`;
  }, [activity.tieBreak, now]);

  const selectedTimeLabel = useMemo(
    () =>
      selected
        .map((id) => activity.options.find((option) => option.id === id))
        .filter((option): option is PublicOption => option !== undefined && option.kind === "time")
        .map((option) => option.label)
        .join(" · "),
    [selected, activity.options]
  );
  const selectedPlaceLabel = useMemo(
    () =>
      selected
        .map((id) => activity.options.find((option) => option.id === id))
        .filter((option): option is PublicOption => option !== undefined && option.kind === "place")
        .map((option) => option.label)
        .join(" · "),
    [selected, activity.options]
  );

  const rankedOrder = useMemo(() => {
    const kept = ranked.filter((id) => selected.includes(id));
    const appended = selected.filter((id) => !kept.includes(id));
    return [...kept, ...appended];
  }, [ranked, selected]);

  const rankedTimeIds = useMemo(
    () => rankedOrder.filter((id) => timeOptions.some((option) => option.id === id)),
    [rankedOrder, timeOptions]
  );
  const rankedPlaceIds = useMemo(
    () => rankedOrder.filter((id) => placeOptions.some((option) => option.id === id)),
    [rankedOrder, placeOptions]
  );

  // During a tie-break only the remaining options may be submitted.
  const allowedSelection = tieBreakActive
    ? selected.filter((id) => tieBreakIds.has(id))
    : selected;
  const allowedVetoes = tieBreakActive ? vetoed.filter((id) => tieBreakIds.has(id)) : vetoed;
  const allowedRanked = rankedOrder.filter((id) => allowedSelection.includes(id));

  const weatherPoint = useMemo(() => {
    const winner = placeOptions.find((option) => option.id === activity.rankedWinners.place);
    const withCoords =
      winner && winner.lat != null && winner.lng != null
        ? { lat: winner.lat, lng: winner.lng }
        : placeOptions.reduce<{ lat: number; lng: number } | null>((found, option) => {
            if (found) return found;
            if (option.lat == null || option.lng == null) return null;
            return { lat: option.lat, lng: option.lng };
          }, null);
    if (withCoords) return withCoords;
    if (activity.location?.lat != null && activity.location?.lng != null) {
      return { lat: activity.location.lat, lng: activity.location.lng };
    }
    return null;
  }, [placeOptions, activity.rankedWinners.place, activity.location]);

  const weatherDate = useMemo(() => {
    const winner = timeOptions.find((option) => option.id === activity.rankedWinners.time);
    return (
      winner?.startsAt ??
      timeOptions.find((option) => option.startsAt != null)?.startsAt ??
      activity.deadline ??
      activity.createdAt
    );
  }, [timeOptions, activity.rankedWinners.time, activity.deadline, activity.createdAt]);

  const suggestions = useMemo(
    () =>
      [...activity.suggestions].sort(
        (a, b) => b.votes - a.votes || +new Date(b.createdAt) - +new Date(a.createdAt)
      ),
    [activity.suggestions]
  );

  function isBlockedByTieBreak(option: PublicOption) {
    return tieBreakActive && !tieBreakIds.has(option.id);
  }

  function toggleOption(option: PublicOption) {
    if (locked || isBlockedByTieBreak(option)) return;
    setError(null);
    setVetoed((current) => current.filter((id) => id !== option.id));
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

  function toggleVeto(option: PublicOption) {
    if (locked || isBlockedByTieBreak(option)) return;
    setError(null);
    setVetoed((current) =>
      current.includes(option.id) ? current.filter((id) => id !== option.id) : [option.id]
    );
    // A veto overrides support: the same person never counts twice.
    setSelected((current) => current.filter((id) => id !== option.id));
  }

  function moveRank(option: PublicOption, direction: -1 | 1) {
    const list = rankedOrder.filter(
      (id) => activity.options.find((item) => item.id === id)?.kind === option.kind
    );
    const position = list.indexOf(option.id);
    const target = list[position + direction];
    if (position < 0 || !target) return;
    const next = [...rankedOrder];
    const a = next.indexOf(option.id);
    const b = next.indexOf(target);
    if (a < 0 || b < 0) return;
    next[a] = target;
    next[b] = option.id;
    setRanked(next);
  }

  function setAnswer(fieldId: string, value: string | string[]) {
    setError(null);
    setAnswers((current) => ({ ...current, [fieldId]: value }));
  }

  function validate() {
    if (!name.trim()) return "请先填写你的称呼。";
    if (activity.options.length > 0 && allowedSelection.length === 0 && allowedVetoes.length === 0) {
      return "至少选择一个时间或地点。";
    }
    if (!slider) return "请先完成滑块验证";
    if (Boolean(condition.trim()) !== Boolean(conditionOptionId)) {
      return "条件和条件选项需要同时填写。";
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

    const rankedOptionIds = allowedRanked;
    setSubmitting(true);
    setError(null);
    try {
      const response = await fetch(`/api/activities/${activity.shareCode}/respond`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          clientKey,
          name: name.trim(),
          optionIds: allowedSelection,
          answers,
          vetoOptionIds: allowedVetoes.slice(0, 1),
          rankedOptionIds,
          condition: condition.trim() || null,
          conditionOptionId: conditionOptionId || null,
          sliderToken: slider?.token,
          sliderX: slider?.x,
        }),
      });
      const data = await response.json();
      if (!response.ok) {
        setError(data.error ?? "提交失败，请重试");
        toast({ title: "提交失败", description: data.error, variant: "error" });
        setSlider(null);
        setSliderReset((value) => value + 1);
        return;
      }

      setYou({
        id: data.participant?.id ?? you?.id ?? clientKey,
        name: data.participant?.name ?? name.trim(),
        optionIds: allowedSelection,
        vetoOptionIds: allowedVetoes.slice(0, 1),
        rankedOptionIds,
        condition: condition.trim() || null,
        conditionOptionId: conditionOptionId || null,
        answers,
      });
      setAnswers(data.participant?.answers ?? answers);
      const snapshot = data.snapshot as ActivitySnapshot;
      setActivity((current) => ({
        ...current,
        options: snapshot.options,
        suggestions: snapshot.suggestions,
        participants: snapshot.participants,
        counts: snapshot.counts,
        status: snapshot.activity.status,
        deadline: snapshot.activity.deadline,
        consensus: snapshot.activity.consensus,
        rankedWinners: snapshot.activity.rankedWinners,
        tieBreak: snapshot.activity.tieBreak,
      }));
      setJustSubmitted(true);
      setNotice(null);
      setSlider(null);
      setSliderReset((value) => value + 1);
    } catch {
      setError("网络出了点问题，请重试");
      toast({ title: "网络出了点问题", variant: "error" });
      setSlider(null);
      setSliderReset((value) => value + 1);
    } finally {
      setSubmitting(false);
    }
  }

  async function addSuggestion() {
    if (!suggestionText.trim()) {
      setNotice("请输入内容后再提交。");
      return;
    }
    if (!suggestionSlider) {
      setNotice("请先完成滑块验证");
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
          sliderToken: suggestionSlider.token,
          sliderX: suggestionSlider.x,
        }),
      });
      const data = await response.json();
      if (!response.ok) {
        setNotice(data.error ?? "提交失败");
        toast({ title: "提议提交失败", description: data.error, variant: "error" });
        setSuggestionSlider(null);
        setSuggestionSliderReset((value) => value + 1);
        return;
      }
      setActivity((current) => ({
        ...current,
        suggestions: [data.suggestion, ...current.suggestions],
        counts: { ...current.counts, suggestions: current.counts.suggestions + 1 },
      }));
      setSuggestionText("");
      setSuggestionSlider(null);
      setSuggestionSliderReset((value) => value + 1);
      setNotice("提议已发布。");
    } catch {
      setNotice("网络出了点问题，请重试");
      setSuggestionSlider(null);
      setSuggestionSliderReset((value) => value + 1);
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
        toast({ title: "操作失败", description: data.error, variant: "error" });
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
          <span className="font-mono tracking-wide">{activity.shareCode}</span>
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

      <div className="grid gap-px border-x border-b border-line bg-line sm:grid-cols-2 lg:grid-cols-4">
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

      {tieBreakActive && (
        <div className="mt-4 flex flex-wrap items-center gap-2 border border-coral bg-coral-soft px-3.5 py-2.5 text-[11px]">
          <Clock3 size={12} className="shrink-0 text-coral" />
          <span className="font-medium">决胜轮</span>
          <span className="text-muted">·</span>
          <span className="font-mono tabular-nums">
            {activity.tieBreak?.until ? `剩余 ${tieBreakClock}` : "进行中"}
          </span>
          <span className="text-muted">·</span>
          <span>仅可投平票选项</span>
        </div>
      )}

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
                  <div className="mb-5 flex items-center justify-between gap-3 border border-line bg-paper px-3.5 py-2.5">
                    <p className="flex items-center gap-2 text-[11px] text-muted">
                      <Pencil size={12} />
                      你已参与，当前选择「{selectedNames().join(" · ") || "未选择"}」
                    </p>
                    <span className="text-[11px] text-muted">可修改</span>
                  </div>
                )}

                {notice && (
                  <div className="mb-4 border border-line bg-acid-soft px-3 py-2 text-[11px]">
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
                      vetoed={vetoed}
                      rankedOrder={rankedTimeIds}
                      showCounts={showCounts}
                      totalVotes={activity.counts.participants}
                      tieBreakIds={tieBreakActive ? tieBreakIds : null}
                      rankedWinnerId={activity.rankedWinners.time}
                      sorting={sortingKind === "time"}
                      onToggle={toggleOption}
                      onToggleVeto={toggleVeto}
                      onToggleSorting={() =>
                        setSortingKind(sortingKind === "time" ? null : "time")
                      }
                      onMoveRank={moveRank}
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
                    vetoed={vetoed}
                    rankedOrder={rankedPlaceIds}
                    showCounts={showCounts}
                    totalVotes={activity.counts.participants}
                    tieBreakIds={tieBreakActive ? tieBreakIds : null}
                    rankedWinnerId={activity.rankedWinners.place}
                    sorting={sortingKind === "place"}
                    onToggle={toggleOption}
                    onToggleVeto={toggleVeto}
                    onToggleSorting={() =>
                      setSortingKind(sortingKind === "place" ? null : "place")
                    }
                    onMoveRank={moveRank}
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

                <div className="mt-6 border-t border-line pt-5">
                  <button
                    type="button"
                    onClick={() => setConditionOpen((value) => !value)}
                    aria-expanded={conditionOpen}
                    className="flex w-full items-center justify-between gap-3 text-left"
                  >
                    <span>
                      <span className="field-label mb-0 block">我的参加条件（可选）</span>
                      <span className="mt-1 block text-[10px] text-muted">
                        {condition.trim()
                          ? "已填写：会随选择一起保存。"
                          : "例如「只能待到 21:30」或「需要靠近地铁」。"}
                      </span>
                    </span>
                    <ChevronDown
                      size={14}
                      className={`shrink-0 text-muted transition-transform ${
                        conditionOpen ? "rotate-180" : ""
                      }`}
                    />
                  </button>
                  {conditionOpen && (
                    <div className="mt-3 space-y-2.5">
                      <input
                        value={condition}
                        onChange={(event) => {
                          setCondition(event.target.value);
                          setError(null);
                        }}
                        maxLength={120}
                        className="field text-[12px]"
                        placeholder="写下一个条件，组织者会看到"
                      />
                      <select
                        value={conditionOptionId}
                        onChange={(event) => setConditionOptionId(event.target.value)}
                        className="field text-[12px]"
                        aria-label="条件对应的选项"
                      >
                        <option value="">不绑定具体选项</option>
                        {activity.options.map((option) => (
                          <option key={option.id} value={option.id}>
                            {option.kind === "time" ? "时间 · " : "地点 · "}
                            {option.label}
                          </option>
                        ))}
                      </select>
                      <p className="text-[10px] text-muted">
                        填写条件时需要同时选择一个对应选项。
                      </p>
                    </div>
                  )}
                </div>

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
                  <div className="mb-3">
                    <p className="mb-2 text-[11px] text-muted">人机验证</p>
                    <SliderCaptcha
                      onVerified={(value) => setSlider(value)}
                      resetSignal={sliderReset}
                      disabled={submitting}
                    />
                    {!slider && (
                      <p className="mt-1.5 text-[10px] text-muted">请先完成滑块验证</p>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={() => void submit()}
                    disabled={submitting || !slider}
                    className="btn btn-primary w-full py-3"
                  >
                    {submitting ? <Loader2 size={15} className="animate-spin" /> : <Check size={15} />}
                    {submitting ? "正在提交…" : hasResponded ? "更新我的选择" : "提交我的选择"}
                  </button>
                  {hasResponded && (
                    <button
                      type="button"
                      onClick={() => setChoiceOpen(true)}
                      className="btn btn-ghost btn-sm mt-2 w-full"
                    >
                      生成我的选择卡
                    </button>
                  )}
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
                    <div className="border border-dashed border-line-strong bg-surface/50 px-5 py-10 text-center">
                      <MessageSquare size={20} className="mx-auto text-muted" />
                      <p className="mt-2 font-display text-xl">暂无提议</p>
                      <p className="mt-1 text-[11px] text-muted">你可以添加一个时间或地点。</p>
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
                      <p id="suggestion-label" className="mb-2 text-[12px] text-muted">
                        添加提议
                      </p>
                      <textarea
                        aria-labelledby="suggestion-label"
                        value={suggestionText}
                        onChange={(event) => setSuggestionText(event.target.value)}
                        maxLength={300}
                        className="field min-h-[84px] text-[12px]"
                        placeholder="例如：周五 19:00，或更近的地点。"
                      />
                      <div className="mt-2">
                        <SliderCaptcha
                          onVerified={(value) => setSuggestionSlider(value)}
                          resetSignal={suggestionSliderReset}
                          disabled={suggestionSending}
                        />
                        {!suggestionSlider && (
                          <p className="mt-1.5 text-[10px] text-muted">请先完成滑块验证</p>
                        )}
                      </div>
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
                          disabled={suggestionSending || !suggestionSlider}
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
          <div className="border border-line bg-surface p-5">
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

            <div className="mt-3 border-t border-line pt-3">
              <p className="text-[11px] text-muted">共识度</p>
              <ConsensusRow label="时间" value={activity.consensus.time} />
              <ConsensusRow label="地点" value={activity.consensus.place} />
            </div>

            {activity.location && (activity.location.lat != null && activity.location.lng != null ? (
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
            <p className="mb-3 text-[12px] font-medium">发起人</p>
            <div className="flex items-center gap-3">
              <Avatar name={activity.organizer.name} size="md" />
              <div>
                <p className="text-[13px] font-medium">{activity.organizer.name}</p>
              </div>
            </div>
          </div>

          {weatherPoint && weatherDate && (
            <WeatherBadge
              lat={weatherPoint.lat}
              lng={weatherPoint.lng}
              date={weatherDate}
              label="决策日天气"
            />
          )}

          <CommutePanel options={placeOptions} />
          <FairPointCard options={placeOptions} />

          <div className="border border-ink bg-ink p-5 text-paper">
            <div className="flex items-center justify-between">
              <p className="text-[12px] font-medium text-paper/70">实时结果</p>
              <span className="live-dot" />
            </div>
            <p className="mt-3 font-display text-2xl leading-tight">结果持续更新。</p>
            <p className="mt-1.5 text-[11px] leading-5 text-paper/55">
              每一票都会实时进入结果页。
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

      <ChoiceCard
        open={choiceOpen}
        title={activity.title}
        code={activity.shareCode}
        name={name.trim() || you?.name || ""}
        timeLabel={selectedTimeLabel}
        placeLabel={selectedPlaceLabel}
        participantCount={activity.counts.participants}
        condition={condition.trim() || undefined}
        onClose={() => setChoiceOpen(false)}
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

function ConsensusRow({ label, value }: { label: string; value: number | null }) {
  return (
    <div className="mt-2">
      <div className="flex items-center justify-between text-[10px]">
        <span className="text-muted">{label}</span>
        <span className={value === null ? "text-muted" : "font-mono"}>
          {value === null ? "暂无" : `${value}%`}
        </span>
      </div>
      <div className="mt-1 h-1.5 bg-paper-deep">
        <div
          className="vote-bar h-full bg-ink"
          style={{ width: `${value === null ? 0 : Math.max(0, Math.min(100, value))}%` }}
        />
      </div>
    </div>
  );
}

function OptionGroup({
  title,
  hint,
  footnote,
  options,
  selected,
  vetoed,
  rankedOrder,
  showCounts,
  totalVotes,
  tieBreakIds,
  rankedWinnerId,
  sorting,
  onToggle,
  onToggleVeto,
  onToggleSorting,
  onMoveRank,
}: {
  title: string;
  hint: string;
  footnote?: string;
  options: PublicOption[];
  selected: string[];
  vetoed: string[];
  rankedOrder: string[];
  showCounts: boolean;
  totalVotes: number;
  tieBreakIds: Set<string> | null;
  rankedWinnerId: string | null;
  sorting: boolean;
  onToggle: (option: PublicOption) => void;
  onToggleVeto: (option: PublicOption) => void;
  onToggleSorting: () => void;
  onMoveRank: (option: PublicOption, direction: -1 | 1) => void;
}) {
  const selectedInGroup = options.filter((option) => selected.includes(option.id));
  const showRanks = selectedInGroup.length >= 2;

  return (
    <section className="mt-6">
      <div className="mb-2.5 flex flex-wrap items-center justify-between gap-2">
        <p className="field-label mb-0">{title}</p>
        <div className="flex items-center gap-2">
          <p className="text-[11px] text-muted">{hint}</p>
          {showRanks && (
            <button
              type="button"
              onClick={onToggleSorting}
              aria-pressed={sorting}
              className={`flex items-center gap-1 border px-2 py-1 text-[10px] transition-colors ${
                sorting
                  ? "border-ink bg-ink text-paper"
                  : "border-line-strong bg-surface hover:border-ink"
              }`}
            >
              {sorting ? <Check size={10} /> : <ArrowUp size={10} />}
              {sorting ? "完成排序" : "排序"}
            </button>
          )}
        </div>
      </div>
      {footnote && <p className="mb-2 text-[10px] text-muted">{footnote}</p>}
      {sorting && showRanks && (
        <p className="mb-2 border border-line bg-surface px-2.5 py-1.5 text-[10px] text-muted">
          用上下箭头调整优先顺序，1 为最想要。
        </p>
      )}
      <div className="space-y-2" role="group" aria-label={title}>
        {options.map((option) => {
          const isSelected = selected.includes(option.id);
          const isVetoed = vetoed.includes(option.id);
          const percentage =
            totalVotes > 0 ? Math.round((option.votes / totalVotes) * 100) : 0;
          const rank = rankedOrder.indexOf(option.id) + 1;
          const blocked = tieBreakIds !== null && !tieBreakIds.has(option.id);
          const isRankedWinner = rankedWinnerId === option.id;
          const showVetoMark = isVetoed || (showCounts && option.vetoes > 0);
          return (
            <div
              key={option.id}
              className={`relative overflow-hidden border transition-all duration-200 ${
                blocked
                  ? "border-line bg-paper/20 opacity-45"
                  : isVetoed
                    ? "border-coral bg-coral-soft/40"
                    : isSelected
                      ? "border-ink bg-acid-soft shadow-[2px_2px_0_#171714]"
                      : "border-line-strong bg-paper/40 hover:border-ink hover:bg-paper"
              }`}
            >
              {showVetoMark && (
                <span
                  className="absolute inset-y-0 left-0 w-[3px] bg-coral"
                  aria-hidden="true"
                />
              )}
              <div className="flex items-stretch">
                <button
                  type="button"
                  onClick={() => onToggle(option)}
                  disabled={blocked}
                  aria-pressed={isSelected}
                  className={`min-w-0 flex-1 py-3 text-left transition-colors disabled:cursor-not-allowed ${
                    showVetoMark ? "pl-4 pr-3.5" : "px-3.5"
                  }`}
                >
                  <div className="relative flex items-center justify-between gap-3">
                    <div className="flex min-w-0 items-center gap-2.5">
                      <span
                        className={`flex h-4 w-4 shrink-0 items-center justify-center rounded-full border ${
                          isSelected
                            ? "border-ink bg-ink text-acid"
                            : "border-line-strong bg-surface"
                        }`}
                      >
                        {isSelected && <Check size={10} strokeWidth={3} />}
                      </span>
                      {showRanks && rank > 0 && (
                        <span
                          aria-label={`优先第 ${rank} 位`}
                          className={`flex h-4 w-4 shrink-0 items-center justify-center border font-mono text-[9px] ${
                            isSelected
                              ? "border-ink bg-ink text-acid"
                              : "border-line-strong text-muted"
                          }`}
                        >
                          {rank}
                        </span>
                      )}
                      <span className="min-w-0">
                        <span className="flex flex-wrap items-center gap-1.5">
                          <span className="text-[13px] font-medium">{option.label}</span>
                          {showCounts && isRankedWinner && (
                            <span className="border border-ink bg-acid px-1 py-0.5 font-mono text-[9px]">
                              排序首选
                            </span>
                          )}
                          {isVetoed && (
                            <span className="border border-coral px-1 py-0.5 font-mono text-[9px] text-coral">
                              我的否决
                            </span>
                          )}
                          {blocked && (
                            <span className="border border-line-strong px-1 py-0.5 font-mono text-[9px] text-muted">
                              未进入决胜轮
                            </span>
                          )}
                        </span>
                        {option.note && (
                          <span className="mt-0.5 block text-[10px] text-muted">
                            {option.note}
                          </span>
                        )}
                        {showCounts && option.vetoes > 0 && (
                          <span className="mt-1 flex items-center gap-1 text-[10px] text-coral">
                            <ThumbsDown size={9} />
                            有人坚决不行 · {option.vetoes} 人
                          </span>
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
                </button>

                <div className="flex shrink-0 flex-col items-stretch justify-center gap-1 border-l border-line px-1.5 py-2">
                  {sorting && showRanks && isSelected ? (
                    <>
                      <button
                        type="button"
                        onClick={() => onMoveRank(option, -1)}
                        disabled={rank <= 1}
                        aria-label={`提升 ${option.label} 的优先顺序`}
                        className="flex h-5 w-6 items-center justify-center border border-line-strong bg-surface text-muted transition-colors hover:border-ink hover:text-ink disabled:opacity-30"
                      >
                        <ArrowUp size={10} />
                      </button>
                      <button
                        type="button"
                        onClick={() => onMoveRank(option, 1)}
                        disabled={rank >= selectedInGroup.length}
                        aria-label={`降低 ${option.label} 的优先顺序`}
                        className="flex h-5 w-6 items-center justify-center border border-line-strong bg-surface text-muted transition-colors hover:border-ink hover:text-ink disabled:opacity-30"
                      >
                        <ArrowDown size={10} />
                      </button>
                    </>
                  ) : (
                    <button
                      type="button"
                      onClick={() => onToggleVeto(option)}
                      disabled={blocked}
                      aria-pressed={isVetoed}
                      title={isVetoed ? "取消否决" : "否决这个选项"}
                      className={`flex h-7 items-center gap-1 border px-1.5 text-[10px] transition-colors disabled:cursor-not-allowed ${
                        isVetoed
                          ? "border-coral bg-coral text-surface"
                          : "border-line-strong bg-surface text-muted hover:border-coral hover:text-coral"
                      }`}
                    >
                      {isVetoed ? <X size={10} /> : <ThumbsDown size={10} />}
                      否决
                    </button>
                  )}
                </div>
              </div>
              {showCounts && (
                <div className="absolute inset-x-0 bottom-0 h-[3px] bg-line/40">
                  <div
                    className={`vote-bar h-full ${
                      isSelected ? "bg-ink" : isVetoed ? "bg-coral" : "bg-ink/30"
                    }`}
                    style={{ width: `${percentage}%` }}
                  />
                </div>
              )}
            </div>
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
  const labelId = `${inputId}-label`;

  return (
    <div>
      <label
        htmlFor={field.type === "multi" ? undefined : inputId}
        id={labelId}
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
        <div className="flex flex-wrap gap-2" role="group" aria-labelledby={labelId}>
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
            const isRankedWinner =
              option.id ===
              (option.kind === "time"
                ? activity.rankedWinners.time
                : activity.rankedWinners.place);
            return (
              <div key={option.id}>
                <div className="mb-1 flex items-center justify-between gap-3 text-[12px]">
                  <span className="flex flex-wrap items-center gap-1.5">
                    {option.label}
                    {isRankedWinner && (
                      <span className="border border-ink bg-acid px-1 py-0.5 font-mono text-[9px]">
                        排序首选
                      </span>
                    )}
                    {option.vetoes > 0 && (
                      <span className="flex items-center gap-1 text-[10px] text-coral">
                        <ThumbsDown size={9} /> 有人坚决不行 · {option.vetoes} 人
                      </span>
                    )}
                  </span>
                  <span className="shrink-0 text-[10px] text-muted">
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

        <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-1 border-t border-line pt-3 text-[11px] text-muted">
          <span>
            共识度 · 时间{" "}
            <span className="font-mono text-ink">
              {activity.consensus.time === null ? "暂无" : `${activity.consensus.time}%`}
            </span>
          </span>
          <span>
            地点{" "}
            <span className="font-mono text-ink">
              {activity.consensus.place === null ? "暂无" : `${activity.consensus.place}%`}
            </span>
          </span>
        </div>
      </div>
    </div>
  );
}
