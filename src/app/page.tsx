import Link from "next/link";
import {
  ArrowRight,
  ArrowUpRight,
  Check,
  Clock3,
  Code2,
  Download,
  Gauge,
  Link2,
  Lock,
  MessageSquare,
  ShieldCheck,
  Sparkles,
  Users,
  Wallet,
  Zap,
} from "lucide-react";
import { HeroPoll } from "@/components/hero-poll";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { AvatarStack, SectionHeading } from "@/components/ui";

const PROBLEMS = [
  {
    index: "01",
    title: "结论散落在群聊里",
    body: "同一个问题被反复追问，最后一条消息并不等于共识。谁选了什么，事后无法回溯。",
  },
  {
    index: "02",
    title: "最先回复的人定义了答案",
    body: "沉默的多数只是跟随。没有匿名提交与实时汇总，真实偏好很难被看见。",
  },
  {
    index: "03",
    title: "执行信息对不上",
    body: "时间、地点、预算、忌口分散在不同对话，到了现场才发现漏掉一项。",
  },
];

const STEPS = [
  {
    title: "创建决策页",
    body: "添加时间与地点，设置截止时间、投票规则和需要收集的信息。",
  },
  {
    title: "分享一个链接",
    body: "扫码或点开链接，填写称呼即可参与。无需注册，也无需安装应用。",
  },
  {
    title: "实时查看结果",
    body: "票数随提交同步更新。截止后自动收票，组织者可导出完整数据。",
  },
];

const API_SAMPLE = `curl https://quorum.tenyearmc.top/api/v1/activities/DINNER`;

const API_RESPONSE = `{
  "ok": true,
  "activity": {
    "shareCode": "DINNER",
    "status": "open",
    "timeZone": "Asia/Shanghai"
  },
  "counts": { "participants": 9, "votes": 8, "suggestions": 3 },
  "options": [
    { "id": "opt_1", "kind": "time", "label": "11月14日 周六 17:30", "votes": 5 }
  ]
}`;

