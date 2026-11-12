const TZ = "Asia/Shanghai";

const dateTimeFormatter = new Intl.DateTimeFormat("zh-CN", {
  timeZone: TZ,
  month: "numeric",
  day: "numeric",
  weekday: "short",
  hour: "2-digit",
  minute: "2-digit",
  hour12: false,
});

const dateFormatter = new Intl.DateTimeFormat("zh-CN", {
  timeZone: TZ,
  year: "numeric",
  month: "long",
  day: "numeric",
});

const timeFormatter = new Intl.DateTimeFormat("zh-CN", {
  timeZone: TZ,
  hour: "2-digit",
  minute: "2-digit",
  hour12: false,
});

export function formatDateTime(value: string | Date | null | undefined) {
  if (!value) return "";
  const date = typeof value === "string" ? new Date(value) : value;
  if (Number.isNaN(date.getTime())) return "";
  return dateTimeFormatter.format(date);
}

export function formatDate(value: string | Date | null | undefined) {
  if (!value) return "";
  const date = typeof value === "string" ? new Date(value) : value;
  if (Number.isNaN(date.getTime())) return "";
  return dateFormatter.format(date);
}

export function formatTime(value: string | Date | null | undefined) {
  if (!value) return "";
  const date = typeof value === "string" ? new Date(value) : value;
  if (Number.isNaN(date.getTime())) return "";
  return timeFormatter.format(date);
}

export function formatOptionTime(startsAt: string | null, endsAt: string | null) {
  if (!startsAt) return "";
  const start = new Date(startsAt);
  const sameDay = endsAt ? new Date(endsAt).toDateString() === start.toDateString() : true;
  if (!endsAt) return formatDateTime(startsAt);
  return sameDay
    ? `${formatDateTime(startsAt)} – ${formatTime(endsAt)}`
    : `${formatDateTime(startsAt)} – ${formatDateTime(endsAt)}`;
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
