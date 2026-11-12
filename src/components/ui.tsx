import Link from "next/link";
import type { ReactNode } from "react";
import { ArrowRight } from "lucide-react";
import { deadlineState, initials } from "@/lib/format";
import { categoryShort } from "@/lib/types";

export function Avatar({
  name,
  size = "md",
  title,
}: {
  name: string;
  size?: "xs" | "sm" | "md" | "lg";
  title?: string;
}) {
  const palette = ["#ff5c35", "#a9c7ff", "#d9ff43", "#c9b8ff", "#e6d5b0"];
  const hash = Array.from(name).reduce((sum, char) => sum + char.charCodeAt(0), 0);
  const background = palette[hash % palette.length];
  const sizes = {
    xs: "h-6 w-6 text-[9px]",
    sm: "h-7 w-7 text-[10px]",
    md: "h-9 w-9 text-xs",
    lg: "h-12 w-12 text-sm",
  };
  return (
    <span
      title={title ?? name}
      className={`inline-flex shrink-0 items-center justify-center rounded-full border border-ink/15 font-mono font-medium text-ink ${sizes[size]}`}
      style={{ background }}
    >
      {initials(name)}
    </span>
  );
}

export function AvatarStack({ names, max = 5 }: { names: string[]; max?: number }) {
  const visible = names.slice(0, max);
  const rest = names.length - visible.length;
  return (
    <div className="flex items-center -space-x-2">
      {visible.map((name) => (
        <span key={name} className="rounded-full ring-2 ring-surface">
          <Avatar name={name} size="sm" />
        </span>
      ))}
      {rest > 0 && (
        <span className="flex h-7 w-7 items-center justify-center rounded-full border border-line-strong bg-paper font-mono text-[9px] text-muted ring-2 ring-surface">
          +{rest}
        </span>
      )}
    </div>
  );
}

export function StatusPill({
  status,
  deadline,
  className = "",
}: {
  status: string;
  deadline: string | null;
  className?: string;
}) {
  const state = deadlineState(deadline, status);
  if (state.state === "closed") {
    return (
      <span className={`chip border-ink bg-ink text-paper ${className}`}>
        <span className="inline-block h-1.5 w-1.5 rounded-full bg-paper/70" />
        已结束
      </span>
    );
  }
  if (state.state === "expired") {
    return (
      <span className={`chip border-line-strong bg-sand/60 text-ink ${className}`}>
        <span className="inline-block h-1.5 w-1.5 rounded-full bg-ink/50" />
        已截止
      </span>
    );
  }
  return (
    <span className={`chip border-ink/30 bg-acid-soft text-ink ${className}`}>
      <span className="live-dot" />
      投票中
    </span>
  );
}

export function SectionHeading({
  index,
  eyebrow,
  title,
  intro,
  action,
  dark = false,
}: {
  index: string;
  eyebrow: string;
  title: ReactNode;
  intro?: ReactNode;
  action?: { href: string; label: string };
  dark?: boolean;
}) {
  return (
    <div className="reveal mb-12 grid gap-6 border-b pb-6 md:mb-16 md:grid-cols-[1fr_auto] md:items-end"
      style={{ borderColor: dark ? "rgba(244,241,232,0.2)" : undefined }}
    >
      <div>
        <div className="mb-5 flex items-center gap-3">
          <span className={`font-mono text-[10px] ${dark ? "text-paper/50" : "text-muted"}`}>
            {index}
          </span>
          <span className={`h-px w-8 ${dark ? "bg-paper/30" : "bg-line-strong"}`} />
          <span className={`label ${dark ? "text-paper/60" : ""}`}>{eyebrow}</span>
        </div>
        <h2 className="section-title max-w-[720px]">{title}</h2>
      </div>
      <div className="md:pb-1">
        {intro && (
          <p
            className={`max-w-[330px] text-sm leading-6 ${
              dark ? "text-paper/60" : "text-muted"
            }`}
          >
            {intro}
          </p>
        )}
        {action && (
          <Link
            href={action.href}
            className={`mt-4 inline-flex items-center gap-1.5 text-sm ${dark ? "text-acid" : "text-ink"}`}
          >
            {action.label}
            <ArrowRight size={14} />
          </Link>
        )}
      </div>
    </div>
  );
}

export function CategoryTag({ category }: { category: string }) {
  return (
    <span className="font-mono text-[9px] tracking-[0.18em] opacity-60">
      {categoryShort(category)}
    </span>
  );
}

export function EmptyState({
  title,
  description,
  action,
}: {
  title: string;
  description: string;
  action?: { href: string; label: string };
}) {
  return (
    <div className="relative overflow-hidden border border-dashed border-line-strong bg-surface/60 px-6 py-16 text-center">
      <div className="paper-grid absolute inset-0 opacity-40" aria-hidden="true" />
      <div className="relative">
        <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-full border border-ink bg-acid">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <circle cx="8" cy="8" r="5" stroke="currentColor" strokeWidth="1.2" />
            <circle cx="16" cy="8" r="5" stroke="currentColor" strokeWidth="1.2" />
            <circle cx="12" cy="16" r="5" stroke="currentColor" strokeWidth="1.2" />
          </svg>
        </div>
        <h3 className="font-display text-2xl">{title}</h3>
        <p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-muted">{description}</p>
        {action && (
          <Link href={action.href} className="btn btn-primary mt-6">
            {action.label}
            <ArrowRight size={15} />
          </Link>
        )}
      </div>
    </div>
  );
}
