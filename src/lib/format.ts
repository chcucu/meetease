export const DEFAULT_TIME_ZONE = "Asia/Shanghai";

const formatterCache = new Map<string, Intl.DateTimeFormat>();

function getFormatter(timeZone: string, options: Intl.DateTimeFormatOptions) {
  const key = `${timeZone}:${JSON.stringify(options)}`;
  let formatter = formatterCache.get(key);
  if (!formatter) {
    formatter = new Intl.DateTimeFormat("zh-CN", { timeZone, ...options });
    formatterCache.set(key, formatter);
  }
  return formatter;
}

function toDate(value: string | Date | null | undefined) {
  if (!value) return null;
  const date = typeof value === "string" ? new Date(value) : value;
  return Number.isNaN(date.getTime()) ? null : date;
}

export function formatDateTime(
  value: string | Date | null | undefined,
  timeZone: string = DEFAULT_TIME_ZONE
) {
  const date = toDate(value);
  if (!date) return "";
  return getFormatter(timeZone, {
    month: "numeric",
    day: "numeric",
    weekday: "short",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(date);
}

export function formatDate(
  value: string | Date | null | undefined,
  timeZone: string = DEFAULT_TIME_ZONE
) {
  const date = toDate(value);
  if (!date) return "";
  return getFormatter(timeZone, {
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(date);
}

export function formatTime(
  value: string | Date | null | undefined,
  timeZone: string = DEFAULT_TIME_ZONE
) {
  const date = toDate(value);
  if (!date) return "";
  return getFormatter(timeZone, {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(date);
}

function datePart(value: Date, timeZone: string) {
  return getFormatter(timeZone, {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(value);
}

export function formatOptionTime(
  startsAt: string | null,
  endsAt: string | null,
  timeZone: string = DEFAULT_TIME_ZONE
) {
  if (!startsAt) return "";
  if (!endsAt) return formatDateTime(startsAt, timeZone);
  const start = new Date(startsAt);
  const end = new Date(endsAt);
  const sameDay = datePart(start, timeZone) === datePart(end, timeZone);
  return sameDay
    ? `${formatDateTime(startsAt, timeZone)} – ${formatTime(endsAt, timeZone)}`
    : `${formatDateTime(startsAt, timeZone)} – ${formatDateTime(endsAt, timeZone)}`;
}

export function timeZoneLabel(timeZone: string = DEFAULT_TIME_ZONE) {
  try {
    const parts = new Intl.DateTimeFormat("en-US", {
      timeZone,
      timeZoneName: "shortOffset",
    }).formatToParts(new Date());
    return parts.find((part) => part.type === "timeZoneName")?.value ?? timeZone;
  } catch {
    return timeZone;
  }
}

export function isValidTimeZone(timeZone: string) {
  try {
    new Intl.DateTimeFormat("en-US", { timeZone }).format(new Date());
    return true;
  } catch {
    return false;
  }
}

function zoneOffsetMs(date: Date, timeZone: string) {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone,
    hour12: false,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  }).formatToParts(date);
  const read = (type: string) => Number(parts.find((part) => part.type === type)?.value ?? 0);
  const asUtc = Date.UTC(
    read("year"),
    read("month") - 1,
    read("day"),
    read("hour") % 24,
    read("minute"),
    read("second")
  );
  return asUtc - date.getTime();
}

/** Formats a UTC instant as the `datetime-local` value of a specific zone. */
export function toZonedInputValue(
  value: string | Date | null | undefined,
  timeZone: string = DEFAULT_TIME_ZONE
) {
  const date = toDate(value);
  if (!date) return "";
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone,
    hour12: false,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  }).formatToParts(date);
  const read = (type: string) => parts.find((part) => part.type === type)?.value ?? "00";
  return `${read("year")}-${read("month")}-${read("day")}T${read("hour")}:${read("minute")}`;
}

/** Converts a `datetime-local` value expressed in a specific zone to a UTC ISO string. */
export function zonedInputToISO(value: string, timeZone: string = DEFAULT_TIME_ZONE) {
  if (!value) return null;
  const [datePartValue, timePartValue = "00:00"] = value.split("T");
  const [year, month, day] = datePartValue.split("-").map(Number);
  const [hour, minute] = timePartValue.split(":").map(Number);
  if ([year, month, day, hour, minute].some((part) => Number.isNaN(part))) return null;

  const utcGuess = Date.UTC(year, month - 1, day, hour, minute);
  let timestamp = utcGuess - zoneOffsetMs(new Date(utcGuess), timeZone);
  timestamp = utcGuess - zoneOffsetMs(new Date(timestamp), timeZone);
  return new Date(timestamp).toISOString();
}

export function relativeTime(value: string | Date) {
  const date = typeof value === "string" ? new Date(value) : value;
  const diff = Date.now() - date.getTime();
  const minutes = Math.floor(diff / 60000);
  if (minutes < 1) return "刚刚";
  if (minutes < 60) return `${minutes} 分钟前`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} 小时前`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days} 天前`;
  return formatDate(date);
}

export function deadlineState(deadline: string | null, status: string) {
  if (status === "closed") return { state: "closed" as const, label: "已结束" };
  if (!deadline) return { state: "open" as const, label: "进行中" };
  const ms = new Date(deadline).getTime() - Date.now();
  if (ms <= 0) return { state: "expired" as const, label: "已截止" };
  const hours = Math.floor(ms / 3600000);
  if (hours < 1) return { state: "open" as const, label: `${Math.max(1, Math.floor(ms / 60000))} 分钟后截止` };
  if (hours < 48) return { state: "open" as const, label: `${hours} 小时后截止` };
  return { state: "open" as const, label: `${Math.floor(hours / 24)} 天后截止` };
}

export function isPast(value: string | null) {
  if (!value) return false;
  return new Date(value).getTime() < Date.now();
}

export function initials(name: string) {
  const trimmed = name.trim();
  if (!trimmed) return "?";
  const isLatin = /^[A-Za-z]/.test(trimmed);
  if (isLatin) {
    const parts = trimmed.split(/\s+/);
    return (parts[0][0] + (parts[1]?.[0] ?? "")).toUpperCase();
  }
  return trimmed.slice(0, 1);
}

export function plural(count: number, unit: string) {
  return `${count} ${unit}`;
}

export function toLocalInputValue(value: string | null | undefined) {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}
