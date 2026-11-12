import { randomBytes } from "crypto";

const ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

export function generateShareCode(length = 6): string {
  const bytes = randomBytes(length);
  let out = "";
  for (let i = 0; i < length; i++) {
    out += ALPHABET[bytes[i] % ALPHABET.length];
  }
  return out;
}

export function randomKey(length = 18): string {
  return randomBytes(length).toString("base64url").slice(0, length);
}

export function generateJoinCode(): string {
  const value = 1000 + (randomBytes(2).readUInt16BE(0) % 9000);
  return String(value);
}
