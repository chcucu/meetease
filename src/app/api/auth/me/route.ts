import { NextRequest } from "next/server";
import { ok } from "@/lib/api";
import { getSessionUserFromRequest } from "@/lib/session";

export async function GET(request: NextRequest) {
  const user = await getSessionUserFromRequest(request);
  return ok({ user });
}
