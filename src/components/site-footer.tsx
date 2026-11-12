import Link from "next/link";
import { LogoMark } from "./logo";

export function SiteFooter() {
  return (
    <footer className="mt-24 border-t border-line bg-paper-deep/40">
      <div className="container-page py-14">
        <div className="grid gap-12 md:grid-cols-[1.4fr_1fr_1fr_1fr]">
          <div>
            <div className="flex items-center gap-2.5">
              <LogoMark size={30} />
              <span className="font-display text-[28px] leading-none tracking-[-0.035em] lowercase">
                quorum
              </span>
            </div>
            <p className="mt-4 max-w-[260px] text-sm leading-6 text-muted">
              把时间、地点、预算和所有人的意见，收进一张卡片。发一个链接，等一个答案。
            </p>
            <p className="label mt-6 text-[9px]">GROUP DECISION SYSTEM · EST. 2026</p>
          </div>

          <div>
            <p className="label mb-4">产品</p>
            <ul className="space-y-2.5 text-sm text-ink-2">
              <li>
                <Link href="/new" className="link-underline">
                  发起决策
                </Link>
              </li>
              <li>
                <Link href="/app" className="link-underline">
                  组织者工作台
                </Link>
              </li>
              <li>
                <Link href="/a/DINNER" className="link-underline">
                  参与者视角
                </Link>
              </li>
              <li>
                <Link href="/a/DINNER/results" className="link-underline">
                  实时结果
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <p className="label mb-4">关于</p>
            <ul className="space-y-2.5 text-sm text-ink-2">
              <li>
                <Link href="/#how" className="link-underline">
                  它如何工作
                </Link>
              </li>
              <li>
                <Link href="/#features" className="link-underline">
                  能力清单
                </Link>
              </li>
              <li>
                <Link href="/login" className="link-underline">
                  演示账号
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <p className="label mb-4">账号</p>
            <ul className="space-y-2.5 text-sm text-ink-2">
              <li>
                <Link href="/login" className="link-underline">
                  登录
                </Link>
              </li>
              <li>
                <Link href="/register" className="link-underline">
                  创建账号
                </Link>
              </li>
            </ul>
            <p className="mt-6 font-mono text-[10px] leading-5 text-muted">
              Next.js 16 · Prisma
              <br />
              SQLite · SSE
            </p>
          </div>
        </div>

        <div className="mt-14 flex flex-col gap-3 border-t border-line pt-6 text-[11px] text-muted sm:flex-row sm:items-center sm:justify-between">
          <p>© 2026 Quorum. 一次把话说定。</p>
          <p className="font-mono tracking-wide">DESIGNED &amp; BUILT BY LIN YI</p>
        </div>
      </div>

      <div className="overflow-hidden border-t border-line/70">
        <p
          className="container-page -mb-[0.18em] select-none font-display text-[clamp(5rem,17vw,15rem)] leading-[0.8] tracking-[-0.05em] text-transparent"
          style={{ WebkitTextStroke: "1px #b5af9e" }}
          aria-hidden="true"
        >
          quorum
        </p>
      </div>
    </footer>
  );
}
