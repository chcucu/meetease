import { prisma } from "@/lib/db";
import { fail, ok, readBody } from "@/lib/api";
import { hashPassword } from "@/lib/auth";
import { createSession, isSecureRequest, sessionCookieOptions, SESSION_COOKIE } from "@/lib/session";
import { registerSchema } from "@/lib/validation";

export async function POST(request: Request) {
  const data = await readBody(request, registerSchema);
  if (data instanceof Response) return data;

  const existing = await prisma.user.findUnique({ where: { email: data.email } });
  if (existing) return fail("这个邮箱已经注册过了", 409);

  const user = await prisma.user.create({
    data: {
      email: data.email,
      name: data.name,
      passwordHash: hashPassword(data.password),
    },
    select: { id: true, name: true, email: true },
  });

  const { token } = await createSession(user.id);
  const response = ok({ user });
  response.cookies.set(SESSION_COOKIE, token, sessionCookieOptions(isSecureRequest(request)));
  return response;
}