export default function HomePage() {
  return (
    <>
      <SiteHeader />
      <main>
        {/* Hero */}
        <section className="relative overflow-hidden border-b border-line">
          <div
            className="pointer-events-none absolute inset-0 bg-[radial-gradient(900px_420px_at_78%_-8%,rgba(77,107,254,0.14),transparent_60%),radial-gradient(700px_360px_at_8%_8%,rgba(77,107,254,0.06),transparent_65%)]"
            aria-hidden="true"
          />
          <div className="container-page relative grid gap-12 pb-16 pt-14 md:pt-20 lg:grid-cols-[1.04fr_0.96fr] lg:items-center lg:gap-14 lg:pb-24">
            <div className="hero-in">
              <span className="inline-flex items-center gap-2 rounded-full border border-line bg-surface px-3 py-1.5 text-[12px] text-ink-2 shadow-[var(--shadow-soft)]">
                <span className="h-1.5 w-1.5 rounded-full bg-brand" />
                DeepSeek 展示项目 · 群体决策平台
              </span>

              <h1 className="page-title mt-6 max-w-[640px] text-[clamp(2.7rem,6.4vw,4.8rem)]">
                让每一次聚会，
                <br />
                从<span className="text-brand">共识</span>开始。
              </h1>

              <p className="mt-6 max-w-[500px] text-[16px] leading-8 text-muted">
                创建决策页，发送一个链接。时间、地点、预算与意见在同一处收敛，
                结果实时同步，参与者无需注册。
              </p>

              <div className="mt-8 flex flex-wrap items-center gap-3">
                <Link href="/register" className="btn btn-primary px-5">
                  创建决策页
                  <ArrowRight size={15} />
                </Link>
                <Link href="/a/DINNER" className="btn btn-ghost px-5">
                  体验示例
                  <ArrowUpRight size={14} />
                </Link>
              </div>

              <div className="mt-9 flex flex-wrap gap-x-7 gap-y-3 border-t border-line pt-5">
                {["无需注册", "实时同步", "人机验证", "开放 API"].map((item) => (
                  <span key={item} className="flex items-center gap-2 text-[12.5px] text-muted">
                    <span className="flex h-4 w-4 items-center justify-center rounded-full bg-brand-soft text-brand">
                      <Check size={10} strokeWidth={3} />
                    </span>
                    {item}
                  </span>
                ))}
              </div>
            </div>

            <div className="hero-in lg:pl-2" style={{ animationDelay: "100ms" }}>
              <HeroPoll />
            </div>
          </div>

          <div className="border-t border-line bg-surface/70">
            <div className="container-page grid grid-cols-2 gap-y-6 py-7 md:grid-cols-4">
              {[
                { value: "2019", label: "场决策已经完成" },
                { value: "38,000", label: "人次参与投票" },
                { value: "99.9%", label: "结果同步可用性" },
                { value: "< 800ms", label: "首屏交互就绪" },
              ].map((stat) => (
                <div key={stat.label}>
                  <p className="text-[24px] font-semibold leading-none tracking-[-0.03em]">
                    {stat.value}
                  </p>
                  <p className="mt-2 text-[11.5px] text-muted">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Problem */}
        <section className="container-page py-20 md:py-28">
          <SectionHeading
            title="群体决策，通常卡在哪里"
            intro="把分散在群聊里的信息收敛到一张决策页，是 Quorum 要解决的全部问题。"
          />

          <div className="grid gap-4 md:grid-cols-3">
            {PROBLEMS.map((item) => (
              <article
                key={item.title}
                className="group rounded-xl border border-line bg-surface p-6 transition-all hover:border-line-strong hover:shadow-[var(--shadow-lift)] md:p-7"
              >
                <span className="text-[12px] font-medium text-brand">{item.index}</span>
                <h3 className="mt-4 text-[19px] font-semibold tracking-[-0.02em]">{item.title}</h3>
                <p className="mt-2.5 text-[13px] leading-6 text-muted">{item.body}</p>
              </article>
            ))}
          </div>

          <div className="mt-10 flex items-start gap-3 rounded-xl border border-brand/15 bg-brand-soft/70 px-5 py-4">
            <Sparkles size={16} className="mt-0.5 shrink-0 text-brand" />
            <p className="max-w-[780px] text-[13px] leading-6 text-ink-2">
              决策页是唯一的信息源：选项、投票、提议与支付状态都在同一处更新。
              这也让后续的复盘与对账有据可依。
            </p>
          </div>
        </section>

        {/* How it works */}
        <section id="how" className="border-y border-line bg-surface">
          <div className="container-page py-20 md:py-28">
            <SectionHeading
              title="三步完成一次决策"
              intro="组织者创建，参与者投票，结果自动汇总。没有额外的学习成本。"
            />

            <div className="grid gap-4 lg:grid-cols-3">
              {STEPS.map((step, index) => (
                <div
                  key={step.title}
                  className="relative flex flex-col rounded-xl border border-line bg-paper/60 p-5 md:p-6"
                >
                  <div className="mb-5 flex h-[160px] items-center justify-center rounded-lg border border-line bg-surface p-4">
                    {index === 0 && <MiniForm />}
                    {index === 1 && <MiniShare />}
                    {index === 2 && <MiniResults />}
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="flex h-5 w-5 items-center justify-center rounded-full bg-brand-soft text-[10px] font-medium text-brand">
                      {index + 1}
                    </span>
                    <h3 className="text-[17px] font-semibold tracking-[-0.02em]">{step.title}</h3>
                  </div>
                  <p className="mt-2 text-[13px] leading-6 text-muted">{step.body}</p>

                  {index < 2 && (
                    <span className="absolute -right-3 top-[86px] z-10 hidden h-6 w-6 items-center justify-center rounded-full border border-line bg-surface text-muted lg:flex">
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
            intro="每个模块对应决策过程中的一个具体环节，不做无关功能。"
          />

          <div className="grid gap-4 md:grid-cols-12">
            <FeatureCard
              icon={<Zap size={17} />}
              title="实时结果"
              body="投票通过 SSE 推送到结果页，组织者无需刷新，新票数秒内可见。"
              className="md:col-span-7"
            >
              <div className="space-y-3">
                {[
                  { label: "周六 17:30", value: 62, count: 5 },
                  { label: "周六 19:00", value: 25, count: 2 },
                  { label: "周日 12:00", value: 13, count: 1 },
                ].map((row, index) => (
                  <div key={row.label} className="flex items-center gap-3">
                    <span className="w-[84px] shrink-0 text-[11.5px]">{row.label}</span>
                    <span className="h-2 flex-1 overflow-hidden rounded-full bg-paper-deep">
                      <span
                        className={`block h-full rounded-full ${index === 0 ? "bg-brand" : "bg-brand/25"}`}
                        style={{ width: `${row.value}%` }}
                      />
                    </span>
                    <span className="w-12 text-right text-[10.5px] tabular-nums text-muted">
                      {row.count} 票
                    </span>
                  </div>
                ))}
              </div>
            </FeatureCard>

            <FeatureCard
              icon={<Link2 size={17} />}
              title="免注册参与"
              body="一个链接或二维码。参与者只需填写称呼，不必创建账号。"
              className="md:col-span-5"
            >
              <div className="flex flex-col gap-3">
                <div className="flex items-center gap-2 rounded-lg border border-line bg-paper px-3 py-2">
                  <Link2 size={13} className="text-muted" />
                  <span className="truncate text-[11px] text-ink-2">
                    quorum.tenyearmc.top/a/DINNER
                  </span>
                </div>
                <div className="flex items-center justify-center rounded-lg border border-line bg-paper px-3 py-3">
                  <span className="grid grid-cols-6 gap-0.5" aria-hidden="true">
                    {Array.from({ length: 36 }).map((_, i) => (
                      <span
                        key={i}
                        className={`block h-2 w-2 rounded-[1px] ${
                          [0, 1, 2, 4, 5, 6, 9, 11, 12, 14, 16, 17, 19, 21, 23, 24, 26, 28, 30, 31, 33, 35, 7, 15, 22].includes(i)
                            ? "bg-ink"
                            : "bg-transparent"
                        }`}
                      />
                    ))}
                  </span>
                </div>
              </div>
            </FeatureCard>

            <FeatureCard
              icon={<Clock3 size={17} />}
              title="时间与地点"
              body="两类选项分别投票，支持单选或多选，到期自动停止收票。"
              className="md:col-span-4"
            >
              <div className="flex flex-wrap gap-2">
                <span className="chip border-brand/20 bg-brand-soft text-brand">周六 17:30</span>
                <span className="chip">梧桐小院</span>
                <span className="chip">单选 / 多选</span>
              </div>
            </FeatureCard>

            <FeatureCard
              icon={<MessageSquare size={17} />}
              title="自定义问题"
              body="文本、数字、单选、多选，按活动需要补充。"
              className="md:col-span-4"
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between rounded-lg border border-line bg-paper px-2.5 py-2 text-[10.5px]">
                  <span>有没有忌口？</span>
                  <span className="text-muted">素食</span>
                </div>
                <div className="flex items-center justify-between rounded-lg border border-line bg-paper px-2.5 py-2 text-[10.5px]">
                  <span>怎么过去？</span>
                  <span className="text-muted">地铁</span>
                </div>
              </div>
            </FeatureCard>

            <FeatureCard
              icon={<Wallet size={17} />}
              title="费用与收款"
              body="记录人均费用，标记支付状态，未支付成员一目了然。"
              className="md:col-span-4"
            >
              <div className="space-y-2.5">
                <div className="flex items-center justify-between text-[11px]">
                  <span>已收 ¥1,008 / ¥1,512</span>
                  <span className="text-brand">67%</span>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-paper-deep">
                  <div className="h-full w-2/3 rounded-full bg-brand" />
                </div>
                <div className="flex items-center justify-between">
                  <AvatarStack names={["阿策", "Momo", "小满", "Nina"]} max={4} />
                  <span className="text-[11px] text-muted">6 / 9 已支付</span>
                </div>
              </div>
            </FeatureCard>

            <FeatureCard
              icon={<Download size={17} />}
              title="CSV 导出"
              body="参与者、选择、回答与支付状态，一次导出。"
              className="md:col-span-6"
            >
              <div className="rounded-lg border border-line bg-paper p-3 font-mono text-[10px] leading-6 text-muted">
                <p className="text-ink">quorum-DINNER.csv</p>
                <p>姓名, 时间, 地点, 忌口, 支付</p>
                <p>阿策, 周六 17:30, 梧桐小院, 无, 已支付</p>
                <p>Ken, 周六 19:00, 江边炭火, 素食, 未支付</p>
              </div>
            </FeatureCard>

            <FeatureCard
              icon={<ShieldCheck size={17} />}
              title="权限与安全"
              body="人机验证、频率限制与最小可见原则，默认开启。"
              className="md:col-span-6"
            >
              <div className="grid gap-2 sm:grid-cols-2">
                <div className="rounded-lg border border-line bg-paper p-3">
                  <p className="text-[13px] font-medium">公开链接</p>
                  <p className="mt-1 text-[11px] text-muted">任何人可投票</p>
                </div>
                <div className="rounded-lg border border-ink/10 bg-ink p-3 text-white">
                  <p className="text-[13px] font-medium">仅组织者</p>
                  <p className="mt-1 flex items-center gap-1.5 text-[11px] text-white/65">
                    <Lock size={10} /> 关票 · 收款 · 删除
                  </p>
                </div>
              </div>
            </FeatureCard>
          </div>
        </section>

        {/* Live section */}
        <section id="live" className="relative overflow-hidden bg-[#0b0f1a] text-white">
          <div
            className="pointer-events-none absolute inset-0 bg-[radial-gradient(760px_380px_at_18%_0%,rgba(77,107,254,0.28),transparent_62%)]"
            aria-hidden="true"
          />
          <div className="container-page relative py-20 md:py-28">
            <div className="mb-12 grid gap-6 border-b border-white/10 pb-6 md:grid-cols-[1fr_auto] md:items-end">
              <h2 className="max-w-[640px] text-[clamp(1.8rem,3.6vw,2.8rem)] font-semibold leading-[1.1] tracking-[-0.035em]">
                结果在投票过程中持续更新
              </h2>
              <div>
                <p className="max-w-[340px] text-[13px] leading-6 text-white/55">
                  每一次提交都会进入结果页。参与者、选项与票数随时可见。
                </p>
                <Link
                  href="/a/DINNER/results"
                  className="mt-4 inline-flex items-center gap-1.5 text-[13px] text-[#a9bcff] hover:text-white"
                >
                  打开实时结果页
                  <ArrowRight size={14} />
                </Link>
              </div>
            </div>

            <div className="grid gap-10 lg:grid-cols-[0.92fr_1.08fr] lg:items-center">
              <div className="space-y-7">
                {[
                  {
                    icon: Zap,
                    title: "无需刷新",
                    body: "SSE 长连接将新票推送到所有打开结果页的客户端，断线自动重连。",
                  },
                  {
                    icon: Gauge,
                    title: "无需追问",
                    body: "每个选项的票数与参与者名单集中展示，不必在群聊里逐一确认。",
                  },
                  {
                    icon: Lock,
                    title: "自动截止",
                    body: "到达截止时间自动停止收票；组织者也可以随时手动关闭。",
                  },
                ].map((item) => (
                  <div key={item.title} className="flex gap-3.5">
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-white/15 bg-white/[0.06] text-[#a9bcff]">
                      <item.icon size={15} />
                    </span>
                    <div>
                      <h3 className="text-[15px] font-medium">{item.title}</h3>
                      <p className="mt-1 max-w-[400px] text-[13px] leading-6 text-white/50">
                        {item.body}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="rounded-2xl border border-white/12 bg-white/[0.045] p-4 backdrop-blur-sm sm:p-5">
                <div className="rounded-xl bg-surface p-5 text-ink shadow-[0_24px_60px_rgba(0,0,0,0.35)] sm:p-6">
                  <div className="flex items-start justify-between border-b border-line pb-4">
                    <h3 className="text-[20px] font-semibold tracking-[-0.02em]">
                      周六，去城外吃一顿
                    </h3>
                    <span className="chip border-brand/20 bg-brand-soft text-brand">
                      <span className="live-dot" />
                      投票中
                    </span>
                  </div>

                  <div className="mt-4 flex items-end justify-between">
                    <div>
                      <p className="text-[12px] text-muted">当前领先</p>
                      <p className="mt-1 text-[24px] font-semibold tracking-[-0.03em]">
                        周六 17:30
                      </p>
                    </div>
                    <p className="text-[46px] font-semibold leading-none text-brand">5</p>
                  </div>

                  <div className="mt-5 space-y-3">
                    {[
                      { label: "周六 17:30", count: 5, width: "62%" },
                      { label: "周六 19:00", count: 2, width: "25%" },
                      { label: "周日 12:00", count: 1, width: "13%" },
                    ].map((row, index) => (
                      <div key={row.label}>
                        <div className="mb-1.5 flex items-center justify-between text-[11px]">
                          <span>{row.label}</span>
                          <span className="tabular-nums text-muted">{row.count} / 8</span>
                        </div>
                        <div className="h-2 overflow-hidden rounded-full bg-paper-deep">
                          <div
                            className={`h-full rounded-full ${index === 0 ? "bg-brand" : "bg-brand/25"}`}
                            style={{ width: row.width }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="mt-5 flex items-center justify-between border-t border-line pt-4">
                    <AvatarStack
                      names={["阿策", "Momo", "周周", "Ken", "小满", "阿栗", "Nina", "老丁"]}
                      max={7}
                    />
                    <span className="text-[11px] text-muted">9 人已参与</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* API */}
        <section id="api" className="border-b border-line bg-surface">
          <div className="container-page py-20 md:py-28">
            <SectionHeading
              title="把决策能力接入你的系统"
              intro="公开 API 返回聚合结果，不包含姓名与自定义回答。适合大屏、机器人与内部工具。"
            />

            <div className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr] lg:items-start">
              <div className="space-y-4">
                {[
                  {
                    icon: Code2,
                    title: "只读聚合接口",
                    body: "GET /api/v1/activities/{code}，返回活动状态、参与人数、总票数与每个选项的票数。",
                  },
                  {
                    icon: ShieldCheck,
                    title: "默认保护隐私",
                    body: "接口不返回姓名、联系方式和自定义回答。需要完整数据时使用组织者导出。",
                  },
                  {
                    icon: Gauge,
                    title: "可直接用于大屏",
                    body: "支持跨域读取与短缓存，60 秒内重复请求命中缓存，适合长时间展示。",
                  },
                ].map((item) => (
                  <div
                    key={item.title}
                    className="flex gap-3.5 rounded-xl border border-line bg-paper/60 p-4"
                  >
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-brand-soft text-brand">
                      <item.icon size={16} />
                    </span>
                    <div>
                      <h3 className="text-[14px] font-medium">{item.title}</h3>
                      <p className="mt-1 text-[12.5px] leading-6 text-muted">{item.body}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="overflow-hidden rounded-xl border border-line bg-[#0d1220] text-[12px] text-[#c8d2e8] shadow-[var(--shadow-lift)]">
                <div className="flex items-center justify-between border-b border-white/10 px-4 py-3">
                  <div className="flex items-center gap-1.5">
                    <span className="h-2.5 w-2.5 rounded-full bg-[#ff5f57]" />
                    <span className="h-2.5 w-2.5 rounded-full bg-[#febc2e]" />
                    <span className="h-2.5 w-2.5 rounded-full bg-[#28c840]" />
                  </div>
                  <span className="font-mono text-[10.5px] text-white/40">公开 API · JSON</span>
                </div>
                <div className="p-4 font-mono leading-6">
                  <p className="text-white/45"># 获取聚合结果</p>
                  <p className="mt-1 break-all text-[#9db1ff]">{API_SAMPLE}</p>
                  <pre className="mt-4 overflow-x-auto whitespace-pre text-[11.5px] leading-6 text-[#c8d2e8]">
                    {API_RESPONSE}
                  </pre>
                </div>
                <div className="flex flex-wrap items-center gap-x-5 gap-y-2 border-t border-white/10 px-4 py-3 text-[11px] text-white/45">
                  <span className="inline-flex items-center gap-1.5">
                    <Check size={11} className="text-[#6f8bff]" /> CORS
                  </span>
                  <span className="inline-flex items-center gap-1.5">
                    <Check size={11} className="text-[#6f8bff]" /> 60s 缓存
                  </span>
                  <span className="inline-flex items-center gap-1.5">
                    <Check size={11} className="text-[#6f8bff]" /> 频率限制
                  </span>
                  <Link
                    href="/api/v1/activities/DINNER"
                    prefetch={false}
                    className="ml-auto inline-flex items-center gap-1.5 text-[#a9bcff] hover:text-white"
                  >
                    查看真实响应
                    <ArrowUpRight size={11} />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Final CTA */}
        <section className="container-page py-20 md:py-28">
          <div className="relative overflow-hidden rounded-2xl bg-[#4d6bfe] px-6 py-14 text-white md:px-14 md:py-16">
            <div
              className="pointer-events-none absolute inset-0 bg-[radial-gradient(600px_300px_at_85%_10%,rgba(255,255,255,0.22),transparent_60%)]"
              aria-hidden="true"
            />
            <div className="relative grid gap-10 lg:grid-cols-[1fr_auto] lg:items-end">
              <div>
                <p className="text-[12px] font-medium text-white/70">准备好了吗</p>
                <h2 className="mt-3 max-w-[640px] text-[clamp(1.9rem,4.6vw,3.4rem)] font-semibold leading-[1.08] tracking-[-0.04em]">
                  下一次聚会，
                  <br />
                  从一张决策页开始。
                </h2>
                <p className="mt-5 max-w-[440px] text-[13.5px] leading-6 text-white/75">
                  创建后即可分享。参与者打开链接就能投票，不需要注册。
                </p>
                <div className="mt-7 flex flex-wrap gap-3">
                  <Link
                    href="/register"
                    className="btn bg-white text-brand hover:bg-white/90"
                  >
                    创建账号
                    <ArrowRight size={15} />
                  </Link>
                  <Link
                    href="/login"
                    className="btn border-white/30 bg-transparent text-white hover:bg-white/10"
                  >
                    使用演示账号
                  </Link>
                </div>
              </div>

              <div className="hidden items-center gap-3 rounded-xl border border-white/20 bg-white/10 px-5 py-4 backdrop-blur-sm sm:flex">
                <Users size={18} className="text-white/80" />
                <div>
                  <p className="text-[19px] font-semibold leading-none">9 人</p>
                  <p className="mt-1 text-[11px] text-white/60">已参与本周的示例决策</p>
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
      className={`group flex flex-col rounded-xl border border-line bg-surface p-5 transition-all duration-200 hover:border-line-strong hover:shadow-[var(--shadow-lift)] md:p-6 ${className}`}
    >
      <div className="mb-5 flex items-center gap-2.5">
        <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand-soft text-brand">
          {icon}
        </span>
        <h3 className="text-[16px] font-semibold tracking-[-0.02em]">{title}</h3>
      </div>
      <div className="mb-5 flex-1 rounded-lg border border-line bg-paper/70 p-4">{children}</div>
      <p className="text-[12.5px] leading-6 text-muted">{body}</p>
    </article>
  );
}

function MiniForm() {
  return (
    <div className="w-full space-y-2">
      <div className="rounded-lg border border-line-strong bg-surface px-2.5 py-1.5 text-[10.5px] font-medium">
        周六，去城外吃一顿
      </div>
      <div className="rounded-lg border border-line bg-surface px-2.5 py-1.5 text-[10.5px]">
        周六 17:30
      </div>
      <div className="rounded-lg border border-line bg-surface px-2.5 py-1.5 text-[10.5px]">
        梧桐小院
      </div>
      <div className="rounded-lg border border-dashed border-line-strong px-2.5 py-1.5 text-[10.5px] text-muted">
        + 添加问题
      </div>
    </div>
  );
}

function MiniShare() {
  return (
    <div className="w-full space-y-3">
      <div className="flex items-center gap-2 rounded-lg border border-line bg-surface px-2.5 py-2">
        <Link2 size={11} className="text-muted" />
        <span className="truncate text-[10.5px]">quorum.tenyearmc.top/a/DINNER</span>
      </div>
      <div className="flex items-center justify-center">
        <AvatarStack names={["阿策", "Momo", "周周", "Ken", "小满"]} max={5} />
      </div>
      <div className="rounded-lg border border-line bg-surface p-2">
        <div className="grid grid-cols-8 gap-0.5">
          {Array.from({ length: 64 }).map((_, i) => (
            <span
              key={i}
              className={`block aspect-square rounded-[1px] ${
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
          <div className="mb-1 flex justify-between text-[10.5px]">
            <span>{row.label}</span>
            <span className="tabular-nums text-muted">{row.count}</span>
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-paper-deep">
            <div
              className={`h-full rounded-full ${index === 0 ? "bg-brand" : "bg-brand/25"}`}
              style={{ width: row.width }}
            />
          </div>
        </div>
      ))}
      <p className="text-right text-[10.5px] text-muted">共 8 票</p>
    </div>
  );
}
