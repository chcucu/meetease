import Link from "next/link";
import { SiteHeader } from "@/components/site-header";
import { LogoMark } from "@/components/logo";

export default function NotFound() {
  return (
    <>
      <SiteHeader />
      <main className="relative flex min-h-[calc(100vh-66px)] items-center overflow-hidden">
        <div className="paper-grid pointer-events-none absolute inset-0 opacity-60" aria-hidden="true" />
        <div className="container-page relative py-20">
          <div className="grid gap-10 lg:grid-cols-[auto_1fr] lg:items-end">
            <p className="font-display text-[clamp(7rem,20vw,16rem)] leading-[0.8] tracking-[-0.06em]">
              4<span className="serif-italic text-coral">0</span>4
            </p>
            <div className="max-w-lg lg:pb-4">
              <p className="label mb-3">DEAD END / 这里没有决策</p>
              <h1 className="font-display text-[clamp(2rem,4.4vw,3.4rem)] leading-[1.02] tracking-[-0.03em]">
                这张卡不存在，<br />
                或者已经被收走了。
              </h1>
              <p className="mt-4 text-[13px] leading-6 text-muted">
                分享码是六位字母与数字的组合。检查一下链接有没有拼错，或者向发起人要一个新的。
              </p>
              <div className="mt-7 flex flex-wrap items-center gap-2">
                <Link href="/" className="btn btn-primary">
                  回到首页
                </Link>
                <Link href="/app" className="btn btn-ghost">
                  我的工作台
                </Link>
              </div>
            </div>
          </div>

          <div className="mt-16 flex items-center gap-3 border-t border-line pt-5">
            <LogoMark size={24} />
            <p className="font-mono text-[9px] uppercase tracking-[0.16em] text-muted">
              Quorum — 一群人，一个答案
            </p>
          </div>
        </div>
      </main>
    </>
  );
}
