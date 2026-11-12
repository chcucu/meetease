import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getActivityDetail, getSnapshot } from "@/lib/activities";
import { getSessionUser } from "@/lib/session";
import { SiteHeader } from "@/components/site-header";
import { LiveResults } from "@/components/live-results";

type Props = { params: Promise<{ code: string }> };

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { code } = await params;
  const activity = await getActivityDetail(code.toUpperCase());
  if (!activity) return { title: "结果不存在" };
  return {
    title: `实时结果 · ${activity.title}`,
    description: `查看「${activity.title}」的实时投票结果。`,
    robots: { index: false, follow: true },
  };
}

export default async function ResultsPage({ params }: Props) {
  const { code } = await params;
  const normalized = code.toUpperCase();
  const [activity, snapshot] = await Promise.all([
    getActivityDetail(normalized),
    getSnapshot(normalized),
  ]);

  if (!activity || !snapshot) notFound();

  const user = await getSessionUser();

  return (
    <>
      <SiteHeader />
      <main>
        <LiveResults
          initialSnapshot={snapshot}
          initialActivity={activity}
          isOwner={user?.id === activity.ownerId}
        />
      </main>
    </>
  );
}
