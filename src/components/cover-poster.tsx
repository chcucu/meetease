import { formatDateTime } from "@/lib/format";
import { coverPalette } from "@/lib/cover";
import { categoryLabel } from "@/lib/types";
import { StatusPill } from "./ui";

function Pattern({ type, color }: { type: string; color: string }) {
  if (type === "rings") {
    return (
      <svg viewBox="0 0 100 100" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
        <g fill="none" stroke={color} strokeWidth="0.32" opacity="0.3">
          <circle cx="88" cy="74" r="16" />
          <circle cx="88" cy="74" r="25" />
          <circle cx="88" cy="74" r="34" />
          <circle cx="88" cy="74" r="43" />
        </g>
        <circle cx="88" cy="74" r="2.6" fill={color} opacity="0.5" />
      </svg>
    );
  }
  if (type === "arcs") {
    return (
      <svg viewBox="0 0 100 100" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
        <g fill="none" stroke={color} strokeWidth="0.4" opacity="0.26">
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
        <g stroke={color} strokeWidth="0.3" opacity="0.24">
          {Array.from({ length: 31 }).map((_, i) => (
            <line key={i} x1={i * 3.4 + 1} y1={100} x2={i * 3.4 + 1} y2={84 - (i % 5) * 2.5} />
          ))}
        </g>
      </svg>
    );
  }
  return (
    <svg viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
      <defs>
        <pattern id="cover-grid" width="8" height="8" patternUnits="userSpaceOnUse">
          <path d="M 8 0 L 0 0 0 8" fill="none" stroke={color} strokeWidth="0.28" opacity="0.35" />
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
  const ink = hasImage ? "#ffffff" : palette.ink;
  const muted = hasImage ? "rgba(255,255,255,0.72)" : palette.muted;
  const accent = hasImage ? "#ffffff" : palette.accent;
  const hero = variant === "hero";
  const strip = variant === "strip";
  const Heading = hero ? "h1" : "h2";

  return (
    <div
      className={`relative isolate overflow-hidden border border-black/[0.06] ${
        hero ? "rounded-2xl" : "rounded-xl"
      } ${
        hero
          ? "aspect-[4/3] sm:aspect-[16/9] lg:aspect-[2.05/1]"
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
            loading={hero ? "eager" : "lazy"}
            decoding="async"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/25 to-black/[0.08]" />
        </>
      ) : (
        <>
          <div className="cover-pattern">
            <Pattern type={palette.pattern} color={palette.ink} />
          </div>
          <div
            className="pointer-events-none absolute -right-16 -top-20 h-64 w-64 rounded-full opacity-30 blur-3xl"
            style={{ background: palette.accent }}
            aria-hidden="true"
          />
        </>
      )}

      <div
        className={`relative flex h-full flex-col justify-between ${
          hero ? "p-5 sm:p-8 lg:p-10" : "p-4 sm:p-5"
        }`}
      >
        <div className="flex items-start justify-between gap-4">
          <p className={`inline-flex items-center gap-1.5 font-medium ${hero ? "text-[12px]" : "text-[11px]"}`}>
            <span
              className="inline-block h-1.5 w-1.5 rounded-full"
              style={{ background: accent }}
            />
            <span style={{ color: muted }}>{categoryLabel(category)}</span>
          </p>
          {status && (
            <div className="[&_.chip]:border-current/25 [&_.chip]:bg-white/10 [&_.chip]:text-current [&_.chip]:backdrop-blur-sm">
              <StatusPill status={status} deadline={deadline ?? null} />
            </div>
          )}
        </div>

        <div className={hero ? "max-w-[88%]" : "max-w-[92%]"}>
          <Heading
            className={`font-semibold tracking-[-0.035em] ${
              hero
                ? "text-[clamp(1.9rem,5.2vw,4.2rem)] leading-[1.05]"
                : strip
                  ? "line-clamp-2 text-[clamp(1.1rem,1.5vw,1.4rem)] leading-[1.12]"
                  : "text-[clamp(1.25rem,2.1vw,1.7rem)] leading-[1.12]"
            }`}
          >
            {title}
          </Heading>
        </div>

        <div className="flex items-end justify-between gap-4">
          <div className="space-y-1.5">
            {deadline && (
              <p
                className={`font-medium tabular-nums ${hero ? "text-[11.5px]" : "text-[10.5px]"}`}
                style={{ color: muted }}
              >
                {formatDateTime(deadline, timeZone)} 截止
              </p>
            )}
            {(organizer || fee) && (
              <p
                className={`${hero ? "text-[11.5px]" : "text-[10.5px]"}`}
                style={{ color: muted }}
              >
                {organizer ? `发起人 ${organizer}` : ""}
                {organizer && fee ? " · " : ""}
                {fee ? `¥${fee} / 人` : ""}
              </p>
            )}
          </div>

          {shareCode && (
            <span
              className={`shrink-0 rounded-full border px-2.5 py-1 font-medium tabular-nums ${
                hero ? "text-[11px]" : "text-[10.5px]"
              }`}
              style={{ borderColor: `${accent}55`, color: accent }}
            >
              {shareCode}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
