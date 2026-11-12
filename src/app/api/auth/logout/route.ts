import { NextRequest } from "next/server";
import { ok } from "@/lib/api";
import { destroySession, isSecureRequest, SESSION_COOKIE } from "@/lib/session";

export async function POST(request: NextRequest) {
  await destroySession(request.cookies.get(SESSION_COOKIE)?.value);
  const response = ok({});
  response.cookies.set(SESSION_COOKIE, "", {
    httpOnly: true,
    sameSite: "lax",
    secure: isSecureRequest(request),
    path: "/",
    maxAge: 0,
  });
  return response;
}
