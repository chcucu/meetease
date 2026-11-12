import Link from "next/link";
import {
  ArrowRight,
  ArrowUpRight,
  Check,
  Clock3,
  Download,
  Link2,
  MessageSquare,
  ShieldCheck,
  Wallet,
  Zap,
} from "lucide-react";
import { HeroPoll } from "@/components/hero-poll";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { AvatarStack, SectionHeading } from "@/components/ui";

const PROBLEMS = [
  {
    title: "信息过载",
    body: "同一个问题在多个群聊中反复讨论，结论难以确认，投票记录也无法追溯。",
  },
  {
    title: "沉默的多数",
    body: "最先回复的人往往定义了答案，其余成员只是跟随，真实偏好没有被记录。",
  },
  {
    title: "信息分散",
    body: "时间、地点、预算与饮食需求散落在不同对话中，执行时容易遗漏。",
  },
];

const STEPS = [
  {
    title: "创建决策页",
    body: "添加时间、地点与自定义问题，设置截止时间和投票规则。",
  },
  {
    title: "分享链接",
    body: "参与者打开链接、填写姓名即可投票，无需注册或安装应用。",
  },
  {
    title: "查看结果",
    body: "投票实时汇总。组织者可随时关闭投票，并导出完整数据。",
  },
];

export default function HomePage() {
  return (
    <>
      <SiteHeader />
      <main>
        {/* Hero */}
        <section className="relative overflow-hidden border-b border-line">
          <div className="paper-grid pointer-events-none absolute inset-0 opacity-60" aria-hidden="true" />
          <div
            className="pointer-events-none absolute -right-24 -top-24 h-[420px] w-[420px] rounded-full bg-acid/30 blur-3xl"
            aria-hidden="true"
          />
          <div className="container-page relative grid gap-14 pb-16 pt-16 md:pt-24 lg:grid-cols-[1.02fr_0.98fr] lg:items-center lg:gap-16 lg:pb-28">
            <div className="hero-in">
              <h1 className="page-title max-w-[680px] text-[clamp(2.9rem,7vw,5.4rem)]">
                一个页面，
                <br />
                完成<span className="text-coral">群体决策</span>。
              </h1>

              <p className="mt-7 max-w-[480px] text-[17px] leading-8 text-ink-2">
                创建决策页，分享一个链接，收集时间、地点与意见。
                参与者无需注册，结果实时汇总。
              </p>

              <div className="mt-8 flex flex-wrap items-center gap-3">
                <Link href="/register" className="btn btn-primary">
                  创建决策页
                  <ArrowRight size={16} />
                </Link>
                <Link href="/a/DINNER" className="btn btn-ghost">
                  查看示例
                  <ArrowUpRight size={15} />
                </Link>
              </div>

              <div className="mt-10 flex flex-wrap gap-x-6 gap-y-3 border-t border-line pt-5">
                {["无需注册", "实时结果", "CSV 导出"].map((item) => (
                  <span key={item} className="flex items-center gap-2 text-[12px] text-muted">
                    <span className="flex h-4 w-4 items-center justify-center border border-line-strong bg-surface">
                      <Check size={10} strokeWidth={2.5} />
                    </span>
                    {item}
                  </span>
                ))}
              </div>
            </div>

            <div className="hero-in lg:pl-4" style={{ animationDelay: "120ms" }}>
              <HeroPoll />
            </div>
          </div>
        </section>

        {/* Problem */}
        <section className="container-page py-20 md:py-28">
          <SectionHeading
            title="为什么需要 Quorum"
            intro="同一个问题在不同群聊中反复确认，信息、偏好与截止时间难以集中。Quorum 将它们收敛到一张决策页。"
          />

          <div className="grid gap-px overflow-hidden border border-line bg-line md:grid-cols-3">
            {PROBLEMS.map((item) => (
              <article key={item.title} className="bg-surface p-7 md:p-8">
                <h3 className="font-display text-3xl">{item.title}</h3>
                <p className="mt-4 text-sm leading-7 text-muted">{item.body}</p>
              </article>
            ))}
          </div>

          <div className="mt-10 border-l-2 border-acid pl-5">
            <p className="max-w-[720px] font-display text-[clamp(1.4rem,2.6vw,2rem)] leading-snug">
              决策页是唯一的信息源：选项、投票与支付状态都在同一处更新。
            </p>
          </div>
        </section>

        {/* How it works */}
        <section id="how" className="border-y border-line bg-surface/60">
          <div className="container-page py-20 md:py-28">
            <SectionHeading
              title="三步完成一次决策"
              intro="组织者创建决策页，参与者通过链接投票，结果自动汇总。"
            />

            <div className="grid gap-6 lg:grid-cols-3">
              {STEPS.map((step, index) => (
                <div key={step.title} className="relative flex flex-col border border-line bg-paper p-6 md:p-7">
                  <div className="mb-6 flex h-[150px] items-center justify-center border border-line bg-surface p-4">
                    {index === 0 && <MiniForm />}
                    {index === 1 && <MiniShare />}
                    {index === 2 && <MiniResults />}
                  </div>

                  <h3 className="font-display text-2xl">{step.title}</h3>
                  <p className="mt-3 text-sm leading-6 text-muted">{step.body}</p>

                  {index < 2 && (
                    <span className="absolute -right-3 top-1/2 z-10 hidden h-6 w-6 -translate-y-1/2 items-center justify-center rounded-full border border-ink bg-acid text-ink lg:flex">
                      <ArrowRight size={12} />
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Features */}
        <section id="features" className="container-page py-20 md:py-28">
          <SectionHeading
            title="从创建到结算，一套完整流程"
            intro="没有多余的功能。每个模块都对应决策过程中的一个具体环节。"
          />

          <div className="grid gap-4 md:grid-cols-12">
            <FeatureCard
              icon={<Zap size={18} />}
              title="实时结果"
              body="投票通过 SSE 推送到结果页，组织者无需刷新页面。"
              className="md:col-span-7"
            >
              <div className="space-y-2.5">
                {[
                  { label: "周六 17:30", value: 62, count: 5 },
                  { label: "周六 19:00", value: 25, count: 2 },
                  { label: "周日 12:00", value: 13, count: 1 },
                ].map((row, index) => (
                  <div key={row.label} className="flex items-center gap-3">
                    <span className="w-[86px] shrink-0 text-[11px]">{row.label}</span>
                    <span className="h-2.5 flex-1 overflow-hidden bg-paper-deep">
                      <span
                        className={`block h-full ${index === 0 ? "bg-ink" : "bg-ink/25"}`}
                        style={{ width: `${row.value}%` }}
                      />
                    </span>
                    <span className="w-10 text-right font-mono text-[10px]">{row.count} 票</span>
                  </div>
                ))}
              </div>
            </FeatureCard>

            <FeatureCard
              icon={<Link2 size={18} />}
              title="免注册参与"
              body="一个链接或二维码。参与者只需填写姓名，不必创建账号。"
              className="md:col-span-5"
            >
              <div className="flex flex-col gap-3">
                <div className="flex items-center gap-2 border border-line-strong bg-paper px-3 py-2">
                  <Link2 size={13} className="text-muted" />
                  <span className="truncate font-mono text-[10px]">quorum.app/a/DINNER</span>
                </div>
                <div className="flex items-center justify-center border border-line-strong bg-paper px-3 py-2.5">
                  <span className="grid grid-cols-4 gap-0.5" aria-hidden="true">
                    {Array.from({ length: 16 }).map((_, i) => (
                      <span
                        key={i}
                        className={`block h-2 w-2 ${[0, 2, 5, 7, 8, 10, 13, 15, 3, 12].includes(i) ? "bg-ink" : "bg-transparent"}`}
                      />
                    ))}
                  </span>
                </div>
              </div>
            </FeatureCard>

            <FeatureCard
              icon={<Clock3 size={18} />}
              title="时间与地点"
              body="两类选项分别投票，支持单选或多选，截止时间自动生效。"
              className="md:col-span-4"
            >
              <div className="flex flex-wrap gap-2">
                <span className="chip bg-acid-soft">周六 17:30</span>
                <span className="chip bg-paper">梧桐小院</span>
                <span className="chip bg-paper">单选或多选</span>
              </div>
            </FeatureCard>

            <FeatureCard
              icon={<MessageSquare size={18} />}
              title="自定义问题"
              body="文本、数字、单选、多选，按活动需要添加。"
              className="md:col-span-4"
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between border border-line bg-paper px-2.5 py-2 text-[10px]">
                  <span>有没有忌口？</span>
                  <span className="text-muted">素食</span>
                </div>
                <div className="flex items-center justify-between border border-line bg-paper px-2.5 py-2 text-[10px]">
                  <span>怎么过去？</span>
                  <span className="text-muted">地铁</span>
                </div>
              </div>
            </FeatureCard>

            <FeatureCard
              icon={<Wallet size={18} />}
              title="费用与支付"
              body="记录人均费用，标记支付状态，未支付成员一目了然。"
              className="md:col-span-4"
            >
              <div className="space-y-2.5">
                <div className="flex items-center justify-between text-[11px]">
                  <span>已收 ¥1,008 / ¥1,512</span>
                  <span className="text-coral">67%</span>
                </div>
                <div className="h-2 bg-paper-deep">
                  <div className="h-full w-2/3 bg-coral" />
                </div>
                <div className="flex items-center justify-between">
                  <AvatarStack names={["阿策", "Momo", "小满", "Nina"]} max={4} />
                  <span className="text-[11px] text-muted">6 / 9 已支付</span>
                </div>
              </div>
            </FeatureCard>

            <FeatureCard
              icon={<Download size={18} />}
              title="CSV 导出"
              body="参与者、选择、回答与支付状态，一次导出。"
              className="md:col-span-6"
            >
              <div className="border border-line bg-paper p-3 font-mono text-[10px] leading-5 text-muted">
                <p className="text-ink">quorum-DINNER.csv</p>
                <p>姓名, 时间, 地点, 忌口, 支付</p>
                <p>阿策, 周六 17:30, 梧桐小院, 无, 已支付</p>
                <p>Ken, 周六 19:00, 江边炭火, 素食, 未支付</p>
              </div>
            </FeatureCard>

            <FeatureCard
              icon={<ShieldCheck size={18} />}
              title="权限分离"
              body="公开链接用于投票，管理权限仅限组织者。"
              className="md:col-span-6"
            >
              <div className="grid gap-2 sm:grid-cols-2">
                <div className="border border-line bg-paper p-3">
                  <p className="text-sm font-medium">公开链接</p>
                  <p className="mt-1 text-[11px] text-muted">任何人可投票</p>
                </div>
                <div className="border border-ink bg-ink p-3 text-paper">
                  <p className="text-sm font-medium">仅组织者</p>
                  <p className="mt-1 flex items-center gap-1.5 text-[11px] text-paper/70">
                    <Check size={11} className="text-acid" /> 关票 · 收款 · 删除
                  </p>
                </div>
              </div>
            </FeatureCard>
          </div>
        </section>

        {/* Live section */}
        <section id="live" className="section-ink relative overflow-hidden border-y border-ink">
          <div className="dotted-grid pointer-events-none absolute inset-0 opacity-40" aria-hidden="true" />
          <div
            className="pointer-events-none absolute -left-20 top-10 h-72 w-72 rounded-full bg-acid/15 blur-3xl"
            aria-hidden="true"
          />
          <div className="container-page relative py-20 md:py-28">
            <SectionHeading
              dark
              title="结果在投票过程中持续更新"
              intro="每一次投票都会实时进入结果页。参与者、选项与提交状态随时可见。"
              action={{ href: "/a/DINNER/results", label: "打开实时结果页" }}
            />

            <div className="grid gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
              <div className="space-y-6">
                {[
                  {
                    title: "无需刷新",
                    body: "SSE 长连接将新票推送到所有打开结果页的客户端。",
                  },
                  {
                    title: "无需追问",
                    body: "每个选项的票数与参与者名单集中展示，不必在群聊中逐一确认。",
                  },
                  {
                    title: "自动截止",
                    body: "到达截止时间自动停止收票；组织者也可以手动关闭。",
                  },
                ].map((item) => (
                  <div key={item.title} className="flex gap-4">
                    <span className="mt-2 h-2 w-2 shrink-0 bg-acid" aria-hidden="true" />
                    <div>
                      <h3 className="font-display text-xl text-paper">{item.title}</h3>
                      <p className="mt-1 max-w-[400px] text-sm leading-6 text-paper/55">{item.body}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="relative border border-paper/20 bg-paper p-5 text-ink shadow-[8px_8px_0_rgba(217,255,67,0.9)] sm:p-6">
                <div className="flex items-start justify-between border-b border-line pb-4">
                  <h3 className="font-display text-2xl">周六，去城外吃一顿</h3>
                  <span className="chip border-line bg-paper">
                    <span className="live-dot" />
                    投票中
                  </span>
                </div>

                <div className="mt-4 flex items-end justify-between">
                  <div>
                    <p className="text-[13px] text-muted">当前领先</p>
                    <p className="mt-1 font-display text-3xl">周六 17:30</p>
                  </div>
                  <p className="font-display text-[52px] leading-none text-coral">5</p>
                </div>

                <div className="mt-5 space-y-3">
                  {[
                    { label: "周六 17:30", count: 5, width: "62%" },
                    { label: "周六 19:00", count: 2, width: "25%" },
                    { label: "周日 12:00", count: 1, width: "13%" },
                  ].map((row, index) => (
                    <div key={row.label}>
                      <div className="mb-1 flex items-center justify-between text-[11px]">
                        <span>{row.label}</span>
                        <span className="font-mono text-muted">{row.count} / 8</span>
                      </div>
                      <div className="h-2.5 bg-paper-deep">
                        <div
                          className={`h-full ${index === 0 ? "bg-coral" : "bg-ink/20"}`}
                          style={{ width: row.width }}
                        />
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-5 flex items-center justify-between border-t border-line pt-4">
                  <AvatarStack names={["阿策", "Momo", "周周", "Ken", "小满", "阿栗", "Nina", "老丁", "羽佳"]} max={7} />
                  <span className="text-[11px] text-muted">9 人已参与</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Final CTA */}
        <section className="relative overflow-hidden bg-acid">
          <div className="paper-grid pointer-events-none absolute inset-0 opacity-25" aria-hidden="true" />
          <div className="container-page relative py-20 md:py-28">
            <div className="grid gap-10 lg:grid-cols-[1fr_auto] lg:items-end">
              <div>
                <h2 className="font-display text-[clamp(2.6rem,7vw,6rem)] leading-[0.95] tracking-[-0.04em]">
                  下一次决策，
                  <br />
                  从一张<span className="serif-italic">卡片</span>开始。
                </h2>
                <p className="mt-6 max-w-[460px] text-sm leading-6 text-ink/70">
                  创建决策页并分享链接。三分钟后即可查看结果。
                </p>
                <div className="mt-8 flex flex-wrap gap-3">
                  <Link href="/register" className="btn btn-dark">
                    创建账号
                    <ArrowRight size={16} />
                  </Link>
                  <Link href="/login" className="btn border-ink bg-transparent">
                    使用演示账号
                  </Link>
                </div>
              </div>

              <div className="relative hidden h-[210px] w-[210px] shrink-0 items-center justify-center lg:flex">
                <div className="spin-slow absolute inset-0 rounded-full border border-dashed border-ink/40" />
                <div className="absolute inset-5 rounded-full border border-ink/30" />
                <div className="flex h-28 w-28 rotate-[-8deg] items-center justify-center border border-ink bg-paper shadow-[4px_4px_0_#171714]">
                  <span className="font-display text-5xl">Q</span>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}

function FeatureCard({
  icon,
  title,
  body,
  children,
  className = "",
}: {
  icon: React.ReactNode;
  title: string;
  body: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <article
      className={`group flex flex-col border border-line bg-surface p-5 transition-all duration-200 hover:border-ink hover:shadow-[4px_4px_0_rgba(23,23,20,0.9)] md:p-6 ${className}`}
    >
      <div className="mb-5">
        <span className="flex h-9 w-9 items-center justify-center border border-line-strong bg-paper">
          {icon}
        </span>
      </div>
      <div className="mb-4 flex-1 rounded-sm border border-line bg-paper/70 p-4">{children}</div>
      <h3 className="font-display text-[22px] leading-tight">{title}</h3>
      <p className="mt-2 text-[13px] leading-6 text-muted">{body}</p>
    </article>
  );
}

function MiniForm() {
  return (
    <div className="w-full space-y-2">
      <div className="border border-ink bg-surface px-2.5 py-1.5 text-[10px] font-medium">
        周六，去城外吃一顿
      </div>
      <div className="border border-line bg-surface px-2.5 py-1.5 text-[10px]">周六 17:30</div>
      <div className="border border-line bg-surface px-2.5 py-1.5 text-[10px]">梧桐小院</div>
      <div className="border border-dashed border-line-strong px-2.5 py-1.5 text-[10px] text-muted">
        + 添加问题
      </div>
    </div>
  );
}

function MiniShare() {
  return (
    <div className="w-full space-y-3">
      <div className="flex items-center gap-2 border border-line-strong bg-surface px-2.5 py-2">
        <Link2 size={11} className="text-muted" />
        <span className="truncate font-mono text-[10px]">quorum.app/a/DINNER</span>
      </div>
      <div className="flex items-center justify-center">
        <AvatarStack names={["阿策", "Momo", "周周", "Ken", "小满"]} max={5} />
      </div>
      <div className="border border-line bg-surface p-2">
        <div className="grid grid-cols-8 gap-0.5">
          {Array.from({ length: 64 }).map((_, i) => (
            <span
              key={i}
              className={`block aspect-square ${
                [0, 1, 2, 6, 7, 8, 14, 16, 21, 23, 28, 30, 35, 38, 42, 47, 49, 54, 56, 61, 63, 9, 17, 25, 33, 41, 57, 4, 60].includes(i)
                  ? "bg-ink"
                  : "bg-transparent"
              }`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

function MiniResults() {
  return (
    <div className="w-full space-y-3">
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
          <div className="h-2 bg-line/50">
            <div className={`h-full ${index === 0 ? "bg-coral" : "bg-ink/25"}`} style={{ width: row.width }} />
          </div>
        </div>
      ))}
      <p className="text-right text-[10px] text-muted">共 8 票</p>
    </div>
  );
}
