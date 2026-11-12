"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import {
  AlertCircle,
  ArrowLeft,
  ArrowRight,
  CalendarDays,
  Check,
  Clock3,
  Image as ImageIcon,
  Loader2,
  MapPin,
  MessageSquare,
  Plus,
  Sparkles,
  Trash2,
  Wallet,
} from "lucide-react";
import { CoverPoster } from "./cover-poster";
import { CATEGORIES, COVER_THEMES } from "@/lib/types";
import { toLocalInputValue } from "@/lib/format";

const STORAGE_KEY = "quorum:draft:v1";

type TimeDraft = { id: string; start: string; end: string; note: string };
type PlaceDraft = { id: string; label: string; note: string };
type FieldDraft = {
  id: string;
  label: string;
  type: "text" | "textarea" | "number" | "select" | "multi";
  required: boolean;
  placeholder: string;
  optionsText: string;
};

type Draft = {
  title: string;
  description: string;
  category: string;
  theme: string;
  coverImage: string;
  voteType: "single" | "multiple";
  deadline: string;
  allowSuggestions: boolean;
  times: TimeDraft[];
  places: PlaceDraft[];
  fields: FieldDraft[];
  locationName: string;
  locationAddress: string;
  feeAmount: string;
  feeNote: string;
};

const EMPTY: Draft = {
  title: "",
  description: "",
  category: "dinner",
  theme: "lime",
  coverImage: "",
  voteType: "single",
  deadline: "",
  allowSuggestions: true,
  times: [{ id: "t1", start: "", end: "", note: "" }],
  places: [{ id: "p1", label: "", note: "" }],
  fields: [],
  locationName: "",
  locationAddress: "",
  feeAmount: "",
  feeNote: "",
};

const STEPS = [
  { title: "基本信息", hint: "标题、分类与截止时间" },
  { title: "时间与地点", hint: "设置可选时间与地点" },
  { title: "补充问题", hint: "添加自定义问题" },
  { title: "费用与发布", hint: "费用、检查并发布" },
];

const TEMPLATES = [
  {
    id: "dinner",
    label: "周末聚餐",
    title: "周六聚餐",
    description: "周六晚餐，地点暂定梧桐小院。请选择可行时间，截止后按人数订位。",
    category: "dinner",
    theme: "coral",
    fee: "168",
    feeNote: "含餐位与酒水，多退少补",
    place: "梧桐小院",
    field: "有没有忌口？",
  },
  {
    id: "team",
    label: "团队团建",
    title: "产品组 · 春季 Offsite",
    description: "产品组春季 Offsite，两天一夜。请选择可行时间，以便预订场地与住宿。",
    category: "travel",
    theme: "ink",
    fee: "680",
    feeNote: "含住宿、餐饮与交通，按实际结算",
    place: "莫干山 · 竹里",
    field: "有没有特殊饮食需求？",
  },
  {
    id: "book",
    label: "读书会",
    title: "读书会 · 下一期书目",
    description: "确定下一期读书会的时间与书目。请选择可行时间，并推荐一本你想读的书。",
    category: "workshop",
    theme: "lime",
    fee: "",
    feeNote: "",
    place: "单向空间 · 花家地店",
    field: "想带一本什么书来？",
  },
  {
    id: "trip",
    label: "短途出行",
    title: "周末短途出行",
    description: "周末短途出行，两天一夜。请选择可行时间，费用按人数均摊。",
    category: "travel",
    theme: "sky",
    fee: "420",
    feeNote: "AA 制，含交通与住宿",
    place: "莫干山",
    field: "能接受的步行强度？",
  },
];

function uid(prefix: string) {
  return `${prefix}-${Math.random().toString(36).slice(2, 9)}`;
}

function pad(value: number) {
  return String(value).padStart(2, "0");
}

