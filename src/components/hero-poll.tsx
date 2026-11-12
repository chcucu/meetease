"use client";

import { useState } from "react";
import { Check, Share2, Users } from "lucide-react";
import { AvatarStack } from "./ui";

type DemoOption = { id: string; label: string; note: string; votes: number };

const INITIAL: DemoOption[] = [
  { id: "sat-1730", label: "周六 17:30", note: "看完日落刚好", votes: 5 },
  { id: "sat-1900", label: "周六 19:00", note: "下班晚也来得及", votes: 2 },
  { id: "sun-1200", label: "周日 12:00", note: "午市更安静", votes: 1 },
];

const NAMES = ["阿策", "Momo", "周周", "Ken", "小满", "阿栗", "Nina", "老丁", "羽佳"];

export function HeroPoll() {
  const [options, setOptions] = useState(INITIAL);
  const [selected, setSelected] = useState<string | null>(null);
  const [participants, setParticipants] = useState(8);
  const [flash, setFlash] = useState<string | null>(null);

  const maxVotes = Math.max(...options.map((option) => option.votes), 1);

  function choose(id: string) {
    setOptions((current) =>
      current.map((option) => {
        if (option.id === selected) return { ...option, votes: Math.max(0, option.votes - 1) };
        if (option.id === id) return { ...option, votes: option.votes + 1 };
        return option;
      })
    );
    setSelected((current) => (current === id ? null : id));
    if (selected !== id) {
      setFlash(id);
      setTimeout(() => setFlash(null), 1200);
    }
  }

  function simulateFriend() {
    const index = Math.floor(Math.random() * options.length);
    const picked = options[index];
    setOptions((current) =>
      current.map((option) =>
        option.id === picked.id ? { ...option, votes: option.votes + 1 } : option
      )
    );
    setParticipants((value) => value + 1);
    setFlash(picked.id);
    setTimeout(() => setFlash(null), 1500);
  }

  return (
    <div className="relative">
      <div className="absolute -left-5 top-16 hidden rotate-[-7deg] border border-ink bg-acid px-3 py-1.5 font-mono text-[10px] tracking-[0.12em] shadow-[2px_2px_0_#171714] lg:block">
        无需注册 / 0 SIGN-UP
      </div>
      <div className="absolute -right-4 bottom-20 z-10 hidden rotate-[5deg] items-center gap-2 border border-ink bg-surface px-3 py-2 shadow-[2px_2px_0_#171714] lg:flex">
        <span className="live-dot" />
        <span className="font-mono text-[10px] tracking-[0.12em]">SSE · 实时同步</span>
      </div>

      <div className="relative border border-ink bg-surface shadow-[8px_8px_0_rgba(23,23,20,0.92)]">
        <div className="flex items-start justify-between border-b border-line px-5 py-4">
          <div>
            <p className="label mb-1.5 text-[9px]">LIVE DECISION / 进行中</p>
            <h3 className="font-display text-[24px] leading-tight tracking-tight">周六，去城外吃一顿</h3>
          </div>
          <div className="text-right">
            <p className="font-display text-[26px] leading-none">{participants}</p>
            <p className="label mt-1 text-[8px]">人已参与</p>
          </div>
        </div>

        <div className="px-5 pb-5 pt-4">
          <div className="mb-3 flex items-center justify-between">
            <p className="label text-[9px]">选一个时间 / TIME</p>
            <p className="font-mono text-[9px] text-muted">单选</p>
          </div>

          <div className="space-y-2.5">
            {options.map((option) => {
              const isSelected = selected === option.id;
              return (
                <button
                  key={option.id}
                  type="button"
                  onClick={() => choose(option.id)}
                  className={`group relative w-full overflow-hidden border px-3.5 py-3 text-left transition-all duration-200 ${
                    isSelected
                      ? "border-ink bg-acid-soft shadow-[2px_2px_0_#171714]"
                      : "border-line-strong bg-paper/40 hover:border-ink hover:bg-paper"
                  }`}
                  aria-pressed={isSelected}
                >
                  <div
                    className={`vote-bar absolute inset-y-0 left-0 ${
                      isSelected ? "bg-acid/70" : "bg-paper-deep/70"
                    }`}
                    style={{ width: `${Math.max((option.votes / maxVotes) * 100, 6)}%` }}
                    aria-hidden="true"
                  />
                  <div className="relative flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2.5">
                      <span
                        className={`flex h-4 w-4 shrink-0 items-center justify-center rounded-full border transition-colors ${
                          isSelected ? "border-ink bg-ink text-acid" : "border-line-strong bg-surface"
                        }`}
                      >
                        {isSelected && <Check size={10} strokeWidth={3} />}
                      </span>
                      <span>
                        <span className="block text-[13px] font-medium">{option.label}</span>
                        <span className="block text-[10px] text-muted">{option.note}</span>
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      {flash === option.id && (
                        <span className="ticker-in font-mono text-[8px] text-coral">+1</span>
                      )}
                      <span className="font-display text-lg leading-none">{option.votes}</span>
                      <span className="text-[9px] text-muted">票</span>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>

          <div className="mt-4 flex items-center justify-between border-t border-line pt-3.5">
            <div className="flex items-center gap-2">
              <AvatarStack names={NAMES.slice(0, participants)} max={4} />
              <span className="font-mono text-[9px] text-muted">{Math.max(0, participants - 4)} 人</span>
            </div>
            <button
              type="button"
              onClick={simulateFriend}
              className="flex items-center gap-1.5 text-[11px] text-ink-2 transition-colors hover:text-ink"
            >
              <Users size={12} />
              模拟一位朋友投票
            </button>
          </div>

          <div className="mt-3 flex items-center justify-between bg-ink px-3.5 py-2.5 text-paper">
            <span className="font-mono text-[9px] tracking-[0.1em]">
              {selected ? "已记录你的选择" : "点一个时间，看看会发生什么"}
            </span>
            <Share2 size={12} className="text-acid" />
          </div>
        </div>
      </div>

      <p className="mt-3 text-center font-mono text-[9px] tracking-[0.12em] text-muted">
        ↑ 这是一个可以点的演示 · 数据不会真的提交
      </p>
    </div>
  );
}
