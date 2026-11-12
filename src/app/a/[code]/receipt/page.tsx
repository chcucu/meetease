import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, CalendarDays } from "lucide-react";
import { getActivityDetail, getActivityForOwner } from "@/lib/activities";
import { getSessionUser } from "@/lib/session";
import { formatDateTime } from "@/lib/format";
import type { ActivityDetail, PublicOption } from "@/lib/types";
import { PrintButton } from "./print-button";

type Props = { params: Promise<{ code: string }> };

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { code } = await params;
  const activity = await getActivityDetail(code.toUpperCase());
  if (!activity) return { title: "决策不存在" };
  return {
    title: `决策回执 · ${activity.title}`,
    robots: { index: false, follow: false },
  };
}

function scoreOf(option: PublicOption) {
  return typeof option.score === "number" ? option.score : (option.votes ?? 0);
}

function vetoesOf(option: PublicOption) {
  return typeof option.vetoes === "number" ? option.vetoes : 0;
}

function winnersFor(options: PublicOption[]) {
  const engaged = options.filter(
    (option) => scoreOf(option) > 0 || vetoesOf(option) > 0 || (option.votes ?? 0) > 0
  );
  if (engaged.length === 0) return [];

  const vetoFree = engaged.filter((option) => vetoesOf(option) === 0);
  const pool = vetoFree.length > 0 ? vetoFree : engaged;
  const best = Math.max(...pool.map(scoreOf));
  return pool.filter((option) => scoreOf(option) === best);
}

