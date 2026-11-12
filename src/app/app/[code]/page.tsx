import { notFound, redirect } from "next/navigation";
import { ManagePanel } from "@/components/manage-panel";
import { getActivityForOwner } from "@/lib/activities";
import { getSessionUser } from "@/lib/session";

type Props = {
  params: Promise<{ code: string }>;
  searchParams: Promise<{ created?: string }>;
};

export const dynamic = "force-dynamic";
export const metadata = { title: "控制台" };

export default async function ManageActivityPage({ params, searchParams }: Props) {
  const { code } = await params;
  const normalized = code.toUpperCase();

  const user = await getSessionUser();
  if (!user) redirect(`/login?next=/app/${normalized}`);

  const activity = await getActivityForOwner(normalized, user.id);
  if (!activity) notFound();

  const { created } = await searchParams;

  return <ManagePanel initialActivity={activity} created={created === "1"} />;
}
