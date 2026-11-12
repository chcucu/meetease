import Link from "next/link";
import type { ReactNode } from "react";
import { ArrowRight } from "lucide-react";
import { deadlineState, initials } from "@/lib/format";

export function Avatar({
  name,
  size = "md",
  title,
}: {
  name: string;
  size?: "xs" | "sm" | "md" | "lg";
  title?: string;
}) {
  const palette = ["#dbe3ff", "#e6efff", "#efeaff", "#f4efe6", "#e8f3ee"];
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
      className={`inline-flex shrink-0 items-center justify-center rounded-full border border-line font-medium text-ink-2 ${sizes[size]}`}
      style={{ background }}
    >
      {initials(name)}
    </span>
  );
}

export function AvatarStack({
  names,
  max = 5,
  size = "sm",
}: {
  names: string[];
  max?: number;
  size?: "xs" | "sm" | "md";
}) {
  const visible = names.slice(0, max);
  const rest = names.length - visible.length;
  const ring =
    size === "xs" ? "h-6 w-6" : size === "md" ? "h-9 w-9" : "h-7 w-7";
  return (
    <div className="flex items-center -space-x-2">
      {visible.map((name) => (
        <span key={name} className="rounded-full ring-2 ring-surface">
          <Avatar name={name} size={size} />
        </span>
      ))}
      {rest > 0 && (
        <span
          className={`flex items-center justify-center rounded-full border border-line bg-paper text-[10px] text-muted ring-2 ring-surface ${ring}`}
        >
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
      <span className={`chip border-ink bg-ink text-white ${className}`}>
        <span className="inline-block h-1.5 w-1.5 rounded-full bg-white/70" />
        已结束
      </span>
    );
  }
  if (state.state === "expired") {
    return (
      <span className={`chip border-line-strong bg-sand text-ink-2 ${className}`}>
        <span className="inline-block h-1.5 w-1.5 rounded-full bg-ink/40" />
        已截止
      </span>
    );
  }
  return (
    <span className={`chip border-brand/20 bg-brand-soft text-brand ${className}`}>
      <span className="live-dot" />
      投票中
    </span>
  );
}

export function SectionHeading({
  title,
  intro,
  action,
  dark = false,
}: {
  title: ReactNode;
  intro?: ReactNode;
  action?: { href: string; label: string };
  dark?: boolean;
}) {
  return (
    <div
      className="reveal mb-12 grid gap-6 border-b pb-6 md:mb-16 md:grid-cols-[1fr_auto] md:items-end"
      style={{ borderColor: dark ? "rgba(255,255,255,0.14)" : undefined }}
    >
      <h2 className="section-title max-w-[760px]">{title}</h2>
      <div className="md:pb-1">
        {intro && (
          <p
            className={`max-w-[360px] text-[13px] leading-6 ${
              dark ? "text-white/55" : "text-muted"
            }`}
          >
            {intro}
          </p>
        )}
        {action && (
          <Link
            href={action.href}
            className={`mt-4 inline-flex items-center gap-1.5 text-[13px] ${
              dark ? "text-[#a9bcff] hover:text-white" : "text-ink hover:text-brand"
            }`}
          >
            {action.label}
            <ArrowRight size={14} />
          </Link>
        )}
      </div>
    </div>
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
    <div className="relative overflow-hidden rounded-xl border border-dashed border-line-strong bg-surface px-6 py-16 text-center">
      <div className="relative">
        <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-full bg-brand-soft text-brand">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <circle cx="8" cy="8" r="5" stroke="currentColor" strokeWidth="1.4" />
            <circle cx="16" cy="8" r="5" stroke="currentColor" strokeWidth="1.4" />
            <circle cx="12" cy="16" r="5" stroke="currentColor" strokeWidth="1.4" />
          </svg>
        </div>
        <h3 className="text-xl font-semibold tracking-[-0.02em]">{title}</h3>
        <p className="mx-auto mt-2 max-w-sm text-[13px] leading-6 text-muted">{description}</p>
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
