import { createHmac, timingSafeEqual } from "node:crypto";
import { rateLimit } from "@/lib/rate-limit";

const WIDTH = 320;
const TTL_MS = 10 * 60 * 1000;
const TOLERANCE = 8;
const MIN_TARGET = 40;
const MAX_TARGET = 300;

const usedTokens = new Map<string, number>();

function secret() {
  return process.env.SLIDER_SECRET ?? "quorum-slider-fallback-secret";
}

function sign(payload: string) {
  return createHmac("sha256", secret()).update(payload).digest("base64url");
}

function signatureMatches(received: string, expected: string) {
  const left = Buffer.from(received);
  const right = Buffer.from(expected);
  return left.length === right.length && timingSafeEqual(left, right);
}

function pruneUsedTokens(now: number) {
  for (const [token, expiresAt] of usedTokens) {
    if (expiresAt <= now) usedTokens.delete(token);
  }
}

export function issueSliderChallenge(): { token: string; target: number; width: number } {
  const target =
    MIN_TARGET + Math.floor(Math.random() * (MAX_TARGET - MIN_TARGET + 1));
  const payload = Buffer.from(JSON.stringify({ t: Date.now(), x: target })).toString(
    "base64url"
  );

  return { token: `${payload}.${sign(payload)}`, target, width: WIDTH };
}

export async function verifySlider(
  token?: string,
  x?: number,
  ip?: string
): Promise<{ ok: boolean; error?: string }> {
  if (ip) {
    const limited = rateLimit(`slider-verify:${ip}`, 60, 60_000);
    if (!limited.allowed) return { ok: false, error: "请求过于频繁，请稍后再试" };
  }

  if (!token || typeof x !== "number" || !Number.isFinite(x)) {
    return { ok: false, error: "请先完成滑块验证" };
  }

  const parts = token.split(".");
  if (parts.length !== 2) return { ok: false, error: "请先完成滑块验证" };

  const [payload, signature] = parts;
  if (!payload || !signature) return { ok: false, error: "请先完成滑块验证" };
  if (!signatureMatches(signature, sign(payload))) {
    return { ok: false, error: "请先完成滑块验证" };
  }

  let parsed: { t?: unknown; x?: unknown };
  try {
    parsed = JSON.parse(Buffer.from(payload, "base64url").toString("utf8")) as {
      t?: unknown;
      x?: unknown;
    };
  } catch {
    return { ok: false, error: "请先完成滑块验证" };
  }

  const issuedAt = typeof parsed.t === "number" ? parsed.t : Number.NaN;
  const target = typeof parsed.x === "number" ? parsed.x : Number.NaN;
  if (!Number.isFinite(issuedAt) || !Number.isFinite(target)) {
    return { ok: false, error: "请先完成滑块验证" };
  }

  const now = Date.now();
  pruneUsedTokens(now);
  if (now - issuedAt > TTL_MS || usedTokens.has(token)) {
    return { ok: false, error: "滑块验证已过期，请重新拖动" };
  }

  if (Math.abs(x - target) > TOLERANCE) {
    return { ok: false, error: "滑块位置不正确" };
  }

  usedTokens.set(token, issuedAt + TTL_MS);
  return { ok: true };
}
