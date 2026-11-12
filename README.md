# Quorum · 一群人，一个答案

Quorum 是一个「轻量共识工具」：发起人用两分钟做一张决策卡，把链接丢进群里，所有人不用注册就能投票。时间、地点、自定义问题、提议与附议、费用追踪、实时结果和 CSV 导出都在同一张卡上完成。

它解决的是一个很具体、很日常的问题：**群聊里 40 条「都行」之后，仍然没有人知道到底几点、在哪。** Quorum 把这段拉扯压缩成一次清晰的收敛过程。

> 这是一个完整的重写项目（产品定位、信息架构、视觉系统、数据模型与接口全部重新设计），不是在原页面上换皮。

---

## 体验入口

```bash
npm install
npm run db:push
npm run db:seed
npm run dev
```

打开 http://localhost:3000

| 入口 | 说明 |
| --- | --- |
| 演示账号 | `demo@quorum.app` / `quorum123` |
| 进行中的聚餐卡 | `/a/DINNER` |
| 读书会 | `/a/READ07` |
| 团队 Offsite | `/a/TEAM09` |
| 实时结果 | `/a/DINNER/results` |

登录页提供「用演示账号进入」一键按钮。参与者侧无需任何账号。

---

## 产品能力

**发起人**

- 四步创建向导：基本信息 → 时间与地点 → 自定义问题 → 费用与发布
- 四个可复用模板（周末聚餐 / 团队团建 / 读书会 / 短途出行），自动带出合理的时间、地点与问题
- 草稿自动保存到 localStorage；生成式封面实时预览，可切换六套配色或填写图片链接
- 单轮时间/地点投票、单选或多选、截止时间、是否开放提议
- 控制台：实时票数、参与者名单、自定义回答、支付勾选、关闭/重开投票、修改截止时间、删除
- 一键复制链接、二维码分享、CSV 导出（姓名、支付、选择、回答、附议）
- 活动结束后结果页保留为最终状态

**参与者**

- 打开链接 → 填名字 → 选项 → 提交，全程无需注册
- 同一浏览器自动记住身份，截止前可反复修改
- 提交后才看到票数，避免从众
- 可补充提议并附议别人的提议
- 页面通过 SSE 实时更新票数与参与者

**实时性**

- `GET /api/activities/[code]/stream` 提供 SSE：连接即推送一次快照，之后每次投票/提议/支付变更即时推送
- 进程内 pub/sub 负责低延迟广播，同时每 10 秒做一次数据库对账，防止多实例或重启导致的状态漂移
- 20 秒心跳保活；客户端断线由 `EventSource` 自动重连

---

## 技术栈

| 层 | 选择 |
| --- | --- |
| 框架 | Next.js 16 App Router + React 19 + TypeScript strict |
| 样式 | Tailwind CSS v4（`@theme` design tokens） |
| 数据 | Prisma 6 + SQLite（可平滑替换 Postgres） |
| 校验 | Zod v4 |
| 认证 | 自建 session：scrypt 密码哈希 + DB session + HttpOnly Cookie |
| 即时通信 | Server-Sent Events，无额外基础设施 |
| 图标 / 二维码 | lucide-react / qrcode.react |

---

## 架构决策

### 1. 通用 PollOption，而不是 time/place 两套模型

时间和地点共享 `PollOption(kind, label, note, startsAt, endsAt, sortOrder)`。投票、计票、导出、实时快照只写一次，新增「吃什么」这类投票维度时不需要改表结构。

### 2. 数据库 session，而不是内存 Map

原型的 session 存在进程内存里，重启即掉登录。现在 `Session` 表保存 SHA-256 后的 token，Cookie 只持有原始随机值；30 天 TTL，退出即删除。`secure` 标记按请求协议推断，本地 HTTP 与线上 HTTPS 都能正常工作。

### 3. 服务端只返回该返回的东西

`PublicParticipant` 对匿名访问者只暴露 `id / name / createdAt`；支付状态、逐人选项、自定义回答只在组织者自己的响应中出现。结果页对公开访问也只展示聚合票数，不展示支付信息。

### 4. 投票写入是事务

一次提交会在事务里 upsert 参与者、清空旧票、重建新票，避免「改票后出现重复票」。数据库层再用 `@@unique([participantId, optionId])` 兜底。

### 5. 校验在边界，不在 UI

所有写接口用 Zod 校验：活动是否开放、是否过截止、选项是否属于该活动、单选是否只选一个、必填问题是否填写、select 值是否合法。UI 的禁用态只是体验优化，不是安全边界。

### 6. 视觉是系统，不是装饰

- 暖纸底 + 酸柠绿 + 珊瑚红，Instrument Serif / Geist / JetBrains Mono 三层字体
- 无外部图片依赖：封面由 CSS 色板 + SVG 几何图案 + 巨大 Q 水印生成
- 纸格纹、点阵深色区、噪点覆盖、滚动驱动 reveal、实时投票条
- 完整 `prefers-reduced-motion` 降级与打印样式

---

## 目录速览

```
src/
  app/
    page.tsx                 # 产品首页
    login|register/          # 认证
    app/                     # 组织者工作台（受保护）
      page.tsx               # 决策卡列表
      [code]/page.tsx        # 控制台
    new/                     # 创建向导
    a/[code]/                # 公开决策卡
      results/               # 实时结果大屏
    api/                     # Route Handlers
  components/                # UI、向导、投票、结果、控制台
  lib/                       # auth/session/db/activities/validation/realtime
prisma/
  schema.prisma
  seed.ts
```

## 数据模型

`User → Activity → PollOption / CustomField / Suggestion / Participant`
`Participant → Vote`、`Participant → SuggestionVote`，均为级联删除。
`Activity.shareCode` 唯一；分享码排除了 `0/O/1/I` 等易混字符。

## 已知边界

- SQLite + 进程内 pub/sub 适合单实例演示；多实例部署时应将广播层换成 Redis，并把数据库切到 Postgres。
- 参与者身份由浏览器 localStorage 的 `clientKey` 维持，清除浏览器数据后会被视为新参与者（这是「免注册」的取舍）。
- 未接入邮件/短信通知；分享依赖链接与二维码。

---

## 验证

```bash
npm run typecheck   # tsc --noEmit
npm run build       # production build
```

端到端手动验证覆盖：注册/登录、创建（模板与空白）、公开投票与改票、提议与附议、实时结果、支付勾选、关闭投票、CSV 导出、删除与 404。
