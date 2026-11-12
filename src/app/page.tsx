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

const TICKER = [
  "TIME / 时间",
  "PLACE / 地点",
  "BUDGET / 预算",
  "DIET / 忌口",
  "TRANSPORT / 交通",
  "HEADCOUNT / 人数",
  "DEADLINE / 截止",
];

const PROBLEMS = [
  {
    index: "01",
    title: "刷屏",
    body: "一个问题，三种意见，八十条消息。最后没人记得谁投过什么。",
    meta: "消息 87 条 → 结论 0 个",
  },
  {
    index: "02",
    title: "沉默",
    body: "最先回复的人定义了答案，剩下的人只是跟着点头。真正的偏好被淹没了。",
    meta: "最先说话的人 ≠ 大多数人",
  },
  {
    index: "03",
    title: "散落",
    body: "时间在聊天记录，地点在收藏夹，忌口在某个人的记忆里。临到头才发现漏了。",
    meta: "4 个群 × 3 个话题 × 0 张清单",
  },
];

const STEPS = [
  {
    index: "01",
    kicker: "BUILD",
    title: "建一张决策卡",
    body: "时间、地点、预算、忌口，全放进去。选项可以多选，也可以只选一个。",
  },
  {
    index: "02",
    kicker: "SHARE",
    title: "把链接发出去",
    body: "不用拉群、不用注册、不用下载 App。打开链接，填名字，投票。",
  },
  {
    index: "03",
    kicker: "SETTLE",
    title: "让结果自己出现",
    body: "每一票实时汇总。谁还没投、谁已付款、什么最多人选，一眼看清。",
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
          <div className="container-page relative grid gap-14 pb-16 pt-12 md:pt-20 lg:grid-cols-[1.02fr_0.98fr] lg:items-center lg:gap-16 lg:pb-24">
            <div className="hero-in">
              <div className="mb-7 flex flex-wrap items-center gap-3">
                <span className="chip border-ink bg-acid">
                  <span className="inline-block h-1.5 w-1.5 rounded-full bg-ink" />
                  OPEN BETA
                </span>
                <span className="label text-[9px]">GROUP DECISION SYSTEM / 002</span>
              </div>

              <h1 className="page-title max-w-[640px] text-[clamp(2.9rem,7vw,5.4rem)]">
                把一群人，
                <br />
                拧成一个
                <span className="relative ml-1 inline-block whitespace-nowrap">
                  <span className="absolute inset-x-0 bottom-[0.12em] h-[0.24em] -skew-x-6 bg-acid" aria-hidden="true" />
                  <span className="relative serif-italic text-coral">答案</span>
                </span>
                。
              </h1>

              <p className="mt-7 max-w-[460px] text-[15px] leading-7 text-ink-2">
                Quorum 是一张所有人共同填写的决策卡。时间、地点、预算、忌口 ——
                一次说清，实时出结果，然后真的定下来。
              </p>

              <div className="mt-8 flex flex-wrap items-center gap-3">
                <Link href="/register" className="btn btn-primary">
                  发起一次决策
                  <ArrowRight size={16} />
                </Link>
                <Link href="/a/DINNER" className="btn btn-ghost">
                  看一场进行中的投票
                  <ArrowUpRight size={15} />
                </Link>
              </div>

              <div className="mt-10 flex flex-wrap gap-x-6 gap-y-3 border-t border-line pt-5">
                {["零注册参与", "实时同步", "一键导出"].map((item) => (
                  <span key={item} className="flex items-center gap-2 text-[11px] text-muted">
                    <span className="flex h-4 w-4 items-center justify-center border border-line-strong bg-surface">
                      <Check size={10} strokeWidth={2.5} />
                    </span>
                    {item}
                  </span>
                ))}
                <span className="font-mono text-[10px] tracking-wide text-muted/70">
                  聚餐 · 团建 · 出行 · 读书会
                </span>
              </div>
            </div>

            <div className="hero-in lg:pl-4" style={{ animationDelay: "120ms" }}>
              <HeroPoll />
            </div>
          </div>

          <div className="overflow-hidden border-t border-line bg-paper-deep/50 py-3.5">
            <div className="marquee-track">
              {[0, 1].map((copy) => (
                <div key={copy} className="flex shrink-0 items-center">
                  {TICKER.map((item) => (
                    <span
                      key={`${copy}-${item}`}
                      className="flex items-center gap-6 px-6 font-mono text-[10px] tracking-[0.16em] text-ink-2"
                    >
                      {item}
                      <span className="text-coral">✳</span>
                    </span>
                  ))}
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Problem */}
        <section className="container-page py-20 md:py-28">
          <SectionHeading
            index="01"
            eyebrow="THE PROBLEM"
            title={
              <>
                群聊擅长聊天，
                <br />
                不擅长<span className="serif-italic">做决定</span>。
              </>
            }
            intro="一次普通的聚会，平均要在 4 个群、3 个话题里来回确认。Quorum 把这件事压缩成一张卡片。"
          />

          <div className="grid gap-px overflow-hidden border border-line bg-line md:grid-cols-3">
            {PROBLEMS.map((item) => (
              <article key={item.index} className="group relative bg-surface p-7 transition-colors hover:bg-acid-soft/40 md:p-8">
                <div className="flex items-start justify-between">
                  <span className="font-display text-[54px] leading-none text-line-strong transition-colors group-hover:text-ink/20">
                    {item.index}
                  </span>
                  <span className="label text-[9px]">FAILURE MODE</span>
                </div>
                <h3 className="mt-8 font-display text-3xl">{item.title}</h3>
                <p className="mt-3 min-h-[84px] text-sm leading-6 text-muted">{item.body}</p>
                <p className="mt-6 border-t border-line pt-4 font-mono text-[10px] tracking-wide text-ink-2">
                  {item.meta}
                </p>
              </article>
            ))}
          </div>

          <div className="mt-10 flex flex-col items-start justify-between gap-5 border-l-2 border-acid pl-5 md:flex-row md:items-center">
            <p className="max-w-[640px] font-display text-[clamp(1.4rem,2.6vw,2rem)] leading-snug">
              “不是再来一个群，而是一张所有人共同填写的卡。”
            </p>
            <span className="label shrink-0 text-[9px]">— QUORUM, 2026</span>
          </div>
        </section>

        {/* How it works */}
        <section id="how" className="border-y border-line bg-surface/60">
          <div className="container-page py-20 md:py-28">
            <SectionHeading
              index="02"
              eyebrow="HOW IT WORKS"
              title={
                <>
                  三步，
                  <span className="serif-italic">把话定下来</span>。
                </>
              }
              intro="组织者花三分钟建卡，参与者花三十秒投票。剩下的交给系统。"
            />

            <div className="grid gap-6 lg:grid-cols-3">
              {STEPS.map((step, index) => (
                <div key={step.index} className="relative flex flex-col border border-line bg-paper p-6 md:p-7">
                  <div className="mb-7 flex items-center justify-between">
                    <span className="font-display text-[42px] leading-none">{step.index}</span>
                    <span className="chip text-[8px]">{step.kicker}</span>
                  </div>

                  <div className="mb-6 flex h-[150px] items-center justify-center border border-line bg-surface p-4">
                    {index === 0 && <MiniForm />}
                    {index === 1 && <MiniShare />}
                    {index === 2 && <MiniResults />}
                  </div>

                  <h3 className="font-display text-2xl">{step.title}</h3>
                  <p className="mt-2.5 text-sm leading-6 text-muted">{step.body}</p>

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
            index="03"
            eyebrow="CAPABILITIES"
            title={
              <>
                小工具，
                <br />
                但是每个细节都
                <span className="serif-italic">想过了</span>。
              </>
            }
            intro="从发起、投票、收款到导出，一条完整的闭环。没有多余的功能，只有必须做对的细节。"
          />

          <div className="grid gap-4 md:grid-cols-12">
            <FeatureCard
              index="01"
              icon={<Zap size={18} />}
              title="结果实时出现"
              body="投票通过 SSE 推送到结果页。组织者不用刷新，也不用再问「现在几票了」。"
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
                    <span className="w-8 text-right font-mono text-[10px]">{row.count} 票</span>
                  </div>
                ))}
                <div className="flex items-center justify-between pt-2 font-mono text-[9px] text-muted">
                  <span className="flex items-center gap-1.5">
                    <span className="live-dot" /> 刚刚 · 阿策投了「周六 17:30」
                  </span>
                  <span>SSE CONNECTED</span>
                </div>
              </div>
            </FeatureCard>

            <FeatureCard
              index="02"
              icon={<Link2 size={18} />}
              title="零注册参与"
              body="一个链接或二维码。参与者只需填名字，不必创建账号。"
              className="md:col-span-5"
            >
              <div className="flex flex-col gap-3">
                <div className="flex items-center gap-2 border border-line-strong bg-paper px-3 py-2">
                  <Link2 size={13} className="text-muted" />
                  <span className="truncate font-mono text-[10px]">quorum.app/a/DINNER</span>
                </div>
                <div className="flex items-center justify-between border border-line-strong bg-paper px-3 py-2">
                  <span className="font-mono text-[9px] tracking-wide text-muted">扫码打开</span>
                  <span className="grid grid-cols-4 gap-0.5" aria-hidden="true">
                    {Array.from({ length: 16 }).map((_, i) => (
                      <span
                        key={i}
                        className={`block h-1.5 w-1.5 ${[0, 2, 5, 7, 8, 10, 13, 15, 3, 12].includes(i) ? "bg-ink" : "bg-transparent"}`}
                      />
                    ))}
                  </span>
                </div>
              </div>
            </FeatureCard>

            <FeatureCard
              index="03"
              icon={<Clock3 size={18} />}
              title="时间 × 地点"
              body="两类选项分开投，单选或多选都行。地点还能附上地图坐标。"
              className="md:col-span-4"
            >
              <div className="flex flex-wrap gap-2">
                <span className="chip bg-acid-soft">TIME · 周六 17:30</span>
                <span className="chip bg-paper">PLACE · 梧桐小院</span>
                <span className="chip bg-paper">单选 / 多人同投</span>
              </div>
            </FeatureCard>

            <FeatureCard
              index="04"
              icon={<MessageSquare size={18} />}
              title="自定义问题"
              body="忌口、交通、是否带伴。文本、数字、单选、多选，按需添加。"
              className="md:col-span-4"
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between border border-line bg-paper px-2.5 py-2 text-[10px]">
                  <span>有没有忌口？</span>
                  <span className="font-mono text-muted">SELECT</span>
                </div>
                <div className="flex items-center justify-between border border-line bg-paper px-2.5 py-2 text-[10px]">
                  <span>怎么过去？</span>
                  <span className="font-mono text-muted">TEXT</span>
                </div>
              </div>
            </FeatureCard>

            <FeatureCard
              index="05"
              icon={<Wallet size={18} />}
              title="费用与到场"
              body="记录人均费用，勾选谁已支付。谁还没回，一眼就看得到。"
              className="md:col-span-4"
            >
              <div className="space-y-2.5">
                <div className="flex items-center justify-between font-mono text-[10px]">
                  <span>已收 ¥1,008 / ¥1,512</span>
                  <span className="text-coral">67%</span>
                </div>
                <div className="h-2 bg-paper-deep">
                  <div className="h-full w-2/3 bg-coral" />
                </div>
                <div className="flex items-center justify-between">
                  <AvatarStack names={["阿策", "Momo", "小满", "Nina"]} max={4} />
                  <span className="font-mono text-[9px] text-muted">6 / 9 PAID</span>
                </div>
              </div>
            </FeatureCard>

            <FeatureCard
              index="06"
              icon={<Download size={18} />}
              title="CSV 导出"
              body="参与者、选择、回答、支付状态，一次导出，直接进表格。"
              className="md:col-span-6"
            >
              <div className="border border-line bg-paper p-3 font-mono text-[9px] leading-5 text-muted">
                <p className="text-ink">quorum-DINNER.csv</p>
                <p>姓名, 时间, 地点, 忌口, 支付</p>
                <p>阿策, 周六 17:30, 梧桐小院, 无, 已支付</p>
                <p>Ken, 周六 19:00, 江边炭火, 素食, 未支付</p>
              </div>
            </FeatureCard>

            <FeatureCard
              index="07"
              icon={<ShieldCheck size={18} />}
              title="只有你能关票"
              body="组织者拥有独立账号。投票链接公开，管理权限不公开。"
              className="md:col-span-6"
            >
              <div className="grid gap-2 sm:grid-cols-2">
                <div className="border border-line bg-paper p-3">
                  <p className="label mb-1 text-[8px]">PUBLIC LINK</p>
                  <p className="text-[11px]">任何人都能投票</p>
                </div>
                <div className="border border-ink bg-ink p-3 text-paper">
                  <p className="label mb-1 text-[8px] text-paper/50">OWNER ONLY</p>
                  <p className="flex items-center gap-1.5 text-[11px]">
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
              index="04"
              eyebrow="LIVE RESULTS"
              title={
                <>
                  结果不是投票结束后
                  <br />
                  才出现的。
                </>
              }
              intro="每一票都会实时进入结果页。谁投了什么、谁还没来、哪里最多人选，随时可见。"
              action={{ href: "/a/DINNER/results", label: "打开一个实时结果页" }}
            />

            <div className="grid gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
              <div className="space-y-6">
                {[
                  {
                    title: "不用刷新",
                    body: "SSE 长连接把新票推给所有打开结果页的人。页面上那个小圆点，是真的在跳。",
                  },
                  {
                    title: "不用追问",
                    body: "每个人选了什么、谁还没提交，名单清清楚楚。不用再在群里 @ 所有人。",
                  },
                  {
                    title: "不用手动关",
                    body: "到了截止时间自动停止收票；组织者也可以提前手动关闭，把结果锁住。",
                  },
                ].map((item, index) => (
                  <div key={item.title} className="flex gap-4">
                    <span className="font-mono text-[10px] text-acid/70">0{index + 1}</span>
                    <div>
                      <h3 className="font-display text-xl text-paper">{item.title}</h3>
                      <p className="mt-1 max-w-[380px] text-sm leading-6 text-paper/55">{item.body}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="relative border border-paper/20 bg-paper p-5 text-ink shadow-[8px_8px_0_rgba(217,255,67,0.9)] sm:p-6">
                <div className="flex items-start justify-between border-b border-line pb-4">
                  <div>
                    <p className="label mb-1 text-[8px]">LIVE RESULT / DINNER</p>
                    <h3 className="font-display text-2xl">周六，去城外吃一顿</h3>
                  </div>
                  <div className="flex items-center gap-1.5 border border-line bg-paper px-2 py-1">
                    <span className="live-dot" />
                    <span className="font-mono text-[9px]">LIVE</span>
                  </div>
                </div>

                <div className="mt-4 flex items-end justify-between">
                  <div>
                    <p className="label text-[9px]">目前最多人选</p>
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
                  <span className="font-mono text-[9px] text-muted">9 人已参与</span>
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
                <p className="label mb-6 text-[9px] text-ink/60">READY WHEN YOU ARE</p>
                <h2 className="font-display text-[clamp(2.6rem,7vw,6rem)] leading-[0.95] tracking-[-0.04em]">
                  下一次，
                  <br />
                  别再说
                  <span className="serif-italic">「都行」</span>。
                </h2>
                <p className="mt-6 max-w-[430px] text-sm leading-6 text-ink/70">
                  建一张卡，发一个链接。三分钟后，你会知道大家到底想要什么。
                </p>
                <div className="mt-8 flex flex-wrap gap-3">
                  <Link href="/register" className="btn btn-dark">
                    免费创建账号
                    <ArrowRight size={16} />
                  </Link>
                  <Link href="/login" className="btn border-ink bg-transparent">
                    用演示账号体验
                  </Link>
                </div>
              </div>

              <div className="relative hidden h-[210px] w-[210px] shrink-0 items-center justify-center lg:flex">
                <div className="spin-slow absolute inset-0 rounded-full border border-dashed border-ink/40" />
                <div className="absolute inset-5 rounded-full border border-ink/30" />
                <div className="flex h-28 w-28 rotate-[-8deg] flex-col items-center justify-center border border-ink bg-paper shadow-[4px_4px_0_#171714]">
                  <span className="font-display text-4xl">Q</span>
                  <span className="font-mono text-[8px] tracking-[0.2em]">SETTLED</span>
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
  index,
  icon,
  title,
  body,
  children,
  className = "",
}: {
  index: string;
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
      <div className="mb-5 flex items-start justify-between">
        <span className="flex h-9 w-9 items-center justify-center border border-line-strong bg-paper">
          {icon}
        </span>
        <span className="font-mono text-[9px] tracking-wide text-muted">{index}</span>
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
      <div className="flex items-center justify-between border border-ink bg-surface px-2.5 py-1.5">
        <span className="text-[10px] font-medium">周六，去城外吃一顿</span>
        <span className="font-mono text-[8px] text-muted">TITLE</span>
      </div>
      <div className="flex items-center justify-between border border-line bg-surface px-2.5 py-1.5">
        <span className="text-[10px]">周六 17:30</span>
        <span className="font-mono text-[8px] text-muted">TIME</span>
      </div>
      <div className="flex items-center justify-between border border-line bg-surface px-2.5 py-1.5">
        <span className="text-[10px]">梧桐小院</span>
        <span className="font-mono text-[8px] text-muted">PLACE</span>
      </div>
      <div className="flex items-center justify-between border border-dashed border-line-strong px-2.5 py-1.5">
        <span className="text-[10px] text-muted">+ 添加问题</span>
        <span className="font-mono text-[8px] text-muted">OPTIONAL</span>
      </div>
    </div>
  );
}

function MiniShare() {
  return (
    <div className="w-full space-y-3">
      <div className="flex items-center gap-2 border border-line-strong bg-surface px-2.5 py-2">
        <Link2 size={11} className="text-muted" />
        <span className="truncate font-mono text-[9px]">quorum.app/a/DINNER</span>
      </div>
      <div className="flex items-center justify-between">
        <AvatarStack names={["阿策", "Momo", "周周", "Ken", "小满"]} max={5} />
        <span className="font-mono text-[8px] text-muted">0 SIGN-UP</span>
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
      <div className="flex items-center justify-between">
        <span className="flex items-center gap-1.5 font-mono text-[8px] tracking-wide">
          <span className="live-dot" /> LIVE
        </span>
        <span className="font-mono text-[8px] text-muted">9 人</span>
      </div>
      {[
        { label: "周六 17:30", width: "62%", count: 5 },
        { label: "周六 19:00", width: "25%", count: 2 },
        { label: "周日 12:00", width: "13%", count: 1 },
      ].map((row, index) => (
        <div key={row.label}>
          <div className="mb-1 flex justify-between text-[9px]">
            <span>{row.label}</span>
            <span className="font-mono text-muted">{row.count}</span>
          </div>
          <div className="h-2 bg-line/50">
            <div className={`h-full ${index === 0 ? "bg-coral" : "bg-ink/25"}`} style={{ width: row.width }} />
          </div>
        </div>
      ))}
      <div className="flex justify-end">
        <span className="rotate-[-4deg] border border-ink bg-acid px-2 py-0.5 font-mono text-[8px] tracking-wide">
          SETTLED
        </span>
      </div>
    </div>
  );
}
