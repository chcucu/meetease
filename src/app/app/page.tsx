import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowRight, Plus } from "lucide-react";
import { getOwnerActivities } from "@/lib/activities";
import { getSessionUser } from "@/lib/session";
import { DashboardList } from "@/components/dashboard-list";

export const metadata = { title: "工作台" };

export default async function DashboardPage() {
  const user = await getSessionUser();
  if (!user) redirect("/login?next=/app");

  const activities = await getOwnerActivities(user.id);
  const totals = activities.reduce(
    (acc, activity) => ({
      participants: acc.participants + activity.counts.participants,
      paid: acc.paid + activity.counts.paid,
      suggestions: acc.suggestions + activity.counts.suggestions,
      open: acc.open + (activity.status === "open" ? 1 : 0),
    }),
    { participants: 0, paid: 0, suggestions: 0, open: 0 }
  );

  const today = new Intl.DateTimeFormat("zh-CN", {
    timeZone: "Asia/Shanghai",
    month: "long",
    day: "numeric",
    weekday: "long",
  }).format(new Date());

  const stats = [
    { label: "决策卡", value: activities.length, suffix: "张", note: "全部由你发起" },
    { label: "累计参与", value: totals.participants, suffix: "人次", note: "无需注册的投票者" },
    { label: "进行中", value: totals.open, suffix: "场", note: "仍可接受投票" },
    { label: "已确认支付", value: totals.paid, suffix: "人", note: "由你手动勾选" },
  ];

  return (
    <div className="container-page py-10 md:py-14">
      <div className="flex flex-col justify-between gap-6 md:flex-row md:items-end">
        <div>
          <div className="mb-4 flex flex-wrap items-center gap-3">
            <span className="label">WORKSPACE / 工作台</span>
            <span className="h-px w-8 bg-line-strong" />
            <span className="font-mono text-[10px] text-muted">{today}</span>
          </div>
          <h1 className="page-title">
            你好，{user.name.slice(0, 6)}
            <span className="serif-italic text-coral">。</span>
          </h1>
          <p className="mt-3 max-w-[520px] text-sm leading-6 text-muted">
            这里是你发起过的所有决定。谁在等、谁投了什么、谁已经付了钱，都在下面。
          </p>
        </div>
        <div className="flex shrink-0 items-center gap-2.5">
          <Link href="/new" className="btn btn-primary">
            <Plus size={15} />
            新建决策
          </Link>
          <Link href="/a/DINNER/results" className="btn btn-ghost">
            看实时结果
            <ArrowRight size={14} />
          </Link>
        </div>
      </div>

      <div className="mt-10 grid grid-cols-2 gap-px overflow-hidden border border-line bg-line md:grid-cols-4">
        {stats.map((stat) => (
          <div key={stat.label} className="bg-surface p-5 md:p-6">
            <p className="label text-[9px]">{stat.label}</p>
            <p className="mt-3 flex items-baseline gap-1.5">
              <span className="font-display text-[38px] leading-none">{stat.value}</span>
              <span className="text-[11px] text-muted">{stat.suffix}</span>
            </p>
            <p className="mt-2 text-[11px] text-muted">{stat.note}</p>
          </div>
        ))}
      </div>

      <DashboardList activities={activities} />
    </div>
  );
}
