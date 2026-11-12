"use client";

import { useState } from "react";
import { estimateCommuteMinutes, formatDistance, haversineKm } from "@/lib/geo";

type CommuteOption = {
  id: string;
  label: string;
  lat: number | null;
  lng: number | null;
};

type Origin = { lat: number; lng: number };

export function CommutePanel({ options }: { options: CommuteOption[] }) {
  const located = options.filter(
    (option): option is CommuteOption & { lat: number; lng: number } =>
      option.lat !== null && option.lng !== null
  );
  const [open, setOpen] = useState(false);
  const [status, setStatus] = useState<"idle" | "locating" | "ready" | "error">("idle");
  const [origin, setOrigin] = useState<Origin | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [onlyNearby, setOnlyNearby] = useState(false);

  if (located.length === 0) return null;

  function handleLocate() {
    setOpen(true);
    if (typeof navigator === "undefined" || !("geolocation" in navigator)) {
      setStatus("error");
      setError("当前浏览器不支持定位。");
      return;
    }
    setStatus("locating");
    setError(null);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setOrigin({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        });
        setStatus("ready");
      },
      (positionError) => {
        setStatus("error");
        setError(
          positionError.code === positionError.PERMISSION_DENIED
            ? "定位权限被拒绝，无法估算通勤。"
            : "定位失败，无法估算通勤。"
        );
      },
      { enableHighAccuracy: false, timeout: 10000, maximumAge: 60000 }
    );
  }

  const results = origin
    ? located.map((option) => ({
        ...option,
        km: haversineKm(origin, { lat: option.lat, lng: option.lng }),
      }))
    : [];
  const visible = onlyNearby ? results.filter((item) => item.km <= 5) : results;

  return (
    <div className="card overflow-hidden">
      <div className="flex flex-wrap items-center justify-between gap-2 px-3 py-2.5">
        <div>
          <p className="label">通勤估算</p>
          <p className="mt-1 text-[10px] leading-4 text-muted">
            基于直线距离本地估算，不请求外部路线服务。
          </p>
        </div>
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={handleLocate}
            disabled={status === "locating"}
            className="btn btn-ghost btn-sm"
          >
            {status === "locating" ? "定位中…" : "用我的位置估算通勤"}
          </button>
          {open && (
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="border border-line-strong bg-surface px-2 py-1 text-[10px] text-muted transition-colors hover:border-ink hover:text-ink"
            >
              收起
            </button>
          )}
        </div>
      </div>

      {open && (
        <div className="border-t border-line px-3 py-2.5">
          {error && <p className="text-[11px] leading-5 text-coral">{error}</p>}
          {status === "idle" && (
            <p className="text-[11px] leading-5 text-muted">
              点击上方按钮获取当前位置，估算各地点的距离与通勤时间。
            </p>
          )}
          {status === "ready" && origin && (
            <>
              <label className="mb-2 flex cursor-pointer items-center gap-1.5 text-[10px] text-muted">
                <input
                  type="checkbox"
                  checked={onlyNearby}
                  onChange={(event) => setOnlyNearby(event.target.checked)}
                  className="h-3.5 w-3.5 accent-[#171714]"
                />
                只看 5 km 内
              </label>
              {visible.length > 0 ? (
                <ul className="space-y-1.5">
                  {visible.map((item) => (
                    <li
                      key={item.id}
                      className="flex items-center justify-between gap-3 border-t border-line pt-1.5 text-[11px]"
                    >
                      <span className="truncate">{item.label}</span>
                      <span className="shrink-0 font-mono text-[10px] tracking-[0.06em] text-muted">
                        {formatDistance(item.km)} · 约 {estimateCommuteMinutes(item.km)} 分钟
                      </span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-[11px] leading-5 text-muted">5 km 内没有带坐标的地点。</p>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
}
