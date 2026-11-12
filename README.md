# Quorum

Quorum 是一个群体决策页面生成工具。组织者创建决策页，分享链接，参与者无需注册即可提交时间、地点与自定义问题的选择；结果实时汇总。

This is a full rewrite: product model, information architecture, visual system, data model and API are redesigned from scratch.

---

## 快速开始

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
| 进行中的聚餐决策 | `/a/DINNER` |
| 读书会 | `/a/READ07` |
| 已结束的团队 Offsite | `/a/TEAM09` |
| 实时结果 | `/a/DINNER/results` |

登录页提供演示账号一键登录。参与者侧不需要账号。

---

## 功能

**组织者**

- 四步创建向导：基本信息 → 时间与地点 → 自定义问题 → 费用与发布
- 四个模板（周末聚餐 / 团队 Offsite / 读书会 / 短途出行），预填时间、地点与问题
- 草稿保存在 localStorage；封面实时预览，六套配色或自定义图片
- 单轮时间与地点投票，单选或多选，可设置截止时间与是否开放提议
- 控制台：实时票数、参与者名单、自定义回答、支付状态、关闭或重开投票、修改截止时间、删除
- 复制链接、二维码分享、CSV 导出
- 投票关闭后结果页保留为最终状态

**参与者**

- 打开链接，填写姓名，选择选项，提交。全程无需注册
- 同一浏览器内保留身份，截止前可修改
- 提交后才显示票数，减少从众效应
- 可提交提议并附议他人提议
- 页面通过 SSE 实时更新

**实时通信**

- `GET /api/activities/[code]/stream` 建立 SSE 连接：连接时推送快照，投票、提议与支付变更即时推送
- 进程内 pub/sub 负责广播，每 10 秒与数据库对账，避免多实例或重启造成状态漂移
- 20 秒心跳，客户端断线后由 `EventSource` 自动重连

---

## 技术栈

| 层 | 选择 |
| --- | --- |
| 框架 | Next.js 16 App Router, React 19, TypeScript strict |
| 样式 | Tailwind CSS v4（`@theme` tokens） |
| 数据 | Prisma 6 + SQLite（可替换为 Postgres） |
| 校验 | Zod v4 |
| 认证 | Session：scrypt 密码哈希、数据库 session、HttpOnly Cookie |
| 实时 | Server-Sent Events |
| 图标 / 二维码 | lucide-react / qrcode.react |

---

## 设计决策

### 1. 通用 PollOption

时间与地点共用 `PollOption(kind, label, note, startsAt, endsAt, sortOrder)`。投票、计票、导出与实时快照只实现一次；新增投票维度不需要改表结构。

### 2. 数据库 session

`Session` 表保存 SHA-256 后的 token，Cookie 只持有原始随机值。30 天 TTL，退出即删除。`secure` 标记按请求协议推断，本地 HTTP 与线上 HTTPS 均可用。

### 3. 最小化数据暴露

`PublicParticipant` 对匿名访问者只返回 `id / name / createdAt`。支付状态、逐人选项与自定义回答只在组织者的响应中出现。结果页对公开访问只展示聚合票数。

### 4. 投票写入事务化

一次提交在事务中 upsert 参与者、清除旧票、写入新票，避免改票产生重复记录。数据库层用 `@@unique([participantId, optionId])` 约束兜底。

### 5. 校验在接口边界

所有写接口用 Zod 校验活动状态、截止时间、选项归属、单选约束、必填问题与 select 取值。UI 禁用态只负责体验，不承担安全职责。

### 6. 视觉系统

- 暖纸底色、酸柠绿与珊瑚红；Instrument Serif / Geist / JetBrains Mono 三层字体
- 封面由 CSS 色板、SVG 几何图案与 Q 水印生成，无外部图片依赖
- 支持 `prefers-reduced-motion` 降级与打印样式

---

## 目录

```
src/
  app/
    page.tsx                 # 首页
    login|register/          # 认证
    app/                     # 组织者工作台（受保护）
      page.tsx               # 决策列表
      [code]/page.tsx        # 控制台
    new/                     # 创建向导
    a/[code]/                # 公开决策页
      results/               # 实时结果
    api/                     # Route Handlers
  components/                # UI、向导、投票、结果、控制台
  lib/                       # auth/session/db/activities/validation/realtime
prisma/
  schema.prisma
  seed.ts
```

## 数据模型

`User → Activity → PollOption / CustomField / Suggestion / Participant`
`Participant → Vote`、`Participant → SuggestionVote`，级联删除。
`Activity.shareCode` 唯一，生成时排除 `0/O/1/I` 等易混字符。

## 边界

- SQLite 与进程内 pub/sub 适用于单实例演示；多实例部署需将广播层替换为 Redis，数据库切换为 Postgres。
- 参与者身份依赖 localStorage 中的 `clientKey`，清除浏览器数据后会被视为新参与者。这是免注册的取舍。
- 未接入邮件或短信通知，分享依赖链接与二维码。

---

## 验证

```bash
npm run lint
npm run typecheck
npm run build
```

手动验证覆盖：注册与登录、模板与空白创建、公开投票与改票、提议与附议、实时结果、支付标记、关闭投票、CSV 导出、删除与 404。
