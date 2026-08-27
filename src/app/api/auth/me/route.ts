import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { AUTH_COOKIE } from "@/lib/auth";

export async function GET(req: NextRequest) {
  try {
    const token = req.cookies.get(AUTH_COOKIE)?.value;
    if (!token) {
      return NextResponse.json({ success: false, error: "未登录" }, { status: 401 });
    }

    const sessionStore = globalThis as unknown as { __sessions: Map<string, string> };
    const userId = sessionStore.__sessions?.get(token);
    if (!userId) {
      return NextResponse.json({ success: false, error: "会话已过期" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, email: true, name: true, createdAt: true },
    });

    if (!user) {
      return NextResponse.json({ success: false, error: "用户不存在" }, { status: 401 });
    }

    return NextResponse.json({ success: true, user });
  } catch (err) {
    console.error("Me error:", err);
    return NextResponse.json({ success: false, error: "获取用户信息失败" }, { status: 500 });
  }
}