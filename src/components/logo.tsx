import Link from "next/link";

export function LogoMark({ size = 28 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      fill="none"
      aria-hidden="true"
      className="shrink-0"
    >
      <defs>
        <linearGradient id="quorum-mark" x1="4" y1="3" x2="28" y2="29" gradientUnits="userSpaceOnUse">
          <stop stopColor="#6C86FF" />
          <stop offset="1" stopColor="#3A55E6" />
        </linearGradient>
      </defs>
      <rect width="32" height="32" rx="9" fill="url(#quorum-mark)" />
      <circle cx="15" cy="15" r="6.6" stroke="#fff" strokeWidth="2.4" />
      <path d="M19.4 19.4 24 24" stroke="#fff" strokeWidth="2.4" strokeLinecap="round" />
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
      className={`group inline-flex items-center gap-2 ${className}`}
      aria-label="Quorum 首页"
    >
      <LogoMark />
      <span className="text-[21px] font-semibold leading-none tracking-[-0.035em]">
        Quorum
      </span>
    </Link>
  );
}
