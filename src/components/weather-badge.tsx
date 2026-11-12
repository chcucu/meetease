"use client";

import { useEffect, useState } from "react";

type WeatherBadgeProps = {
  lat: number | null;
  lng: number | null;
  date: string | null;
  label?: string;
};

type WeatherData = {
  code: number;
  tMax: number;
  tMin: number;
  precip: number | null;
};

const CACHE_PREFIX = "quorum:weather:v1:";
const CACHE_TTL_MS = 30 * 60 * 1000;

function weatherText(code: number) {
  if (code === 0) return "晴";
  if (code === 1 || code === 2) return "多云";
  if (code === 3 || code === 45 || code === 48) return "阴";
  if (code >= 51 && code <= 67) return "雨";
  if (code >= 71 && code <= 77) return "雪";
  if (code >= 80 && code <= 82) return "雨";
  if (code === 85 || code === 86) return "雪";
  if (code >= 95) return "雷雨";
  return "多云";
}

function dayFrom(date: string) {
  const day = date.slice(0, 10);
  return /^\d{4}-\d{2}-\d{2}$/.test(day) ? day : null;
}

function dayLabel(day: string) {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(day);
  if (!match) return day;
  return `${Number(match[2])}月${Number(match[3])}日`;
}

function isWeatherData(value: unknown): value is WeatherData {
  if (!value || typeof value !== "object") return false;
  const record = value as Record<string, unknown>;
  return (
    typeof record.code === "number" &&
    typeof record.tMax === "number" &&
    typeof record.tMin === "number" &&
    (record.precip === null || typeof record.precip === "number")
  );
}

function parseWeather(payload: unknown): WeatherData | null {
  if (!payload || typeof payload !== "object") return null;
  const daily = (payload as { daily?: unknown }).daily;
  if (!daily || typeof daily !== "object") return null;
  const record = daily as Record<string, unknown>;
  const code = Array.isArray(record.weather_code) ? record.weather_code[0] : null;
  const tMax = Array.isArray(record.temperature_2m_max)
    ? record.temperature_2m_max[0]
    : null;
  const tMin = Array.isArray(record.temperature_2m_min)
    ? record.temperature_2m_min[0]
    : null;
  const precipRaw = Array.isArray(record.precipitation_probability_max)
    ? record.precipitation_probability_max[0]
    : null;
  if (typeof code !== "number" || typeof tMax !== "number" || typeof tMin !== "number") {
    return null;
  }
  return {
    code,
    tMax,
    tMin,
    precip: typeof precipRaw === "number" ? precipRaw : null,
  };
}

function readCache(key: string): WeatherData | null {
  try {
    const raw = window.sessionStorage.getItem(key);
    if (!raw) return null;
    const parsed: unknown = JSON.parse(raw);
    if (!parsed || typeof parsed !== "object") return null;
    const record = parsed as { savedAt?: unknown; data?: unknown };
    if (typeof record.savedAt !== "number" || Date.now() - record.savedAt > CACHE_TTL_MS) {
      window.sessionStorage.removeItem(key);
      return null;
    }
    return isWeatherData(record.data) ? record.data : null;
  } catch {
    return null;
  }
}

function writeCache(key: string, data: WeatherData) {
  try {
    window.sessionStorage.setItem(key, JSON.stringify({ savedAt: Date.now(), data }));
  } catch {
    // 缓存不可用时忽略。
  }
}

export function WeatherBadge({ lat, lng, date, label }: WeatherBadgeProps) {
  const day = date ? dayFrom(date) : null;
  const key =
    lat !== null && lng !== null && day
      ? `${CACHE_PREFIX}${lat.toFixed(4)},${lng.toFixed(4)},${day}`
      : null;
  const [entry, setEntry] = useState<{ key: string; data: WeatherData } | null>(null);

  useEffect(() => {
    if (!key || lat === null || lng === null || !day) return;
    const controller = new AbortController();
    let cancelled = false;
    const timer = window.setTimeout(() => controller.abort(), 4000);

    void (async () => {
      const cached = readCache(key);
      if (cached) {
        await Promise.resolve();
        if (!cancelled) setEntry({ key, data: cached });
        window.clearTimeout(timer);
        return;
      }
      try {
        const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lng}&daily=weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max&timezone=Asia%2FShanghai&start_date=${day}&end_date=${day}`;
        const response = await fetch(url, { signal: controller.signal });
        if (!response.ok) return;
        const payload: unknown = await response.json();
        const parsed = parseWeather(payload);
        if (!parsed || cancelled) return;
        writeCache(key, parsed);
        setEntry({ key, data: parsed });
      } catch {
        // 天气获取失败时静默降级，不显示占位。
      } finally {
        window.clearTimeout(timer);
      }
    })();

    return () => {
      cancelled = true;
      window.clearTimeout(timer);
      controller.abort();
    };
  }, [key, lat, lng, day]);

  if (!key || !day || !entry || entry.key !== key) return null;
  const data = entry.data;

  return (
    <div className="flex flex-wrap items-center gap-1.5">
      <span className="label">{label || "天气"}</span>
      <span className="chip">{weatherText(data.code)}</span>
      <span className="font-mono text-[10px] tracking-[0.06em] text-muted">
        {dayLabel(day)} · {Math.round(data.tMax)}° / {Math.round(data.tMin)}°
        {data.precip !== null ? ` · 降水 ${Math.round(data.precip)}%` : ""}
      </span>
    </div>
  );
}
