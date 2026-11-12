"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { LeafletMouseEvent, Map as LeafletMap, Marker } from "leaflet";
import "leaflet/dist/leaflet.css";

type LeafletModule = typeof import("leaflet");

export type LocationPoint = { lat: number; lng: number };

export type LocationPickerProps = {
  value: LocationPoint | null;
  onChange: (next: (LocationPoint & { address?: string }) | null) => void;
  onAddress?: (address: string) => void;
  height?: number;
};

const DEFAULT_CENTER: LocationPoint = { lat: 31.2304, lng: 121.4737 };
const DEFAULT_ZOOM = 12;
const SELECTED_ZOOM = 15;
const MAX_ZOOM = 19;

const MARKER_HTML =
  '<span style="display:block;width:18px;height:18px;border:2px solid #171714;background:#d9ff43;border-radius:4px;box-shadow:0 0 0 3px rgba(23,23,20,0.12);"></span>';

function roundCoordinate(value: number) {
  return Math.round(value * 1e6) / 1e6;
}

async function reverseGeocode(lat: number, lng: number, signal: AbortSignal) {
  const url = `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat.toFixed(
    5
  )}&lon=${lng.toFixed(5)}&accept-language=zh-CN`;
  const response = await fetch(url, { signal, headers: { Accept: "application/json" } });
  if (!response.ok) return null;
  const data: unknown = await response.json();
  if (!data || typeof data !== "object") return null;
  const record = data as { display_name?: unknown; name?: unknown };
  const displayName = typeof record.display_name === "string" ? record.display_name.trim() : "";
  if (displayName) return displayName;
  const name = typeof record.name === "string" ? record.name.trim() : "";
  return name || null;
}