function timeLabel(start: string) {
  if (!start) return "";
  const date = new Date(start);
  if (Number.isNaN(date.getTime())) return "";
  const weekday = new Intl.DateTimeFormat("zh-CN", { weekday: "short" }).format(date);
  return `${date.getMonth() + 1}月${date.getDate()}日 ${weekday} ${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

function nextDay(daysFromNow: number, hour: number, minute: number) {
  const date = new Date();
  date.setDate(date.getDate() + daysFromNow);
  date.setHours(hour, minute, 0, 0);
  return toLocalInputValue(date.toISOString());
}

export function CreateWizard({ userName }: { userName: string }) {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [maxVisited, setMaxVisited] = useState(0);
  const [draft, setDraft] = useState<Draft>(EMPTY);
  const [loaded, setLoaded] = useState(false);
  const [savedAt, setSavedAt] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as Partial<Draft>;
        // Restoring a local draft is a client-only external read, not a render-time value.
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setDraft({
          ...EMPTY,
          ...parsed,
          times: parsed.times?.length ? parsed.times : EMPTY.times,
          places: parsed.places?.length ? parsed.places : EMPTY.places,
          fields: parsed.fields ?? [],
        });
      }
    } catch {
      // Ignore a broken draft.
    }
    setLoaded(true);
  }, []);

  useEffect(() => {
    if (!loaded) return;
    const timer = setTimeout(() => {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(draft));
      setSavedAt(new Date().toLocaleTimeString("zh-CN", { hour: "2-digit", minute: "2-digit" }));
    }, 700);
    return () => clearTimeout(timer);
  }, [draft, loaded]);

  function update<K extends keyof Draft>(key: K, value: Draft[K]) {
    setDraft((current) => ({ ...current, [key]: value }));
    setError(null);
  }

  function applyTemplate(template: (typeof TEMPLATES)[number]) {
    setDraft({
      ...EMPTY,
      title: template.title,
      description: template.description,
      category: template.category,
      theme: template.theme,
      feeAmount: template.fee,
      feeNote: template.feeNote,
      deadline: nextDay(3, 21, 0),
      times: [
        { id: uid("t"), start: nextDay(2, 17, 30), end: nextDay(2, 21, 0), note: "" },
        { id: uid("t"), start: nextDay(2, 19, 0), end: nextDay(2, 22, 0), note: "" },
        { id: uid("t"), start: nextDay(3, 12, 0), end: nextDay(3, 15, 0), note: "" },
      ],
      places: [
        { id: uid("p"), label: template.place, note: "人均 ¥150–200" },
        { id: uid("p"), label: "备选地点", note: "视人数确认" },
      ],
      locationName: template.place,
      fields: [
        {
          id: uid("f"),
          label: template.field,
          type: "select",
          required: true,
          placeholder: "",
          optionsText: "没有, 不吃辣, 不吃海鲜, 素食",
        },
        {
          id: uid("f"),
          label: "怎么过去？",
          type: "text",
          required: false,
          placeholder: "自驾 / 地铁 / 需要拼车",
          optionsText: "",
        },
      ],
    });
    setError(null);
  }

  function validate(target = step): string | null {
    if (target === 0) {
      if (draft.title.trim().length < 2) return "先给这次决定起个标题（至少 2 个字）。";
      if (draft.coverImage.trim()) {
        try {
          new URL(draft.coverImage.trim());
        } catch {
          return "封面图片链接格式不正确。";
        }
      }
    }
    if (target === 1) {
      const validTimes = draft.times.filter((time) => time.start);
      if (validTimes.length === 0) return "至少添加一个时间选项。";
      for (const time of draft.times) {
        if (time.start && time.end && new Date(time.end) <= new Date(time.start)) {
          return "结束时间需要晚于开始时间。";
        }
      }
    }
    if (target === 2) {
      for (const field of draft.fields) {
        if (!field.label.trim()) return "每个问题都需要一个标题。";
        if (
          (field.type === "select" || field.type === "multi") &&
          !field.optionsText.split(/[,，]/).map((item) => item.trim()).filter(Boolean).length
        ) {
          return `「${field.label}」需要至少一个选项。`;
        }
      }
    }
    if (target === 3) {
      if (draft.feeAmount && Number.isNaN(Number(draft.feeAmount))) return "费用需要填写数字。";
      if (draft.feeAmount && Number(draft.feeAmount) < 0) return "费用不能是负数。";
    }
    return null;
  }

  function goNext() {
    const message = validate(step);
    if (message) {
      setError(message);
      return;
    }
    const next = Math.min(step + 1, STEPS.length - 1);
    setStep(next);
    setMaxVisited((value) => Math.max(value, next));
    setError(null);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function goBack() {
    setError(null);
    setStep((value) => Math.max(0, value - 1));
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function publish() {
    for (let index = 0; index < STEPS.length; index++) {
      const message = validate(index);
      if (message) {
        setStep(index);
        setError(message);
        return;
      }
    }

    setSubmitting(true);
    setError(null);

    const payload = {
      title: draft.title.trim(),
      description: draft.description.trim(),
      category: draft.category,
      voteType: draft.voteType,
      allowSuggestions: draft.allowSuggestions,
      deadline: draft.deadline ? new Date(draft.deadline).toISOString() : null,
      coverTheme: draft.theme,
      coverImage: draft.coverImage.trim() || null,
      timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone || "Asia/Shanghai",
      location:
        draft.locationName.trim() || draft.locationAddress.trim()
          ? {
              name: draft.locationName.trim() || null,
              address: draft.locationAddress.trim() || null,
              lat: null,
              lng: null,
            }
          : null,
      fee:
        draft.feeAmount && !Number.isNaN(Number(draft.feeAmount))
          ? { amount: Number(draft.feeAmount), note: draft.feeNote.trim() || null }
          : null,
      options: [
        ...draft.times
          .filter((time) => time.start)
          .map((time) => ({
            kind: "time" as const,
            label: timeLabel(time.start),
            note: time.note.trim() || null,
            startsAt: new Date(time.start).toISOString(),
            endsAt: time.end ? new Date(time.end).toISOString() : null,
            lat: null,
            lng: null,
          })),
        ...draft.places
          .filter((place) => place.label.trim())
          .map((place) => ({
            kind: "place" as const,
            label: place.label.trim(),
            note: place.note.trim() || null,
            startsAt: null,
            endsAt: null,
            lat: null,
            lng: null,
          })),
      ],
      fields: draft.fields.map((field) => ({
        label: field.label.trim(),
        type: field.type,
        required: field.required,
        options:
          field.type === "select" || field.type === "multi"
            ? field.optionsText
                .split(/[,，]/)
                .map((item) => item.trim())
                .filter(Boolean)
            : [],
        placeholder: field.placeholder.trim() || null,
      })),
    };

    try {
      const response = await fetch("/api/activities", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await response.json();
      if (!response.ok) {
        setError(data.error ?? "发布失败，请检查输入");
        return;
      }
      localStorage.removeItem(STORAGE_KEY);
      router.push(`/app/${data.code}?created=1`);
    } catch {
      setError("网络出了点问题，请重试");
    } finally {
      setSubmitting(false);
    }
  }

  const validTimes = useMemo(() => draft.times.filter((time) => time.start), [draft.times]);
  const validPlaces = useMemo(() => draft.places.filter((place) => place.label.trim()), [draft.places]);
  const previewDeadline = draft.deadline ? new Date(draft.deadline).toISOString() : null;
  const previewFee = draft.feeAmount && !Number.isNaN(Number(draft.feeAmount)) ? Number(draft.feeAmount) : null;

  return (
    <div className="container-page py-8 md:py-12">
      <div className="mb-8 flex flex-col justify-between gap-4 md:flex-row md:items-end">
        <div>
          <div className="mb-3 flex items-center gap-3">
            <Link href="/app" className="flex items-center gap-1.5 text-[12px] text-muted hover:text-ink">
              <ArrowLeft size={13} />
              工作台
            </Link>
          </div>
          <h1 className="page-title">创建决策页</h1>
          <p className="mt-2 max-w-[520px] text-sm leading-6 text-muted">
            填写时间、地点与问题。发布后分享链接即可开始收集投票。
          </p>
        </div>
        <div className="flex items-center gap-2 text-[11px] text-muted">
          <span className={`h-1.5 w-1.5 rounded-full ${savedAt ? "bg-acid-deep" : "bg-line-strong"}`} />
          {savedAt ? `草稿已自动保存 ${savedAt}` : "草稿会自动保存"}
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[190px_minmax(0,1fr)] xl:grid-cols-[190px_minmax(0,1fr)_340px]">
        <aside className="hidden lg:block">
          <div className="sticky top-[88px]">
            <p className="mb-3 text-[12px] text-muted">步骤</p>
            <ol className="space-y-1">
              {STEPS.map((item, index) => {
                const active = index === step;
                const done = index < step;
                const reachable = index <= maxVisited;
                return (
                  <li key={item.title}>
                    <button
                      type="button"
                      disabled={!reachable}
                      onClick={() => {
                        if (!reachable) return;
                        if (index > step && validate(step)) {
                          setError(validate(step));
                          return;
                        }
                        setStep(index);
                        setError(null);
                      }}
                      className={`flex w-full items-start gap-3 border-l-2 px-3 py-3 text-left transition-colors ${
                        active
                          ? "border-ink bg-surface"
                          : done
                            ? "border-acid-deep/60 hover:bg-surface/60"
                            : "border-line hover:bg-surface/40"
                      } ${reachable ? "" : "cursor-not-allowed opacity-40"}`}
                    >
                      <span
                        className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border font-mono text-[10px] ${
                          done
                            ? "border-ink bg-ink text-acid"
                            : active
                              ? "border-ink bg-acid text-ink"
                              : "border-line-strong text-muted"
                        }`}
                      >
                        {done ? <Check size={10} strokeWidth={3} /> : `0${index + 1}`}
                      </span>
                      <span>
                        <span className={`block text-[13px] ${active ? "font-medium" : ""}`}>
                          {item.title}
                        </span>
                        <span className="mt-0.5 block text-[10px] leading-4 text-muted">
                          {item.hint}
                        </span>
                      </span>
                    </button>
                  </li>
                );
              })}
            </ol>

            <div className="mt-6 border border-line bg-surface p-3">
              <p className="text-[11px] leading-5 text-muted">
                建议提供 2–3 个时间选项，便于比较。
              </p>
            </div>
          </div>
        </aside>

        <div>
          {/* Mobile progress */}
          <div className="mb-5 lg:hidden">
            <div className="mb-2 flex items-center justify-between text-[11px] text-muted">
              <span>
                步骤 {step + 1} / 4 · {STEPS[step].title}
              </span>
              <span>{Math.round(((step + 1) / 4) * 100)}%</span>
            </div>
            <div className="h-1 bg-line">
              <div
                className="h-full bg-ink transition-all duration-300"
                style={{ width: `${((step + 1) / 4) * 100}%` }}
              />
            </div>
          </div>

          <div className="border border-line bg-surface">
            <div className="border-b border-line px-5 py-5 md:px-7">
              <div className="flex items-center gap-3">
                <span className="flex h-7 w-7 items-center justify-center border border-ink bg-acid font-mono text-[10px]">
                  {step + 1}
                </span>
                <div>
                  <h2 className="font-display text-[26px] leading-none">{STEPS[step].title}</h2>
                  <p className="mt-1 text-[11px] text-muted">{STEPS[step].hint}</p>
                </div>
              </div>
            </div>

            <div className="px-5 py-6 md:px-7">
              {error && (
                <div
                  role="alert"
                  className="mb-5 flex items-start gap-2 border border-coral bg-coral-soft px-3 py-2.5 text-[12px] leading-5"
                >
                  <AlertCircle size={14} className="mt-0.5 shrink-0 text-coral" />
                  {error}
                </div>
              )}

              {step === 0 && (
                <div className="space-y-6">
                  <div>
                    <p className="mb-2 text-[12px] text-muted">从模板开始</p>
                    <div className="flex flex-wrap gap-2">
                      {TEMPLATES.map((template) => (
                        <button
                          key={template.id}
                          type="button"
                          onClick={() => applyTemplate(template)}
                          className="flex items-center gap-1.5 border border-line-strong bg-paper px-2.5 py-1.5 text-[11px] transition-colors hover:border-ink hover:bg-acid-soft"
                        >
                          <Sparkles size={11} />
                          {template.label}
                        </button>
                      ))}
                    </div>
                    <p className="mt-2 text-[10px] text-muted">
                      套用模板会覆盖当前内容，之后仍然可以逐项修改。
                    </p>
                  </div>

                  <div>
                    <label htmlFor="title" className="field-label">
                      这次要决定什么？ <span className="text-coral">*</span>
                    </label>
                    <input
                      id="title"
                      value={draft.title}
                      onChange={(event) => update("title", event.target.value)}
                      maxLength={80}
                      className="field text-base"
                      placeholder="例如：周六，去城外吃一顿"
                    />
                    <div className="mt-1.5 flex justify-between text-[10px] text-muted">
                      <span>短一点，具体一点。</span>
                      <span className="font-mono">{draft.title.length}/80</span>
                    </div>
                  </div>

                  <div>
                    <label htmlFor="description" className="field-label">
                      补充说明
                    </label>
                    <textarea
                      id="description"
                      value={draft.description}
                      onChange={(event) => update("description", event.target.value)}
                      maxLength={600}
                      className="field"
                      placeholder="为什么要聚、在哪里、有什么需要提前知道的。"
                    />
                  </div>

                  <div>
                    <span className="field-label">分类</span>
                    <div className="flex flex-wrap gap-2">
                      {CATEGORIES.map((category) => (
                        <button
                          key={category.value}
                          type="button"
                          onClick={() => update("category", category.value)}
                          className={`border px-3 py-1.5 text-[12px] transition-colors ${
                            draft.category === category.value
                              ? "border-ink bg-ink text-paper"
                              : "border-line-strong bg-paper text-ink-2 hover:border-ink"
                          }`}
                        >
                          {category.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <span className="field-label">封面配色</span>
                    <div className="flex flex-wrap gap-2">
                      {COVER_THEMES.map((theme) => (
                        <button
                          key={theme.value}
                          type="button"
                          onClick={() => update("theme", theme.value)}
                          className={`flex items-center gap-2 border px-2 py-1.5 text-[11px] transition-colors ${
                            draft.theme === theme.value
                              ? "border-ink bg-paper"
                              : "border-line bg-paper/50 hover:border-ink"
                          }`}
                        >
                          <span
                            className="h-4 w-4 border border-ink/20"
                            style={{ background: theme.swatch }}
                          />
                          {theme.label}
                        </button>
                      ))}
                    </div>
                    <div className="mt-2 flex items-center gap-2">
                      <ImageIcon size={12} className="shrink-0 text-muted" />
                      <input
                        value={draft.coverImage}
                        onChange={(event) => update("coverImage", event.target.value)}
                        className="field h-8 flex-1 py-0 text-[11px]"
                        placeholder="可选：填入图片链接，替换生成封面"
                      />
                    </div>
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <span className="field-label">投票方式</span>
                      <div className="grid grid-cols-2 border border-line-strong bg-paper p-0.5">
                        {[
                          { value: "single" as const, label: "每类单选" },
                          { value: "multiple" as const, label: "可多选" },
                        ].map((option) => (
                          <button
                            key={option.value}
                            type="button"
                            onClick={() => update("voteType", option.value)}
                            className={`px-2 py-1.5 text-[11px] transition-colors ${
                              draft.voteType === option.value ? "bg-ink text-paper" : "text-muted"
                            }`}
                          >
                            {option.label}
                          </button>
                        ))}
                      </div>
                    </div>
                    <div>
                      <label htmlFor="deadline" className="field-label">
                        截止时间（可选）
                      </label>
                      <input
                        id="deadline"
                        type="datetime-local"
                        value={draft.deadline}
                        onChange={(event) => update("deadline", event.target.value)}
                        className="field text-[12px]"
                      />
                    </div>
                  </div>

                  <label className="flex cursor-pointer items-start gap-3 border border-line bg-paper p-3">
                    <input
                      type="checkbox"
                      checked={draft.allowSuggestions}
                      onChange={(event) => update("allowSuggestions", event.target.checked)}
                      className="mt-0.5 h-4 w-4 accent-[#171714]"
                    />
                    <span>
                      <span className="block text-[12px] font-medium">开放提议</span>
                      <span className="mt-0.5 block text-[11px] leading-5 text-muted">
                        参与者可以补充「周五晚上也可以」之类的建议，并附议别人的提议。
                      </span>
                    </span>
                  </label>
                </div>
              )}

              {step === 1 && (
                <div className="space-y-7">
                  <section>
                    <div className="mb-3 flex items-center justify-between">
                      <div>
                        <p className="field-label mb-0 flex items-center gap-1.5">
                          <Clock3 size={13} /> 时间选项 <span className="text-coral">*</span>
                        </p>
                        <p className="mt-1 text-[10px] text-muted">给出 2–3 个可选时间，至少一个。</p>
                      </div>
                      <button
                        type="button"
                        onClick={() =>
                          update("times", [
                            ...draft.times,
                            { id: uid("t"), start: "", end: "", note: "" },
                          ])
                        }
                        className="btn btn-ghost btn-sm"
                      >
                        <Plus size={12} />
                        添加时间
                      </button>
                    </div>

                    <div className="space-y-2.5">
                      {draft.times.map((time, index) => (
                        <div key={time.id} className="border border-line bg-paper p-3">
                          <div className="mb-2 flex items-center justify-between">
                            <span className="text-[11px] text-muted">时间 {index + 1}</span>
                            {draft.times.length > 1 && (
                              <button
                                type="button"
                                onClick={() =>
                                  update(
                                    "times",
                                    draft.times.filter((item) => item.id !== time.id)
                                  )
                                }
                                className="text-muted transition-colors hover:text-coral"
                                aria-label="删除时间选项"
                              >
                                <Trash2 size={13} />
                              </button>
                            )}
                          </div>
                          <div className="grid gap-2 sm:grid-cols-2">
                            <label className="block">
                              <span className="mb-1 block text-[11px] text-muted">
                                开始
                              </span>
                              <input
                                type="datetime-local"
                                value={time.start}
                                onChange={(event) =>
                                  update(
                                    "times",
                                    draft.times.map((item) =>
                                      item.id === time.id
                                        ? { ...item, start: event.target.value }
                                        : item
                                    )
                                  )
                                }
                                className="field py-1.5 text-[11px]"
                              />
                            </label>
                            <label className="block">
                              <span className="mb-1 block text-[11px] text-muted">
                                结束（可选）
                              </span>
                              <input
                                type="datetime-local"
                                value={time.end}
                                onChange={(event) =>
                                  update(
                                    "times",
                                    draft.times.map((item) =>
                                      item.id === time.id
                                        ? { ...item, end: event.target.value }
                                        : item
                                    )
                                  )
                                }
                                className="field py-1.5 text-[11px]"
                              />
                            </label>
                          </div>
                          <input
                            value={time.note}
                            onChange={(event) =>
                              update(
                                "times",
                                draft.times.map((item) =>
                                  item.id === time.id ? { ...item, note: event.target.value } : item
                                )
                              )
                            }
                            className="field mt-2 h-8 py-0 text-[11px]"
                            placeholder="备注（可选）：例如 17:22 日落"
                            maxLength={120}
                          />
                        </div>
                      ))}
                    </div>
                  </section>

                  <section>
                    <div className="mb-3 flex items-center justify-between">
                      <div>
                        <p className="field-label mb-0 flex items-center gap-1.5">
                          <MapPin size={13} /> 地点选项
                        </p>
                        <p className="mt-1 text-[10px] text-muted">不想让大家选地点？留空即可。</p>
                      </div>
                      <button
                        type="button"
                        onClick={() =>
                          update("places", [...draft.places, { id: uid("p"), label: "", note: "" }])
                        }
                        className="btn btn-ghost btn-sm"
                      >
                        <Plus size={12} />
                        添加地点
                      </button>
                    </div>

                    <div className="space-y-2.5">
                      {draft.places.map((place, index) => (
                        <div key={place.id} className="border border-line bg-paper p-3">
                          <div className="mb-2 flex items-center justify-between">
                            <span className="text-[11px] text-muted">地点 {index + 1}</span>
                            {draft.places.length > 1 && (
                              <button
                                type="button"
                                onClick={() =>
                                  update(
                                    "places",
                                    draft.places.filter((item) => item.id !== place.id)
                                  )
                                }
                                className="text-muted transition-colors hover:text-coral"
                                aria-label="删除地点选项"
                              >
                                <Trash2 size={13} />
                              </button>
                            )}
                          </div>
                          <div className="grid gap-2 sm:grid-cols-[1fr_1fr]">
                            <input
                              value={place.label}
                              onChange={(event) =>
                                update(
                                  "places",
                                  draft.places.map((item) =>
                                    item.id === place.id
                                      ? { ...item, label: event.target.value }
                                      : item
                                  )
                                )
                              }
                              className="field py-1.5 text-[12px]"
                              placeholder="地点名称，如：梧桐小院"
                              maxLength={80}
                            />
                            <input
                              value={place.note}
                              onChange={(event) =>
                                update(
                                  "places",
                                  draft.places.map((item) =>
                                    item.id === place.id
                                      ? { ...item, note: event.target.value }
                                      : item
                                  )
                                )
                              }
                              className="field py-1.5 text-[11px]"
                              placeholder="备注：有院子 · 人均 168"
                              maxLength={120}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </section>

                  <section className="border-t border-line pt-6">
                    <p className="field-label flex items-center gap-1.5">
                      <MapPin size={13} /> 集合点信息（可选）
                    </p>
                    <p className="mb-3 text-[10px] text-muted">
                      这里填的是最终集合地点，和上面的「地点选项」不冲突。
                    </p>
                    <div className="grid gap-2 sm:grid-cols-2">
                      <input
                        value={draft.locationName}
                        onChange={(event) => update("locationName", event.target.value)}
                        className="field py-1.5 text-[12px]"
                        placeholder="地点名称"
                        maxLength={80}
                      />
                      <input
                        value={draft.locationAddress}
                        onChange={(event) => update("locationAddress", event.target.value)}
                        className="field py-1.5 text-[12px]"
                        placeholder="详细地址"
                        maxLength={160}
                      />
                    </div>
                  </section>
                </div>
              )}

              {step === 2 && (
                <div>
                  <div className="mb-4 flex items-start justify-between gap-3">
                    <div>
                      <p className="field-label mb-0 flex items-center gap-1.5">
                        <MessageSquare size={13} /> 自定义问题
                      </p>
                      <p className="mt-1 text-[10px] text-muted">
                        忌口、交通、是否带伴。最多 10 个，全部可选。
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() =>
                        update("fields", [
                          ...draft.fields,
                          {
                            id: uid("f"),
                            label: "",
                            type: "text",
                            required: false,
                            placeholder: "",
                            optionsText: "",
                          },
                        ])
                      }
                      className="btn btn-ghost btn-sm shrink-0"
                    >
                      <Plus size={12} />
                      添加问题
                    </button>
                  </div>

                  {draft.fields.length === 0 ? (
                    <div className="border border-dashed border-line-strong bg-paper/60 px-5 py-12 text-center">
                      <p className="font-display text-xl">暂时没有问题</p>
                      <p className="mx-auto mt-2 max-w-xs text-[12px] leading-5 text-muted">
                        可以留空。若需收集忌口、交通或人数，请在此添加问题。
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {draft.fields.map((field, index) => (
                        <div key={field.id} className="border border-line bg-paper p-3.5">
                          <div className="mb-2 flex items-center justify-between gap-2">
                            <span className="text-[11px] text-muted">
                              问题 {index + 1}
                            </span>
                            <div className="flex items-center gap-3">
                              <select
                                value={field.type}
                                onChange={(event) =>
                                  update(
                                    "fields",
                                    draft.fields.map((item) =>
                                      item.id === field.id
                                        ? { ...item, type: event.target.value as FieldDraft["type"] }
                                        : item
                                    )
                                  )
                                }
                                className="border border-line-strong bg-surface px-1.5 py-1 text-[11px]"
                                aria-label="问题类型"
                              >
                                <option value="text">文本</option>
                                <option value="textarea">长文本</option>
                                <option value="number">数字</option>
                                <option value="select">单选</option>
                                <option value="multi">多选</option>
                              </select>
                              <button
                                type="button"
                                onClick={() =>
                                  update(
                                    "fields",
                                    draft.fields.filter((item) => item.id !== field.id)
                                  )
                                }
                                className="text-muted hover:text-coral"
                                aria-label="删除问题"
                              >
                                <Trash2 size={13} />
                              </button>
                            </div>
                          </div>

                          <input
                            value={field.label}
                            onChange={(event) =>
                              update(
                                "fields",
                                draft.fields.map((item) =>
                                  item.id === field.id
                                    ? { ...item, label: event.target.value }
                                    : item
                                )
                              )
                            }
                            className="field py-1.5 text-[12px]"
                            placeholder="问题，例如：有没有忌口？"
                            maxLength={60}
                          />

                          {(field.type === "select" || field.type === "multi") && (
                            <input
                              value={field.optionsText}
                              onChange={(event) =>
                                update(
                                  "fields",
                                  draft.fields.map((item) =>
                                    item.id === field.id
                                      ? { ...item, optionsText: event.target.value }
                                      : item
                                  )
                                )
                              }
                              className="field mt-2 py-1.5 text-[11px]"
                              placeholder="选项，用逗号分隔：没有, 不吃辣, 素食"
                            />
                          )}

                          <div className="mt-2 flex items-center justify-between gap-2">
                            <input
                              value={field.placeholder}
                              onChange={(event) =>
                                update(
                                  "fields",
                                  draft.fields.map((item) =>
                                    item.id === field.id
                                      ? { ...item, placeholder: event.target.value }
                                      : item
                                  )
                                )
                              }
                              className="field h-8 flex-1 py-0 text-[11px]"
                              placeholder="输入提示（可选）"
                            />
                            <label className="flex shrink-0 cursor-pointer items-center gap-1.5 text-[10px] text-muted">
                              <input
                                type="checkbox"
                                checked={field.required}
                                onChange={(event) =>
                                  update(
                                    "fields",
                                    draft.fields.map((item) =>
                                      item.id === field.id
                                        ? { ...item, required: event.target.checked }
                                        : item
                                    )
                                  )
                                }
                                className="h-3.5 w-3.5 accent-[#171714]"
                              />
                              必填
                            </label>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {step === 3 && (
                <div className="space-y-6">
                  <section>
                    <p className="field-label flex items-center gap-1.5">
                      <Wallet size={13} /> 人均费用（可选）
                    </p>
                    <p className="mb-3 text-[10px] text-muted">
                      填了费用之后，控制台会出现「已支付」勾选和收款进度。
                    </p>
                    <div className="grid gap-2 sm:grid-cols-[160px_1fr]">
                      <div className="relative">
                        <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 font-display text-lg">
                          ¥
                        </span>
                        <input
                          value={draft.feeAmount}
                          onChange={(event) => update("feeAmount", event.target.value)}
                          inputMode="decimal"
                          className="field pl-8 text-[13px]"
                          placeholder="0"
                        />
                      </div>
                      <input
                        value={draft.feeNote}
                        onChange={(event) => update("feeNote", event.target.value)}
                        className="field text-[12px]"
                        placeholder="费用说明：含餐位与酒水，多退少补"
                        maxLength={120}
                      />
                    </div>
                  </section>

                  <section className="border border-line bg-paper p-4">
                    <div className="mb-3 flex items-center justify-between border-b border-line pb-3">
                      <p className="text-[13px] font-medium">发布前检查</p>
                    </div>
                    <dl className="space-y-2.5 text-[12px]">
                      <div className="flex justify-between gap-4">
                        <dt className="text-muted">标题</dt>
                        <dd className="max-w-[65%] text-right font-medium">
                          {draft.title || "尚未填写"}
                        </dd>
                      </div>
                      <div className="flex justify-between gap-4">
                        <dt className="text-muted">时间选项</dt>
                        <dd className="text-right">{validTimes.length} 个</dd>
                      </div>
                      <div className="flex justify-between gap-4">
                        <dt className="text-muted">地点选项</dt>
                        <dd className="text-right">{validPlaces.length} 个</dd>
                      </div>
                      <div className="flex justify-between gap-4">
                        <dt className="text-muted">自定义问题</dt>
                        <dd className="text-right">{draft.fields.length} 个</dd>
                      </div>
                      <div className="flex justify-between gap-4">
                        <dt className="text-muted">截止时间</dt>
                        <dd className="text-right">
                          {draft.deadline ? draft.deadline.replace("T", " ") : "未设置"}
                        </dd>
                      </div>
                      <div className="flex justify-between gap-4">
                        <dt className="text-muted">参与费用</dt>
                        <dd className="text-right">
                          {previewFee !== null ? `¥${previewFee} / 人` : "免费"}
                        </dd>
                      </div>
                      <div className="flex justify-between gap-4">
                        <dt className="text-muted">开放提议</dt>
                        <dd className="text-right">{draft.allowSuggestions ? "是" : "否"}</dd>
                      </div>
                    </dl>
                  </section>

                  <div className="flex items-start gap-2.5 border border-acid-deep/50 bg-acid-soft px-3.5 py-3">
                    <Check size={15} className="mt-0.5 shrink-0" />
                    <div>
                      <p className="text-[12px] font-medium">发布后会发生什么</p>
                      <p className="mt-1 text-[11px] leading-5 text-ink-2/80">
                        你会得到一个分享链接和二维码。参与者无需注册，打开即可投票。你可以在控制台随时关闭投票、标记收款或导出 CSV。
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => void publish()}
                    disabled={submitting}
                    className="btn btn-primary w-full py-3"
                  >
                    {submitting ? <Loader2 size={15} className="animate-spin" /> : <ArrowRight size={15} />}
                    {submitting ? "正在发布…" : "发布并生成分享链接"}
                  </button>
                </div>
              )}

              {step < 3 && (
                <div className="mt-7 flex items-center justify-between border-t border-line pt-5">
                  <button
                    type="button"
                    onClick={goBack}
                    disabled={step === 0}
                    className="btn btn-ghost btn-sm"
                  >
                    <ArrowLeft size={13} />
                    上一步
                  </button>
                  <button type="button" onClick={goNext} className="btn btn-dark">
                    下一步
                    <ArrowRight size={14} />
                  </button>
                </div>
              )}

              {step === 3 && (
                <div className="mt-7 flex items-center justify-between border-t border-line pt-5">
                  <button type="button" onClick={goBack} className="btn btn-ghost btn-sm">
                    <ArrowLeft size={13} />
                    上一步
                  </button>
                  <Link href="/app" className="text-[12px] text-muted hover:text-ink">
                    稍后再发
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>

        <aside className="hidden xl:block">
          <div className="sticky top-[88px]">
            <div className="mb-3 flex items-center justify-between">
              <p className="text-[12px] text-muted">预览</p>
            </div>

            <CoverPoster
              variant="card"
              title={draft.title || "你的决策标题"}
              category={draft.category}
              theme={draft.theme}
              coverImage={draft.coverImage.trim() || null}
              deadline={previewDeadline}
              organizer={userName}
              fee={previewFee}
              shareCode="PREVIEW"
              status="open"
            />

            <div className="mt-4 border border-line bg-surface p-4">
              <p className="mb-3 text-[12px] text-muted">内容概览</p>
              <div className="space-y-2 text-[11px]">
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-1.5 text-muted">
                    <CalendarDays size={11} /> 时间选项
                  </span>
                  <span className="font-mono">{validTimes.length}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-1.5 text-muted">
                    <MapPin size={11} /> 地点选项
                  </span>
                  <span className="font-mono">{validPlaces.length}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-1.5 text-muted">
                    <MessageSquare size={11} /> 自定义问题
                  </span>
                  <span className="font-mono">{draft.fields.length}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-1.5 text-muted">
                    <Wallet size={11} /> 人均费用
                  </span>
                  <span className="font-mono">{previewFee !== null ? `¥${previewFee}` : "免费"}</span>
                </div>
              </div>
            </div>

            <p className="mt-3 text-[10px] leading-5 text-muted">
              封面根据标题、分类与配色实时生成。
            </p>
          </div>
        </aside>
      </div>
    </div>
  );
}
