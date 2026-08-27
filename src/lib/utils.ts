import { v4 as uuidv4 } from "uuid";

export function generateShareCode(): string {
  return uuidv4().slice(0, 8).toUpperCase();
}

export function generateParticipantId(): string {
  return uuidv4();
}

export function getBaseUrl(): string {
  if (typeof window !== "undefined") return "";
  if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`;
  return `http://localhost:${process.env.PORT ?? 3000}`;
}