import Link from "next/link";
import { ArrowLeft, Check } from "lucide-react";
import { Logo } from "./logo";
import { AvatarStack } from "./ui";

export function AuthLayout({
  children,
  asideTitle,
  asideBody,
  asideLabel,
}: {
  children: React.ReactNode;
  asideTitle: React.ReactNode;
  asideBody: string;
  asideLabel: string;
}) {
  return (
    <div className="grid min-h-screen lg:grid-cols-[1.02fr_0.98fr]">
      <div className="flex min-h-screen flex-col">
        <div className="flex items-center justify-between px-6 py-5 sm:px-10">
          <Logo />
          <Link
            href="/"
            className="flex items-center gap-1.5 text-[12px] text-muted transition-colors hover:text-ink"
          >
            <ArrowLeft size={13} />
            回到首页
          </Link>
        </div>

        <div className="flex flex-1 items-center justify-center px-6 py-10 sm:px-10">
          <div className="w-full max-w-[400px]">{children}</div>
        </div>

        <div className="px-6 py-5 sm:px-10">
          <p className="font-mono text-[9px] tracking-[0.12em] text-muted">
            QUORUM · GROUP DECISION SYSTEM · 2026
          </p>
        </div>
      </div>

      <aside className="section-ink relative hidden flex-col justify-between overflow-hidden border-l border-ink p-10 lg:flex">
        <div className="dotted-grid pointer-events-none absolute inset-0 opacity-40" aria-hidden="true" />
        <div
          className="pointer-events-none absolute -right-24 -top-24 h-[380px] w-[380px] rounded-full bg-acid/20 blur-3xl"
          aria-hidden="true"
        />

        <div className="relative flex items-center justify-between">
          <span className="label text-[9px] text-paper/50">{asideLabel}</span>
          <span className="flex items-center gap-2">
            <span className="live-dot" />
            <span className="font-mono text-[9px] tracking-wide text-paper/60">SYSTEM ONLINE</span>
          </span>
        </div>

        <div className="relative my-10">
          <h2 className="max-w-[420px] font-display text-[clamp(2.2rem,3.6vw,3.6rem)] leading-[1.02] tracking-[-0.03em]">
            {asideTitle}
          </h2>
          <p className="mt-5 max-w-[360px] text-sm leading-6 text-paper/55">{asideBody}</p>

          <div className="mt-10 max-w-[400px] border border-paper/20 bg-paper p-4 text-ink shadow-[5px_5px_0_rgba(217,255,67,0.85)]">
            <div className="flex items-start justify-between border-b border-line pb-3">
              <div>
                <p className="label text-[8px]">LIVE RESULT / DINNER</p>
                <p className="mt-1 font-display text-lg leading-tight">周六，去城外吃一顿</p>
              </div>
              <span className="chip border-line bg-paper text-[8px]">
                <span className="live-dot" /> LIVE
              </span>
            </div>
            <div className="mt-3 space-y-2">
              {[
                { label: "周六 17:30", width: "62%", count: 5 },
                { label: "周六 19:00", width: "25%", count: 2 },
                { label: "周日 12:00", width: "13%", count: 1 },
              ].map((row, index) => (
                <div key={row.label}>
                  <div className="mb-1 flex justify-between text-[10px]">
                    <span>{row.label}</span>
                    <span className="font-mono text-muted">{row.count}</span>
                  </div>
                  <div className="h-2 bg-paper-deep">
                    <div
                      className={`h-full ${index === 0 ? "bg-coral" : "bg-ink/20"}`}
                      style={{ width: row.width }}
                    />
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-4 flex items-center justify-between border-t border-line pt-3">
              <AvatarStack names={["阿策", "Momo", "周周", "Ken", "小满"]} max={5} />
              <span className="font-mono text-[8px] text-muted">9 人已参与</span>
            </div>
          </div>
        </div>

        <div className="relative grid grid-cols-3 gap-4 border-t border-paper/15 pt-5">
          {["免注册链接", "实时结果", "一键导出"].map((item) => (
            <div key={item} className="flex items-center gap-2 text-[11px] text-paper/65">
              <Check size={12} className="text-acid" />
              {item}
            </div>
          ))}
        </div>
      </aside>
    </div>
  );
}
