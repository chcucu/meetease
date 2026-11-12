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
            <p className="mt-4 max-w-[280px] text-sm leading-6 text-muted">
              Quorum 是一个群体决策工具。创建决策页，分享链接，收集时间、地点与意见。
            </p>
          </div>

          <div>
            <p className="mb-4 text-[12px] font-medium text-ink">产品</p>
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
            <p className="mb-4 text-[12px] font-medium text-ink">关于</p>
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
            <p className="mb-4 text-[12px] font-medium text-ink">账号</p>
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
          </div>
        </div>

        <div className="mt-14 flex flex-col gap-3 border-t border-line pt-6 text-[11px] text-muted sm:flex-row sm:items-center sm:justify-between">
          <p>© 2026 Quorum. All rights reserved.</p>
          <p>Designed and built by Lin Yi</p>
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
