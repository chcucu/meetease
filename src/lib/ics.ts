import type { PublicOption } from "./types";

type CalendarEventInput = {
  code: string;
  title: string;
  description?: string | null;
  location?: string | null;
  option: PublicOption;
  origin?: string;
};

function escapeText(value: string) {
  return value
    .replace(/\\/g, "\\\\")
    .replace(/;/g, "\\;")
    .replace(/,/g, "\\,")
    .replace(/\r?\n/g, "\\n");
}

function foldLine(line: string) {
  const encoder = new TextEncoder();
  if (encoder.encode(line).length <= 75) return line;

  const chunks: string[] = [];
  let current = "";
  for (const char of line) {
    if (encoder.encode(current + char).length > 73) {
      chunks.push(current);
      current = char;
    } else {
      current += char;
    }
  }
  if (current) chunks.push(current);
  return chunks.map((chunk, index) => (index === 0 ? chunk : ` ${chunk}`)).join("\r\n");
}

function utcStamp(value: Date) {
  return value.toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");
}

function basicStamp(value: Date) {
  return value.toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");
}

function endOf(option: PublicOption) {
  if (option.endsAt) return new Date(option.endsAt);
  if (!option.startsAt) return new Date();
  return new Date(new Date(option.startsAt).getTime() + 60 * 60 * 1000);
}

function summaryFor(title: string, option: PublicOption) {
  return option.label && option.label !== title ? `${title} · ${option.label}` : title;
}

function locationFor(option: PublicOption, fallback?: string | null) {
  if (option.kind === "place") {
    return option.note ? `${option.label}（${option.note}）` : option.label;
  }
  return fallback ?? "";
}

export function buildCalendarFile(input: CalendarEventInput) {
  const { option } = input;
  if (!option.startsAt) throw new Error("Option has no start time");

  const start = new Date(option.startsAt);
  const end = endOf(option);
  const url = input.origin ? `${input.origin}/a/${input.code}` : `/a/${input.code}`;
  const description = [
    input.description?.trim(),
    option.note ? `备注：${option.note}` : "",
    `来自 Quorum 决策卡 ${input.code}`,
  ]
    .filter(Boolean)
    .join("\n");

  const lines = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Quorum//Decision Calendar//ZH",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    "BEGIN:VEVENT",
    `UID:quorum-${input.code}-${option.id}@quorum.app`,
    `DTSTAMP:${utcStamp(new Date())}`,
    `DTSTART:${utcStamp(start)}`,
    `DTEND:${utcStamp(end)}`,
    `SUMMARY:${escapeText(summaryFor(input.title, option))}`,
    `LOCATION:${escapeText(locationFor(option, input.location))}`,
    `DESCRIPTION:${escapeText(description)}`,
    `URL:${url}`,
    "STATUS:CONFIRMED",
    "BEGIN:VALARM",
    "ACTION:DISPLAY",
    `DESCRIPTION:${escapeText("一小时后开始")}`,
    "TRIGGER:-PT1H",
    "END:VALARM",
    "END:VEVENT",
    "END:VCALENDAR",
  ];

  return `${lines.map(foldLine).join("\r\n")}\r\n`;
}

export function googleCalendarUrl(
  input: Omit<CalendarEventInput, "origin"> & { origin?: string }
) {
  const { option } = input;
  if (!option.startsAt) return null;
  const start = new Date(option.startsAt);
  const end = endOf(option);
  const details = [
    input.description?.trim(),
    option.note ? `备注：${option.note}` : "",
    `来自 Quorum 决策卡 ${input.code}`,
  ]
    .filter(Boolean)
    .join("\n");

  const params = new URLSearchParams({
    action: "TEMPLATE",
    text: summaryFor(input.title, option),
    dates: `${basicStamp(start)}/${basicStamp(end)}`,
    details,
    location: locationFor(option, input.location),
  });

  return `https://calendar.google.com/calendar/render?${params.toString()}`;
}

export function calendarFileName(code: string) {
  return `quorum-${code.toLowerCase()}.ics`;
}
