import { randomBytes, scryptSync, timingSafeEqual } from "crypto";

const SALT_LEN = 32;
const KEY_LEN = 64;
const SCRYPT_PARAMS = { N: 16384, r: 8, p: 1 };

export function hashPassword(password: string): string {
  const salt = randomBytes(SALT_LEN).toString("hex");
  const derivedKey = scryptSync(password, salt, KEY_LEN, SCRYPT_PARAMS);
  return `${salt}:${derivedKey.toString("hex")}`;
}

export function verifyPassword(password: string, hash: string): boolean {
  const [salt, key] = hash.split(":");
  const derivedKey = scryptSync(password, salt, KEY_LEN, SCRYPT_PARAMS);
  return timingSafeEqual(Buffer.from(key, "hex"), derivedKey);
}

export function generateToken(): string {
  return randomBytes(48).toString("hex");
}

export const AUTH_COOKIE = "meetease_token";
export const AUTH_MAX_AGE = 7 * 24 * 60 * 60; // 7 days