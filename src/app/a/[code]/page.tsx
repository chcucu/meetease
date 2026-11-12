import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getActivityDetail } from "@/lib/activities";
import { getSessionUser } from "@/lib/session";
import { SiteHeader } from "@/components/site-header";
import { ParticipantExperience } from "@/components/participant-experience";
import Link from "next/link";
import { LogoMark } from "@/components/logo";

type Props = { params: Promise<{ code: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { code } = await params;
  const activity = await getActivityDetail(code.toUpperCase());
  if (!activity) return { title: "活动不存在" };
  return {
    title: activity.title,
    description: activity.description || "查看选项并投票，结果实时汇总。",
    robots: { index: false, follow: false },
    openGraph: {
      title: `${activity.title} · Quorum`,
      description: activity.description || "查看选项并投票，结果实时汇总。",
      type: "website",
    },
  };
}

export default async function PublicActivityPage({ params }: Props) {
  const { code } = await params;
  const activity = await getActivityDetail(code.toUpperCase());
  if (!activity) notFound();

  const user = await getSessionUser();

  return (
    <>
      <SiteHeader />
      <main className="min-h-screen">
        <ParticipantExperience
          initialActivity={activity}
          isOwner={user?.id === activity.ownerId}
        />
      </main>
      <footer className="mt-16 border-t border-line">
        <div className="container-page flex flex-col items-start justify-between gap-3 py-7 sm:flex-row sm:items-center">
          <div className="flex items-center gap-2">
            <LogoMark size={22} />
            <span className="text-[17px] font-semibold tracking-[-0.03em]">Quorum</span>
          </div>
          <p className="text-[11px] text-muted">
            由 Quorum 提供 · DeepSeek 展示项目 ·{" "}
            <Link href="/" className="link-underline text-ink">
              创建决策页
            </Link>
          </p>
        </div>
      </footer>
    </>
  );
}
