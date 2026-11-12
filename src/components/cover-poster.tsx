import { formatDateTime } from "@/lib/format";
import { coverPalette } from "@/lib/cover";
import { categoryLabel } from "@/lib/types";
import { StatusPill } from "./ui";

function Pattern({ type, color }: { type: string; color: string }) {
  if (type === "rings") {
    return (
      <svg viewBox="0 0 100 100" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
        <g fill="none" stroke={color} strokeWidth="0.35" opacity="0.55">
          <circle cx="88" cy="74" r="16" />
          <circle cx="88" cy="74" r="25" />
          <circle cx="88" cy="74" r="34" />
          <circle cx="88" cy="74" r="43" />
        </g>
        <circle cx="88" cy="74" r="3" fill={color} opacity="0.8" />
      </svg>
    );
  }
  if (type === "arcs") {
    return (
      <svg viewBox="0 0 100 100" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
        <g fill="none" stroke={color} strokeWidth="0.5" opacity="0.45">
          <path d="M -8 108 A 78 78 0 0 1 86 22" />
          <path d="M -8 122 A 92 92 0 0 1 100 22" />
          <path d="M -8 136 A 106 106 0 0 1 114 22" />
        </g>
      </svg>
    );
  }
  if (type === "ticks") {
    return (
      <svg viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
        <g stroke={color} strokeWidth="0.35" opacity="0.5">
          {Array.from({ length: 31 }).map((_, i) => (
            <line key={i} x1={i * 3.4 + 1} y1={100} x2={i * 3.4 + 1} y2={82 - (i % 5) * 3} />
          ))}
        </g>
      </svg>
    );
  }
  return (
    <svg viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
      <defs>
        <pattern id="cover-grid" width="8" height="8" patternUnits="userSpaceOnUse">
          <path d="M 8 0 L 0 0 0 8" fill="none" stroke={color} strokeWidth="0.3" opacity="0.5" />
        </pattern>
      </defs>
      <rect width="100" height="100" fill="url(#cover-grid)" />
    </svg>
  );
}

export function CoverPoster({
  title,
  category,
  theme,
  coverImage,
  deadline,
  timeZone,
  organizer,
  fee,
  shareCode,
  status,
  variant = "card",
  className = "",
}: {
  title: string;
  category: string;
  theme: string;
  coverImage?: string | null;
  deadline?: string | null;
  timeZone?: string;
  organizer?: string;
  fee?: number | null;
  shareCode?: string;
  status?: string;
  variant?: "card" | "hero" | "strip";
  className?: string;
}) {
  const palette = coverPalette(theme);
  const hasImage = Boolean(coverImage);
  const ink = hasImage ? "#f7f4ea" : palette.ink;
  const muted = hasImage ? "rgba(247,244,234,0.72)" : palette.muted;
  const accent = hasImage ? "#d9ff43" : palette.accent;
  const hero = variant === "hero";
  const strip = variant === "strip";

  return (
    <div
      className={`relative isolate overflow-hidden border border-ink/15 ${
        hero
          ? "aspect-[4/3] sm:aspect-[16/9] lg:aspect-[2.02/1]"
          : strip
            ? "h-[148px]"
            : "aspect-[16/10]"
      } ${className}`}
      style={{ background: palette.background, color: ink }}
    >
      {hasImage ? (
        <>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={coverImage ?? ""}
            alt=""
            className="absolute inset-0 h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/25 to-black/10" />
        </>
      ) : (
        <div className="cover-pattern opacity-90">
          <Pattern type={palette.pattern} color={palette.ink} />
        </div>
      )}

      <div
        className={`relative flex h-full flex-col justify-between ${
          hero ? "p-5 sm:p-8 lg:p-10" : "p-4 sm:p-5"
        }`}
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <p
              className={`font-mono uppercase ${hero ? "text-[11px]" : "text-[10px]"}`}
              style={{ letterSpacing: "0.2em", color: muted }}
            >
              {categoryLabel(category)}
            </p>
          </div>
          {status && (
            <div className="[&_.chip]:border-current/30 [&_.chip]:bg-transparent [&_.chip]:text-current">
              <StatusPill status={status} deadline={deadline ?? null} />
            </div>
          )}
        </div>

        <div className={hero ? "max-w-[85%]" : "max-w-[92%]"}>
          <h2
            className={`font-display leading-[0.98] tracking-[-0.03em] ${
              hero
                ? "text-[clamp(2rem,5.6vw,4.5rem)]"
                : strip
                  ? "line-clamp-2 text-[clamp(1.15rem,1.5vw,1.45rem)] leading-[1.06]"
                  : "text-[clamp(1.3rem,2.1vw,1.75rem)] leading-[1.02]"
            }`}
          >
            {title}
          </h2>
        </div>

        <div className="flex items-end justify-between gap-4">
          <div className="space-y-1.5">
            {deadline && (
              <p
                className={`font-mono uppercase ${hero ? "text-[11px]" : "text-[10px]"}`}
                style={{ letterSpacing: "0.1em", color: muted }}
              >
                {formatDateTime(deadline, timeZone)} 截止
              </p>
            )}
            {(organizer || fee) && (
              <p className={`text-[11px] ${hero ? "sm:text-xs" : ""}`} style={{ color: muted }}>
                {organizer ? `发起人 ${organizer}` : ""}
                {organizer && fee ? " · " : ""}
                {fee ? `¥${fee} / 人` : ""}
              </p>
            )}
          </div>

          {shareCode && (
            <span
              className={`shrink-0 border px-2 py-1 font-mono uppercase ${
                hero ? "text-[11px]" : "text-[10px]"
              }`}
              style={{ borderColor: accent, color: accent, letterSpacing: "0.16em" }}
            >
              {shareCode}
            </span>
          )}
        </div>
      </div>

      {!hasImage && (
        <div
          className="pointer-events-none absolute -right-6 -top-10 font-display leading-none opacity-[0.07]"
          style={{ fontSize: hero ? "22rem" : "13rem", color: palette.ink }}
          aria-hidden="true"
        >
          Q
        </div>
      )}
    </div>
  );
}
