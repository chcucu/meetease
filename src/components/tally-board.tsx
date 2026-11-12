"use client";

import { useMemo, useState } from "react";
import { ChevronDown, Clock3, MapPin } from "lucide-react";
import type { PublicOption } from "@/lib/types";

function percentage(votes: number, voters: number) {
  if (voters <= 0 || votes <= 0) return 0;
  return Math.min(100, Math.round((votes / voters) * 100));
}

export function TallyBoard({
  options,
  voters,
  emptyHint = "还没有人投票。把链接发出去，让第一个答案出现。",
  compact = false,
}: {
  options: PublicOption[];
  voters: number;
  emptyHint?: string;
  compact?: boolean;
}) {
  const [expanded, setExpanded] = useState<string | null>(null);

  const groups = useMemo(() => {
    const build = (kind: "time" | "place", title: string, Icon: typeof Clock3) => {
      const items = options
        .filter((option) => option.kind === kind)
        .slice()
        .sort((a, b) => b.votes - a.votes);
      return { kind, title, Icon, items, leadingId: items.find((item) => item.votes > 0)?.id ?? null };
    };
    return [
      build("time", "时间", Clock3),
      build("place", "地点", MapPin),
    ].filter((group) => group.items.length > 0);
  }, [options]);

  if (options.length === 0) {
    return (
      <div className="border border-dashed border-line-strong bg-surface/60 px-5 py-12 text-center">
        <p className="font-display text-2xl">还没有可投票的选项</p>
        <p className="mx-auto mt-2 max-w-sm text-[12px] leading-6 text-muted">{emptyHint}</p>
      </div>
    );
  }

  return (
    <div className={compact ? "space-y-7" : "space-y-9"}>
      {groups.map((group) => (
        <section key={group.kind}>
          <div className="mb-2.5 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <group.Icon size={12} className="text-muted" />
              <span className="label text-[9px]">{group.title}</span>
            </div>
            <span className="font-mono text-[9px] tracking-wide text-muted">
              {group.items.length} 个选项
            </span>
          </div>

          <div className="space-y-2">
            {group.items.map((option, index) => {
              const percent = percentage(option.votes, voters);
              const leading = option.id === group.leadingId;
              const open = expanded === option.id;
              const hasVoters = option.voterNames.length > 0;

              return (
                <div
                  key={option.id}
                  className={`border bg-surface transition-colors ${
                    leading ? "border-ink shadow-[3px_3px_0_rgba(23,23,20,0.12)]" : "border-line"
                  }`}
                >
                  <button
                    type="button"
                    onClick={() => setExpanded(open ? null : option.id)}
                    aria-expanded={open}
                    className="w-full px-4 py-4 text-left"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex min-w-0 items-start gap-3">
                        <span
                          className={`mt-0.5 font-mono text-[10px] leading-none ${
                            leading ? "text-ink" : "text-muted"
                          }`}
                        >
                          {String(index + 1).padStart(2, "0")}
                        </span>
                        <div className="min-w-0">
                          <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                            <p className="text-[13px] font-medium leading-5">{option.label}</p>
                            {leading && (
                              <span className="inline-flex items-center border border-ink bg-acid px-1.5 py-0.5 font-mono text-[8px] uppercase tracking-[0.12em]">
                                领先
                              </span>
                            )}
                          </div>
                          {option.note && (
                            <p className="mt-0.5 line-clamp-1 text-[11px] text-muted">{option.note}</p>
                          )}
                        </div>
                      </div>

                      <div className="flex shrink-0 items-baseline gap-1">
                        <span className="font-display text-[30px] leading-none">{option.votes}</span>
                        <span className="text-[10px] text-muted">票</span>
                      </div>
                    </div>

                    <div className="mt-3 flex items-center gap-3">
                      <div className="h-2 flex-1 overflow-hidden bg-paper-deep">
                        <div
                          className={`vote-bar h-full ${leading ? "bg-ink" : "bg-ink/35"}`}
                          style={{ width: `${percent}%` }}
                        />
                      </div>
                      <span className="w-8 shrink-0 text-right font-mono text-[9px] text-muted">
                        {percent}%
                      </span>
                      {hasVoters && (
                        <ChevronDown
                          size={13}
                          className={`shrink-0 text-muted transition-transform ${
                            open ? "rotate-180" : ""
                          }`}
                        />
                      )}
                    </div>
                  </button>

                  {open && hasVoters && (
                    <div className="ticker-in flex flex-wrap gap-1.5 border-t border-line bg-paper/60 px-4 py-3">
                      {option.voterNames.map((name, voterIndex) => (
                        <span
                          key={`${name}-${voterIndex}`}
                          className="border border-line-strong bg-surface px-2 py-1 text-[10px]"
                        >
                          {name}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </section>
      ))}
    </div>
  );
}
