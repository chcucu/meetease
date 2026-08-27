import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET(request: Request, { params }: { params: Promise<{ code: string }> }) {
  try {
    const { code } = await params;

    const activity = await prisma.activity.findUnique({
      where: { shareCode: code },
      include: {
        timeOptions: {
          include: {
            _count: { select: { votes: true } },
            votes: { include: { participant: { select: { name: true } } } },
          },
        },
        locationOptions: {
          include: {
            _count: { select: { votes: true } },
            votes: { include: { participant: { select: { name: true } } } },
          },
        },
        suggestions: {
          include: { _count: { select: { votes: true } } },
        },
        participants: {
          select: { name: true, paid: true, paidAt: true, createdAt: true },
          orderBy: { createdAt: "asc" },
        },
      },
    });

    if (!activity) {
      return NextResponse.json({ error: "Activity not found" }, { status: 404 });
    }

    // 构建 CSV
    const rows: string[] = [];
    const esc = (v: string) => `"${v.replace(/"/g, '""')}"`;

    rows.push(`活动,${esc(activity.title)}`);
    rows.push(`描述,${esc(activity.description)}`);
    rows.push(`发起人,${esc(activity.creatorName)}`);
    rows.push(`状态,${activity.status}`);
    rows.push(`创建时间,${activity.createdAt.toISOString()}`);
    rows.push("");

    if (activity.timeOptions.length > 0) {
      rows.push("时间选项投票");
      rows.push("选项,票数,投票人");
      activity.timeOptions.forEach((t) => {
        const voters = t.votes.map((v) => v.participant.name).join("; ");
        rows.push(`${esc(t.label)},${t._count.votes},${esc(voters)}`);
      });
      rows.push("");
    }

    if (activity.locationOptions.length > 0) {
      rows.push("地点选项投票");
      rows.push("选项,地址,票数,投票人");
      activity.locationOptions.forEach((l) => {
        const voters = l.votes.map((v) => v.participant.name).join("; ");
        rows.push(`${esc(l.name)},${esc(l.address || "")},${l._count.votes},${esc(voters)}`);
      });
      rows.push("");
    }

    if (activity.participants.length > 0) {
      rows.push("参与者");
      rows.push("姓名,是否缴费,缴费时间,参与时间");
      activity.participants.forEach((p) => {
        rows.push(`${esc(p.name)},${p.paid ? "是" : "否"},${p.paidAt ? p.paidAt.toISOString() : ""},${p.createdAt.toISOString()}`);
      });
      rows.push("");
    }

    if (activity.feeAmount) {
      rows.push(`人均费用,${activity.feeAmount}元`);
      rows.push(`费用说明,${esc(activity.feeDescription || "")}`);
      const paid = activity.participants.filter((p) => p.paid).length;
      rows.push(`已缴费,${paid}人`);
      rows.push(`未缴费,${activity.participants.length - paid}人`);
      rows.push(`应收总额,${(activity.participants.length * activity.feeAmount).toFixed(2)}元`);
    }

    const csv = "\uFEFF" + rows.join("\r\n");

    return new NextResponse(csv, {
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="${activity.shareCode}-results.csv"`,
      },
    });
  } catch (error) {
    console.error("Export error:", error);
    return NextResponse.json({ error: "Export failed" }, { status: 500 });
  }
}