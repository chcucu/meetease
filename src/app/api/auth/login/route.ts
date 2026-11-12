import { prisma } from "@/lib/db";
import { fail, ok, readBody } from "@/lib/api";
import { verifyPassword } from "@/lib/auth";
import { createSession, isSecureRequest, sessionCookieOptions, SESSION_COOKIE } from "@/lib/session";
import { loginSchema } from "@/lib/validation";

export async function POST(request: Request) {
  const data = await readBody(request, loginSchema);
  if (data instanceof Response) return data;

  const user = await prisma.user.findUnique({ where: { email: data.email } });
  if (!user || !verifyPassword(data.password, user.passwordHash)) {
    return fail("邮箱或密码不正确", 401);
  }

  await prisma.session.deleteMany({
    where: { userId: user.id, expiresAt: { lt: new Date() } },
  });

  const { token } = await createSession(user.id);
  const response = ok({ user: { id: user.id, name: user.name, email: user.email } });
  response.cookies.set(SESSION_COOKIE, token, sessionCookieOptions(isSecureRequest(request)));
  return response;
}
