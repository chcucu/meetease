export default function MeetEaseLogo({ size = "md", showText = true }: { size?: "sm" | "md" | "lg"; showText?: boolean }) {
  const dims = { sm: 28, md: 36, lg: 52 };
  const d = dims[size];
  return (
    <div className="flex items-center gap-2.5 group">
      <div
        className="relative flex items-center justify-center rounded-2xl transition-all duration-300 group-hover:scale-105"
        style={{ width: d + 4, height: d + 4 }}
      >
        {/* 背景光晕 */}
        <div
          className="absolute inset-0 rounded-2xl bg-gradient-to-br from-meet-gold-300/40 to-meet-400/40 blur-md transition-all duration-300 group-hover:blur-xl"
          aria-hidden="true"
        />
        {/* Logo 图标 */}
        <svg viewBox="0 0 48 48" className="relative" style={{ width: d, height: d }}>
          <defs>
            <linearGradient id="logo-bg" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#38bdf8" />
              <stop offset="50%" stopColor="#0ea5e9" />
              <stop offset="100%" stopColor="#0284c7" />
            </linearGradient>
            <linearGradient id="logo-sun" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#fbbf24" />
              <stop offset="100%" stopColor="#f59e0b" />
            </linearGradient>
          </defs>
          {/* 圆角方形底 */}
          <rect x="2" y="2" width="44" height="44" rx="12" fill="url(#logo-bg)" />
          {/* 太阳 */}
          <circle cx="24" cy="24" r="10" fill="url(#logo-sun)" />
          {/* 太阳光芒 */}
          {[0, 45, 90, 135, 180, 225, 270, 315].map((angle) => (
            <line
              key={angle}
              x1={24 + 12 * Math.cos((angle * Math.PI) / 180)}
              y1={24 + 12 * Math.sin((angle * Math.PI) / 180)}
              x2={24 + 16 * Math.cos((angle * Math.PI) / 180)}
              y2={24 + 16 * Math.sin((angle * Math.PI) / 180)}
              stroke="#fbbf24"
              strokeWidth="2.5"
              strokeLinecap="round"
            />
          ))}
          {/* 笑脸 */}
          <path d="M18 26 Q24 32 30 26" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" />
          <circle cx="20" cy="21" r="1.5" fill="#fff" />
          <circle cx="28" cy="21" r="1.5" fill="#fff" />
        </svg>
      </div>
      {showText && (
        <span className="font-display text-lg sm:text-xl tracking-wide">
          <span className="text-meet-700">MeetEase</span>
          <span className="text-meet-gold-500"> 聚会</span>
        </span>
      )}
    </div>
  );
}