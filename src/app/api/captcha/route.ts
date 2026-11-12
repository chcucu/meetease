import { NextRequest } from "next/server";
import { ok } from "@/lib/api";
import { clientIp, rateLimit, tooManyRequests } from "@/lib/rate-limit";
import { issueSliderChallenge } from "@/lib/slider-captcha";

export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  const ip = clientIp(request);
  const limited = rateLimit(`captcha:${ip}`, 30, 60_000);
  if (!limited.allowed) return tooManyRequests(limited.retryAfter);

  const response = ok(issueSliderChallenge());
  response.headers.set("Cache-Control", "no-store");
  return response;
}
