import { redirect } from "next/navigation";
import { AppShell } from "@/components/app-shell";
import { CreateWizard } from "@/components/create-wizard";
import { getSessionUser } from "@/lib/session";

export const metadata = { title: "新建决策" };

export default async function NewActivityPage() {
  const user = await getSessionUser();
  if (!user) redirect("/login?next=/new");

  return (
    <AppShell user={user}>
      <CreateWizard userName={user.name} />
    </AppShell>
  );
}
