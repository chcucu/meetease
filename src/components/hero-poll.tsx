"use client";

import { useMemo, useState } from "react";
import { Check, ChevronRight, Clock3, MapPin, Users } from "lucide-react";
import { AvatarStack } from "./ui";

const BASE_OPTIONS = [
  { id: "t1", time: "周六 17:30", place: "梧桐小院", votes: 5 },
  { id: "t2", time: "周六 19:00", place: "江边炭火", votes: 2 },
  { id: "t3", time: "周日 12:00", place: "梧桐小院", votes: 1 },
];

const NAMES = ["阿策", "Momo", "周周", "Ken", "小满", "阿栗", "Nina", "老丁"];

export function HeroPoll() {
  const [selected, setSelected] = useState<string>("t1");
  const [submitted, setSubmitted] = useState(false);

  const options = useMemo(
    () =>
      BASE_OPTIONS.map((option) =>
        submitted && option.id === selected ? { ...option, votes: option.votes + 1 } : option,
      ),
    [selected, submitted],
  );

  const total = options.reduce((sum, option) => sum + option.votes, 0);
  const max = Math.max(...options.map((option) => option.votes));

  return (
    <div className="relative">
      <div
        className="pointer-events-none absolute -inset-3 rounded-[22px] bg-gradient-to-b from-brand/10 to-transparent blur-xl"
        aria-hidden="true"
      />
      <div className="relative overflow-hidden rounded-2xl border border-line bg-surface shadow-[0_1px_2px_rgba(16,24,40,0.04),0_18px_48px_rgba(16,24,40,0.10)]">
        <div className="flex items-center justify-between border-b border-line px-5 py-4">
          <div className="flex items-center gap-2">
            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-brand-soft text-brand">
              <Users size={13} />
            </span>
            <div>
              <p className="text-[12.5px] font-medium leading-tight">周六，去城外吃一顿</p>
              <p className="text-[10.5px] text-muted">示例决策 · 无需注册</p>
            </div>
          </div>
          <span className="inline-flex items-center gap-1.5 rounded-full border border-brand/20 bg-brand-soft px-2 py-1 text-[10px] font-medium text-brand">
            <span className="live-dot" />
            投票中
          </span>
        </div>

        <div className="px-5 py-4">
          <div className="mb-3 flex items-center justify-between">
            <p className="text-[12px] font-medium">选一个时间</p>
            <p className="text-[10.5px] text-muted">截止周六 12:00</p>
          </div>

          <div className="space-y-2" role="group" aria-label="时间选项">
            {options.map((option) => {
              const active = selected === option.id;
              const percent = Math.round((option.votes / Math.max(total, 1)) * 100);
              return (
                <button
                  key={option.id}
                  type="button"
                  onClick={() => {
                    setSelected(option.id);
                    setSubmitted(false);
                  }}
                  aria-pressed={active}
                  className={`relative w-full overflow-hidden rounded-xl border px-3 py-2.5 text-left transition-all ${
                    active
                      ? "border-brand/45 bg-brand-soft/60"
                      : "border-line bg-surface hover:border-line-strong"
                  }`}
                >
                  <span
                    className={`absolute inset-y-0 left-0 ${
                      active ? "bg-brand/[0.07]" : "bg-paper"
                    }`}
                    style={{ width: `${option.votes === max || submitted ? percent : percent * 0.89}%` }}
                    aria-hidden="true"
                  />
                  <span className="relative flex items-center justify-between gap-3">
                    <span className="flex min-w-0 items-center gap-2.5">
                      <span
                        className={`flex h-4 w-4 shrink-0 items-center justify-center rounded-full border ${
                          active ? "border-brand bg-brand text-white" : "border-line-strong bg-surface"
                        }`}
                      >
                        {active && <Check size={9} strokeWidth={3.5} />}
                      </span>
                      <span className="truncate">
                        <span className="block text-[12.5px] font-medium leading-tight">
                          {option.time}
                        </span>
                        <span className="mt-0.5 flex items-center gap-1 text-[10.5px] text-muted">
                          <MapPin size={9} />
                          {option.place}
                        </span>
                      </span>
                    </span>
                    <span className="shrink-0 text-[11px] tabular-nums text-muted">
                      {option.votes} 票
                    </span>
                  </span>
                </button>
              );
            })}
          </div>

          <button
            type="button"
            onClick={() => setSubmitted(true)}
            disabled={submitted}
            className={`btn mt-3.5 w-full ${
              submitted ? "bg-brand-soft text-brand" : "btn-primary"
            }`}
          >
            {submitted ? (
              <>
                <Check size={14} strokeWidth={2.5} />
                已记录，结果已同步
              </>
            ) : (
              <>
                提交选择
                <ChevronRight size={14} />
              </>
            )}
          </button>

          <div className="mt-3.5 flex items-center justify-between border-t border-line pt-3">
            <div className="flex items-center gap-2">
              <AvatarStack names={NAMES} max={5} size="sm" />
              <span className="text-[10.5px] text-muted">{submitted ? 10 : 9} 人已参与</span>
            </div>
            <span className="inline-flex items-center gap-1 text-[10.5px] text-muted">
              <Clock3 size={10} />
              实时更新
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