function WinnerBlock({
  label,
  options,
}: {
  label: string;
  options: PublicOption[];
}) {
  return (
    <div className="border border-line-strong bg-white p-4">
      <p className="label">{label}</p>
      {options.length === 0 ? (
        <p className="mt-3 text-sm text-muted">尚无结果</p>
      ) : (
        <div className="mt-3 space-y-2">
          {options.map((option) => (
            <div key={option.id}>
              <p className="font-display text-2xl leading-tight">{option.label}</p>
              <p className="mt-1 font-mono text-[10px] uppercase tracking-[0.08em] text-muted">
                {option.votes} 票
                {vetoesOf(option) > 0 ? ` · ${vetoesOf(option)} 否决` : ""} · 得分{" "}
                {scoreOf(option)}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function conditionValue(participant: ActivityDetail["participants"][number], activity: ActivityDetail) {
  const text = participant.condition?.trim();
  if (text) return text;
  if (participant.conditionOptionId) {
    return (
      activity.options.find((option) => option.id === participant.conditionOptionId)?.label ?? ""
    );
  }
  return "";
}

export default async function ReceiptPage({ params }: Props) {
  const { code } = await params;
  const normalized = code.toUpperCase();
  const [activity, user] = await Promise.all([
    getActivityDetail(normalized),
    getSessionUser(),
  ]);

  if (!activity) notFound();

  const ownerView =
    user && user.id === activity.ownerId
      ? await getActivityForOwner(normalized, user.id)
      : null;
  const conditions = (ownerView?.participants ?? [])
    .map((participant) => ({
      name: participant.name,
      value: conditionValue(participant, ownerView ?? activity),
    }))
    .filter((row) => row.value.length > 0);

  const timeWinners = winnersFor(activity.options.filter((option) => option.kind === "time"));
  const placeWinners = winnersFor(activity.options.filter((option) => option.kind === "place"));
  const statusLabel = activity.status === "closed" ? "已结束" : "进行中";
  const deadlineLabel = activity.deadline
    ? formatDateTime(activity.deadline, activity.timeZone)
    : "未设置";
  const feeLabel = activity.fee
    ? `¥${activity.fee.amount} / 人${activity.fee.note ? ` · ${activity.fee.note}` : ""}`
    : "免费";

  const facts = [
    { label: "状态", value: statusLabel },
    { label: "截止时间", value: deadlineLabel },
    { label: "参与人数", value: `${activity.counts.participants} 人` },
    { label: "组织者", value: activity.organizer.name },
  ];

  return (
    <main className="min-h-screen bg-white text-ink">
      <div className="mx-auto w-full max-w-[860px] px-4 py-8 sm:px-6 print:max-w-none print:p-0">
        <div className="receipt-actions no-print mb-5 flex flex-wrap items-center gap-2">
          <PrintButton />
          <Link href={`/a/${activity.shareCode}`} className="btn btn-ghost btn-sm">
            <ArrowLeft size={14} />
            返回决策页
          </Link>
          <a
            href={`/api/activities/${activity.shareCode}/export?format=ics`}
            className="btn btn-ghost btn-sm"
          >
            <CalendarDays size={14} />
            导出日历
          </a>
        </div>

        <article className="receipt-sheet border border-line-strong bg-white px-6 py-8 sm:px-12 sm:py-12">
          <header className="flex flex-wrap items-start justify-between gap-4 border-b border-ink pb-6">
            <div>
              <p className="label">DECISION RECEIPT</p>
              <h1 className="mt-2 font-display text-[clamp(2.2rem,5vw,3.4rem)] leading-[1.02] tracking-[-0.03em]">
                决策回执
              </h1>
              <p className="mt-3 max-w-[520px] text-lg leading-7">{activity.title}</p>
            </div>
            <div className="border border-ink bg-paper px-3 py-2 text-right">
              <p className="label">SHARE CODE</p>
              <p className="mt-1 font-mono text-lg tracking-[0.18em]">{activity.shareCode}</p>
            </div>
          </header>

          <section className="grid grid-cols-2 gap-x-6 gap-y-5 border-b border-line py-6 sm:grid-cols-4">
            {facts.map((fact) => (
              <div key={fact.label}>
                <p className="label">{fact.label}</p>
                <p className="mt-2 text-sm leading-6">{fact.value}</p>
              </div>
            ))}
          </section>

          <section className="grid gap-4 border-b border-line py-6 sm:grid-cols-2">
            <WinnerBlock label="时间赢家" options={timeWinners} />
            <WinnerBlock label="地点赢家" options={placeWinners} />
          </section>

          <section className="grid gap-6 border-b border-line py-6 sm:grid-cols-2">
            <div>
              <p className="label">费用</p>
              <p className="mt-2 font-display text-2xl leading-tight">{feeLabel}</p>
            </div>
            <div>
              <p className="label">共识度</p>
              <p className="mt-2 text-sm leading-6">
                时间 {activity.consensus?.time ?? "—"}% · 地点 {activity.consensus?.place ?? "—"}%
              </p>
            </div>
          </section>

          {conditions.length > 0 && (
            <section className="border-b border-line py-6">
              <p className="label">附加条件</p>
              <ul className="mt-3 space-y-2">
                {conditions.map((condition, index) => (
                  <li key={`${condition.name}-${index}`} className="text-sm leading-6">
                    <span className="font-medium">{condition.name}</span>
                    <span className="text-muted">：</span>
                    {condition.value}
                  </li>
                ))}
              </ul>
            </section>
          )}

          <footer className="flex flex-wrap items-end justify-between gap-4 pt-6">
            <p className="text-[11px] leading-5 text-muted">
              由 Quorum 生成 · {activity.counts.participants} 人参与 ·{" "}
              {activity.status === "closed" ? "决策已结束" : "结果可能继续变化"}
            </p>
            <p className="font-display text-2xl lowercase">quorum</p>
          </footer>
        </article>
      </div>

      <style>{`
        @media print {
          @page { size: A4; margin: 14mm; }
          .receipt-actions { display: none !important; }
          .receipt-sheet { border: 0 !important; padding: 0 !important; }
          .grain-overlay { display: none !important; }
          body { background: #fff !important; }
        }
      `}</style>
    </main>
  );
}
