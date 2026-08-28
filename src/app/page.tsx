import Link from "next/link";
import MacWindow from "@/components/MacWindow";

export default function HomePage() {
  return (
    <div className="flex-1">
      {/* ============ HERO ============ */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-meet-100 via-meet-50 to-white" aria-hidden="true" />

        <div className="relative max-w-6xl mx-auto px-4 sm:px-6 pt-20 pb-28 lg:pt-28 lg:pb-36">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            {/* 文案 */}
            <div className="text-center lg:text-left">
              <div className="inline-flex items-center gap-2 bg-white/70 backdrop-blur-sm rounded-full px-4 py-1.5 text-sm text-meet-700 mb-8 anim-fade-up border border-meet-100">
                <span className="w-2 h-2 rounded-full bg-meet-400 animate-pulse" />
                <span className="font-medium">实时协作 / 免注册参与 / 全平台适配</span>
              </div>

              <h1 className="anim-fade-up" style={{ animationDelay: "0.1s" }}>
                <span className="block font-display text-5xl sm:text-6xl lg:text-7xl leading-tight">
                  <span className="text-meet-800">让聚会</span>
                  <br />
                  <span className="art-title">更简单</span>
                </span>
              </h1>

              <p className="mt-6 text-lg sm:text-xl text-meet-700/70 max-w-xl mx-auto lg:mx-0 anim-fade-up" style={{ animationDelay: "0.2s" }}>
                <span className="font-semibold text-meet-600">MeetEase</span> 帮你搞定
                动态表单、智能投票与实时决策。
                告别群聊刷屏，几分钟定下大家都有空的时间与地点。
              </p>

              <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center lg:justify-start anim-fade-up" style={{ animationDelay: "0.3s" }}>
                <Link
                  href="/create"
                  className="btn-sun text-white font-semibold px-8 py-3.5 rounded-2xl inline-flex items-center justify-center gap-2"
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                  </svg>
                  创建活动
                </Link>
                <Link
                  href="#features"
                  className="bg-white/70 backdrop-blur-sm text-meet-700 font-semibold px-8 py-3.5 rounded-2xl inline-flex items-center justify-center gap-2 hover:bg-white transition border border-meet-100"
                >
                  了解功能
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                  </svg>
                </Link>
              </div>

              <div className="mt-12 flex items-center justify-center lg:justify-start gap-10 anim-fade-up" style={{ animationDelay: "0.4s" }}>
                {[
                  ["3 步", "搞定一场活动"],
                  ["0 注册", "参与零门槛"],
                  ["实时", "投票即见"],
                ].map(([num, label]) => (
                  <div key={num} className="text-center">
                    <div className="text-2xl font-bold text-meet-700">{num}</div>
                    <div className="text-xs text-meet-500/70 mt-1">{label}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* macOS 窗口演示 */}
            <div className="relative anim-fade-up" style={{ animationDelay: "0.25s" }}>
              <div className="absolute -inset-4 bg-gradient-to-br from-meet-200/40 to-meet-100/40 rounded-[32px] blur-2xl" aria-hidden="true" />
              <MacWindow title="MeetEase 聚会 - 周末烧烤局" className="relative rotate-1 hover:rotate-0 transition-transform duration-500">
                <div className="p-6 space-y-4">
                  <div>
                    <h3 className="font-display text-xl text-meet-800">周末烧烤局</h3>
                    <p className="text-sm text-meet-600/60 mt-1">选个大家都方便的时间，一起去海边烧烤吧！</p>
                  </div>

                  <div>
                    <p className="text-xs font-semibold text-meet-600 mb-2">选择时间</p>
                    <div className="space-y-2">
                      {[
                        { label: "周六 17:00 - 21:00", votes: 8, best: true },
                        { label: "周日 16:00 - 20:00", votes: 5, best: false },
                        { label: "周五 18:30 - 22:00", votes: 3, best: false },
                      ].map((opt) => (
                        <div
                          key={opt.label}
                          className={`flex items-center gap-3 px-3 py-2.5 rounded-xl border ${
                            opt.best
                              ? "border-meet-200 bg-gradient-to-r from-meet-50 to-white"
                              : "border-meet-100 bg-white/60"
                          }`}
                        >
                          <span className={`w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0 ${
                            opt.best ? "border-meet-500 bg-meet-500" : "border-meet-300"
                          }`}>
                            {opt.best && <span className="w-1.5 h-1.5 rounded-full bg-white" />}
                          </span>
                          <span className="text-sm text-meet-800 flex-1">{opt.label}</span>
                          {opt.best && (
                            <span className="text-[10px] font-semibold text-meet-600 bg-meet-50 px-2 py-0.5 rounded-full">
                              {opt.votes} 票 / 最优
                            </span>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <p className="text-xs font-semibold text-meet-600 mb-2">选择地点</p>
                    <div className="flex gap-2">
                      {["海边公园", "天台烧烤", "河畔营地"].map((loc, i) => (
                        <div
                          key={loc}
                          className={`flex-1 text-center px-2 py-2.5 rounded-xl border text-xs ${
                            i === 0 ? "border-meet-200 bg-meet-50 text-meet-700" : "border-meet-100 bg-white/60 text-meet-600"
                          }`}
                        >
                          {loc}
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="flex gap-2 pt-1">
                    <div className="flex-1 bg-meet-500 text-white text-sm font-semibold py-2.5 rounded-xl text-center">
                      提交投票
                    </div>
                    <div className="bg-white/70 backdrop-blur-sm text-meet-700 text-sm font-semibold py-2.5 rounded-xl text-center px-4 border border-meet-100">
                      实时结果
                    </div>
                  </div>
                </div>
              </MacWindow>
            </div>
          </div>
        </div>
      </section>

      {/* ============ 功能 ============ */}
      <section id="features" className="bg-white relative">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-24">
          <div className="text-center mb-16">
            <span className="inline-block font-semibold text-meet-500 text-sm tracking-widest mb-3">FEATURES</span>
            <h2 className="font-display text-4xl sm:text-5xl text-meet-800">
              一切，为聚会而生
            </h2>
            <p className="mt-4 text-lg text-meet-600/70 max-w-2xl mx-auto">
              从动态表单到实时投票，我们提供组织聚会所需的全部工具。
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((f, i) => (
              <div
                key={f.title}
                className="bg-white rounded-3xl p-7 border border-meet-100 hover:border-meet-200 hover:shadow-lg hover:shadow-meet-100/50 transition-all duration-300 anim-fade-up"
                style={{ animationDelay: `${i * 0.08}s` }}
              >
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-meet-400 to-meet-600 flex items-center justify-center mb-5 shadow-lg shadow-meet-200/40">
                  {f.icon}
                </div>
                <h3 className="font-display text-xl text-meet-800 mb-2">{f.title}</h3>
                <p className="text-sm text-meet-600/70 leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ============ 怎么用 ============ */}
      <section id="how" className="relative bg-meet-50/50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-24">
          <div className="text-center mb-16">
            <span className="inline-block font-semibold text-meet-500 text-sm tracking-widest mb-3">HOW IT WORKS</span>
            <h2 className="font-display text-4xl sm:text-5xl text-meet-800">
              三步搞定一场聚会
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {steps.map((s, i) => (
              <div key={s.title} className="relative anim-fade-up" style={{ animationDelay: `${i * 0.12}s` }}>
                {i < 2 && (
                  <div className="hidden md:block absolute top-10 left-[calc(50%+3rem)] w-[calc(100%-6rem)] h-px bg-meet-200" aria-hidden="true" />
                )}
                <div className="bg-white rounded-3xl p-8 text-center border border-meet-100 hover:border-meet-200 transition-all duration-300">
                  <div className="relative w-20 h-20 mx-auto mb-6">
                    <div className="absolute inset-0 bg-meet-100 rounded-full blur-lg" aria-hidden="true" />
                    <div className="relative w-20 h-20 rounded-full bg-gradient-to-br from-meet-300 to-meet-500 flex items-center justify-center shadow-lg shadow-meet-200/50">
                      <span className="font-bold text-2xl text-white">{i + 1}</span>
                    </div>
                  </div>
                  <h3 className="font-display text-xl text-meet-800 mb-3">{s.title}</h3>
                  <p className="text-sm text-meet-600/70 leading-relaxed">{s.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ============ 全站业务一览 ============ */}
      <section id="business" className="bg-white relative">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-24">
          <div className="text-center mb-16">
            <span className="inline-block font-semibold text-meet-500 text-sm tracking-widest mb-3">FULL PRODUCT</span>
            <h2 className="font-display text-4xl sm:text-5xl text-meet-800">
              全站业务，完整闭环
            </h2>
            <p className="mt-4 text-lg text-meet-600/70 max-w-2xl mx-auto">
              从创建到决策，从分享到导出，每一个环节都已就绪。
            </p>
          </div>

          <MacWindow title="MeetEase · 业务闭环" className="max-w-5xl mx-auto">
            {/* 业务闭环流程 */}
            <div className="p-6 sm:p-8">
              <div className="grid sm:grid-cols-5 gap-3 mb-10">
                {flowSteps.map((step, i) => (
                  <div key={step.title} className="relative text-center">
                    {i < flowSteps.length - 1 && (
                      <div className="hidden sm:block absolute top-7 left-[calc(50%+1.75rem)] w-[calc(100%-3.5rem)] h-px bg-meet-200" aria-hidden="true" />
                    )}
                    <div className="relative w-14 h-14 mx-auto rounded-2xl bg-gradient-to-br from-meet-400 to-meet-600 flex items-center justify-center shadow-lg shadow-meet-200/50 mb-3">
                      {step.icon}
                    </div>
                    <div className="text-sm font-semibold text-meet-800">{step.title}</div>
                    <div className="text-[11px] text-meet-500/70 mt-1 leading-relaxed whitespace-pre-line">{step.desc}</div>
                  </div>
                ))}
              </div>

              {/* 已实现功能模块 */}
              <div className="rounded-2xl border border-meet-100 bg-meet-50/40 p-6">
                <div className="flex items-center justify-between mb-5">
                  <h3 className="font-display text-lg text-meet-800">已实现功能模块</h3>
                  <span className="text-xs font-semibold text-meet-600 bg-meet-100 px-3 py-1 rounded-full">
                    共 {modules.length} 项
                  </span>
                </div>
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
                  {modules.map((m) => (
                    <div key={m} className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl bg-white border border-meet-100 text-sm text-meet-800">
                      <span className="w-2 h-2 rounded-full bg-meet-500 shrink-0" />
                      {m}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </MacWindow>
        </div>
      </section>

      {/* ============ CTA ============ */}
      <section className="relative overflow-hidden bg-gradient-to-br from-meet-500 to-meet-600">
        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 py-20 text-center">
          <h2 className="font-display text-4xl sm:text-5xl text-white">
            现在就创建你的聚会
          </h2>
          <p className="mt-4 text-lg text-white/80">
            免费、免注册、几分钟搞定。参与者只需一个链接。
          </p>
          <Link
            href="/create"
            className="mt-8 inline-flex items-center gap-2 bg-white text-meet-600 font-bold px-10 py-4 rounded-2xl shadow-2xl hover:shadow-3xl hover:scale-105 transition-all duration-300"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
            </svg>
            开始创建
          </Link>
        </div>
      </section>

      {/* ============ 页脚 ============ */}
      <footer className="bg-meet-900 text-meet-300/70">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-14">
          <div className="grid md:grid-cols-4 gap-10">
            {/* 品牌 */}
            <div className="md:col-span-1">
              <p className="font-display text-xl text-white mb-2">MeetEase 聚会</p>
              <p className="text-sm leading-relaxed">专业活动组织平台。动态表单、智能投票、实时决策，让组织更简单，让参与更自由。</p>
            </div>

            {/* 快速导航 */}
            <div>
              <p className="text-sm font-semibold text-white mb-4">快速导航</p>
              <ul className="space-y-2.5 text-sm">
                <li><Link href="/" className="hover:text-white transition">首页</Link></li>
                <li><Link href="/create" className="hover:text-white transition">创建活动</Link></li>
                <li><Link href="/dashboard" className="hover:text-white transition">我的活动</Link></li>
                <li><Link href="/#business" className="hover:text-white transition">全站业务</Link></li>
              </ul>
            </div>

            {/* 产品 */}
            <div>
              <p className="text-sm font-semibold text-white mb-4">产品功能</p>
              <ul className="space-y-2.5 text-sm">
                <li><Link href="/#features" className="hover:text-white transition">动态表单</Link></li>
                <li><Link href="/#features" className="hover:text-white transition">智能投票</Link></li>
                <li><Link href="/#features" className="hover:text-white transition">实时结果</Link></li>
                <li><Link href="/#features" className="hover:text-white transition">地图选点</Link></li>
              </ul>
            </div>

            {/* 联系与开源 */}
            <div>
              <p className="text-sm font-semibold text-white mb-4">联系与开源</p>
              <ul className="space-y-2.5 text-sm">
                <li>
                  <a
                    href="https://github.com/chcucu/meetease"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 hover:text-white transition"
                  >
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                      <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.48 2 2 6.58 2 12.25c0 4.53 2.87 8.37 6.84 9.73.5.09.68-.22.68-.49 0-.24-.01-.87-.01-1.7-2.78.62-3.37-1.37-3.37-1.37-.45-1.18-1.11-1.5-1.11-1.5-.91-.63.07-.62.07-.62 1 .07 1.53 1.06 1.53 1.06.89 1.56 2.34 1.11 2.91.85.09-.66.35-1.11.63-1.37-2.22-.26-4.56-1.14-4.56-5.07 0-1.12.39-2.03 1.03-2.75-.1-.26-.45-1.3.1-2.71 0 0 .84-.28 2.75 1.05a9.36 9.36 0 015 0c1.91-1.33 2.75-1.05 2.75-1.05.55 1.41.2 2.45.1 2.71.64.72 1.03 1.63 1.03 2.75 0 3.94-2.34 4.81-4.57 5.06.36.32.68.94.68 1.9 0 1.37-.01 2.47-.01 2.81 0 .27.18.59.69.49A10.02 10.02 0 0022 12.25C22 6.58 17.52 2 12 2z" />
                    </svg>
                    GitHub 开源仓库
                  </a>
                </li>
                <li>
                  <a
                    href="mailto:chenjh8557@outlook.com"
                    className="inline-flex items-center gap-2 hover:text-white transition"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                    chenjh8557@outlook.com
                  </a>
                </li>
                <li>
                  <a
                    href="https://github.com/chcucu/meetease/issues"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 hover:text-white transition"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 0V16.5a3 3 0 11-5.367 2.684 3 3 0 015.367-2.684z" />
                    </svg>
                    反馈与建议
                  </a>
                </li>
              </ul>
            </div>
          </div>

          {/* 底部版权行 */}
          <div className="mt-12 pt-6 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
            <p>&copy; 2026 MeetEase 聚会 · 让聚会更简单</p>
            <p className="flex items-center gap-4">
              <span className="inline-flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-meet-gold-400" />
                开源项目 · MIT License
              </span>
              <span>v0.1.0</span>
              <span>地图数据 &copy; 高德地图</span>
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}

const features = [
  {
    title: "动态表单",
    desc: "拖拽式自定义收集字段：文本、单选、多选、数字，还能设置必填与条件联动。",
    icon: <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>,
  },
  {
    title: "智能投票",
    desc: "时间、地点、自定义选项一键投票，单选多选随心配，实时计票自动高亮最优选项。",
    icon: <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>,
  },
  {
    title: "自由提议",
    desc: "参与者可以提出新时间、新地点，大家一起投票决定，让决策真正民主。",
    icon: <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>,
  },
  {
    title: "实时同步",
    desc: "投票结果毫秒级同步到所有设备，打开结果页就能看到实时变化。",
    icon: <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>,
  },
  {
    title: "免注册参与",
    desc: "参与者通过链接即可加入，无需注册、无需下载，零门槛参与。",
    icon: <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" /></svg>,
  },
  {
    title: "全平台适配",
    desc: "移动优先设计，从折叠屏到带鱼屏都能完美呈现，触控友好。",
    icon: <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 18h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" /></svg>,
  },
];

const steps = [
  {
    title: "创建活动",
    desc: "设置活动信息、时间地点选项与自定义收集字段，用模板或从零开始。",
  },
  {
    title: "分享链接",
    desc: "把专属链接或二维码发给参与者，他们无需注册即可加入。",
  },
  {
    title: "一起决定",
    desc: "大家投票选时间、选地点、提建议，实时结果一目了然。",
  },
];

const flowSteps = [
  {
    title: "创建",
    desc: "动态表单\n图片地图",
    icon: <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" /></svg>,
  },
  {
    title: "分享",
    desc: "专属链接\n免注册加入",
    icon: <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M13.19 8.688a4.5 4.5 0 011.242 7.244l-4.5 4.5a4.5 4.5 0 01-6.364-6.364l1.757-1.757m13.35-.622l1.757-1.757a4.5 4.5 0 00-6.364-6.364l-4.5 4.5a4.5 4.5 0 001.242 7.244" /></svg>,
  },
  {
    title: "投票",
    desc: "时间地点\n自由提议",
    icon: <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>,
  },
  {
    title: "实时结果",
    desc: "毫秒同步\n最优高亮",
    icon: <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>,
  },
  {
    title: "导出决策",
    desc: "结果导出\n费用追踪",
    icon: <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>,
  },
];

const modules = [
  "动态表单构建器",
  "时间智能投票",
  "地点智能投票",
  "自定义选项投票",
  "自由提议与投票",
  "实时结果 SSE",
  "地图选点（高德）",
  "图片上传",
  "费用管理",
  "登录注册",
  "我的活动看板",
  "结果导出",
  "macOS 启动台与 Dock",
  "免注册参与",
  "全平台响应式适配",
];