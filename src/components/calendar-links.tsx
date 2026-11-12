import { CalendarPlus, Download } from "lucide-react";
import { googleCalendarUrl } from "@/lib/ics";
import type { PublicOption } from "@/lib/types";

export function CalendarLinks({
  code,
  title,
  description,
  location,
  options,
  compact = false,
}: {
  code: string;
  title: string;
  description?: string | null;
  location?: string | null;
  options: PublicOption[];
  compact?: boolean;
}) {
  const timeOptions = options.filter((option) => option.kind === "time" && option.startsAt);
  if (timeOptions.length === 0) return null;

  return (
    <div className={compact ? "space-y-2" : "space-y-2.5"}>
      {timeOptions.map((option) => {
        const google = googleCalendarUrl({
          code,
          title,
          description,
          location,
          option,
        });
        return (
          <div
            key={option.id}
            className="flex flex-wrap items-center gap-x-3 gap-y-1.5 border border-line bg-paper px-3 py-2"
          >
            <span className="min-w-0 flex-1 truncate text-[11px]">{option.label}</span>
            <a
              href={`/api/activities/${code}/calendar?option=${option.id}`}
              className="flex shrink-0 items-center gap-1 text-[10px] text-muted transition-colors hover:text-ink"
              download
            >
              <Download size={11} />
              .ics
            </a>
            {google && (
              <a
                href={google}
                target="_blank"
                rel="noreferrer"
                className="flex shrink-0 items-center gap-1 text-[10px] text-muted transition-colors hover:text-ink"
              >
                <CalendarPlus size={11} />
                Google 日历
              </a>
            )}
          </div>
        );
      })}
    </div>
  );
}