export function LocationPicker({
  value,
  onChange,
  onAddress,
  height = 260,
}: LocationPickerProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<LeafletMap | null>(null);
  const markerRef = useRef<Marker | null>(null);
  const leafletRef = useRef<LeafletModule | null>(null);
  const valueRef = useRef<LocationPoint | null>(value);
  const onChangeRef = useRef(onChange);
  const onAddressRef = useRef(onAddress);
  const selectRef = useRef<(lat: number, lng: number) => void>(() => {});
  const geocodeAbortRef = useRef<AbortController | null>(null);
  const [locating, setLocating] = useState(false);
  const [hint, setHint] = useState<string | null>(null);
  const [resolvedAddress, setResolvedAddress] = useState<string | null>(null);

  useEffect(() => {
    valueRef.current = value;
  }, [value]);

  useEffect(() => {
    onChangeRef.current = onChange;
    onAddressRef.current = onAddress;
  });

  const syncMarker = useCallback((lat: number, lng: number) => {
    const leaflet = leafletRef.current;
    const map = mapRef.current;
    if (!leaflet || !map) return;
    const target = leaflet.latLng(lat, lng);
    if (markerRef.current) {
      markerRef.current.setLatLng(target);
      return;
    }
    markerRef.current = leaflet
      .marker(target, {
        icon: leaflet.divIcon({
          className: "quorum-location-pin",
          html: MARKER_HTML,
          iconSize: [18, 18],
          iconAnchor: [9, 9],
        }),
      })
      .addTo(map);
  }, []);

  useEffect(() => {
    selectRef.current = (lat, lng) => {
      const nextLat = roundCoordinate(lat);
      const nextLng = roundCoordinate(lng);
      setHint(null);
      setResolvedAddress(null);
      onChangeRef.current({ lat: nextLat, lng: nextLng });

      geocodeAbortRef.current?.abort();
      const controller = new AbortController();
      geocodeAbortRef.current = controller;
      void (async () => {
        try {
          const address = await reverseGeocode(nextLat, nextLng, controller.signal);
          if (controller.signal.aborted) return;
          if (address) {
            setResolvedAddress(address);
            onAddressRef.current?.(address);
          }
        } catch {
          if (!controller.signal.aborted) {
            setHint("地址解析失败，可手动填写地址。");
          }
        }
      })();
    };
  });

  useEffect(() => {
    let cancelled = false;

    void (async () => {
      const leaflet = await import("leaflet");
      if (cancelled || mapRef.current || !containerRef.current) return;

      leafletRef.current = leaflet;
      const initial = valueRef.current;
      const center = initial ?? DEFAULT_CENTER;
      const map = leaflet.map(containerRef.current, {
        center: [center.lat, center.lng],
        zoom: initial ? SELECTED_ZOOM : DEFAULT_ZOOM,
        minZoom: 3,
        maxZoom: MAX_ZOOM,
        scrollWheelZoom: false,
      });

      leaflet
        .tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
          maxZoom: MAX_ZOOM,
          attribution:
            '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> 贡献者',
        })
        .addTo(map);

      mapRef.current = map;
      if (initial) syncMarker(initial.lat, initial.lng);

      map.on("click", (event: LeafletMouseEvent) => {
        syncMarker(event.latlng.lat, event.latlng.lng);
        selectRef.current(event.latlng.lat, event.latlng.lng);
      });
    })();

    return () => {
      cancelled = true;
      geocodeAbortRef.current?.abort();
      markerRef.current?.remove();
      markerRef.current = null;
      mapRef.current?.remove();
      mapRef.current = null;
      leafletRef.current = null;
    };
  }, [syncMarker]);

  const lat = value?.lat ?? null;
  const lng = value?.lng ?? null;

  useEffect(() => {
    if (lat === null || lng === null) {
      if (markerRef.current) {
        markerRef.current.remove();
        markerRef.current = null;
      }
      return;
    }
    const leaflet = leafletRef.current;
    const map = mapRef.current;
    if (!leaflet || !map) return;

    const current = markerRef.current?.getLatLng();
    if (!current || current.lat !== lat || current.lng !== lng) {
      syncMarker(lat, lng);
    }
    const target = leaflet.latLng(lat, lng);
    if (!map.getBounds().contains(target)) {
      map.setView(target, Math.max(map.getZoom(), SELECTED_ZOOM));
    }
  }, [lat, lng, syncMarker]);

  function locate() {
    if (typeof navigator === "undefined" || !("geolocation" in navigator)) {
      setHint("当前浏览器不支持定位，请在地图上手动选点。");
      return;
    }
    setLocating(true);
    setHint(null);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLocating(false);
        const nextLat = position.coords.latitude;
        const nextLng = position.coords.longitude;
        mapRef.current?.setView([nextLat, nextLng], SELECTED_ZOOM);
        syncMarker(nextLat, nextLng);
        selectRef.current(nextLat, nextLng);
      },
      (positionError) => {
        setLocating(false);
        setHint(
          positionError.code === positionError.PERMISSION_DENIED
            ? "定位权限被拒绝，请在地图上手动选点。"
            : "定位失败，请在地图上手动选点。"
        );
      },
      { enableHighAccuracy: false, timeout: 10000, maximumAge: 60000 }
    );
  }

  function clear() {
    geocodeAbortRef.current?.abort();
    markerRef.current?.remove();
    markerRef.current = null;
    setResolvedAddress(null);
    setHint(null);
    onChangeRef.current(null);
  }

  return (
    <div className="border border-line-strong bg-paper">
      <div
        ref={containerRef}
        style={{ height }}
        className="relative isolate z-0 w-full bg-paper-deep"
        aria-label="地图选点"
        role="region"
      />
      <div className="flex flex-wrap items-center justify-between gap-2 border-t border-line px-2.5 py-2">
        <p className="font-mono text-[10px] tracking-[0.08em] text-muted">
          {value
            ? `已选择 ${value.lat.toFixed(4)}, ${value.lng.toFixed(4)}`
            : "点击地图落点，或使用当前位置"}
        </p>
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={locate}
            disabled={locating}
            className="border border-line-strong bg-surface px-2 py-1 text-[10px] text-ink-2 transition-colors hover:border-ink hover:bg-paper disabled:cursor-not-allowed disabled:opacity-50"
          >
            {locating ? "定位中…" : "使用当前位置"}
          </button>
          {value && (
            <button
              type="button"
              onClick={clear}
              className="border border-line-strong bg-surface px-2 py-1 text-[10px] text-muted transition-colors hover:border-coral hover:text-coral"
            >
              清除
            </button>
          )}
        </div>
      </div>
      {hint && (
        <p className="border-t border-line px-2.5 py-1.5 text-[10px] leading-4 text-coral">
          {hint}
        </p>
      )}
      {!hint && resolvedAddress && (
        <p className="border-t border-line px-2.5 py-1.5 text-[10px] leading-4 text-muted">
          地址：{resolvedAddress}
        </p>
      )}
    </div>
  );
}
