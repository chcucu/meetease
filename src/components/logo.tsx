import Link from "next/link";

export function LogoMark({ size = 28 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      fill="none"
      aria-hidden="true"
      style={{ mixBlendMode: "multiply" }}
    >
      <circle cx="11" cy="11" r="9" fill="#ff5c35" fillOpacity="0.92" />
      <circle cx="21" cy="11" r="9" fill="#a9c7ff" fillOpacity="0.92" />
      <circle cx="16" cy="21" r="9" fill="#d9ff43" fillOpacity="0.92" />
    </svg>
  );
}

export function Logo({
  href = "/",
  className = "",
}: {
  href?: string;
  className?: string;
}) {
  return (
    <Link
      href={href}
      className={`group inline-flex items-center gap-2.5 ${className}`}
      aria-label="Quorum 首页"
    >
      <LogoMark />
      <span className="font-display text-[25px] leading-none tracking-[-0.035em] lowercase">
        quorum
      </span>
    </Link>
  );
}
