import Link from "next/link";
import { LogoMark } from "./logo";

export function SiteFooter() {
  return (
    <footer className="mt-20 border-t border-line bg-surface">
      <div className="container-page py-12">
        <div className="grid gap-10 md:grid-cols-[1.6fr_1fr_1fr_1fr]">
          <div>
            <div className="flex items-center gap-2.5">
              <LogoMark size={28} />
              <span className="text-[20px] font-semibold leading-none tracking-[-0.03em]">
                Quorum
              </span>
            </div>
            <p className="mt-4 max-w-[300px] text-[13px] leading-6 text-muted">
              群体决策平台。一个链接完成时间、地点与意见的收集，结果实时汇总。
            </p>
            <p className="mt-4 inline-flex items-center gap-1.5 rounded-full border border-line bg-paper px-2.5 py-1 text-[11px] text-muted">
              <span className="h-1.5 w-1.5 rounded-full bg-brand" />
              DeepSeek 展示项目
            </p>
          </div>

          <div>
            <p className="mb-3.5 text-[12px] font-medium text-ink">产品</p>
            <ul className="space-y-2.5 text-[13px] text-ink-2">
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
            <p className="mb-3.5 text-[12px] font-medium text-ink">开发者</p>
            <ul className="space-y-2.5 text-[13px] text-ink-2">
              <li>
                <Link href="/#api" className="link-underline">
                  公开 API
                </Link>
              </li>
              <li>
                <Link href="/api/v1/activities/DINNER" prefetch={false} className="link-underline">
                  API 示例
                </Link>
              </li>
              <li>
                <Link href="/#how" className="link-underline">
                  工作原理
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <p className="mb-3.5 text-[12px] font-medium text-ink">账号</p>
            <ul className="space-y-2.5 text-[13px] text-ink-2">
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
              <li>
                <Link href="/login" className="link-underline">
                  演示账号
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 flex flex-col gap-2 border-t border-line pt-5 text-[11px] text-muted sm:flex-row sm:items-center sm:justify-between">
          <p>© 2026 Quorum · DeepSeek 展示项目</p>
          <p>为每一次聚会，提供可信的共识。</p>
        </div>
      </div>
    </footer>
  );
}
