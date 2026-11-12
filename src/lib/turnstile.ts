const VERIFY_URL = "https://challenges.cloudflare.com/turnstile/v0/siteverify";

export function turnstileEnabled() {
  return Boolean(process.env.TURNSTILE_SECRET_KEY);
}

type VerifyResult = { ok: true } | { ok: false; error: string };

export async function verifyTurnstile(
  token: string | null | undefined,
  ip: string
): Promise<VerifyResult> {
  const secret = process.env.TURNSTILE_SECRET_KEY;
  if (!secret) return { ok: true };
  if (!token) return { ok: false, error: "请先完成人机验证" };

  try {
    const body = new URLSearchParams({ secret, response: token });
    if (ip && ip !== "local") body.set("remoteip", ip);

    const response = await fetch(VERIFY_URL, {
      method: "POST",
      body,
      cache: "no-store",
    });
    const result = (await response.json()) as { success?: boolean };
    if (result.success) return { ok: true };

    return { ok: false, error: "人机验证未通过，请重新验证" };
  } catch {
    return { ok: false, error: "人机验证服务暂不可用，请稍后重试" };
  }
}
