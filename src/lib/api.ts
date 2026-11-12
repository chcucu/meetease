import { NextResponse } from "next/server";
import type { ZodType } from "zod";

export function ok<T extends Record<string, unknown>>(data: T = {} as T, status = 200) {
  return NextResponse.json({ ok: true, ...data }, { status });
}

export function fail(error: string, status = 400) {
  return NextResponse.json({ ok: false, error }, { status });
}

export async function readBody<T>(request: Request, schema: ZodType<T>): Promise<T | NextResponse> {
  let raw: unknown;
  try {
    raw = await request.json();
  } catch {
    return fail("请求格式不正确", 400);
  }

  const parsed = schema.safeParse(raw);
  if (!parsed.success) {
    const issue = parsed.error.issues[0];
    return fail(issue?.message ?? "请求参数不正确", 422);
  }

  return parsed.data;
}

export function isResponse(value: unknown): value is NextResponse {
  return value instanceof NextResponse;
}

export function normalizeCode(code: string) {
  return code.trim().toUpperCase();
}
