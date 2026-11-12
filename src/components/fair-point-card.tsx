"use client";

import { useEffect, useRef, useState } from "react";
import { fairPoint } from "@/lib/geo";

type FairPointOption = {
  id: string;
  label: string;
  lat: number | null;
  lng: number | null;
};

export function FairPointCard({ options }: { options: FairPointOption[] }) {
  const points = options.flatMap((option) =>
    option.lat !== null &&
    option.lng !== null &&
    Number.isFinite(option.lat) &&
    Number.isFinite(option.lng) &&
    Math.abs(option.lat) <= 90 &&
    Math.abs(option.lng) <= 180
      ? [{ lat: option.lat, lng: option.lng }]
      : []
  );
  const center = fairPoint(points);
  const [copied, setCopied] = useState(false);
  const [failed, setFailed] = useState(false);
  const timerRef = useRef<number | null>(null);

  useEffect(
    () => () => {
      if (timerRef.current !== null) window.clearTimeout(timerRef.current);
    },
    []
  );

  if (!center || points.length < 2) return null;

  const coordinate = `${center.lat.toFixed(4)}, ${center.lng.toFixed(4)}`;
  const amapUrl = `https://uri.amap.com/marker?position=${center.lng.toFixed(6)},${center.lat.toFixed(6)}&name=${encodeURIComponent("公平集合点")}`;

  async function copyCoordinate() {
    try {
      await navigator.clipboard.writeText(coordinate);
      setFailed(false);
      setCopied(true);
    } catch {
      setCopied(false);
      setFailed(true);
    }
    if (timerRef.current !== null) window.clearTimeout(timerRef.current);
    timerRef.current = window.setTimeout(() => {
      setCopied(false);
      setFailed(false);
    }, 1600);
  }

  return (
    <section className="card p-3.5">
      <p className="label">公平集合点</p>
      <p className="mt-2 font-mono text-[13px] tracking-[0.04em] tabular-nums">
        {coordinate}
      </p>
      <p className="mt-1 text-[10px] text-muted">
        由 {points.length} 个带坐标地点等权计算
      </p>
      <div className="mt-3 flex flex-wrap items-center gap-2">
        <a
          href={amapUrl}
          target="_blank"
          rel="noreferrer"
          className="btn btn-ghost btn-sm"
        >
          在高德中查看
        </a>
        <button
          type="button"
          onClick={() => void copyCoordinate()}
          className="btn btn-ghost btn-sm"
        >
          {copied ? "已复制" : failed ? "复制失败" : "复制坐标"}
        </button>
      </div>
    </section>
  );
}
