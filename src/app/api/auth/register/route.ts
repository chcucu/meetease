import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { hashPassword, generateToken, AUTH_COOKIE, AUTH_MAX_AGE } from "@/lib/auth";

export async function POST(req: NextRequest) {
  try {
    const { email, name, password } = await req.json();

    if (!email || !name || !password) {
      return NextResponse.json({ success: false, error: "请填写所有必填字段" }, { status: 400 });
    }

    if (password.length < 6) {
      return NextResponse.json({ success: false, error: "密码至少 6 个字符" }, { status: 400 });
    }

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return NextResponse.json({ success: false, error: "该邮箱已被注册" }, { status: 409 });
    }

    const user = await prisma.user.create({
      data: { email, name, password: hashPassword(password) },
    });

    const token = generateToken();

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

    // Store token in a simple way (in-memory map since we use SQLite)
    // In production, use Redis or a proper session store
    const sessionStore = globalThis as unknown as { __sessions: Map<string, string> };
    if (!sessionStore.__sessions) sessionStore.__sessions = new Map();
    sessionStore.__sessions.set(token, user.id);

    return res;
  } catch (err) {
    console.error("Register error:", err);
    return NextResponse.json({ success: false, error: "注册失败，请稍后重试" }, { status: 500 });
  }
}