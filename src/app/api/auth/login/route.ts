import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyPassword, generateToken, AUTH_COOKIE, AUTH_MAX_AGE } from "@/lib/auth";

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json({ success: false, error: "请填写邮箱和密码" }, { status: 400 });
    }

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return NextResponse.json({ success: false, error: "邮箱或密码错误" }, { status: 401 });
    }

    if (!verifyPassword(password, user.password)) {
      return NextResponse.json({ success: false, error: "邮箱或密码错误" }, { status: 401 });
    }

    const token = generateToken();

    const sessionStore = globalThis as unknown as { __sessions: Map<string, string> };
    if (!sessionStore.__sessions) sessionStore.__sessions = new Map();
    sessionStore.__sessions.set(token, user.id);

    const res = NextResponse.json({
      success: true,
      user: { id: user.id, email: user.email, name: user.name },
    });

    res.cookies.set(AUTH_COOKIE, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: AUTH_MAX_AGE,
      path: "/",
    });

    return res;
  } catch (err) {
    console.error("Login error:", err);
    return NextResponse.json({ success: false, error: "登录失败，请稍后重试" }, { status: 500 });
  }
}